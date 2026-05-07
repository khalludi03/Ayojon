ALTER TABLE "rate_limit" ALTER COLUMN "count" DROP DEFAULT;
ALTER TABLE "rate_limit" ALTER COLUMN "count" SET DATA TYPE integer USING count::integer;
ALTER TABLE "rate_limit" ALTER COLUMN "count" SET DEFAULT 0;