import { db } from "../packages/db/src/index";
import { user, vendors } from "../packages/db/src/schema/index";
import { eq } from "drizzle-orm";

console.log("\n🔍 Complete Check: vendor@test.com\n");

// Check user table
console.log("1️⃣ USER TABLE:");
const [testUser] = await db
  .select()
  .from(user)
  .where(eq(user.email, "vendor@test.com"))
  .limit(1);

if (testUser) {
  console.log("  ✅ Found in user table");
  console.log(`     ID: ${testUser.id}`);
  console.log(`     Name: ${testUser.name}`);
  console.log(`     Email: ${testUser.email}`);
  console.log(`     Role: ${testUser.role}`);
  console.log(`     Vendor Status: ${testUser.vendorStatus}`);
  console.log(`     Is Deactivated: ${testUser.isDeactivated}\n`);
} else {
  console.log("  ❌ NOT found in user table\n");
  process.exit(1);
}

// Check vendor table
console.log("2️⃣ VENDOR TABLE:");
const [testVendor] = await db
  .select()
  .from(vendors)
  .where(eq(vendors.userId, testUser.id))
  .limit(1);

if (testVendor) {
  console.log("  ✅ Found in vendor table");
  console.log(`     Vendor ID: ${testVendor.id}`);
  console.log(`     Vendor Name: ${testVendor.name}`);
  console.log(`     Slug: ${testVendor.slug}`);
  console.log(`     User ID: ${testVendor.userId}`);
  console.log(`     Is Active: ${testVendor.isActive}`);
  console.log(`     Is Verified: ${testVendor.isVerified}`);
  console.log(`     Product Count: ${testVendor.productCount}`);
  console.log(`     Joined At: ${testVendor.joinedAt}\n`);
} else {
  console.log("  ❌ NOT found in vendor table");
  console.log(`\n💡 User exists but has no vendor profile!`);
  console.log(`   User ID: ${testUser.id}`);
  console.log(`   This means the vendor record is missing.\n`);
}

// Summary
console.log("📊 SUMMARY:");
console.log(`  User exists: ${!!testUser}`);
console.log(`  Vendor profile exists: ${!!testVendor}`);
console.log(`  Status: ${testUser.role}/${testUser.vendorStatus}\n`);

if (testUser && !testVendor) {
  console.log("⚠️  ISSUE DETECTED: User has vendor role but no vendor profile!");
  console.log("    Run: bun scripts/create-vendor-profile.ts to fix\n");
}

process.exit(0);
