import { db } from "../packages/db/src/index";
import { vendors, products, user } from "../packages/db/src/schema/index";
import { eq } from "drizzle-orm";

console.log("\n🔍 Checking vendor@test.com Products...\n");

// Find vendor@test.com
const [testUser] = await db
  .select()
  .from(user)
  .where(eq(user.email, "vendor@test.com"))
  .limit(1);

if (!testUser) {
  console.log("❌ User vendor@test.com not found");
  process.exit(1);
}

console.log(`Found user: ${testUser.name} (${testUser.email})`);
console.log(`User role: ${testUser.role}`);
console.log(`Vendor status: ${testUser.vendorStatus}\n`);

// Find vendor profile
const [vendor] = await db
  .select()
  .from(vendors)
  .where(eq(vendors.userId, testUser.id))
  .limit(1);

if (!vendor) {
  console.log("❌ No vendor profile found");
  process.exit(1);
}

console.log(`Vendor profile: ${vendor.name}`);
console.log(`Product count (in vendors table): ${vendor.productCount}\n`);

// Get actual products
const vendorProducts = await db
  .select()
  .from(products)
  .where(eq(products.vendorId, vendor.id));

console.log(`Actual products in database: ${vendorProducts.length}\n`);

if (vendorProducts.length > 0) {
  console.log("Products:");
  vendorProducts.forEach((p, i) => {
    console.log(`  ${i + 1}. "${p.title}"`);
    console.log(`     ID: ${p.id}`);
    console.log(`     Status: ${p.status}`);
    console.log(`     Stock: ${p.stock}`);
    console.log(`     Created: ${p.createdAt}\n`);
  });
}

// Check for mismatch
if (vendor.productCount !== vendorProducts.length) {
  console.log(`⚠️  MISMATCH DETECTED!`);
  console.log(`   vendors.productCount = ${vendor.productCount}`);
  console.log(`   Actual products = ${vendorProducts.length}`);
  console.log(`\n💡 Run: bun scripts/recalculate-product-counts.ts to fix\n`);
} else {
  console.log(`✅ Product count is accurate (${vendorProducts.length})\n`);
}

process.exit(0);
