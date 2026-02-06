#!/usr/bin/env bun
import { db } from "../packages/db/src/index";
import { user, account } from "../packages/db/src/schema/auth";
import { eq } from "drizzle-orm";

console.log("\n🔍 Listing all users and their accounts\n");

try {
  const users = await db.select().from(user);

  if (users.length === 0) {
    console.log("❌ No users found in database");
    process.exit(0);
  }

  console.log(`Found ${users.length} user(s):\n`);

  for (const userData of users) {
    console.log(`👤 User: ${userData.name} (${userData.email})`);
    console.log(`   ID: ${userData.id}`);
    console.log(`   Email Verified: ${userData.emailVerified}`);
    console.log(`   Created: ${userData.createdAt}`);

    const userAccounts = await db
      .select()
      .from(account)
      .where(eq(account.userId, userData.id));

    console.log(`   Accounts (${userAccounts.length}):`);
    userAccounts.forEach((acc) => {
      console.log(`      - ${acc.accountId === 'credential' ? '🔐 Credential' : '🌐 OAuth (' + acc.accountId + ')'}`);
      console.log(`        Provider ID: ${acc.providerId}`);
      console.log(`        Has Password: ${acc.password ? 'Yes' : 'No'}`);
    });
    console.log();
  }

} catch (error) {
  console.error("Error:", error);
  process.exit(1);
}

process.exit(0);
