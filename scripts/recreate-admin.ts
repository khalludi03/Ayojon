import { auth } from "../packages/auth/src/index";
import { db } from "../packages/db/src/index";
import { user, account, session } from "../packages/db/src/schema/auth";
import { eq } from "drizzle-orm";

async function recreateAdmin() {
  const email = "admin@test.com";
  const password = "Password123!";
  const name = "Super Admin";

  console.log(`🚀 Recreating Admin user ${email}...`);

  try {
    // 1. Find existing user to get ID
    const existingUser = await db.query.user.findFirst({
      where: eq(user.email, email),
    });

    if (existingUser) {
      console.log(`   Found existing user (ID: ${existingUser.id}), deleting...`);
      
      // Delete sessions, accounts and user
      await db.delete(session).where(eq(session.userId, existingUser.id));
      await db.delete(account).where(eq(account.userId, existingUser.id));
      await db.delete(user).where(eq(user.id, existingUser.id));
      
      console.log(`   User deleted.`);
    }

    // 2. Create the user using better-auth API (handles proper hashing)
    console.log(`   Creating user via Better Auth API...`);
    const result = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });

    if (!result) {
      console.error("❌ Failed to create user via Better Auth API.");
      return 1;
    }

    console.log(`   User created (ID: ${result.user.id}).`);

    // 3. Promote to Admin and verify email
    console.log(`   Promoting to admin role and verifying email...`);
    await db
      .update(user)
      .set({
        role: "admin",
        emailVerified: true
      } as any)
      .where(eq(user.email, email));

    console.log(`\n✅ Success! Admin account recreated correctly.`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);

    return 0;
  } catch (error) {
    console.error("❌ Error:", error);
    return 1;
  }
}

recreateAdmin().then((code) => {
  process.exit(code);
});