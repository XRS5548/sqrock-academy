ALTER TABLE "course" ADD COLUMN "certificate_template_name" text;--> statement-breakpoint
ALTER TABLE "course" ADD COLUMN "certificate_template_url" text;--> statement-breakpoint
ALTER TABLE "course" ADD COLUMN "certificate_template_key" text;--> statement-breakpoint
ALTER TABLE "course" ADD COLUMN "certificate_placeholders" jsonb DEFAULT '[]';