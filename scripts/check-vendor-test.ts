import { db } from "../packages/db/src/index";
import { user, vendorApplications } from "../packages/db/src/schema/index";
import { eq } from "drizzle-orm";

console.log("\n🔍 Checking for vendor@test.com:\n");

// Check in users table
const testUser = await db.select().from(user).where(eq(user.email, "vendor@test.com")).limit(1);
console.log("User table:", testUser.length > 0 ? "✅ EXISTS" : "❌ NOT FOUND");
if (testUser[0]) {
  console.log("  Email:", testUser[0].email);
  console.log("  Role:", testUser[0].role);
  console.log("  Vendor Status:", testUser[0].vendorStatus);
  console.log("  User ID:", testUser[0].id);
}

// Check in vendor applications table
if (testUser[0]) {
  const testApp = await db.select().from(vendorApplications).where(eq(vendorApplications.userId, testUser[0].id)).limit(1);
  console.log("\nVendor Applications:", testApp.length > 0 ? "✅ EXISTS" : "❌ NOT FOUND");
  if (testApp[0]) {
    console.log("  Application Status:", testApp[0].status);
    console.log("  Store Name:", testApp[0].storeName);
    console.log("  Submitted At:", testApp[0].submittedAt);
  }
}

// List ALL vendor applications
console.log("\n📊 All vendor applications in database:");
const allApps = await db.select().from(vendorApplications);
console.log(`Total: ${allApps.length}`);
if (allApps.length > 0) {
  for (const app of allApps) {
    const appUser = await db.select().from(user).where(eq(user.id, app.userId)).limit(1);
    console.log(`  - ${appUser[0]?.email}: ${app.status} (${app.storeName})`);
  }
}

console.log("\n");
process.exit(0);
