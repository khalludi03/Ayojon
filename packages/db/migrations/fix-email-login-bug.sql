-- Migration: Fix email login bug - sync account.providerId with user.email
-- Date: 2026-02-06
-- Issue: Users can still login with old email after changing it

-- This query updates credential accounts to use the current user email
-- Safe for production: only updates where there's a mismatch

UPDATE account
SET
  provider_id = u.email,
  updated_at = NOW()
FROM "user" u
WHERE
  account.user_id = u.id
  AND account.account_id = 'credential'
  AND account.provider_id != u.email;

-- Verification query (run after migration to confirm):
-- SELECT
--   u.email as current_email,
--   a.provider_id as login_email,
--   u.id as user_id
-- FROM "user" u
-- JOIN account a ON a.user_id = u.id
-- WHERE a.account_id = 'credential'
--   AND a.provider_id != u.email;
-- Expected result: 0 rows
