CREATE TABLE "attachment" (
	"id" text PRIMARY KEY,
	"course_id" text NOT NULL,
	"lesson_id" text,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"file_type" text,
	"file_size" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "certificate" (
	"id" text PRIMARY KEY,
	"certificate_no" text NOT NULL,
	"user_id" text NOT NULL,
	"course_id" text NOT NULL,
	"attempt_id" text,
	"score" integer DEFAULT 0 NOT NULL,
	"issued_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course" (
	"id" text PRIMARY KEY,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"subtitle" text,
	"description" text DEFAULT '' NOT NULL,
	"category" text DEFAULT 'Development' NOT NULL,
	"level" text DEFAULT 'Beginner' NOT NULL,
	"language" text DEFAULT 'English' NOT NULL,
	"thumbnail" text,
	"trailer_url" text,
	"price" integer DEFAULT 0 NOT NULL,
	"is_free" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"duration_minutes" integer DEFAULT 0 NOT NULL,
	"instructor_name" text DEFAULT 'Sqrock Academy' NOT NULL,
	"instructor_role" text DEFAULT 'Lead Instructor',
	"instructor_image" text,
	"certificate_enabled" boolean DEFAULT true NOT NULL,
	"exam_pass_percent" integer DEFAULT 70 NOT NULL,
	"exam_lock_hours" integer DEFAULT 48 NOT NULL,
	"outcomes" jsonb DEFAULT '[]',
	"requirements" jsonb DEFAULT '[]',
	"tags" jsonb DEFAULT '[]',
	"enrollments" integer DEFAULT 0 NOT NULL,
	"rating" integer DEFAULT 48 NOT NULL,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enrollment" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"course_id" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"enrolled_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "exam" (
	"id" text PRIMARY KEY,
	"course_id" text NOT NULL,
	"title" text DEFAULT 'Final certification exam' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"pass_percent" integer DEFAULT 70 NOT NULL,
	"lock_hours" integer DEFAULT 48 NOT NULL,
	"time_limit_minutes" integer DEFAULT 30 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exam_attempt" (
	"id" text PRIMARY KEY,
	"exam_id" text NOT NULL,
	"user_id" text NOT NULL,
	"course_id" text NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"passed" boolean DEFAULT false NOT NULL,
	"answers" jsonb DEFAULT '[]',
	"submitted_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exam_question" (
	"id" text PRIMARY KEY,
	"exam_id" text NOT NULL,
	"question" text NOT NULL,
	"options" jsonb DEFAULT '[]' NOT NULL,
	"correct_index" integer DEFAULT 0 NOT NULL,
	"explanation" text,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job" (
	"id" text PRIMARY KEY,
	"title" text NOT NULL,
	"company" text NOT NULL,
	"company_logo" text,
	"company_website" text,
	"type" text DEFAULT 'job' NOT NULL,
	"location" text DEFAULT 'Remote' NOT NULL,
	"work_mode" text DEFAULT 'Remote' NOT NULL,
	"category" text DEFAULT 'Engineering' NOT NULL,
	"experience" text DEFAULT 'Fresher',
	"salary" text,
	"description" text DEFAULT '' NOT NULL,
	"apply_url" text,
	"apply_email" text,
	"contact_email" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"posted_by" text,
	"approved_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "lesson" (
	"id" text PRIMARY KEY,
	"course_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"video_type" text DEFAULT 'youtube' NOT NULL,
	"video_url" text DEFAULT '' NOT NULL,
	"video_key" text,
	"duration_minutes" integer DEFAULT 0 NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"is_preview" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lesson_progress" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"course_id" text NOT NULL,
	"lesson_id" text NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" text DEFAULT 'student' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "headline" text;--> statement-breakpoint
CREATE INDEX "attachment_course_idx" ON "attachment" ("course_id");--> statement-breakpoint
CREATE UNIQUE INDEX "certificate_no_idx" ON "certificate" ("certificate_no");--> statement-breakpoint
CREATE UNIQUE INDEX "certificate_user_course_idx" ON "certificate" ("user_id","course_id");--> statement-breakpoint
CREATE UNIQUE INDEX "course_slug_idx" ON "course" ("slug");--> statement-breakpoint
CREATE INDEX "course_status_idx" ON "course" ("status");--> statement-breakpoint
CREATE INDEX "course_category_idx" ON "course" ("category");--> statement-breakpoint
CREATE UNIQUE INDEX "enrollment_user_course_idx" ON "enrollment" ("user_id","course_id");--> statement-breakpoint
CREATE UNIQUE INDEX "exam_course_idx" ON "exam" ("course_id");--> statement-breakpoint
CREATE INDEX "attempt_user_exam_idx" ON "exam_attempt" ("user_id","exam_id");--> statement-breakpoint
CREATE INDEX "question_exam_idx" ON "exam_question" ("exam_id");--> statement-breakpoint
CREATE INDEX "job_status_idx" ON "job" ("status");--> statement-breakpoint
CREATE INDEX "job_type_idx" ON "job" ("type");--> statement-breakpoint
CREATE INDEX "lesson_course_idx" ON "lesson" ("course_id");--> statement-breakpoint
CREATE UNIQUE INDEX "progress_user_lesson_idx" ON "lesson_progress" ("user_id","lesson_id");--> statement-breakpoint
ALTER TABLE "attachment" ADD CONSTRAINT "attachment_course_id_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "attachment" ADD CONSTRAINT "attachment_lesson_id_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lesson"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "certificate" ADD CONSTRAINT "certificate_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "certificate" ADD CONSTRAINT "certificate_course_id_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "certificate" ADD CONSTRAINT "certificate_attempt_id_exam_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "exam_attempt"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "course" ADD CONSTRAINT "course_created_by_user_id_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enrollment" ADD CONSTRAINT "enrollment_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "enrollment" ADD CONSTRAINT "enrollment_course_id_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "exam" ADD CONSTRAINT "exam_course_id_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "exam_attempt" ADD CONSTRAINT "exam_attempt_exam_id_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "exam"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "exam_attempt" ADD CONSTRAINT "exam_attempt_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "exam_attempt" ADD CONSTRAINT "exam_attempt_course_id_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "exam_question" ADD CONSTRAINT "exam_question_exam_id_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "exam"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "job" ADD CONSTRAINT "job_posted_by_user_id_fkey" FOREIGN KEY ("posted_by") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "job" ADD CONSTRAINT "job_approved_by_user_id_fkey" FOREIGN KEY ("approved_by") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lesson" ADD CONSTRAINT "lesson_course_id_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_course_id_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_lesson_id_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lesson"("id") ON DELETE CASCADE;