/**
 * Fix Vendor Status Inconsistencies
 *
 * Updates user records to match their vendor profile status
 */

import { db } from "../packages/db/src/index";
import { vendors, user } from "../packages/db/src/schema/index";
import { eq } from "drizzle-orm";

async function fixVendorStatuses() {
  console.log("\n🔧 Fixing Vendor Status Inconsistencies...\n");

  try {
    let fixed = 0;
    const allVendors = await db.select().from(vendors);

    console.log(`Found ${allVendors.length} vendor profiles\n`);

    for (const vendor of allVendors) {
      const [vendorUser] = await db
        .select()
        .from(user)
        .where(eq(user.id, vendor.userId))
        .limit(1);

      if (!vendorUser) {
        console.log(`⏭️  Skipping "${vendor.name}" - no user found`);
        continue;
      }

      const needsUpdate =
        vendorUser.role !== "vendor" ||
        (vendor.isActive && vendorUser.vendorStatus !== "approved") ||
        (!vendor.isActive && vendorUser.vendorStatus === "approved");

      if (needsUpdate) {
        const newRole = "vendor";
        const newStatus = vendor.isActive ? "approved" : "suspended";

        await db
          .update(user)
          .set({
            role: newRole,
            vendorStatus: newStatus,
            updatedAt: new Date(),
          })
          .where(eq(user.id, vendor.userId));

        console.log(`✅ Fixed "${vendor.name}" (${vendorUser.email})`);
        console.log(`   Role: ${vendorUser.role} → ${newRole}`);
        console.log(`   Status: ${vendorUser.vendorStatus} → ${newStatus}`);
        fixed++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`  Fixed: ${fixed} users`);
    console.log(`  Total vendors: ${allVendors.length}`);

    if (fixed === 0) {
      console.log(`  ✅ All vendors already had correct statuses`);
    }

    console.log("\n🎉 Done!\n");
  } catch (error) {
    console.error("\n❌ Error:", error);
    throw error;
  }
}

fixVendorStatuses();
