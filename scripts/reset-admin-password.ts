/**
 * Reset Admin Password Script
 *
 * Creates/updates the admin account with a new password using better-auth's hashing.
 * Usage: bun scripts/reset-admin-password.ts
 */

import { pbkdf2, randomBytes } from 'node:crypto'
import { promisify } from 'node:util'
import { drizzle } from 'drizzle-orm/node-postgres'
import { eq } from 'drizzle-orm'
import { Pool } from 'pg'
import * as schema from '../packages/db/src/schema'

const pbkdf2Async = promisify(pbkdf2)

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@127.0.0.1:54322/postgres',
})

const db = drizzle(pool, { schema })

// Better-auth compatible password hashing (matches their crypto/password.mjs)
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16) // 16 bytes = 32 hex chars
  const key = await pbkdf2Async(password, salt, 10000, 64, 'sha256') // 64 bytes = 128 hex chars
  return `${salt.toString('hex')}:${key.toString('hex')}`
}

async function resetAdminPassword() {
  console.log('🔐 Resetting admin password...\n')

  const adminEmail = 'admin@test.com'
  const newPassword = 'Password123!'

  try {
    // Find admin user
    const adminUser = await db
      .select()
      .from(schema.user)
      .where(eq(schema.user.email, adminEmail))
      .limit(1)

    if (adminUser.length === 0) {
      console.error('❌ Admin user not found!')
      process.exit(1)
    }

    const userId = adminUser[0]!.id
    console.log(`✓ Found admin user: ${adminEmail} (${userId})`)

    // Hash the password using better-auth's format
    const hashedPassword = await hashPassword(newPassword)
    console.log(`✓ Generated password hash (format: salt:key)`)

    // Check if account exists
    const existingAccount = await db
      .select()
      .from(schema.account)
      .where(eq(schema.account.userId, userId))
      .limit(1)

    if (existingAccount.length > 0) {
      // Update existing account
      await db
        .update(schema.account)
        .set({
          password: hashedPassword,
        })
        .where(eq(schema.account.userId, userId))
      console.log('✓ Updated existing account password')
    } else {
      // Create new account
      await db.insert(schema.account).values({
        id: `${userId}-credential`,
        userId: userId,
        accountId: adminEmail,
        providerId: 'credential',
        password: hashedPassword,
      })
      console.log('✓ Created new account with password')
    }

    console.log(`\n✅ Admin password reset successfully!`)
    console.log(`\nLogin credentials:`)
    console.log(`  Email: ${adminEmail}`)
    console.log(`  Password: ${newPassword}`)
  } catch (error) {
    console.error('\n❌ Error resetting password:', error)
    throw error
  } finally {
    await pool.end()
  }
}

resetAdminPassword()
