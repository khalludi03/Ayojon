/**
 * Comprehensive Database Connection Verification
 *
 * Tests all database connections for vendor and application features
 */

import { db } from "../packages/db/src/index";
import { user, vendors, products, productImages, vendorApplications } from "../packages/db/src/schema/index";
import { eq } from "drizzle-orm";

console.log("\n🔍 COMPREHENSIVE DATABASE CONNECTION VERIFICATION\n");
console.log("=".repeat(60) + "\n");

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
}

const results: TestResult[] = [];

function addResult(name: string, passed: boolean, message: string) {
  results.push({ name, passed, message });
  const icon = passed ? "✅" : "❌";
  console.log(`${icon} ${name}: ${message}`);
}

async function runTests() {
  console.log("📋 Running Database Connection Tests...\n");

  // Test 1: Database Connection
  try {
    await db.select().from(user).limit(1);
    addResult("Database Connection", true, "Successfully connected to database");
  } catch (error) {
    addResult("Database Connection", false, `Failed to connect: ${error}`);
    return;
  }

  // Test 2: Admin User Exists
  const adminUser = await db.select().from(user).where(eq(user.email, "admin@test.com")).limit(1);
  if (adminUser.length > 0) {
    addResult("Admin User", true, `Found: ${adminUser[0].email} (role: ${adminUser[0].role})`);
  } else {
    addResult("Admin User", false, "admin@test.com not found");
  }

  // Test 3: Vendor Applications Table
  try {
    const apps = await db.select().from(vendorApplications);
    addResult("Vendor Applications Table", true, `Accessible (${apps.length} records)`);
  } catch (error) {
    addResult("Vendor Applications Table", false, `Error: ${error}`);
  }

  // Test 4: Vendors Table
  try {
    const vendorsList = await db.select().from(vendors);
    addResult("Vendors Table", true, `Accessible (${vendorsList.length} records)`);
  } catch (error) {
    addResult("Vendors Table", false, `Error: ${error}`);
  }

  // Test 5: Products Table
  try {
    const productsList = await db.select().from(products);
    addResult("Products Table", true, `Accessible (${productsList.length} records)`);
  } catch (error) {
    addResult("Products Table", false, `Error: ${error}`);
  }

  // Test 6: Product Images Table
  try {
    const images = await db.select().from(productImages);
    addResult("Product Images Table", true, `Accessible (${images.length} records)`);
  } catch (error) {
    addResult("Product Images Table", false, `Error: ${error}`);
  }

  console.log("\n" + "=".repeat(60));
  console.log("📊 SUMMARY");
  console.log("=".repeat(60) + "\n");

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;

  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);

  if (failed === 0) {
    console.log("\n🎉 All database connections verified!");
    console.log("\n✅ Database is properly set up and accessible.");
  } else {
    console.log("\n⚠️  Some tests failed. Check the errors above.");
  }

  console.log("\n" + "=".repeat(60));
  console.log("📝 CURRENT DATABASE STATE");
  console.log("=".repeat(60) + "\n");

  const allUsers = await db.select().from(user);
  const allVendors = await db.select().from(vendors);
  const allProducts = await db.select().from(products);
  const allApplications = await db.select().from(vendorApplications);

  console.log(`Users: ${allUsers.length}`);
  if (allUsers.length > 0) {
    allUsers.forEach(u => console.log(`  - ${u.email} (${u.role}/${u.vendorStatus})`));
  }

  console.log(`\nVendors: ${allVendors.length}`);
  if (allVendors.length > 0) {
    allVendors.forEach(v => console.log(`  - ${v.name} (active: ${v.isActive}, verified: ${v.isVerified})`));
  }

  console.log(`\nProducts: ${allProducts.length}`);

  console.log(`\nVendor Applications: ${allApplications.length}`);
  if (allApplications.length > 0) {
    allApplications.forEach(app => console.log(`  - ${app.storeName} (status: ${app.status})`));
  }

  console.log("\n✅ Database connection verification complete!\n");
}

runTests().catch(error => {
  console.error("\n❌ Fatal error during verification:", error);
  process.exit(1);
});
