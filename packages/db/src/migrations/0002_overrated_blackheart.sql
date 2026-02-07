CREATE TABLE "address" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"address_line1" text NOT NULL,
	"address_line2" text,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"postal_code" text NOT NULL,
	"country" text NOT NULL,
	"type" text DEFAULT 'home' NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "address" ADD CONSTRAINT "address_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "address_userId_idx" ON "address" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "address_isDefault_idx" ON "address" USING btree ("is_default");