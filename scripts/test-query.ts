
import { db } from "../packages/db/src/index";
import { platformSettings } from "../packages/db/src/schema/index";
import { eq } from "drizzle-orm";

async function test() {
  try {
    console.log("Querying platformSettings...");
    const settings = await db
      .select()
      .from(platformSettings)
      .where(eq(platformSettings.id, "current"))
      .limit(1);
    console.log("Result:", JSON.stringify(settings, null, 2));
  } catch (e) {
    console.error("Query failed:", e);
  }
}

test().catch(console.error);
