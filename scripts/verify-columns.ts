import { db } from "../packages/db/src/index";
import { sql } from "drizzle-orm";

async function verify() {
  try {
    console.log("Checking payments table columns...");
    const paymentCols = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'payments'
    `);
    console.log("Payments columns:", paymentCols.rows.map(r => r.column_name).join(", "));

    console.log("\nChecking vendors table columns...");
    const vendorCols = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'vendors'
    `);
    console.log("Vendors columns:", vendorCols.rows.map(r => r.column_name).join(", "));

    process.exit(0);
  } catch (err) {
    console.error("Verification failed:", err);
    process.exit(1);
  }
}

verify();