import { db } from "../packages/db/src/index";
import { vendors } from "../packages/db/src/schema/catalog";
import { updateVendorScore } from "../packages/api/src/services/vendor-service";

async function main() {
  console.log("🚀 Starting vendor score recalculation...");

  const allVendors = await db.select({ id: vendors.id, name: vendors.name }).from(vendors);
  console.log(`Found ${allVendors.length} vendors to process.`);

  for (const vendor of allVendors) {
    try {
      process.stdout.write(`Processing ${vendor.name} (${vendor.id})... `);
      await updateVendorScore(vendor.id);
      console.log("✅ Done");
    } catch (error) {
      console.log(`❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  console.log("\n✨ Recalculation complete!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});