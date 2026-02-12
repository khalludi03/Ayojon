import { db } from "@my-better-t-app/db";
import { platformSettings } from "@my-better-t-app/db/schema/index";
import { eq } from "drizzle-orm";

async function checkCommissionRate() {
  console.log("🔍 Checking Platform Settings...\n");

  const settings = await db
    .select()
    .from(platformSettings)
    .where(eq(platformSettings.id, "current"))
    .limit(1);

  if (settings.length === 0) {
    console.log("❌ No platform settings found!");
    console.log("Creating default settings with 10% commission...");
    
    await db.insert(platformSettings).values({
      id: "current",
      platformCommission: 10,
    });
    
    console.log("✅ Default settings created!");
  } else {
    console.log("✅ Platform Settings Found:");
    console.log("   Commission Rate:", settings[0].platformCommission, "%");
    console.log("   Flash Deal Ends:", settings[0].flashDealEndsAt);
  }

  process.exit(0);
}

checkCommissionRate().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
