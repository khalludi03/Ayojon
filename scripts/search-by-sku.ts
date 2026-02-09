import { db } from "../packages/db/src/index";
import { products, vendors, user } from "../packages/db/src/schema/index";
import { eq, ilike, or } from "drizzle-orm";

console.log("\n🔍 Searching for SKU: AYJ-MLF0PNYO-MRPB...\n");

// Search by slug (SKU is usually stored in slug field)
const productsBySlug = await db
  .select({
    productId: products.id,
    productTitle: products.title,
    productSlug: products.slug,
    productStatus: products.status,
    vendorName: vendors.name,
    userEmail: user.email,
  })
  .from(products)
  .innerJoin(vendors, eq(products.vendorId, vendors.id))
  .innerJoin(user, eq(vendors.userId, user.id))
  .where(
    or(
      ilike(products.slug, "%MLF0PNYO%"),
      ilike(products.slug, "%MRPB%"),
      ilike(products.id, "%MLF0PNYO%")
    )
  )
  .limit(5);

if (productsBySlug.length > 0) {
  console.log(`Found ${productsBySlug.length} matching product(s):\n`);
  productsBySlug.forEach(p => {
    console.log(`- "${p.productTitle}"`);
    console.log(`  Slug: ${p.productSlug}`);
    console.log(`  Owner: ${p.userEmail}\n`);
  });
} else {
  console.log("❌ No products found with that SKU");
  console.log("\n💡 The product shown in the UI is cached/stale data.\n");
  console.log("Solutions:");
  console.log("1. Hard refresh the browser (Ctrl+Shift+R or Cmd+Shift+R)");
  console.log("2. Clear browser cache");
  console.log("3. Restart the dev server\n");
}

// Also check total products for all vendors
console.log("📊 Current database state:");
const totalProducts = await db.select().from(products);
console.log(`  Total products: ${totalProducts.length}`);

const testVendorData = await db
  .select({
    vendorName: vendors.name,
    productCount: vendors.productCount,
    ownerEmail: user.email,
  })
  .from(vendors)
  .innerJoin(user, eq(vendors.userId, user.id))
  .where(eq(user.email, "vendor@test.com"))
  .limit(1);

if (testVendorData[0]) {
  console.log(`  vendor@test.com product count: ${testVendorData[0].productCount}`);
}

console.log();
process.exit(0);
