CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"icon" text NOT NULL,
	"description" text,
	"image_url" text,
	"product_count" integer DEFAULT 0 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "event_types" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"icon_url" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "event_types_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "subcategories" (
	"id" text PRIMARY KEY NOT NULL,
	"parent_id" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"image_url" text,
	"product_count" integer DEFAULT 0 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subcategories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "vendors" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"logo_url" text,
	"banner_url" text,
	"location" text NOT NULL,
	"address" text,
	"phone" text,
	"email" text,
	"website" text,
	"is_verified" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"rating_average" numeric(2, 1) DEFAULT '0',
	"rating_count" integer DEFAULT 0 NOT NULL,
	"product_count" integer DEFAULT 0 NOT NULL,
	"total_sales" integer DEFAULT 0 NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "vendors_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "vendors_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "product_event_types" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"event_type_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_images" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"url" text NOT NULL,
	"alt" text,
	"is_primary" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_prices" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"price_type" text DEFAULT 'regular' NOT NULL,
	"price" numeric(12, 2) NOT NULL,
	"min_quantity" integer DEFAULT 1 NOT NULL,
	"max_quantity" integer,
	"starts_at" timestamp,
	"ends_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_shipping_options" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"method" text NOT NULL,
	"cost" numeric(10, 2) NOT NULL,
	"estimated_days" integer NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_specifications" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_variants" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"type" text NOT NULL,
	"value" text NOT NULL,
	"price_modifier" numeric(10, 2) DEFAULT '0' NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"sku" text,
	"image_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" text PRIMARY KEY NOT NULL,
	"vendor_id" text NOT NULL,
	"category_id" text NOT NULL,
	"subcategory_id" text,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"description_short" text,
	"brand" text,
	"sku" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"stock_status" text DEFAULT 'in_stock' NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"low_stock_threshold" integer DEFAULT 5 NOT NULL,
	"price" numeric(12, 2) NOT NULL,
	"sale_price" numeric(12, 2),
	"discount_percentage" integer,
	"currency" text DEFAULT 'BDT' NOT NULL,
	"rating_average" numeric(2, 1) DEFAULT '0',
	"rating_count" integer DEFAULT 0 NOT NULL,
	"weight_kg" numeric(6, 2),
	"dimension_length_cm" numeric(6, 2),
	"dimension_width_cm" numeric(6, 2),
	"dimension_height_cm" numeric(6, 2),
	"is_fragile" boolean DEFAULT false NOT NULL,
	"setup_required" boolean DEFAULT false NOT NULL,
	"free_shipping" boolean DEFAULT false NOT NULL,
	"shipping_cost" numeric(10, 2),
	"shipping_estimated_days" integer,
	"content" jsonb,
	"deal_type" text,
	"deal_starts_at" timestamp,
	"deal_ends_at" timestamp,
	"is_featured" boolean DEFAULT false NOT NULL,
	"condition" text DEFAULT 'new' NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"sales_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "review_images" (
	"id" text PRIMARY KEY NOT NULL,
	"review_id" text NOT NULL,
	"url" text NOT NULL,
	"alt" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review_votes" (
	"id" text PRIMARY KEY NOT NULL,
	"review_id" text NOT NULL,
	"user_id" text NOT NULL,
	"vote_type" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"user_id" text NOT NULL,
	"rating" integer NOT NULL,
	"title" text,
	"comment" text NOT NULL,
	"is_verified_purchase" boolean DEFAULT false NOT NULL,
	"is_anonymous" boolean DEFAULT false NOT NULL,
	"is_approved" boolean DEFAULT true NOT NULL,
	"is_flagged" boolean DEFAULT false NOT NULL,
	"helpful_votes" integer DEFAULT 0 NOT NULL,
	"not_helpful_votes" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vendor_ratings" (
	"id" text PRIMARY KEY NOT NULL,
	"vendor_id" text NOT NULL,
	"user_id" text NOT NULL,
	"overall_rating" integer NOT NULL,
	"communication_rating" integer,
	"delivery_rating" integer,
	"quality_rating" integer,
	"comment" text,
	"is_verified_purchase" boolean DEFAULT false NOT NULL,
	"is_approved" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subcategories" ADD CONSTRAINT "subcategories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_event_types" ADD CONSTRAINT "product_event_types_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_event_types" ADD CONSTRAINT "product_event_types_event_type_id_event_types_id_fk" FOREIGN KEY ("event_type_id") REFERENCES "public"."event_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_prices" ADD CONSTRAINT "product_prices_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_shipping_options" ADD CONSTRAINT "product_shipping_options_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_specifications" ADD CONSTRAINT "product_specifications_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_subcategory_id_subcategories_id_fk" FOREIGN KEY ("subcategory_id") REFERENCES "public"."subcategories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_images" ADD CONSTRAINT "review_images_review_id_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_votes" ADD CONSTRAINT "review_votes_review_id_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_votes" ADD CONSTRAINT "review_votes_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_ratings" ADD CONSTRAINT "vendor_ratings_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_ratings" ADD CONSTRAINT "vendor_ratings_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "subcategories_parent_id_idx" ON "subcategories" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "vendors_user_id_idx" ON "vendors" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "vendors_slug_idx" ON "vendors" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "vendors_location_idx" ON "vendors" USING btree ("location");--> statement-breakpoint
CREATE INDEX "vendors_is_verified_idx" ON "vendors" USING btree ("is_verified");--> statement-breakpoint
CREATE INDEX "product_event_types_product_id_idx" ON "product_event_types" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_event_types_event_type_id_idx" ON "product_event_types" USING btree ("event_type_id");--> statement-breakpoint
CREATE INDEX "product_images_product_id_idx" ON "product_images" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_images_is_primary_idx" ON "product_images" USING btree ("product_id","is_primary");--> statement-breakpoint
CREATE INDEX "product_prices_product_id_idx" ON "product_prices" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_prices_price_type_idx" ON "product_prices" USING btree ("product_id","price_type");--> statement-breakpoint
CREATE INDEX "product_shipping_options_product_id_idx" ON "product_shipping_options" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_specifications_product_id_idx" ON "product_specifications" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_variants_product_id_idx" ON "product_variants" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_variants_type_idx" ON "product_variants" USING btree ("product_id","type");--> statement-breakpoint
CREATE INDEX "products_vendor_id_idx" ON "products" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "products_category_id_idx" ON "products" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "products_subcategory_id_idx" ON "products" USING btree ("subcategory_id");--> statement-breakpoint
CREATE INDEX "products_status_idx" ON "products" USING btree ("status");--> statement-breakpoint
CREATE INDEX "products_stock_status_idx" ON "products" USING btree ("stock_status");--> statement-breakpoint
CREATE INDEX "products_price_idx" ON "products" USING btree ("price");--> statement-breakpoint
CREATE INDEX "products_rating_average_idx" ON "products" USING btree ("rating_average");--> statement-breakpoint
CREATE INDEX "products_is_featured_idx" ON "products" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "products_deal_type_idx" ON "products" USING btree ("deal_type");--> statement-breakpoint
CREATE INDEX "products_deal_ends_at_idx" ON "products" USING btree ("deal_ends_at");--> statement-breakpoint
CREATE INDEX "products_slug_idx" ON "products" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "products_category_status_idx" ON "products" USING btree ("category_id","status");--> statement-breakpoint
CREATE INDEX "products_vendor_status_idx" ON "products" USING btree ("vendor_id","status");--> statement-breakpoint
CREATE INDEX "products_status_category_price_idx" ON "products" USING btree ("status","category_id","price");--> statement-breakpoint
CREATE INDEX "review_images_review_id_idx" ON "review_images" USING btree ("review_id");--> statement-breakpoint
CREATE INDEX "review_votes_review_id_idx" ON "review_votes" USING btree ("review_id");--> statement-breakpoint
CREATE INDEX "review_votes_user_id_idx" ON "review_votes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "review_votes_unique_idx" ON "review_votes" USING btree ("review_id","user_id");--> statement-breakpoint
CREATE INDEX "reviews_product_id_idx" ON "reviews" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "reviews_user_id_idx" ON "reviews" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "reviews_rating_idx" ON "reviews" USING btree ("product_id","rating");--> statement-breakpoint
CREATE INDEX "reviews_is_verified_purchase_idx" ON "reviews" USING btree ("product_id","is_verified_purchase");--> statement-breakpoint
CREATE INDEX "reviews_created_at_idx" ON "reviews" USING btree ("product_id","created_at");--> statement-breakpoint
CREATE INDEX "vendor_ratings_vendor_id_idx" ON "vendor_ratings" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "vendor_ratings_user_id_idx" ON "vendor_ratings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "vendor_ratings_overall_rating_idx" ON "vendor_ratings" USING btree ("vendor_id","overall_rating");