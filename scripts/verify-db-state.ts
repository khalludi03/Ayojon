/**
 * Verification Script: Check database state for credential accounts
 *
 * This shows all credential accounts and their email/login mapping
 * Usage: bun run verify:db
 */

import { db } from "../packages/db/src/index.ts";
import { user as userTable, account as accountTable } from "../packages/db/src/schema/auth.ts";
import { eq } from "drizzle-orm";

async function verifyDatabaseState() {
  console.log("🔍 Checking database state...\n");

  // Get all credential accounts
  const credentialAccounts = await db
    .select({
      userId: userTable.id,
      userName: userTable.name,
      userEmail: userTable.email,
      accountProviderId: accountTable.providerId,
      accountId: accountTable.accountId,
      accountCreatedAt: accountTable.createdAt,
      accountUpdatedAt: accountTable.updatedAt,
    })
    .from(userTable)
    .innerJoin(accountTable, eq(accountTable.userId, userTable.id))
    .where(eq(accountTable.accountId, "credential"));

  console.log(`📊 Found ${credentialAccounts.length} credential account(s):\n`);

  if (credentialAccounts.length === 0) {
    console.log("⚠️  No credential accounts found in database.");
    console.log("This could mean:");
    console.log("  - Users are only signing in with OAuth (Google)");
    console.log("  - No users have signed up yet");
    console.log("  - Database is empty\n");
  } else {
    credentialAccounts.forEach((account, index) => {
      const isSync = account.userEmail === account.accountProviderId;
      const status = isSync ? "✅ SYNCED" : "❌ MISMATCH";

      console.log(`${index + 1}. ${account.userName || "N/A"} - ${status}`);
      console.log(`   User Email:    ${account.userEmail}`);
      console.log(`   Login Email:   ${account.accountProviderId}`);
      console.log(`   Created:       ${account.accountCreatedAt}`);
      console.log(`   Updated:       ${account.accountUpdatedAt}`);
      console.log("");
    });
  }

  // Also check for any accounts (including OAuth)
  const allAccounts = await db
    .select({
      accountId: accountTable.accountId,
      providerId: accountTable.providerId,
    })
    .from(accountTable);

  console.log(`\n📋 Summary:`);
  console.log(`   Total accounts: ${allAccounts.length}`);
  console.log(`   Credential accounts: ${credentialAccounts.length}`);
  console.log(`   OAuth accounts: ${allAccounts.length - credentialAccounts.length}\n`);

  // Show account types breakdown
  const accountTypes = allAccounts.reduce((acc, account) => {
    acc[account.accountId] = (acc[account.accountId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log("Account types:");
  Object.entries(accountTypes).forEach(([type, count]) => {
    console.log(`   ${type}: ${count}`);
  });
  console.log("");
}

verifyDatabaseState()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
