import { db } from "../packages/db/src/index";
import { vendorApplications, user } from "../packages/db/src/schema/index";
import { eq } from "drizzle-orm";

console.log("\n📋 Checking Vendor Applications...\n");

// Check total applications
const allApplications = await db.select().from(vendorApplications);
console.log(`Total applications in vendorApplications table: ${allApplications.length}`);

// Check by status
const pending = allApplications.filter(a => a.status === "pending");
const approved = allApplications.filter(a => a.status === "approved");
const rejected = allApplications.filter(a => a.status === "rejected");

console.log(`  - Pending: ${pending.length}`);
console.log(`  - Approved: ${approved.length}`);
console.log(`  - Rejected: ${rejected.length}`);

// Check users with pending vendorStatus
const pendingUsers = await db.select().from(user).where(eq(user.vendorStatus, "pending"));
console.log(`\nUsers with vendorStatus="pending": ${pendingUsers.length}`);

if (allApplications.length > 0) {
  console.log("\nSample applications:");
  allApplications.slice(0, 5).forEach(app => {
    console.log(`  - ${app.storeName} (${app.status}) - submitted ${app.submittedAt}`);
  });
}

console.log("\n✅ Done!\n");
process.exit(0);
