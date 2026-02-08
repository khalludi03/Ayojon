import { db } from "../packages/db/src/index";
import { user } from "../packages/db/src/schema/auth";
import { count, desc, and, or, ilike, eq } from "drizzle-orm";

async function main() {
  const search = undefined;
  const role = undefined;
  const limit = 50;
  const offset = 0;

  const filters = [];
  // For debugging, let's see what happens if we build it manually
  if (search) filters.push(or(ilike(user.name, `%${search}%`), ilike(user.email, `%${search}%`)));
  if (role) filters.push(eq(user.role, role));
  
  const where = filters.length > 0 ? and(...filters) : undefined;

  console.log("Where clause built:", where ? "Conditional" : "Undefined (All)");

  const totalCountResult = await db
    .select({ value: count() })
    .from(user)
    .where(where);

  console.log("Total Count Result:", totalCountResult);

  const users = await db
    .select()
    .from(user)
    .where(where)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(user.createdAt));

  console.log("Users found count:", users.length);
  users.forEach(u => {
    console.log(`- ${u.name} (${u.email}) [Role: ${u.role}, Status: ${u.isDeactivated ? 'Suspended' : 'Active'}]`);
  });
}

main().catch(console.error);