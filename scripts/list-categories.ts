#!/usr/bin/env bun
import { db } from "../packages/db/src/index";
import { categories } from "../packages/db/src/schema/index";

console.log("\n📋 Available Categories:\n");

const allCategories = await db.select().from(categories);

if (allCategories.length === 0) {
  console.log("❌ No categories found in database!");
} else {
  allCategories.forEach((cat, i) => {
    console.log(`${i + 1}. ${cat.name} (ID: ${cat.id})`);
  });
}

console.log(`\nTotal: ${allCategories.length} categories\n`);
