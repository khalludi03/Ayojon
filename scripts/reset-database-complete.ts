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
  orders,
  orderItems,
  payments,
  vendorPayouts,
  reviews,
  reviewImages,
  reviewVotes,
  vendorRatings,
  cart,
  wishlist,
  address,
  productVariants,
  productSpecifications,
  productEventTypes,
  productPrices,
  productShippingOptions,
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
      console.log("Deleting review images and votes...");
      await tx.delete(reviewImages);
      await tx.delete(reviewVotes);

      console.log("Deleting reviews...");
      await tx.delete(reviews);

      console.log("Deleting vendor payouts...");
      await tx.delete(vendorPayouts);

      console.log("Deleting payments...");
      await tx.delete(payments);

      console.log("Deleting order items...");
      await tx.delete(orderItems);

      console.log("Deleting orders...");
      await tx.delete(orders);

      console.log("Deleting cart and wishlist...");
      await tx.delete(cart);
      await tx.delete(wishlist);

      console.log("Deleting product details...");
      await tx.delete(productPrices);
      await tx.delete(productShippingOptions);
      await tx.delete(productSpecifications);
      await tx.delete(productVariants);
      await tx.delete(productEventTypes);

      console.log("Deleting product images...");
      await tx.delete(productImages);

      console.log("Deleting products...");
      await tx.delete(products);

      console.log("Deleting vendor ratings...");
      await tx.delete(vendorRatings);

      console.log("Deleting vendor applications...");
      await tx.delete(vendorApplications);

      console.log("Deleting vendors...");
      await tx.delete(vendors);

      console.log("Deleting addresses...");
      await tx.delete(address);

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
    const remainingOrders = await db.select().from(orders);
    const remainingReviews = await db.select().from(reviews);

    console.log(`  Users: ${remainingUsers.length} (remaining admins)`);
    console.log(`  Vendors: ${remainingVendors.length} (should be 0)`);
    console.log(`  Products: ${remainingProducts.length} (should be 0)`);
    console.log(`  Applications: ${remainingApplications.length} (should be 0)`);
    console.log(`  Orders: ${remainingOrders.length} (should be 0)`);
    console.log(`  Reviews: ${remainingReviews.length} (should be 0)`);

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
