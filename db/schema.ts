import { relations } from "drizzle-orm/_relations";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/* ------------------------------- Auth ------------------------------- */

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  // "student" | "admin" | "instructor"
  role: text("role").default("student").notNull(),
  headline: text("headline"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

/* ------------------------------ Courses ----------------------------- */

export const course = pgTable(
  "course",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    subtitle: text("subtitle"),
    description: text("description").notNull().default(""),
    category: text("category").notNull().default("Development"),
    level: text("level").notNull().default("Beginner"),
    language: text("language").notNull().default("English"),
    thumbnail: text("thumbnail"),
    trailerUrl: text("trailer_url"),
    price: integer("price").notNull().default(0), // in INR
    isFree: boolean("is_free").notNull().default(false),
    status: text("status").notNull().default("draft"), // draft | published
    durationMinutes: integer("duration_minutes").notNull().default(0),
    instructorName: text("instructor_name").notNull().default("Sqrock Academy"),
    instructorRole: text("instructor_role").default("Lead Instructor"),
    instructorImage: text("instructor_image"),
    certificateEnabled: boolean("certificate_enabled").notNull().default(true),
    examPassPercent: integer("exam_pass_percent").notNull().default(70),
    examLockHours: integer("exam_lock_hours").notNull().default(48),
    outcomes: jsonb("outcomes").$type<string[]>().default([]),
    requirements: jsonb("requirements").$type<string[]>().default([]),
    tags: jsonb("tags").$type<string[]>().default([]),
    enrollments: integer("enrollments").notNull().default(0),
    rating: integer("rating").notNull().default(48), // rating * 10
    createdBy: text("created_by").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("course_slug_idx").on(table.slug),
    index("course_status_idx").on(table.status),
    index("course_category_idx").on(table.category),
  ],
);

export const lesson = pgTable(
  "lesson",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    courseId: text("course_id")
      .notNull()
      .references(() => course.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    // youtube (unlisted) | r2 (uploaded video)
    videoType: text("video_type").notNull().default("youtube"),
    videoUrl: text("video_url").notNull().default(""),
    videoKey: text("video_key"),
    durationMinutes: integer("duration_minutes").notNull().default(0),
    position: integer("position").notNull().default(0),
    isPreview: boolean("is_preview").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("lesson_course_idx").on(table.courseId)],
);

export const attachment = pgTable(
  "attachment",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    courseId: text("course_id")
      .notNull()
      .references(() => course.id, { onDelete: "cascade" }),
    lessonId: text("lesson_id").references(() => lesson.id, {
      onDelete: "cascade",
    }),
    name: text("name").notNull(),
    url: text("url").notNull(),
    fileType: text("file_type"),
    fileSize: integer("file_size"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("attachment_course_idx").on(table.courseId)],
);

/* ---------------------------- Enrollment ---------------------------- */

export const enrollment = pgTable(
  "enrollment",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    courseId: text("course_id")
      .notNull()
      .references(() => course.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("active"), // active | completed
    enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
  },
  (table) => [
    uniqueIndex("enrollment_user_course_idx").on(table.userId, table.courseId),
  ],
);

export const lessonProgress = pgTable(
  "lesson_progress",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    courseId: text("course_id")
      .notNull()
      .references(() => course.id, { onDelete: "cascade" }),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lesson.id, { onDelete: "cascade" }),
    completed: boolean("completed").notNull().default(false),
    completedAt: timestamp("completed_at"),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("progress_user_lesson_idx").on(table.userId, table.lessonId),
  ],
);

/* ------------------------------- Exams ------------------------------ */

export const exam = pgTable(
  "exam",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    courseId: text("course_id")
      .notNull()
      .references(() => course.id, { onDelete: "cascade" }),
    title: text("title").notNull().default("Final certification exam"),
    description: text("description").notNull().default(""),
    passPercent: integer("pass_percent").notNull().default(70),
    lockHours: integer("lock_hours").notNull().default(48),
    timeLimitMinutes: integer("time_limit_minutes").notNull().default(30),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("exam_course_idx").on(table.courseId)],
);

export const examQuestion = pgTable(
  "exam_question",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    examId: text("exam_id")
      .notNull()
      .references(() => exam.id, { onDelete: "cascade" }),
    question: text("question").notNull(),
    options: jsonb("options").$type<string[]>().notNull().default([]),
    correctIndex: integer("correct_index").notNull().default(0),
    explanation: text("explanation"),
    position: integer("position").notNull().default(0),
  },
  (table) => [index("question_exam_idx").on(table.examId)],
);

export const examAttempt = pgTable(
  "exam_attempt",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    examId: text("exam_id")
      .notNull()
      .references(() => exam.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    courseId: text("course_id")
      .notNull()
      .references(() => course.id, { onDelete: "cascade" }),
    score: integer("score").notNull().default(0),
    passed: boolean("passed").notNull().default(false),
    answers: jsonb("answers").$type<number[]>().default([]),
    submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  },
  (table) => [
    index("attempt_user_exam_idx").on(table.userId, table.examId),
  ],
);

export const certificate = pgTable(
  "certificate",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    certificateNo: text("certificate_no").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    courseId: text("course_id")
      .notNull()
      .references(() => course.id, { onDelete: "cascade" }),
    attemptId: text("attempt_id").references(() => examAttempt.id, {
      onDelete: "set null",
    }),
    score: integer("score").notNull().default(0),
    issuedAt: timestamp("issued_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("certificate_no_idx").on(table.certificateNo),
    uniqueIndex("certificate_user_course_idx").on(table.userId, table.courseId),
  ],
);

/* -------------------------------- Jobs ------------------------------ */

export const job = pgTable(
  "job",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    title: text("title").notNull(),
    company: text("company").notNull(),
    companyLogo: text("company_logo"),
    companyWebsite: text("company_website"),
    type: text("type").notNull().default("job"), // job | internship
    location: text("location").notNull().default("Remote"),
    workMode: text("work_mode").notNull().default("Remote"),
    category: text("category").notNull().default("Engineering"),
    experience: text("experience").default("Fresher"),
    salary: text("salary"),
    description: text("description").notNull().default(""),
    applyUrl: text("apply_url"),
    applyEmail: text("apply_email"),
    contactEmail: text("contact_email"),
    status: text("status").notNull().default("pending"), // pending | approved | rejected
    featured: boolean("featured").notNull().default(false),
    postedBy: text("posted_by").references(() => user.id, {
      onDelete: "set null",
    }),
    approvedBy: text("approved_by").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at"),
  },
  (table) => [
    index("job_status_idx").on(table.status),
    index("job_type_idx").on(table.type),
  ],
);

/* ---------------------------- Relations ----------------------------- */

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  enrollments: many(enrollment),
  certificates: many(certificate),
  attempts: many(examAttempt),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const courseRelations = relations(course, ({ many, one }) => ({
  lessons: many(lesson),
  attachments: many(attachment),
  enrollments: many(enrollment),
  exam: one(exam, { fields: [course.id], references: [exam.courseId] }),
  author: one(user, { fields: [course.createdBy], references: [user.id] }),
}));

export const lessonRelations = relations(lesson, ({ one, many }) => ({
  course: one(course, { fields: [lesson.courseId], references: [course.id] }),
  attachments: many(attachment),
}));

export const enrollmentRelations = relations(enrollment, ({ one }) => ({
  user: one(user, { fields: [enrollment.userId], references: [user.id] }),
  course: one(course, {
    fields: [enrollment.courseId],
    references: [course.id],
  }),
}));

export const examRelations = relations(exam, ({ one, many }) => ({
  course: one(course, { fields: [exam.courseId], references: [course.id] }),
  questions: many(examQuestion),
  attempts: many(examAttempt),
}));

export const attemptRelations = relations(examAttempt, ({ one }) => ({
  exam: one(exam, { fields: [examAttempt.examId], references: [exam.id] }),
  user: one(user, { fields: [examAttempt.userId], references: [user.id] }),
}));

export const certificateRelations = relations(certificate, ({ one }) => ({
  user: one(user, { fields: [certificate.userId], references: [user.id] }),
  course: one(course, {
    fields: [certificate.courseId],
    references: [course.id],
  }),
}));

export const jobRelations = relations(job, ({ one }) => ({
  author: one(user, { fields: [job.postedBy], references: [user.id] }),
}));
