/**
 * Migration Script: Fix email/login mismatches
 *
 * This script syncs account.providerId with user.email for credential accounts.
 * Run this AFTER verifying with check-email-mismatch.ts
 *
 * Usage: bun run fix:emails
 */

import { db } from "../packages/db/src/index.ts";
import { user as userTable, account as accountTable } from "../packages/db/src/schema/auth.ts";
import { eq, and, ne, sql } from "drizzle-orm";

async function fixEmailAccounts() {
  console.log("🔧 Starting email/account mismatch fix...\n");

  // Step 1: Find accounts that need fixing
  console.log("📊 Step 1: Analyzing accounts...");
  const accountsToFix = await db
    .select({
      userId: userTable.id,
      userName: userTable.name,
      currentEmail: userTable.email,
      oldLoginEmail: accountTable.providerId,
      accountId: accountTable.id,
    })
    .from(userTable)
    .innerJoin(accountTable, eq(accountTable.userId, userTable.id))
    .where(eq(accountTable.accountId, "credential"));

  const mismatches = accountsToFix.filter(a => a.oldLoginEmail !== a.currentEmail);

  if (mismatches.length === 0) {
    console.log("✅ No mismatches found! Nothing to fix.\n");
    return;
  }

  console.log(`\nFound ${mismatches.length} account(s) to fix:\n`);
  mismatches.forEach((account, index) => {
    console.log(`${index + 1}. ${account.userName || "N/A"}`);
    console.log(`   Old login: "${account.oldLoginEmail}"`);
    console.log(`   New login: "${account.currentEmail}"`);
  });
  console.log("");

  // Step 2: Fix each account
  console.log("🔄 Step 2: Updating accounts...");
  let successCount = 0;

  for (const account of mismatches) {
    try {
      await db
        .update(accountTable)
        .set({
          providerId: account.currentEmail,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(accountTable.id, account.accountId),
            eq(accountTable.accountId, "credential")
          )
        );
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to update account for ${account.userName}:`, error);
    }
  }

  console.log(`✅ Successfully updated ${successCount} account(s)\n`);

  // Step 3: Verify the fix
  console.log("🔍 Step 3: Verifying fix...");
  const verifyResults = await db
    .select({
      userId: userTable.id,
      currentEmail: userTable.email,
      loginEmail: accountTable.providerId,
    })
    .from(userTable)
    .innerJoin(accountTable, eq(accountTable.userId, userTable.id))
    .where(eq(accountTable.accountId, "credential"));

  const remainingMismatches = verifyResults.filter(r => r.loginEmail !== r.currentEmail);

  if (remainingMismatches.length === 0) {
    console.log("✅ Verification passed! All accounts are now in sync.\n");
    console.log("📝 Next steps:");
    console.log("   1. Restart your server: bun run dev:server");
    console.log("   2. Test login with NEW email - should work");
    console.log("   3. Test login with OLD email - should fail");
    console.log("   4. Try signing up with OLD email - should create NEW account\n");
  } else {
    console.log(`⚠️  Warning: ${remainingMismatches.length} mismatch(es) still remain.`);
    console.log("Please review the errors above.\n");
  }
}

fixEmailAccounts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  });
