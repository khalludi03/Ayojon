CREATE TABLE "home_banners" (
	"id" text PRIMARY KEY NOT NULL,
	"image_url" text NOT NULL,
	"title" text NOT NULL,
	"subtitle" text NOT NULL,
	"button_text" text NOT NULL,
	"button_link" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "home_promo_cards" (
	"id" text PRIMARY KEY NOT NULL,
	"slot_number" integer NOT NULL,
	"image_url" text NOT NULL,
	"label" text NOT NULL,
	"title" text NOT NULL,
	"link" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "home_promo_cards_slot_number_unique" UNIQUE("slot_number")
);
--> statement-breakpoint
CREATE INDEX "home_banners_is_active_idx" ON "home_banners" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "home_banners_sort_order_idx" ON "home_banners" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "home_banners_active_sort_idx" ON "home_banners" USING btree ("is_active","sort_order");--> statement-breakpoint
CREATE INDEX "home_promo_cards_slot_number_idx" ON "home_promo_cards" USING btree ("slot_number");--> statement-breakpoint
CREATE INDEX "home_promo_cards_is_active_idx" ON "home_promo_cards" USING btree ("is_active");