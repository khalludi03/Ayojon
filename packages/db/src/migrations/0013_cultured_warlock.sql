CREATE TABLE "rate_limit" (
	"key" text PRIMARY KEY NOT NULL,
	"count" text DEFAULT '0' NOT NULL,
	"last_attempt" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE INDEX "rate_limit_expiresAt_idx" ON "rate_limit" USING btree ("expires_at");