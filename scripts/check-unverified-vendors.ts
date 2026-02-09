import { db } from "../packages/db/src/index";
import { vendors, user } from "../packages/db/src/schema/index";
import { eq } from "drizzle-orm";

console.log("\n🔍 Checking Vendor Verification Status...\n");

const allVendors = await db.select().from(vendors);

const verified = allVendors.filter(v => v.isVerified);
const unverified = allVendors.filter(v => !v.isVerified);
const active = allVendors.filter(v => v.isActive);
const inactive = allVendors.filter(v => !v.isActive);

console.log(`Total vendors: ${allVendors.length}`);
console.log(`  - Verified: ${verified.length}`);
console.log(`  - NOT Verified: ${unverified.length} ← Should show as "Pending Review"`);
console.log(`  - Active: ${active.length}`);
console.log(`  - Inactive: ${inactive.length}`);

if (unverified.length > 0) {
  console.log(`\n📋 Unverified vendors (need admin review):`);
  unverified.slice(0, 5).forEach(v => {
    console.log(`  - ${v.name} (isActive: ${v.isActive}, isVerified: ${v.isVerified})`);
  });
  if (unverified.length > 5) {
    console.log(`  ... and ${unverified.length - 5} more`);
  }
}

console.log("\n✅ Done!\n");
process.exit(0);
