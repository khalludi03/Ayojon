import { Pool } from 'pg';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load env from server
dotenv.config({ path: resolve(__dirname, '../apps/server/.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const migrationSQL = `
CREATE TABLE IF NOT EXISTS "home_banners" (
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

CREATE TABLE IF NOT EXISTS "home_promo_cards" (
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

CREATE INDEX IF NOT EXISTS "home_banners_is_active_idx" ON "home_banners" USING btree ("is_active");
CREATE INDEX IF NOT EXISTS "home_banners_sort_order_idx" ON "home_banners" USING btree ("sort_order");
CREATE INDEX IF NOT EXISTS "home_banners_active_sort_idx" ON "home_banners" USING btree ("is_active","sort_order");
CREATE INDEX IF NOT EXISTS "home_promo_cards_slot_number_idx" ON "home_promo_cards" USING btree ("slot_number");
CREATE INDEX IF NOT EXISTS "home_promo_cards_is_active_idx" ON "home_promo_cards" USING btree ("is_active");
`;

async function migrate() {
  console.log('Applying homepage tables migration...');

  try {
    await pool.query(migrationSQL);
    console.log('✅ Migration applied successfully!');

    // Check tables
    const { rows } = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_name IN ('home_banners', 'home_promo_cards');
    `);

    console.log('Tables created:', rows.map(r => r.table_name).join(', '));
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
