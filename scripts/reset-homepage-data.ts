import { Pool } from 'pg';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load env from server
dotenv.config({ path: resolve(__dirname, '../apps/server/.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function reset() {
  console.log('Resetting homepage data...');

  try {
    // Delete all existing data
    await pool.query('DELETE FROM home_banners');
    await pool.query('DELETE FROM home_promo_cards');

    console.log('✅ Cleared all homepage data');
    console.log('Now run: bun /home/takib/Documents/nemo/my-better-t-app/scripts/seed-homepage-data.ts');
  } catch (error) {
    console.error('❌ Reset failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

reset();
