#!/usr/bin/env bun
import { db } from "../packages/db/src/index";
import { vendors, products } from "../packages/db/src/schema/index";
import { eq, sql } from "drizzle-orm";

async function fixVendorProductCounts() {
  console.log("🔄 Recalculating product counts for all vendors...\n");

  // Get all vendors
  const allVendors = await db.select().from(vendors);
  console.log(`Found ${allVendors.length} vendors\n`);

  let fixed = 0;
  let unchanged = 0;

  for (const vendor of allVendors) {
    // Count actual products for this vendor
    const productCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .where(eq(products.vendorId, vendor.id));

    const actualCount = productCount[0]?.count ?? 0;
    const currentCount = vendor.productCount ?? 0;

    if (actualCount !== currentCount) {
      console.log(`📦 Vendor: ${vendor.storeName} (${vendor.id})`);
      console.log(`   Current count: ${currentCount} → Actual count: ${actualCount}`);

      // Update the vendor's product count
      await db
        .update(vendors)
        .set({
          productCount: actualCount,
          updatedAt: new Date(),
        })
        .where(eq(vendors.id, vendor.id));

      console.log(`   ✅ Fixed!\n`);
      fixed++;
    } else {
      unchanged++;
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log(`✅ Fixed: ${fixed} vendors`);
  console.log(`✓  Unchanged: ${unchanged} vendors`);
  console.log("=".repeat(50));
}

fixVendorProductCounts()
  .then(() => {
    console.log("\n✅ All vendor product counts have been recalculated!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error recalculating product counts:", error);
    process.exit(1);
  });
