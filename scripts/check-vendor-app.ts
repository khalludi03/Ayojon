import { db } from "../packages/db/src/index";
import { user, vendorApplications } from "../packages/db/src/schema/index";
import { eq } from "drizzle-orm";

async function checkApplication() {
  const email = "vendor@test.com";
  console.log(`Checking application for ${email}...`);

  const users = await db.select().from(user).where(eq(user.email, email)).limit(1);
  if (users.length === 0) {
    console.log("User not found.");
    return;
  }

  const u = users[0];
  console.log(`User ID: ${u.id}, Role: ${u.role}, VendorStatus: ${u.vendorStatus}`);

  const apps = await db.select().from(vendorApplications).where(eq(vendorApplications.userId, u.id)).limit(1);
  if (apps.length === 0) {
    console.log("No vendor application found.");
  } else {
    console.log("Application found:", JSON.stringify(apps[0], null, 2));
  }
}

checkApplication().then(() => process.exit(0));
