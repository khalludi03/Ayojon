import { db } from "./packages/db/src/index.ts";
import { platformSettings } from "./packages/db/src/schema/settings.ts";
import { eq } from "drizzle-orm";

async function test() {
  try {
    console.log("Fetching settings...");
    const result = await db
      .select()
      .from(platformSettings)
      .where(eq(platformSettings.id, "current"))
      .limit(1);
    console.log("Result:", JSON.stringify(result, null, 2));
  } catch (e) {
    console.error("Error fetching settings:", e);
  }
}

test();
