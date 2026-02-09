/**
 * Sync Vendor and User Status
 *
 * Ensures user.vendorStatus matches vendors.isActive:
 * - isActive: true → vendorStatus: "approved"
 * - isActive: false → vendorStatus: "suspended"
 */

import { db } from "../packages/db/src/index";
import { vendors, user } from "../packages/db/src/schema/index";
import { eq } from "drizzle-orm";

console.log("\n🔄 Syncing Vendor and User Status...\n");

const allVendors = await db.select().from(vendors);
console.log(`Found ${allVendors.length} vendors\n`);

let updated = 0;

for (const vendor of allVendors) {
  const [vendorUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, vendor.userId))
    .limit(1);

  if (!vendorUser) {
    console.log(`⏭️  Skipping vendor "${vendor.name}" - no user found`);
    continue;
  }

  // Determine expected vendorStatus based on isActive
  const expectedStatus = vendor.isActive ? "approved" : "suspended";

  if (vendorUser.vendorStatus !== expectedStatus) {
    await db
      .update(user)
      .set({
        vendorStatus: expectedStatus,
        updatedAt: new Date(),
      })
      .where(eq(user.id, vendor.userId));

    console.log(`✅ Synced "${vendor.name}"`);
    console.log(`   isActive: ${vendor.isActive} → vendorStatus: "${expectedStatus}"`);
    console.log(`   (was: "${vendorUser.vendorStatus}")\n`);
    updated++;
  }
}

console.log(`📊 Summary:`);
console.log(`  Updated: ${updated} users`);
console.log(`  Total vendors: ${allVendors.length}`);

if (updated === 0) {
  console.log(`  ✅ All statuses already in sync`);
}

console.log("\n🎉 Done!\n");
process.exit(0);
