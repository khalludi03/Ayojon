import { auth } from "../packages/auth/src/index";
import { db } from "../packages/db/src/index";
import { user } from "../packages/db/src/schema/auth";
import { eq } from "drizzle-orm";

async function createVendor() {
  const email = "vendor@test.com";
  const password = "Password123!";
  const name = "Test Vendor";

  console.log(`Creating user ${email}...`);

  try {
    // 1. Create the user using better-auth to ensure password hashing is correct
    const newUser = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });

    if (!newUser) {
      console.error("❌ Failed to create user.");
      return;
    }

    console.log("✅ User created. Promoting to Approved Vendor...");

    // 2. Promote the user
    await db
      .update(user)
      .set({
        role: "vendor",
        vendorStatus: "approved",
        emailVerified: true
      } as any)
      .where(eq(user.email, email));

    console.log("🚀 Success! You can now log in with:");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    process.exit();
  }
}

createVendor();
