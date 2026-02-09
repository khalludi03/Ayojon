import { db } from "../packages/db/src/index";
import { vendors } from "../packages/db/src/schema/index";

async function listVendors() {
  const v = await db.select().from(vendors);
  console.log(`Total vendors: ${v.length}`);
  console.log(JSON.stringify(v, null, 2));
}

listVendors().then(() => process.exit(0));
