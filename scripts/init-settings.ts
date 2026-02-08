import { db } from "../packages/db/src/index";
import { platformSettings } from "../packages/db/src/schema/settings";

async function init() {
  console.log("Initializing platform settings...");
  
  try {
    await db.insert(platformSettings).values({
      id: "current",
      platformName: "Ayojon",
      contactEmail: "admin@ayojon.com",
      supportPhone: "+8801700000000",
      platformCommission: 10,
      freeShippingThreshold: 2000,
      insideDhakaRate: 60,
      outsideDhakaRate: 120,
      enableGuestCheckout: true,
      enableVendorRegistration: true,
      isMaintenanceMode: false
    }).onConflictDoNothing();

    console.log("✅ Platform settings initialized.");
  } catch (error) {
    console.error("Initialization failed:", error);
  } finally {
    process.exit();
  }
}

init();
