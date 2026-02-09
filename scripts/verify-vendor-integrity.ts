/**
 * Verify Vendor Data Integrity
 *
 * Checks for:
 * - Vendors without users
 * - Users with vendor role but no profile
 * - Mismatched status between user and vendor
 */

import { db } from "../packages/db/src/index";
import { vendors, user } from "../packages/db/src/schema/index";
import { eq } from "drizzle-orm";

async function verifyIntegrity() {
  console.log("\n🔍 Verifying Vendor Data Integrity...\n");

  const issues: string[] = [];

  try {
    // Check 1: Users with vendor role but no profile
    console.log("Check 1: Users with vendor role...");
    const vendorUsers = await db.select().from(user).where(eq(user.role, "vendor"));

    for (const u of vendorUsers) {
      const vendorProfile = await db
        .select()
        .from(vendors)
        .where(eq(vendors.userId, u.id))
        .limit(1);

      if (vendorProfile.length === 0) {
        issues.push(`❌ User ${u.email} has role=vendor but no vendor profile`);
      }
    }

    if (issues.length === 0) {
      console.log(`✅ All ${vendorUsers.length} vendor users have profiles`);
    }

    // Check 2: Vendor profiles without valid user
    console.log("\nCheck 2: Vendor profiles...");
    const allVendors = await db.select().from(vendors);

    for (const v of allVendors) {
      const vendorUser = await db
        .select()
        .from(user)
        .where(eq(user.id, v.userId))
        .limit(1);

      if (vendorUser.length === 0) {
        issues.push(`❌ Vendor profile "${v.name}" (${v.id}) has no user`);
      } else if (vendorUser[0]!.role !== "vendor") {
        issues.push(`⚠️  Vendor "${v.name}" user has role="${vendorUser[0]!.role}" (should be "vendor")`);
      }
    }

    if (issues.filter(i => i.includes("Vendor profile")).length === 0) {
      console.log(`✅ All ${allVendors.length} vendor profiles have valid users`);
    }

    // Check 3: Vendor status consistency
    console.log("\nCheck 3: Status consistency...");
    for (const v of allVendors) {
      const vendorUser = await db
        .select()
        .from(user)
        .where(eq(user.id, v.userId))
        .limit(1);

      if (vendorUser.length > 0) {
        const u = vendorUser[0]!;
        if (u.vendorStatus !== "approved" && v.isActive) {
          issues.push(`⚠️  Vendor "${v.name}" is active but user status is "${u.vendorStatus}"`);
        }
        if (!v.isActive && u.role === "vendor") {
          issues.push(`⚠️  Vendor "${v.name}" is inactive but user still has vendor role`);
        }
      }
    }

    if (issues.filter(i => i.includes("Status")).length === 0) {
      console.log(`✅ All vendor statuses are consistent`);
    }

    // Summary
    console.log("\n" + "=".repeat(80));
    console.log("VERIFICATION RESULTS");
    console.log("=".repeat(80));

    if (issues.length === 0) {
      console.log("\n🎉 All checks passed! Vendor data is consistent.\n");
    } else {
      console.log("\n⚠️  Found issues:\n");
      issues.forEach(issue => console.log(`  ${issue}`));
      console.log(`\nTotal issues: ${issues.length}`);
      console.log("\n💡 Run: bun scripts/fix-vendor-profiles.ts to fix automatically\n");
    }

    // Statistics
    console.log("📊 Statistics:");
    console.log(`  Total users: ${(await db.select().from(user)).length}`);
    console.log(`  Vendor users: ${vendorUsers.length}`);
    console.log(`  Vendor profiles: ${allVendors.length}`);
    console.log(`  Active vendors: ${allVendors.filter(v => v.isActive).length}`);
    console.log(`  Verified vendors: ${allVendors.filter(v => v.isVerified).length}`);
    console.log();

  } catch (error) {
    console.error("\n❌ Error during verification:", error);
    throw error;
  }
}

verifyIntegrity();
