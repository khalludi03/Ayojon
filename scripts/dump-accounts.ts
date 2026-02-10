import { db } from "../packages/db/src/index";
import { account } from "../packages/db/src/schema/auth";

async function dump() {
  console.log("Dumping accounts...");
  try {
    const accounts = await db.select().from(account).limit(10);
    console.log(JSON.stringify(accounts, null, 2));
  } catch (e) {
    console.error(e);
  }
}

dump().then(() => {
  console.log("Done");
  process.exit(0);
});