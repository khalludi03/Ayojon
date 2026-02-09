import { db } from "../packages/db/src/index";
import { user } from "../packages/db/src/schema/index";
import { eq } from "drizzle-orm";

console.log("\n📊 Checking Users by Vendor Status...\n");

const allUsers = await db.select().from(user);
console.log(`Total users: ${allUsers.length}`);

const byStatus = {
  pending: allUsers.filter(u => u.vendorStatus === "pending").length,
  approved: allUsers.filter(u => u.vendorStatus === "approved").length,
  rejected: allUsers.filter(u => u.vendorStatus === "rejected").length,
  suspended: allUsers.filter(u => u.vendorStatus === "suspended").length,
  none: allUsers.filter(u => u.vendorStatus === "none" || !u.vendorStatus).length,
};

console.log("\nBreakdown by vendorStatus:");
console.log(`  - Pending: ${byStatus.pending}`);
console.log(`  - Approved: ${byStatus.approved} ← Your 51 vendors`);
console.log(`  - Rejected: ${byStatus.rejected}`);
console.log(`  - Suspended: ${byStatus.suspended}`);
console.log(`  - None: ${byStatus.none}`);

console.log("\n✅ To see your vendors in the admin panel:");
console.log("   Change the filter from 'Pending Review' to 'Approved'\n");

process.exit(0);
