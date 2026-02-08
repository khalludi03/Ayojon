import { db } from "../packages/db/src/index";
import { user } from "../packages/db/src/schema/auth";
import { eq } from "drizzle-orm";

async function promote() {
  const email = "khaled@gmail.com";
  
  console.log(`Promoting ${email} to Approved Vendor...`);
  
  try {
    const result = await db
      .update(user)
      .set({
        role: "vendor",
        vendorStatus: "approved"
      } as any)
      .where(eq(user.email, email))
      .returning();

    if (result.length > 0) {
      console.log("✅ Success! User updated:");
      console.log(JSON.stringify(result[0], null, 2));
    } else {
      console.log("❌ User not found.");
    }
  } catch (error) {
    console.error("❌ Failed to promote user:", error);
  } finally {
    process.exit();
  }
}

promote();
