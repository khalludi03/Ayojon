import { db } from "../packages/db/src/index";
import { user, vendors, products, orders } from "../packages/db/src/schema/index";
import { count } from "drizzle-orm";

async function check(): Promise<number> {
  try {
    const [u] = await db.select({ value: count() }).from(user);
    const [v] = await db.select({ value: count() }).from(vendors);
    const [p] = await db.select({ value: count() }).from(products);
    const [o] = await db.select({ value: count() }).from(orders);

    console.log("--- Database Counts ---");
    console.log(`Users: ${u?.value}`);
    console.log(`Vendors: ${v?.value}`);
    console.log(`Products: ${p?.value}`);
    console.log(`Orders: ${o?.value}`);

    if (Number(v?.value) > 0) {
      const sampleVendor = await db.select().from(vendors).limit(1);
      console.log("\nSample Vendor:", JSON.stringify(sampleVendor[0], null, 2));
    }

    return 0; // Success
  } catch (error) {
    console.error("Check failed:", error);
    return 1; // Failure
  }
}

async function main() {
  const exitCode = await check();

  // Close database connection if available
  if (db && typeof (db as any).$client?.end === 'function') {
    await (db as any).$client.end();
  }

  process.exit(exitCode);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
