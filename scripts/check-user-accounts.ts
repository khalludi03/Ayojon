#!/usr/bin/env bun
import { db } from "../packages/db/src/index";
import { user, account } from "../packages/db/src/schema/auth";
import { eq } from "drizzle-orm";

const userEmail = process.argv[2];

if (!userEmail) {
  console.error("Usage: bun run check-user [email]");
  process.exit(1);
}

console.log(`\n🔍 Checking accounts for: ${userEmail}\n`);

try {
  // Find the user
  const users = await db
    .select()
    .from(user)
    .where(eq(user.email, userEmail));

  if (users.length === 0) {
    console.log("❌ No user found with this email");
    process.exit(0);
  }

  const userData = users[0];
  console.log("✅ User found:");
  console.log(`   ID: ${userData.id}`);
  console.log(`   Name: ${userData.name}`);
  console.log(`   Email: ${userData.email}`);
  console.log(`   Email Verified: ${userData.emailVerified}`);

  // Find all accounts for this user
  const accounts = await db
    .select()
    .from(account)
    .where(eq(account.userId, userData.id));

  console.log(`\n📋 Accounts (${accounts.length}):`);

  if (accounts.length === 0) {
    console.log("   No accounts found");
  } else {
    accounts.forEach((acc, index) => {
      console.log(`\n   Account ${index + 1}:`);
      console.log(`      Provider: ${acc.providerId}`);
      console.log(`      Account ID: ${acc.accountId}`);
      console.log(`      Has Password: ${acc.password ? "Yes" : "No"}`);
      console.log(`      Created: ${acc.createdAt}`);
      console.log(`      Updated: ${acc.updatedAt}`);
    });
  }

  // Check specifically for credential account
  const credentialAccount = accounts.find(acc => acc.accountId === "credential");
  console.log(`\n🔐 Credential Account: ${credentialAccount ? "✅ EXISTS" : "❌ MISSING"}`);

  if (!credentialAccount) {
    console.log("\n⚠️  This user does not have a credential account.");
    console.log("   They need to sign in with email + password to create one.");
  }

} catch (error) {
  console.error("Error:", error);
  process.exit(1);
}

process.exit(0);
