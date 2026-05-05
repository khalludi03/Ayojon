/**
 * Recalculate Product Counts for All Vendors
 *
 * Updates vendors.productCount based on actual product records
 */

import { count, eq } from 'drizzle-orm'
import { db } from '../packages/db/src/index'
import { products, vendors } from '../packages/db/src/schema/index'

console.log('\n📊 Recalculating Product Counts...\n')

const allVendors = await db.select().from(vendors)
console.log(`Found ${allVendors.length} vendors\n`)

let updated = 0

for (const vendor of allVendors) {
  // Count actual products for this vendor
  const [productCountResult] = await db
    .select({ value: count() })
    .from(products)
    .where(eq(products.vendorId, vendor.id))

  const actualCount = productCountResult?.value ?? 0

  if (vendor.productCount !== actualCount) {
    await db
      .update(vendors)
      .set({
        productCount: actualCount,
        updatedAt: new Date(),
      })
      .where(eq(vendors.id, vendor.id))

    console.log(`✅ Updated "${vendor.name}"`)
    console.log(`   Product count: ${vendor.productCount} → ${actualCount}\n`)
    updated++
  }
}

console.log(`📊 Summary:`)
console.log(`  Updated: ${updated} vendors`)
console.log(`  Total vendors: ${allVendors.length}`)

if (updated === 0) {
  console.log(`  ✅ All product counts were already accurate`)
}

console.log('\n🎉 Done!\n')
process.exit(0)
