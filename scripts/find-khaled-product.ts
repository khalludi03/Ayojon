import { db } from "../packages/db/src/index";
import { products, vendors, user } from "../packages/db/src/schema/index";
import { eq, ilike } from "drizzle-orm";

console.log("\n🔍 Finding 'Khaled Kashem' Product...\n");

// Search for the product by title
const khaledProducts = await db
  .select({
    productId: products.id,
    productTitle: products.title,
    productSku: products.slug,
    productStatus: products.status,
    productStock: products.stock,
    vendorId: vendors.id,
    vendorName: vendors.name,
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
  })
  .from(products)
  .innerJoin(vendors, eq(products.vendorId, vendors.id))
  .innerJoin(user, eq(vendors.userId, user.id))
  .where(ilike(products.title, "%Khaled%"))
  .limit(5);

if (khaledProducts.length === 0) {
  console.log("❌ No products found with 'Khaled' in the title");
  process.exit(1);
}

console.log(`Found ${khaledProducts.length} product(s):\n`);

khaledProducts.forEach((p, i) => {
  console.log(`${i + 1}. Product: "${p.productTitle}"`);
  console.log(`   SKU: ${p.productSku}`);
  console.log(`   Status: ${p.productStatus}`);
  console.log(`   Stock: ${p.productStock}`);
  console.log(`   Vendor: ${p.vendorName}`);
  console.log(`   Owner: ${p.userName} (${p.userEmail})`);
  console.log(`   Vendor ID: ${p.vendorId}`);
  console.log(`   User ID: ${p.userId}\n`);
});

// Check if vendor@test.com is the owner
const isTestVendor = khaledProducts.some(p => p.userEmail === "vendor@test.com");

if (isTestVendor) {
  console.log("✅ This product belongs to vendor@test.com");
} else {
  console.log("⚠️  This product does NOT belong to vendor@test.com");
  console.log("\n💡 You might be logged in as a different vendor account.\n");
}

process.exit(0);
