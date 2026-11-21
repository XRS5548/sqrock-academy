import "dotenv/config";
import { randomUUID } from "node:crypto";
import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { hashPassword } from "better-auth/crypto";
import {
  account,
  attachment,
  course,
  exam,
  examQuestion,
  job,
  lesson,
  user,
} from "../db/schema";
import { demoCourses, demoJobs } from "../lib/demo-data";

const db = drizzle({
  client: new Pool({ connectionString: process.env.DATABASE_URL }),
});

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@sqrock.cloud";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "Admin@12345";

  const [existing] = await db
    .select()
    .from(user)
    .where(eq(user.email, email))
    .limit(1);
  if (existing) {
    if (existing.role !== "admin") {
      await db.update(user).set({ role: "admin" }).where(eq(user.id, existing.id));
      console.log(`Promoted existing user ${email} to admin.`);
    } else {
      console.log(`Admin ${email} already exists.`);
    }
    return existing.id;
  }

  const userId = randomUUID();
  await db.insert(user).values({
    id: userId,
    name: "Sqrock Admin",
    email,
    emailVerified: true,
    role: "admin",
  });

  await db.insert(account).values({
    id: randomUUID(),
    accountId: userId,
    providerId: "credential",
    userId,
    password: await hashPassword(password),
  });

  console.log(`Created admin account: ${email} / ${password}`);
  return userId;
}

const examQuestionsFor = (title: string, category: string) => [
  {
    question: `What is the main focus of "${title}"?`,
    options: [
      `Practical ${category.toLowerCase()} skills you can apply in real projects`,
      "Learning only theory without any exercises",
      "Memorising exam answers",
      "Watching videos without practicing",
    ],
    correctIndex: 0,
    explanation: "The course is built around practical, job-ready skills.",
  },
  {
    question: "What should you do before taking the final exam?",
    options: [
      "Complete every lesson in the course",
      "Skip the projects and go straight to the exam",
      "Ask someone else to take it for you",
      "Wait for the mobile app",
    ],
    correctIndex: 0,
    explanation: "The exam unlocks after all lessons are marked complete.",
  },
  {
    question: "What happens if you do not pass the final exam?",
    options: [
      "You can retry after the lock period (48 hours by default)",
      "You are permanently blocked from the course",
      "You get the certificate anyway",
      "You have to buy the course again",
    ],
    correctIndex: 0,
    explanation: "Failed attempts lock the exam for the configured retry period.",
  },
  {
    question: "What unlocks your certificate?",
    options: [
      "Passing the final exam with the minimum marks",
      "Watching the first video",
      "Creating an account",
      "Downloading every attachment",
    ],
    correctIndex: 0,
    explanation: "Certificates are issued only after passing the final exam.",
  },
];

async function seedCourses(adminId: string) {
  for (const demo of demoCourses) {
    const [existing] = await db
      .select()
      .from(course)
      .where(eq(course.slug, demo.slug))
      .limit(1);
    if (existing) {
      console.log(`Course exists, skipping: ${demo.title}`);
      continue;
    }

    const [created] = await db
      .insert(course)
      .values({
        slug: demo.slug,
        title: demo.title,
        subtitle: demo.subtitle,
        description: demo.description,
        category: demo.category,
        level: demo.level,
        language: demo.language,
        price: demo.price,
        isFree: demo.isFree,
        status: "published",
        durationMinutes: demo.durationMinutes,
        instructorName: demo.instructorName,
        instructorRole: demo.instructorRole,
        certificateEnabled: demo.certificateEnabled,
        examPassPercent: demo.examPassPercent,
        examLockHours: demo.examLockHours,
        outcomes: demo.outcomes,
        requirements: demo.requirements,
        tags: demo.tags,
        enrollments: demo.enrollments,
        rating: demo.rating,
        createdBy: adminId,
      })
      .returning();

    for (const item of demo.lessons) {
      const [createdLesson] = await db
        .insert(lesson)
        .values({
          courseId: created.id,
          title: item.title,
          description: item.description,
          videoType: item.videoType === "r2" ? "r2" : "youtube",
          videoUrl: item.videoUrl,
          durationMinutes: item.durationMinutes,
          position: item.position,
          isPreview: item.isPreview,
        })
        .returning();

      if (item.attachments.length > 0) {
        await db.insert(attachment).values(
          item.attachments.map((file) => ({
            courseId: created.id,
            lessonId: createdLesson.id,
            name: file.name,
            url: file.url,
            fileType: file.fileType,
          })),
        );
      }
    }

    const [createdExam] = await db
      .insert(exam)
      .values({
        courseId: created.id,
        title: `${demo.title} — Final exam`,
        description:
          "Pass this exam to unlock your certificate. If you do not pass, you can retry after the lock period.",
        passPercent: demo.examPassPercent,
        lockHours: demo.examLockHours,
      })
      .returning();

    const questions = examQuestionsFor(demo.title, demo.category);
    await db.insert(examQuestion).values(
      questions.map((question, index) => ({
        examId: createdExam.id,
        question: question.question,
        options: question.options,
        correctIndex: question.correctIndex,
        explanation: question.explanation,
        position: index + 1,
      })),
    );

    console.log(`Seeded course: ${demo.title}`);
  }
}

async function seedJobs() {
  for (const demo of demoJobs) {
    const [existing] = await db
      .select()
      .from(job)
      .where(and(eq(job.title, demo.title), eq(job.company, demo.company)))
      .limit(1);
    if (existing) continue;

    await db.insert(job).values({
      title: demo.title,
      company: demo.company,
      type: demo.type === "internship" ? "internship" : "job",
      location: demo.location,
      workMode: demo.workMode,
      category: demo.category,
      experience: demo.experience,
      salary: demo.salary,
      description: demo.description,
      applyUrl: demo.applyUrl,
      applyEmail: demo.applyEmail,
      status: "approved",
      featured: demo.featured,
      createdAt: demo.createdAt,
    });
    console.log(`Seeded job: ${demo.title} @ ${demo.company}`);
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set. Add it to .env first.");
    process.exit(1);
  }

  console.log("Seeding Sqrock Academy…");
  const adminId = await seedAdmin();
  await seedCourses(adminId);
  await seedJobs();
  console.log("Done.");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
