import { auth } from "../packages/auth/src/index";
import { db } from "../packages/db/src/index";
import { user } from "../packages/db/src/schema/auth";
import { eq } from "drizzle-orm";

async function createAdmin() {
  const email = "admin@test.com";
  const password = "Password123!";
  const name = "Super Admin";

  console.log(`Creating Admin user ${email}...`);

  try {
    // 1. Create the user using better-auth
    const newUser = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });

    if (!newUser) {
      console.error("❌ Failed to create user. It might already exist.");
    }

    // 2. Promote to Admin
    await db
      .update(user)
      .set({
        role: "admin",
        emailVerified: true
      } as any)
      .where(eq(user.email, email));

    console.log("🚀 Success! You can now log in with Admin credentials:");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    process.exit();
  }
}

createAdmin();
