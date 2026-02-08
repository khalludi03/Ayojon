CREATE TABLE "platform_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"platform_name" text DEFAULT 'Ayojon' NOT NULL,
	"contact_email" text NOT NULL,
	"support_phone" text NOT NULL,
	"platform_commission" integer DEFAULT 10 NOT NULL,
	"free_shipping_threshold" integer DEFAULT 2000 NOT NULL,
	"inside_dhaka_rate" integer DEFAULT 60 NOT NULL,
	"outside_dhaka_rate" integer DEFAULT 120 NOT NULL,
	"enable_guest_checkout" boolean DEFAULT true NOT NULL,
	"enable_vendor_registration" boolean DEFAULT true NOT NULL,
	"is_maintenance_mode" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
