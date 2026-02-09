/**
 * Fix Vendor Profiles for All Existing Users
 *
 * Creates vendor profiles for:
 * - Users with role="vendor" but no vendor profile
 * - Users with vendorStatus="approved" but no vendor profile
 */

import { db } from "../packages/db/src/index";
import { vendors, user } from "../packages/db/src/schema/index";
import { eq, and, or, isNull } from "drizzle-orm";

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

const LOCATIONS = ["Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna"] as const;

async function fixVendorProfiles() {
  console.log("\n🔧 Fixing Vendor Profiles for All Users...\n");

  try {
    // Find all users who should be vendors
    console.log("Step 1: Finding users who need vendor profiles...");

    const usersNeedingProfiles = await db
      .select()
      .from(user)
      .where(
        or(
          eq(user.role, "vendor"),
          eq(user.vendorStatus, "approved")
        )
      );

    console.log(`Found ${usersNeedingProfiles.length} users with vendor status`);

    if (usersNeedingProfiles.length === 0) {
      console.log("✅ No users need vendor profiles\n");
      return;
    }

    // Check which ones already have vendor profiles
    console.log("\nStep 2: Checking existing vendor profiles...");

    let created = 0;
    let skipped = 0;

    for (const u of usersNeedingProfiles) {
      const existingVendor = await db
        .select()
        .from(vendors)
        .where(eq(vendors.userId, u.id))
        .limit(1);

      if (existingVendor.length > 0) {
        console.log(`  ⏭️  ${u.email} - already has profile`);
        skipped++;
        continue;
      }

      // Create vendor profile
      const vendorName = u.name ? `${u.name}'s Store` : `${u.email.split('@')[0]} Store`;
      const vendorSlug = slugify(vendorName) + "-" + generateId().substring(0, 6);
      const vendorId = generateId();

      await db.insert(vendors).values({
        id: vendorId,
        userId: u.id,
        name: vendorName,
        slug: vendorSlug,
        description: `Professional event supplies and services`,
        location: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
        address: null,
        phone: null,
        email: u.email,
        website: null,
        isVerified: u.vendorStatus === "approved",
        isActive: true,
        ratingAverage: 0,
        ratingCount: 0,
        productCount: 0,
        totalSales: 0,
      });

      console.log(`  ✅ ${u.email} - created profile: ${vendorName}`);
      created++;

      // Ensure user has correct role and status
      if (u.role !== "vendor" || u.vendorStatus !== "approved") {
        await db
          .update(user)
          .set({
            role: "vendor",
            vendorStatus: "approved",
          })
          .where(eq(user.id, u.id));

        console.log(`     Updated user role and status`);
      }
    }

    console.log("\n📊 Summary:");
    console.log(`  Created: ${created} vendor profiles`);
    console.log(`  Skipped: ${skipped} (already existed)`);
    console.log(`  Total: ${usersNeedingProfiles.length} vendors`);

    // Verify results
    console.log("\n🔍 Verification:");
    const allVendors = await db.select().from(vendors);
    const allVendorUsers = await db
      .select()
      .from(user)
      .where(eq(user.role, "vendor"));

    console.log(`  Vendor profiles in DB: ${allVendors.length}`);
    console.log(`  Users with vendor role: ${allVendorUsers.length}`);

    if (allVendors.length !== allVendorUsers.length) {
      console.log(`  ⚠️  Mismatch detected! Some vendors may be missing profiles.`);
    } else {
      console.log(`  ✅ All vendors have profiles!`);
    }

    console.log("\n🎉 Done!\n");
  } catch (error) {
    console.error("\n❌ Error:", error);
    throw error;
  }
}

fixVendorProfiles();
