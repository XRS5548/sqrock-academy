"use server";

import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  attachment,
  certificate,
  course,
  enrollment,
  exam,
  examAttempt,
  examQuestion,
  job,
  lesson,
  lessonProgress,
  pptTemplate,
  user,
} from "@/db/schema";
import { getCurrentUser } from "@/lib/session";
import { deleteObject } from "@/lib/r2";
import { toRichText } from "@/lib/rich-text";
import { validateCourse } from "@/lib/course-validation";
import {
  captureRazorpayPayment,
  createRazorpayOrder,
  fetchRazorpayOrder,
  fetchRazorpayPayment,
  getRazorpayConfig,
  verifyRazorpaySignature,
} from "@/lib/razorpay";

type PaymentOrderResult = ActionResult & {
  orderId?: string;
  amount?: number;
  currency?: string;
  keyId?: string;
  courseTitle?: string;
  userName?: string;
  userEmail?: string;
};

type ActionResult = {
  ok: boolean;
  error?: string;
  message?: string;
  slug?: string;
  id?: string;
  requiresPayment?: boolean;
  passed?: boolean;
  score?: number;
  certificateNo?: string;
  lockedUntil?: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/* ----------------------------- Learning ----------------------------- */

async function ensureEnrollment(userId: string, courseId: string) {
  const [existing] = await db
    .select()
    .from(enrollment)
    .where(
      and(
        eq(enrollment.userId, userId),
        eq(enrollment.courseId, courseId),
      ),
    )
    .limit(1);

  if (existing) return false;

  await db.insert(enrollment).values({
    userId,
    courseId,
    status: "active",
  });
  await db
    .update(course)
    .set({ enrollments: sql`${course.enrollments} + 1` })
    .where(eq(course.id, courseId));
  return true;
}

export async function enrollInCourse(courseId: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please log in to enrol." };

  try {
    const [found] = await db
      .select()
      .from(course)
      .where(eq(course.id, courseId))
      .limit(1);
    if (!found) return { ok: false, error: "Course not found." };

    if (!found.isFree && found.price > 0) {
      return {
        ok: false,
        requiresPayment: true,
        error:
          "Online payments are being set up. Email academy@sqrock.cloud to purchase this course.",
      };
    }

    await ensureEnrollment(user.id, courseId);

    revalidatePath(`/courses/${found.slug}`);
    revalidatePath("/dashboard");
    return { ok: true, slug: found.slug, message: "You're enrolled!" };
  } catch {
    return {
      ok: false,
      error: "Could not enrol right now. Please try again.",
    };
  }
}

export async function createCoursePaymentOrder(
  courseId: string,
): Promise<PaymentOrderResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please log in to enrol." };

  const config = getRazorpayConfig();
  if (!config) {
    return {
      ok: false,
      error:
        "Online payments are not configured yet. Add Razorpay keys to the environment.",
    };
  }

  try {
    const [found] = await db
      .select()
      .from(course)
      .where(eq(course.id, courseId))
      .limit(1);
    if (!found) return { ok: false, error: "Course not found." };
    if (found.isFree || Number(found.price) <= 0) {
      return { ok: false, error: "This course is free." };
    }

    const [existing] = await db
      .select()
      .from(enrollment)
      .where(
        and(
          eq(enrollment.userId, user.id),
          eq(enrollment.courseId, courseId),
        ),
      )
      .limit(1);
    if (existing) {
      return {
        ok: false,
        error: "You are already enrolled in this course.",
        slug: found.slug,
      };
    }

    const amount = Math.round(Number(found.price) * 100);
    if (!Number.isFinite(amount) || amount < 100) {
      return { ok: false, error: "This course price is invalid." };
    }

    const order = await createRazorpayOrder({
      amount,
      currency: "INR",
      receipt: `course_${found.id.slice(0, 8)}_${Date.now()}`,
      notes: {
        courseId: found.id,
        courseSlug: found.slug,
        userId: user.id,
      },
    });

    return {
      ok: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: config.keyId,
      courseTitle: found.title,
      userName: user.name,
      userEmail: user.email,
    };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Could not start the payment. Please try again.",
    };
  }
}

export async function verifyCoursePayment(input: {
  courseId: string;
  orderId: string;
  paymentId: string;
  signature: string;
}): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please log in to enrol." };

  const signatureValid = await verifyRazorpaySignature({
    orderId: input.orderId,
    paymentId: input.paymentId,
    signature: input.signature,
  }).catch(() => false);
  if (!signatureValid) {
    return { ok: false, error: "Payment verification failed." };
  }

  try {
    const [found] = await db
      .select()
      .from(course)
      .where(eq(course.id, input.courseId))
      .limit(1);
    if (!found) return { ok: false, error: "Course not found." };

    const order = await fetchRazorpayOrder(input.orderId);
    if (
      order.notes?.courseId !== found.id ||
      order.notes?.userId !== user.id
    ) {
      return { ok: false, error: "Payment does not match this course." };
    }

    const expectedAmount = Math.round(Number(found.price) * 100);
    if (
      Number(order.amount) !== expectedAmount ||
      order.currency !== "INR"
    ) {
      return { ok: false, error: "Payment amount does not match the course price." };
    }

    const payment = await fetchRazorpayPayment(input.paymentId);
    if (
      payment.order_id !== order.id ||
      Number(payment.amount) !== expectedAmount
    ) {
      return { ok: false, error: "Payment does not match this order." };
    }

    if (payment.status === "authorized") {
      await captureRazorpayPayment(
        payment.id,
        Number(payment.amount),
        payment.currency,
      );
    } else if (payment.status !== "captured") {
      return {
        ok: false,
        error: `Payment is ${payment.status}. Please complete the payment and try again.`,
      };
    }

    await ensureEnrollment(user.id, found.id);
    revalidatePath(`/courses/${found.slug}`);
    revalidatePath("/dashboard");
    return {
      ok: true,
      slug: found.slug,
      message: "Payment successful — you're enrolled!",
    };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Could not verify the payment.",
    };
  }
}

export async function markLessonComplete(
  lessonId: string,
  courseId: string,
  completed: boolean,
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please log in." };

  try {
    const [enrolled] = await db
      .select()
      .from(enrollment)
      .where(
        and(
          eq(enrollment.userId, user.id),
          eq(enrollment.courseId, courseId),
        ),
      )
      .limit(1);
    if (!enrolled) return { ok: false, error: "You are not enrolled." };

    await db
      .insert(lessonProgress)
      .values({
        userId: user.id,
        courseId,
        lessonId,
        completed,
        completedAt: completed ? new Date() : null,
      })
      .onConflictDoUpdate({
        target: [lessonProgress.userId, lessonProgress.lessonId],
        set: {
          completed,
          completedAt: completed ? new Date() : null,
          updatedAt: new Date(),
        },
      });

    revalidatePath("/dashboard");
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not save progress." };
  }
}

export async function submitExamAttempt(
  courseId: string,
  answers: number[],
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please log in." };

  try {
    const [enrolled] = await db
      .select()
      .from(enrollment)
      .where(
        and(
          eq(enrollment.userId, user.id),
          eq(enrollment.courseId, courseId),
        ),
      )
      .limit(1);
    if (!enrolled)
      return { ok: false, error: "You need to enrol before taking the exam." };

    const [examRow] = await db
      .select()
      .from(exam)
      .where(eq(exam.courseId, courseId))
      .limit(1);
    if (!examRow) return { ok: false, error: "This course has no exam yet." };

    const [last] = await db
      .select()
      .from(examAttempt)
      .where(
        and(
          eq(examAttempt.userId, user.id),
          eq(examAttempt.examId, examRow.id),
        ),
      )
      .orderBy(sql`${examAttempt.submittedAt} desc`)
      .limit(1);

    if (last && !last.passed) {
      const availableAt = new Date(
        new Date(last.submittedAt).getTime() +
          examRow.lockHours * 60 * 60 * 1000,
      );
      if (availableAt > new Date()) {
        return {
          ok: false,
          lockedUntil: availableAt.toISOString(),
          error: `Your next attempt unlocks on ${availableAt.toLocaleString(
            "en-IN",
            { dateStyle: "medium", timeStyle: "short" },
          )}.`,
        };
      }
    }

    const questions = await db
      .select()
      .from(examQuestion)
      .where(eq(examQuestion.examId, examRow.id))
      .orderBy(asc(examQuestion.position));
    if (questions.length === 0)
      return { ok: false, error: "This exam has no questions yet." };

    const correct = questions.reduce(
      (sum, q, i) => sum + (answers[i] === q.correctIndex ? 1 : 0),
      0,
    );
    const score = Math.round((correct / questions.length) * 100);
    const passed = score >= examRow.passPercent;

    const [attempt] = await db
      .insert(examAttempt)
      .values({
        examId: examRow.id,
        userId: user.id,
        courseId,
        score,
        passed,
        answers,
      })
      .returning();

    let certificateNo: string | undefined;
    const [courseRow] = await db
      .select({ certificateEnabled: course.certificateEnabled })
      .from(course)
      .where(eq(course.id, courseId))
      .limit(1);
    if (passed && courseRow?.certificateEnabled !== false) {
      const [existingCert] = await db
        .select()
        .from(certificate)
        .where(
          and(
            eq(certificate.userId, user.id),
            eq(certificate.courseId, courseId),
          ),
        )
        .limit(1);

      if (!existingCert) {
        certificateNo = `SQ-${new Date().getFullYear()}-${Math.random()
          .toString(36)
          .slice(2, 7)
          .toUpperCase()}`;
        await db.insert(certificate).values({
          certificateNo,
          userId: user.id,
          courseId,
          attemptId: attempt.id,
          score,
        });
        await db
          .update(enrollment)
          .set({ status: "completed", completedAt: new Date() })
          .where(eq(enrollment.id, enrolled.id));
      } else {
        certificateNo = existingCert.certificateNo;
      }
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/certificates");
    return { ok: true, passed, score, certificateNo };
  } catch {
    return { ok: false, error: "Could not submit the exam. Try again." };
  }
}

/* ------------------------------- Profile ---------------------------- */

export async function updateProfile(formData: FormData) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return { ok: false, error: "Please log in." };
  const name = String(formData.get("name") ?? "").trim();
  const headline = String(formData.get("headline") ?? "").trim();
  if (name.length < 2) return { ok: false, error: "Name is too short." };
  try {
    await db
      .update(user)
      .set({ name, headline: headline || null })
      .where(eq(user.id, currentUser.id));
    revalidatePath("/dashboard/settings");
    return { ok: true, message: "Profile updated." };
  } catch {
    return { ok: false, error: "Could not update profile." };
  }
}

/* -------------------------------- Jobs ------------------------------ */

export async function submitJob(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  const get = (key: string) => String(formData.get(key) ?? "").trim();

  const title = get("title");
  const company = get("company");
  const description = toRichText(get("description"));
  const contactEmail = get("contactEmail");
  if (!title || !company || !description || !contactEmail) {
    return { ok: false, error: "Please fill all required fields." };
  }

  try {
    await db.insert(job).values({
      title,
      company,
      companyWebsite: get("companyWebsite") || null,
      type: get("type") === "internship" ? "internship" : "job",
      location: get("location") || "Remote",
      workMode: get("workMode") || "Remote",
      category: get("category") || "Engineering",
      experience: get("experience") || "Fresher",
      salary: get("salary") || null,
      description,
      applyUrl: get("applyUrl") || null,
      applyEmail: get("applyEmail") || null,
      contactEmail,
      status: "pending",
      postedBy: user?.id ?? null,
    });
    revalidatePath("/admin/jobs");
    return {
      ok: true,
      message:
        "Job submitted! Our team verifies companies before publishing — usually within 24 hours.",
    };
  } catch {
    return { ok: false, error: "Could not submit the job. Try again." };
  }
}

export async function reviewJob(
  jobId: string,
  decision: "approved" | "rejected",
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (user?.role !== "admin") return { ok: false, error: "Not authorised." };
  try {
    await db
      .update(job)
      .set({ status: decision, approvedBy: user.id })
      .where(eq(job.id, jobId));
    revalidatePath("/admin/jobs");
    revalidatePath("/jobs");
    return { ok: true, message: `Job ${decision}.` };
  } catch {
    return { ok: false, error: "Could not update job." };
  }
}

export async function deleteJob(jobId: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (user?.role !== "admin") return { ok: false, error: "Not authorised." };
  try {
    await db.delete(job).where(eq(job.id, jobId));
    revalidatePath("/admin/jobs");
    revalidatePath("/jobs");
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not delete job." };
  }
}

/* ------------------------------- Admin ------------------------------ */

export async function createPptTemplate(input: {
  name: string;
  url: string;
  key?: string | null;
  placeholders: string[];
  size?: number;
}): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (user?.role !== "admin") return { ok: false, error: "Not authorised." };

  const name = input.name.trim();
  const url = input.url.trim();
  if (!name || !url) {
    return { ok: false, error: "Template name and file URL are required." };
  }

  try {
    const placeholders = [
      ...new Set(
        input.placeholders.map((item) => item.trim()).filter(Boolean),
      ),
    ];
    const [created] = await db
      .insert(pptTemplate)
      .values({
        name,
        fileUrl: url,
        fileKey: input.key ?? null,
        placeholders,
        fileSize:
          input.size && Number.isFinite(input.size) ? input.size : null,
        createdBy: user.id,
      })
      .returning({ id: pptTemplate.id });

    revalidatePath("/admin/ppt");
    return { ok: true, id: created.id, message: "Template saved." };
  } catch (error) {
    console.error("createPptTemplate failed", error);
    const message = error instanceof Error ? error.message : "";
    if (/relation .*ppt_template.* does not exist/i.test(message)) {
      return {
        ok: false,
        error:
          "The ppt_template table is missing. Run `npm run db:push` to apply the new schema, then try again.",
      };
    }
    if (/ECONNREFUSED|ENOTFOUND|password authentication|connect/i.test(message)) {
      return {
        ok: false,
        error:
          "Could not reach the database. Check DATABASE_URL and try again.",
      };
    }
    return {
      ok: false,
      error:
        process.env.NODE_ENV !== "production"
          ? `Could not save the template details: ${message || "unknown database error"}`
          : "Could not save the template details.",
    };
  }
}

export async function deletePptTemplate(id: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (user?.role !== "admin") return { ok: false, error: "Not authorised." };

  try {
    const [row] = await db
      .select()
      .from(pptTemplate)
      .where(eq(pptTemplate.id, id))
      .limit(1);
    if (!row) return { ok: false, error: "Template not found." };

    await db.delete(pptTemplate).where(eq(pptTemplate.id, id));
    try {
      await deleteObject(row.fileKey);
    } catch {
      // Keep the database entry removed even if storage cleanup fails.
    }
    revalidatePath("/admin/ppt");
    return { ok: true, message: "Template deleted." };
  } catch {
    return { ok: false, error: "Could not delete the template." };
  }
}

export type LessonInput = {
  id?: string;
  title: string;
  description: string;
  videoType: "youtube" | "r2";
  videoUrl: string;
  videoKey?: string | null;
  durationMinutes: number;
  isPreview: boolean;
  attachments: { name: string; url: string; fileType?: string; fileSize?: number }[];
};

export type CourseInput = {
  id?: string;
  title: string;
  subtitle: string;
  slug: string;
  description: string;
  category: string;
  level: string;
  language: string;
  price: number;
  isFree: boolean;
  status: "draft" | "published";
  mode: "live" | "recorded";
  durationMinutes: number;
  instructorName: string;
  instructorRole: string;
  thumbnail: string | null;
  trailerUrl: string | null;
  outcomes: string[];
  requirements: string[];
  tags: string[];
  certificateEnabled: boolean;
  certificateTemplateName: string | null;
  certificateTemplateUrl: string | null;
  certificateTemplateKey: string | null;
  certificatePlaceholders: string[];
  examPassPercent: number;
  examLockHours: number;
  lessons: LessonInput[];
};

export async function saveCourse(input: CourseInput): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (user?.role !== "admin") return { ok: false, error: "Not authorised." };

  const validation = validateCourse(input, [], { requireExam: false });
  if (!validation.ok) {
    return {
      ok: false,
      error: validation.messages[0] ?? "Please fix the highlighted fields.",
    };
  }

  const slugValue = slugify(input.slug || input.title);

  try {
    const [conflict] = await db
      .select({ id: course.id })
      .from(course)
      .where(eq(course.slug, slugValue))
      .limit(1);
    if (conflict && conflict.id !== input.id) {
      return {
        ok: false,
        error:
          "That slug is already used by another course. Choose a different slug.",
      };
    }

    const lessonMinutes = input.lessons.reduce(
      (sum, item) => sum + (Number(item.durationMinutes) || 0),
      0,
    );

    const values = {
      title: input.title.trim(),
      slug: slugValue,
      subtitle: input.subtitle.trim(),
      description: input.description,
      category: input.category,
      level: input.level,
      language: input.language,
      price: input.isFree ? 0 : Number(input.price) || 0,
      isFree: input.isFree,
      status: input.status,
      mode: input.mode === "live" ? "live" : "recorded",
      durationMinutes: lessonMinutes || Number(input.durationMinutes) || 0,
      instructorName: input.instructorName || "Sqrock Academy",
      instructorRole: input.instructorRole || "Instructor",
      thumbnail: input.thumbnail || null,
      trailerUrl: input.trailerUrl || null,
      outcomes: input.outcomes,
      requirements: input.requirements,
      tags: input.tags,
      certificateEnabled: input.certificateEnabled,
      certificateTemplateName: input.certificateTemplateName || null,
      certificateTemplateUrl: input.certificateTemplateUrl || null,
      certificateTemplateKey: input.certificateTemplateKey || null,
      certificatePlaceholders: input.certificatePlaceholders ?? [],
      examPassPercent: Number(input.examPassPercent) || 70,
      examLockHours: Number(input.examLockHours) || 48,
      createdBy: user.id,
    };

    let courseId = input.id;

    if (courseId) {
      await db.update(course).set(values).where(eq(course.id, courseId));
    } else {
      const [created] = await db.insert(course).values(values).returning();
      courseId = created.id;
    }

    const existingLessons = await db
      .select({ id: lesson.id })
      .from(lesson)
      .where(eq(lesson.courseId, courseId));

    const savedLessons = input.lessons.filter((l) => l.title.trim());
    const keptLessonIds: string[] = [];

    for (let i = 0; i < savedLessons.length; i++) {
      const item = savedLessons[i];
      const lessonValues = {
        courseId,
        title: item.title,
        description: item.description,
        videoType: item.videoType,
        videoUrl: item.videoUrl,
        videoKey: item.videoKey ?? null,
        durationMinutes: Number(item.durationMinutes) || 0,
        position: i + 1,
        isPreview: item.isPreview,
      };

      let lessonId = item.id;
      if (lessonId && existingLessons.some((l) => l.id === lessonId)) {
        await db
          .update(lesson)
          .set(lessonValues)
          .where(and(eq(lesson.id, lessonId), eq(lesson.courseId, courseId)));
      } else {
        const [createdLesson] = await db
          .insert(lesson)
          .values(lessonValues)
          .returning();
        lessonId = createdLesson.id;
      }

      keptLessonIds.push(lessonId);
      await db.delete(attachment).where(eq(attachment.lessonId, lessonId));

      const validAttachments = item.attachments.filter(
        (a) => a.name.trim() && a.url.trim(),
      );
      if (validAttachments.length > 0) {
        await db.insert(attachment).values(
          validAttachments.map((a) => ({
            courseId: courseId!,
            lessonId: lessonId!,
            name: a.name,
            url: a.url,
            fileType: a.fileType ?? "Link",
            fileSize: a.fileSize ?? null,
          })),
        );
      }
    }

    const removedLessonIds = existingLessons
      .map((l) => l.id)
      .filter((id) => !keptLessonIds.includes(id));
    if (removedLessonIds.length > 0) {
      await db.delete(lesson).where(inArray(lesson.id, removedLessonIds));
    }

    await db
      .insert(exam)
      .values({
        courseId,
        title: `${input.title} — Final exam`,
        description:
          "Pass this exam to unlock your certificate. You can retry after the lock period if you do not pass.",
        passPercent: Number(input.examPassPercent) || 70,
        lockHours: Number(input.examLockHours) || 48,
      })
      .onConflictDoUpdate({
        target: exam.courseId,
        set: {
          passPercent: Number(input.examPassPercent) || 70,
          lockHours: Number(input.examLockHours) || 48,
        },
      });

    revalidatePath("/admin/courses");
    revalidatePath("/courses");
    revalidatePath(`/courses/${slugValue}`);
    return {
      ok: true,
      message: "Course saved.",
      slug: slugValue,
      id: courseId,
    };
  } catch (error) {
    console.error("saveCourse failed", error);
    return { ok: false, error: "Could not save the course." };
  }
}

export async function saveExamQuestions(
  courseId: string,
  questions: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
  }[],
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (user?.role !== "admin") return { ok: false, error: "Not authorised." };
  try {
    const [examRow] = await db
      .select()
      .from(exam)
      .where(eq(exam.courseId, courseId))
      .limit(1);
    if (!examRow) return { ok: false, error: "Exam not found." };

    const provided = questions.filter(
      (q) => q.question.trim() || q.options.some((option) => option.trim()),
    );
    const invalidIndex = provided.findIndex(
      (q) =>
        !q.question.trim() ||
        q.options.map((option) => option.trim()).filter(Boolean).length < 2 ||
        !q.options[q.correctIndex]?.trim(),
    );
    if (invalidIndex !== -1) {
      return {
        ok: false,
        error: `Question ${invalidIndex + 1} is incomplete. Fill the question, at least two options and select a correct answer.`,
      };
    }

    await db.delete(examQuestion).where(eq(examQuestion.examId, examRow.id));
    const valid = provided;
    if (valid.length > 0) {
      await db.insert(examQuestion).values(
        valid.map((q, index) => ({
          examId: examRow.id,
          question: q.question,
          options: q.options.filter(Boolean),
          correctIndex: q.correctIndex,
          explanation: q.explanation ?? null,
          position: index + 1,
        })),
      );
    }
    revalidatePath(`/admin/courses/${courseId}`);
    return { ok: true, message: "Exam questions saved." };
  } catch {
    return { ok: false, error: "Could not save exam questions." };
  }
}

export async function setUserRole(
  userId: string,
  role: "student" | "admin",
): Promise<ActionResult> {
  const currentUser = await getCurrentUser();
  if (currentUser?.role !== "admin")
    return { ok: false, error: "Not authorised." };
  if (currentUser.id === userId)
    return { ok: false, error: "You cannot change your own role." };
  try {
    await db.update(user).set({ role }).where(eq(user.id, userId));
    revalidatePath("/admin/students");
    return { ok: true, message: `Role updated to ${role}.` };
  } catch {
    return { ok: false, error: "Could not update role." };
  }
}
