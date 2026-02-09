import { db } from "../packages/db/src/index";
import { vendors, user } from "../packages/db/src/schema/index";
import { eq, desc, ilike, or, and } from "drizzle-orm";

console.log("\n🔍 Testing listVendors Query...\n");

// Simulate the exact query from admin.listVendors endpoint
const vendorList = await db
  .select({
    id: vendors.id,
    name: vendors.name,
    slug: vendors.slug,
    ownerEmail: user.email,
    productCount: vendors.productCount,
    isActive: vendors.isActive,
    isVerified: vendors.isVerified,
    joinedAt: vendors.joinedAt,
  })
  .from(vendors)
  .innerJoin(user, eq(vendors.userId, user.id))
  .orderBy(desc(vendors.joinedAt))
  .limit(50);

console.log(`Total vendors returned: ${vendorList.length}\n`);

// Check if vendor@test.com is in the results
const testVendor = vendorList.find(v => v.ownerEmail === "vendor@test.com");

if (testVendor) {
  console.log("✅ vendor@test.com FOUND in results:");
  console.log(`   Vendor ID: ${testVendor.id}`);
  console.log(`   Name: ${testVendor.name}`);
  console.log(`   Slug: ${testVendor.slug}`);
  console.log(`   Email: ${testVendor.ownerEmail}`);
  console.log(`   Product Count: ${testVendor.productCount}`);
  console.log(`   Is Active: ${testVendor.isActive}`);
  console.log(`   Is Verified: ${testVendor.isVerified}`);
  console.log(`   Joined: ${testVendor.joinedAt}\n`);
} else {
  console.log("❌ vendor@test.com NOT in results");
  console.log("\n💡 Possible reasons:");
  console.log("   1. Not in the first 50 vendors (joinedAt ordering)");
  console.log("   2. User-vendor join failed");
  console.log("   3. Frontend filter hiding it\n");

  // Check position in all vendors
  const allVendors = await db
    .select({
      name: vendors.name,
      ownerEmail: user.email,
      joinedAt: vendors.joinedAt,
    })
    .from(vendors)
    .innerJoin(user, eq(vendors.userId, user.id))
    .orderBy(desc(vendors.joinedAt));

  const testIndex = allVendors.findIndex(v => v.ownerEmail === "vendor@test.com");

  if (testIndex >= 0) {
    console.log(`   Found at position ${testIndex + 1} out of ${allVendors.length}`);
    if (testIndex >= 50) {
      console.log(`   ⚠️  It's beyond the first 50 results!`);
      console.log(`      Navigate to page ${Math.ceil((testIndex + 1) / 50)} to see it.\n`);
    }
  }
}

console.log("📊 Sample of first 5 vendors:");
vendorList.slice(0, 5).forEach((v, i) => {
  console.log(`${i + 1}. ${v.name} (${v.ownerEmail})`);
});

console.log("\n✅ Done!\n");
process.exit(0);
