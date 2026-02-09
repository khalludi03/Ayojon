#!/usr/bin/env bun
import { db } from "../packages/db/src/index";
import { vendors, products } from "../packages/db/src/schema/index";
import { eq, sql } from "drizzle-orm";

console.log("\n🔍 Checking vendor product counts vs actual products...\n");

// Get all vendors
const allVendors = await db.select().from(vendors);

for (const vendor of allVendors) {
  // Count actual products
  const actualProducts = await db
    .select()
    .from(products)
    .where(eq(products.vendorId, vendor.id));

  console.log("📦 Vendor:", vendor.storeName);
  console.log("   Vendor ID:", vendor.id);
  console.log("   User ID:", vendor.userId);
  console.log("   Product Count (DB):", vendor.productCount);
  console.log("   Actual Products:", actualProducts.length);

  if (actualProducts.length > 0) {
    console.log("   Products:");
    actualProducts.forEach((p, i) => {
      console.log(`     ${i + 1}. ${p.title} (${p.status})`);
    });
  }

  console.log();
}
