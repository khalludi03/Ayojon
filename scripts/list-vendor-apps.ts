import { db } from "../packages/db/src/index";
import { vendorApplications } from "../packages/db/src/schema/index";

async function listApps() {
  const apps = await db.select().from(vendorApplications);
  console.log(`Total applications: ${apps.length}`);
  console.log(JSON.stringify(apps, null, 2));
}

listApps().then(() => process.exit(0));
