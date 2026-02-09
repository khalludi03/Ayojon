#!/usr/bin/env bun
import { db } from "../packages/db/src/index";
import { products, vendors } from "../packages/db/src/schema/index";
import { eq } from "drizzle-orm";

console.log("\n🔍 Checking all products in database...\n");

// Get all products
const allProducts = await db.select().from(products);

console.log(`Found ${allProducts.length} total products\n`);

for (const product of allProducts) {
  // Get vendor info
  const [vendor] = await db
    .select()
    .from(vendors)
    .where(eq(vendors.id, product.vendorId));

  console.log("📦 Product:", product.title);
  console.log("   Product ID:", product.id);
  console.log("   Status:", product.status);
  console.log("   Price:", product.price);
  console.log("   Stock:", product.stock);
  console.log("   Vendor ID:", product.vendorId);
  console.log("   Vendor Name:", vendor?.storeName || "Unknown");
  console.log("   Vendor Product Count:", vendor?.productCount);
  console.log("   Created At:", product.createdAt);
  console.log();
}

// Show vendor summary
console.log("\n" + "=".repeat(50));
const allVendors = await db.select().from(vendors);
console.log("Vendor Summary:");
for (const vendor of allVendors) {
  const vendorProducts = await db
    .select()
    .from(products)
    .where(eq(products.vendorId, vendor.id));

  console.log(`  ${vendor.storeName || 'Unnamed'}: ${vendor.productCount} (DB) vs ${vendorProducts.length} (Actual)`);
}
console.log("=".repeat(50));
