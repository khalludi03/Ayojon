ALTER TABLE "vendors" ADD COLUMN "score" numeric(3, 2) DEFAULT 0;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "recommend" boolean DEFAULT true NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "reviews_product_user_unique_idx" ON "reviews" USING btree ("product_id","user_id");