# Database Maintenance Scripts

This directory contains utility scripts for database maintenance and debugging.

## Available Scripts

### 1. Check Email Mismatches
**File:** `check-email-mismatch.ts`
**Command:** `bun run check:emails`

**Purpose:** Diagnostic tool to identify users where their login email (`account.providerId`) doesn't match their current email (`user.email`).

**When to use:**
- Before running the fix migration
- After email change operations
- When debugging login issues

**Example output:**
```
🔍 Checking for email/login mismatches...

✅ No mismatches found! All credential accounts are in sync.
```

---

### 2. Fix Email Account Mismatches
**File:** `fix-email-accounts.ts`
**Command:** `bun run fix:emails`

**Purpose:** Syncs `account.providerId` with `user.email` for all credential accounts that have mismatches.

**When to use:**
- After the check script identifies mismatches
- When migrating from buggy email change code
- As a one-time data fix

**Safety features:**
- Only updates mismatched accounts
- Shows what will be changed before updating
- Verifies fix after completion
- Idempotent (safe to run multiple times)

**Example output:**
```
🔧 Starting email/account mismatch fix...

📊 Step 1: Analyzing accounts...

Found 1 account(s) to fix:

1. John Doe
   Old login: "nemo80432@gmail.com"
   New login: "arkochy25@gmail.com"

🔄 Step 2: Updating accounts...
✅ Successfully updated 1 account(s)

🔍 Step 3: Verifying fix...
✅ Verification passed! All accounts are now in sync.
```

---

### 3. Verify Database State
**File:** `verify-db-state.ts`
**Command:** `bun run verify:db`

**Purpose:** Shows comprehensive view of all accounts in the database, including account types and email mapping.

**When to use:**
- Understanding current database state
- Debugging authentication issues
- Verifying account creation
- Checking account type distribution

**Example output:**
```
🔍 Checking database state...

📊 Found 0 credential account(s):

⚠️  No credential accounts found in database.
This could mean:
  - Users are only signing in with OAuth (Google)
  - No users have signed up yet
  - Database is empty


📋 Summary:
   Total accounts: 1
   Credential accounts: 0
   OAuth accounts: 1

Account types:
   114499973901746978906: 1
```

---

## Background: The Email Change Bug

### The Problem
When users changed their email address using the email change feature, only the `user.email` field was updated. The `account.providerId` field (used for login) remained as the old email.

**Result:** Users could still login with their old email, and the old email wasn't freed up for new signups.

### The Fix
The code in `apps/server/src/index.ts` (lines 148-161) now updates BOTH fields:
```typescript
// Update user email
await db.update(userTable).set({ email }).where(eq(userTable.id, userId));

// CRITICAL: Also update the credential account's providerId
await db.update(accountTable)
  .set({ providerId: email })
  .where(and(
    eq(accountTable.userId, userId),
    eq(accountTable.accountId, "credential")
  ));
```

### Account Types
- **Credential accounts** (`accountId = 'credential'`): Email/password login - uses email as `providerId`
- **OAuth accounts** (e.g., Google): Uses provider's user ID as `providerId` - NOT affected by this bug

### Migration Scripts
These scripts fix **legacy data** from before the code fix was implemented. They sync old mismatched accounts to match the current email.

---

## Technical Details

### Database Schema
```sql
-- User table (current state)
user {
  id: string
  email: string
  name: string
  ...
}

-- Account table (login credentials)
account {
  id: string
  user_id: string (FK to user.id)
  account_id: string (type: 'credential' or provider ID)
  provider_id: string (login identifier)
  ...
}
```

### Credential Account Example
```sql
-- BEFORE email change (CORRECT)
user: { id: "123", email: "old@example.com" }
account: { user_id: "123", account_id: "credential", provider_id: "old@example.com" }

-- AFTER email change - BUG (old code)
user: { id: "123", email: "new@example.com" } ✅ Updated
account: { user_id: "123", account_id: "credential", provider_id: "old@example.com" } ❌ NOT updated

-- AFTER email change - FIXED (new code + migration)
user: { id: "123", email: "new@example.com" } ✅ Updated
account: { user_id: "123", account_id: "credential", provider_id: "new@example.com" } ✅ Updated
```

---

## Dependencies

These scripts require the following dependencies (already added to root `package.json`):
- `drizzle-orm` - ORM for database queries
- `pg` - PostgreSQL driver
- `@types/pg` - TypeScript types

---

## Troubleshooting

### "Cannot find module" errors
Make sure dependencies are installed:
```bash
bun install
```

### Database connection errors
Check that `DATABASE_URL` is set in your `.env` file:
```bash
# .env
DATABASE_URL="postgresql://..."
```

### No credential accounts found
This is normal if:
- Users are signing in with Google OAuth only
- No email/password signups have been created
- Fresh database

The scripts will show `0 credential accounts` - this is expected.

---

## Safety Notes

✅ **Safe to run in production:**
- All scripts are read-only except `fix-email-accounts.ts`
- Migration script is idempotent (safe to run multiple times)
- Only updates accounts with actual mismatches
- No data is deleted

⚠️ **Best practices:**
1. Always run `check:emails` BEFORE `fix:emails`
2. Backup database before running fix script in production
3. Test in staging environment first
4. Review the "what will be changed" output before confirming

---

## Questions?

For implementation details, see:
- Code fix: `apps/server/src/index.ts` (lines 136-161)
- SQL migration: `packages/db/migrations/fix-email-login-bug.sql`
- Better Auth docs: https://www.better-auth.com/
