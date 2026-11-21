import { and, asc, count, desc, eq, inArray, ilike, or } from "drizzle-orm";
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
import { demoJobs } from "@/lib/demo-data";
import type {
  AttachmentView,
  CourseView,
  ExamView,
  JobView,
  LessonView,
} from "@/lib/types";

type CourseRow = typeof course.$inferSelect;
type LessonRow = typeof lesson.$inferSelect;
type AttachmentRow = typeof attachment.$inferSelect;

function mapCourse(
  row: CourseRow,
  lessons: LessonView[] = [],
): CourseView {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle ?? "",
    description: row.description,
    category: row.category,
    level: row.level,
    language: row.language,
    thumbnail: row.thumbnail,
    price: row.price,
    isFree: row.isFree,
    status: row.status,
    mode: row.mode === "live" ? "live" : "recorded",
    durationMinutes: row.durationMinutes,
    instructorName: row.instructorName,
    instructorRole: row.instructorRole ?? "Instructor",
    instructorImage: row.instructorImage,
    certificateEnabled: row.certificateEnabled,
    certificateTemplateName: row.certificateTemplateName,
    certificateTemplateUrl: row.certificateTemplateUrl,
    certificateTemplateKey: row.certificateTemplateKey,
    certificatePlaceholders: row.certificatePlaceholders ?? [],
    examPassPercent: row.examPassPercent,
    examLockHours: row.examLockHours,
    outcomes: row.outcomes ?? [],
    requirements: row.requirements ?? [],
    tags: row.tags ?? [],
    enrollments: row.enrollments,
    rating: row.rating,
    lessons,
  };
}

function mapLesson(
  row: LessonRow,
  attachments: AttachmentView[] = [],
): LessonView {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    videoType: row.videoType,
    videoUrl: row.videoUrl,
    durationMinutes: row.durationMinutes,
    position: row.position,
    isPreview: row.isPreview,
    attachments,
  };
}

function mapJob(row: typeof job.$inferSelect): JobView {
  return {
    id: row.id,
    title: row.title,
    company: row.company,
    companyLogo: row.companyLogo,
    type: row.type,
    location: row.location,
    workMode: row.workMode,
    category: row.category,
    experience: row.experience ?? "Fresher",
    salary: row.salary,
    description: row.description,
    applyUrl: row.applyUrl,
    applyEmail: row.applyEmail,
    status: row.status,
    featured: row.featured,
    createdAt: row.createdAt,
  };
}

export async function getPublishedCourses(filters?: {
  category?: string;
  level?: string;
  search?: string;
  free?: boolean;
  limit?: number;
}): Promise<CourseView[]> {
  try {
    const conditions = [eq(course.status, "published")];
    if (filters?.category && filters.category !== "All") {
      conditions.push(eq(course.category, filters.category));
    }
    if (filters?.level && filters.level !== "All") {
      conditions.push(eq(course.level, filters.level));
    }
    if (filters?.free) conditions.push(eq(course.isFree, true));
    if (filters?.search) {
      const term = `%${filters.search}%`;
      conditions.push(
        or(
          ilike(course.title, term),
          ilike(course.subtitle, term),
          ilike(course.category, term),
        )!,
      );
    }

    const query = db
      .select()
      .from(course)
      .where(and(...conditions))
      .orderBy(desc(course.createdAt));

    const rows = filters?.limit ? await query.limit(filters.limit) : await query;
    return rows.map((row) => mapCourse(row));
  } catch {
    return [];
  }
}

export async function getCourseBySlug(
  slug: string,
): Promise<CourseView | null> {
  try {
    const [row] = await db
      .select()
      .from(course)
      .where(eq(course.slug, slug))
      .limit(1);
    if (!row) return null;

    const [lessonRows, attachmentRows] = await Promise.all([
      db
        .select()
        .from(lesson)
        .where(eq(lesson.courseId, row.id))
        .orderBy(asc(lesson.position)),
      db
        .select()
        .from(attachment)
        .where(eq(attachment.courseId, row.id)),
    ]);

    const lessons = lessonRows.map((l) =>
      mapLesson(
        l,
        attachmentRows
          .filter((a) => a.lessonId === l.id)
          .map((a) => ({
            id: a.id,
            lessonId: a.lessonId,
            name: a.name,
            url: a.url,
            fileType: a.fileType,
            fileSize: a.fileSize,
          })),
      ),
    );

    return mapCourse(row, lessons);
  } catch {
    return null;
  }
}

export async function getCourseById(id: string): Promise<CourseView | null> {
  try {
    const [row] = await db
      .select()
      .from(course)
      .where(eq(course.id, id))
      .limit(1);
    if (!row) return null;
    const [lessonRows, attachmentRows] = await Promise.all([
      db
        .select()
        .from(lesson)
        .where(eq(lesson.courseId, row.id))
        .orderBy(asc(lesson.position)),
      db.select().from(attachment).where(eq(attachment.courseId, row.id)),
    ]);
    return mapCourse(
      row,
      lessonRows.map((l) =>
        mapLesson(
          l,
          attachmentRows
            .filter((a) => a.lessonId === l.id)
            .map((a) => ({
              id: a.id,
              lessonId: a.lessonId,
              name: a.name,
              url: a.url,
              fileType: a.fileType,
              fileSize: a.fileSize,
            })),
        ),
      ),
    );
  } catch {
    return null;
  }
}

export async function getRelatedCourses(
  category: string,
  excludeSlug: string,
): Promise<CourseView[]> {
  const all = await getPublishedCourses({ category });
  return all.filter((c) => c.slug !== excludeSlug).slice(0, 3);
}

export async function getExamForCourse(
  courseId: string,
): Promise<ExamView | null> {
  try {
    const [examRow] = await db
      .select()
      .from(exam)
      .where(eq(exam.courseId, courseId))
      .limit(1);
    if (!examRow) return null;
    const questions = await db
      .select()
      .from(examQuestion)
      .where(eq(examQuestion.examId, examRow.id))
      .orderBy(asc(examQuestion.position));
    return {
      id: examRow.id,
      courseId: examRow.courseId,
      title: examRow.title,
      description: examRow.description,
      passPercent: examRow.passPercent,
      lockHours: examRow.lockHours,
      timeLimitMinutes: examRow.timeLimitMinutes,
      questions: questions.map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options ?? [],
        position: q.position,
      })),
    };
  } catch {
    return null;
  }
}

export async function getExamWithAnswers(courseId: string) {
  try {
    const [examRow] = await db
      .select()
      .from(exam)
      .where(eq(exam.courseId, courseId))
      .limit(1);
    if (!examRow) return null;
    const questions = await db
      .select()
      .from(examQuestion)
      .where(eq(examQuestion.examId, examRow.id))
      .orderBy(asc(examQuestion.position));
    return { exam: examRow, questions };
  } catch {
    return null;
  }
}

export async function getApprovedJobs(): Promise<JobView[]> {
  try {
    const rows = await db
      .select()
      .from(job)
      .where(eq(job.status, "approved"))
      .orderBy(desc(job.featured), desc(job.createdAt));
    if (rows.length === 0) return demoJobs;
    return rows.map(mapJob);
  } catch {
    return demoJobs;
  }
}

export async function getJobById(id: string): Promise<JobView | null> {
  try {
    const [row] = await db.select().from(job).where(eq(job.id, id)).limit(1);
    if (!row) return demoJobs.find((j) => j.id === id) ?? null;
    return mapJob(row);
  } catch {
    return demoJobs.find((j) => j.id === id) ?? null;
  }
}

export async function getEnrollment(userId: string, courseId: string) {
  try {
    const [row] = await db
      .select()
      .from(enrollment)
      .where(
        and(eq(enrollment.userId, userId), eq(enrollment.courseId, courseId)),
      )
      .limit(1);
    return row ?? null;
  } catch {
    return null;
  }
}

export async function getEnrolledCourses(userId: string) {
  try {
    const rows = await db
      .select({ course, enrollment })
      .from(enrollment)
      .innerJoin(course, eq(enrollment.courseId, course.id))
      .where(eq(enrollment.userId, userId))
      .orderBy(desc(enrollment.enrolledAt));

    const courseIds = rows.map((r) => r.course.id);
    if (courseIds.length === 0) return [];

    const [lessonRows, progressRows] = await Promise.all([
      db.select().from(lesson).where(inArray(lesson.courseId, courseIds)),
      db
        .select()
        .from(lessonProgress)
        .where(eq(lessonProgress.userId, userId)),
    ]);

    return rows.map(({ course: c, enrollment: e }) => {
      const lessons = lessonRows.filter((l) => l.courseId === c.id);
      const done = lessons.filter(
        (l) =>
          progressRows.find(
            (p) => p.lessonId === l.id && p.completed,
          ) !== undefined,
      ).length;
      return {
        course: mapCourse(c),
        enrollment: e,
        totalLessons: lessons.length,
        completedLessons: done,
        progress:
          lessons.length === 0
            ? 0
            : Math.round((done / lessons.length) * 100),
      };
    });
  } catch {
    return [];
  }
}

export async function getCourseProgress(userId: string, courseId: string) {
  try {
    const rows = await db
      .select()
      .from(lessonProgress)
      .where(
        and(
          eq(lessonProgress.userId, userId),
          eq(lessonProgress.courseId, courseId),
        ),
      );
    return rows;
  } catch {
    return [];
  }
}

export async function getCertificates(userId: string) {
  try {
    return await db
      .select({ certificate, course })
      .from(certificate)
      .innerJoin(course, eq(certificate.courseId, course.id))
      .where(eq(certificate.userId, userId))
      .orderBy(desc(certificate.issuedAt));
  } catch {
    return [];
  }
}

export async function getStudentStats(userId: string) {
  try {
    const [enrolCount] = await db
      .select({ value: count() })
      .from(enrollment)
      .where(eq(enrollment.userId, userId));
    const [certCount] = await db
      .select({ value: count() })
      .from(certificate)
      .where(eq(certificate.userId, userId));
    const [completed] = await db
      .select({ value: count() })
      .from(enrollment)
      .where(
        and(
          eq(enrollment.userId, userId),
          eq(enrollment.status, "completed"),
        ),
      );
    const progressRows = await db
      .select()
      .from(lessonProgress)
      .where(
        and(
          eq(lessonProgress.userId, userId),
          eq(lessonProgress.completed, true),
        ),
      );
    return {
      enrolled: Number(enrolCount?.value ?? 0),
      certificates: Number(certCount?.value ?? 0),
      completed: Number(completed?.value ?? 0),
      lessonsDone: progressRows.length,
    };
  } catch {
    return { enrolled: 0, certificates: 0, completed: 0, lessonsDone: 0 };
  }
}

export async function getLatestAttempt(userId: string, examId: string) {
  try {
    const [row] = await db
      .select()
      .from(examAttempt)
      .where(
        and(eq(examAttempt.userId, userId), eq(examAttempt.examId, examId)),
      )
      .orderBy(desc(examAttempt.submittedAt))
      .limit(1);
    return row ?? null;
  } catch {
    return null;
  }
}

export async function getAttempts(userId: string, examId: string) {
  try {
    return await db
      .select()
      .from(examAttempt)
      .where(
        and(eq(examAttempt.userId, userId), eq(examAttempt.examId, examId)),
      )
      .orderBy(desc(examAttempt.submittedAt));
  } catch {
    return [];
  }
}

/* -------------------------------- Admin ------------------------------- */

export async function getAdminOverview() {
  try {
    const [courseCount] = await db.select({ value: count() }).from(course);
    const [studentCount] = await db
      .select({ value: count() })
      .from(user)
      .where(eq(user.role, "student"));
    const [enrolCount] = await db.select({ value: count() }).from(enrollment);
    const [pendingJobs] = await db
      .select({ value: count() })
      .from(job)
      .where(eq(job.status, "pending"));
    const [certCount] = await db.select({ value: count() }).from(certificate);
    return {
      courses: Number(courseCount?.value ?? 0),
      students: Number(studentCount?.value ?? 0),
      enrollments: Number(enrolCount?.value ?? 0),
      pendingJobs: Number(pendingJobs?.value ?? 0),
      certificates: Number(certCount?.value ?? 0),
    };
  } catch {
    return {
      courses: 0,
      students: 0,
      enrollments: 0,
      pendingJobs: 0,
      certificates: 0,
    };
  }
}

export async function getAllCourses() {
  try {
    return (await db.select().from(course).orderBy(desc(course.createdAt))).map(
      (row) => mapCourse(row),
    );
  } catch {
    return [];
  }
}

export async function getAllJobs() {
  try {
    return (await db.select().from(job).orderBy(desc(job.createdAt))).map(
      mapJob,
    );
  } catch {
    return demoJobs;
  }
}

export async function getAllStudents() {
  try {
    return await db
      .select()
      .from(user)
      .where(eq(user.role, "student"))
      .orderBy(desc(user.createdAt));
  } catch {
    return [];
  }
}

export async function getCertificateByNo(certificateNo: string) {
  try {
    const [row] = await db
      .select({ certificate, course, student: user })
      .from(certificate)
      .innerJoin(course, eq(certificate.courseId, course.id))
      .innerJoin(user, eq(certificate.userId, user.id))
      .where(eq(certificate.certificateNo, certificateNo))
      .limit(1);
    return row ?? null;
  } catch {
    return null;
  }
}

export async function getCertificateForCourse(
  userId: string,
  courseId: string,
) {
  try {
    const [row] = await db
      .select()
      .from(certificate)
      .where(
        and(
          eq(certificate.userId, userId),
          eq(certificate.courseId, courseId),
        ),
      )
      .limit(1);
    return row ?? null;
  } catch {
    return null;
  }
}

export async function getPptTemplates() {
  try {
    return await db
      .select()
      .from(pptTemplate)
      .orderBy(desc(pptTemplate.createdAt));
  } catch (error) {
    console.error("getPptTemplates failed", error);
    return [];
  }
}
