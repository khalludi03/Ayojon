ALTER TABLE "rate_limit" ALTER COLUMN "count" DROP DEFAULT;
--> statement-breakpoint
ALTER TABLE "rate_limit" ALTER COLUMN "count" SET DATA TYPE integer USING count::integer;
--> statement-breakpoint
ALTER TABLE "rate_limit" ALTER COLUMN "count" SET DEFAULT 0;