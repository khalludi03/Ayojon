import { db } from '../packages/db/src/index'
import { platformSettings } from '../packages/db/src/schema/settings'

async function init() {
  console.log('Initializing platform settings...')

  try {
    await db
      .insert(platformSettings)
      .values({
        id: 'current',
        platformName: 'Ayojon',
        contactEmail: 'admin@ayojon.com',
        supportPhone: '+8801700000000',
        platformCommission: 10,
        freeShippingThreshold: 2000,
        insideDhakaRate: 60,
        outsideDhakaRate: 120,
        enableGuestCheckout: true,
        enableVendorRegistration: true,
        isMaintenanceMode: false,
      })
      .onConflictDoNothing()

    console.log('✅ Platform settings initialized successfully.')
    return 0 // Success
  } catch (error) {
    console.error('❌ Initialization failed:', error)
    return 1 // Failure
  }
}

async function main() {
  const exitCode = await init()

  // Close database connection if available
  if (typeof (db as any).$client?.end === 'function') {
    await (db as any).$client.end()
  }

  process.exit(exitCode)
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
