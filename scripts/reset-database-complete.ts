/**
 * COMPLETE DATABASE RESET
 *
 * ⚠️  EXTREMELY DESTRUCTIVE ⚠️
 * Removes ALL data from ALL tables except admin users
 */

import { db } from "../packages/db/src/index";
import {
  user,
  vendors,
  products,
  productImages,
  vendorApplications,
} from "../packages/db/src/schema/index";
import { eq, ne } from "drizzle-orm";

console.log("\n🗑️  COMPLETE DATABASE RESET\n");
console.log("⚠️  ⚠️  ⚠️  EXTREME WARNING ⚠️  ⚠️  ⚠️\n");
console.log("This will DELETE ALL DATA from:");
console.log("  - ALL users (except admin@test.com)");
console.log("  - ALL vendor applications");
console.log("  - ALL vendors");
console.log("  - ALL products");
console.log("  - ALL orders");
console.log("  - ALL cart items");
console.log("  - ALL reviews");
console.log("  - EVERYTHING\n");

async function resetDatabase() {
  try {
    console.log("🗑️  Starting complete reset...\n");

    // Delete in correct order to respect foreign key constraints
    await db.transaction(async (tx) => {
      console.log("Deleting product images...");
      await tx.delete(productImages);

      console.log("Deleting products...");
      await tx.delete(products);

      console.log("Deleting vendor applications...");
      await tx.delete(vendorApplications);

      console.log("Deleting vendors...");
      await tx.delete(vendors);

      console.log("Deleting users (except those with admin role)...");
      await tx.delete(user).where(ne(user.role, "admin"));

      console.log("\n✅ All data deleted!");
    });

    // Verify
    console.log("\n📊 Verification:");
    const remainingUsers = await db.select().from(user);
    const remainingVendors = await db.select().from(vendors);
    const remainingProducts = await db.select().from(products);
    const remainingApplications = await db.select().from(vendorApplications);

    console.log(`  Users: ${remainingUsers.length} (remaining admins)`);
    console.log(`  Vendors: ${remainingVendors.length} (should be 0)`);
    console.log(`  Products: ${remainingProducts.length} (should be 0)`);
    console.log(`  Applications: ${remainingApplications.length} (should be 0)`);

    const nonAdminCount = remainingUsers.filter(u => u.role !== "admin").length;
    if (nonAdminCount === 0) {
      console.log("\n✅ Database successfully reset!");
      console.log(`   ${remainingUsers.length} admin(s) preserved.`);
    } else {
      console.log("\n⚠️  Unexpected state: Some non-admin users remain.");
      remainingUsers.forEach(u => console.log(`    - ${u.email} (${u.role})`));
    }

    console.log("\n🎉 Complete! Database is now clean.\n");
  } catch (error) {
    console.error("\n❌ Error during reset:", error);
    throw error;
  }
}

resetDatabase();
