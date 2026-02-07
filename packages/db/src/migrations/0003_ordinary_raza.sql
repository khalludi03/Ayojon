ALTER TABLE "user" ADD COLUMN "is_deactivated" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "deactivated_at" timestamp;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "retention_until" timestamp;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "deactivation_reason" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "deactivation_feedback" text;