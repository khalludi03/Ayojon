/**
 * Diagnostic Script: Check for email/login mismatches
 *
 * Run this BEFORE the migration to see how many users are affected:
 * bun run check:emails
 */

import { db } from "../packages/db/src/index.ts";
import { user as userTable, account as accountTable } from "../packages/db/src/schema/auth.ts";
import { eq, and } from "drizzle-orm";

async function checkEmailMismatch() {
  console.log("🔍 Checking for email/login mismatches...\n");

  const results = await db
    .select({
      userId: userTable.id,
      userName: userTable.name,
      currentEmail: userTable.email,
      loginEmail: accountTable.providerId,
      accountId: accountTable.accountId,
    })
    .from(userTable)
    .innerJoin(accountTable, eq(accountTable.userId, userTable.id))
    .where(
      and(
        eq(accountTable.accountId, "credential")
      )
    );

  // Filter mismatches in memory (since we can't use != in where with join easily)
  const mismatches = results.filter(r => r.loginEmail !== r.currentEmail);

  if (mismatches.length === 0) {
    console.log("✅ No mismatches found! All credential accounts are in sync.");
    return;
  }

  console.log(`⚠️  Found ${mismatches.length} user(s) with email/login mismatch:\n`);

  mismatches.forEach((user, index) => {
    console.log(`${index + 1}. User: ${user.userName}`);
    console.log(`   Current Email: ${user.currentEmail}`);
    console.log(`   Login Email:   ${user.loginEmail} ← OLD EMAIL (BUG!)`);
    console.log(`   User ID:       ${user.userId}\n`);
  });

  console.log("📋 Summary:");
  console.log(`   - ${mismatches.length} accounts need fixing`);
  console.log(`   - Run the migration to sync login emails with current emails`);
  console.log(`   - After migration, users will ONLY be able to login with their current email\n`);
}

checkEmailMismatch()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
