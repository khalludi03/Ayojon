import { db } from "../packages/db/src/index";
import { products, vendors, user } from "../packages/db/src/schema/index";
import { eq, desc } from "drizzle-orm";

console.log("\n🔍 Checking Recent Products...\n");

// Get the 10 most recent products
const recentProducts = await db
  .select({
    id: products.id,
    title: products.title,
    status: products.status,
    vendorId: products.vendorId,
    vendorName: vendors.name,
    ownerEmail: user.email,
    createdAt: products.createdAt,
  })
  .from(products)
  .innerJoin(vendors, eq(products.vendorId, vendors.id))
  .innerJoin(user, eq(vendors.userId, user.id))
  .orderBy(desc(products.createdAt))
  .limit(10);

console.log(`Most recent 10 products:\n`);

recentProducts.forEach((p, i) => {
  console.log(`${i + 1}. "${p.title}"`);
  console.log(`   Vendor: ${p.vendorName} (${p.ownerEmail})`);
  console.log(`   Status: ${p.status}`);
  console.log(`   Created: ${p.createdAt}\n`);
});

// Check if vendor@test.com tried to create products
const vendorTestProducts = recentProducts.filter(p => p.ownerEmail === "vendor@test.com");

if (vendorTestProducts.length > 0) {
  console.log(`✅ Found ${vendorTestProducts.length} products for vendor@test.com`);
} else {
  console.log(`❌ No products found for vendor@test.com in recent products`);
  console.log(`\n💡 This suggests the product creation failed or wasn't completed.\n`);
}

process.exit(0);
