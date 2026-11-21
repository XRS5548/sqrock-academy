CREATE TABLE "ppt_template" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"file_url" text NOT NULL,
	"file_key" text,
	"placeholders" jsonb DEFAULT '[]',
	"file_size" integer,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "ppt_template_created_idx" ON "ppt_template" ("created_at");--> statement-breakpoint
ALTER TABLE "ppt_template" ADD CONSTRAINT "ppt_template_created_by_user_id_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE SET NULL;