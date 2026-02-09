/**
 * Create Test Application
 * Creates a test user with a pending vendor application
 */

import { db } from "../packages/db/src/index";
import { user, vendorApplications } from "../packages/db/src/schema/index";

console.log("\n📝 Creating test vendor application...\n");

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

async function createTestApplication() {
  const testEmail = `testvendor${Date.now()}@example.com`;
  const userId = generateId();
  const applicationId = generateId();

  try {
    // Create test user with pending application status
    await db.insert(user).values({
      id: userId,
      email: testEmail,
      name: "Test Vendor User",
      emailVerified: true,
      role: "customer",
      vendorStatus: "pending",
    });

    console.log(`✅ Created user: ${testEmail}`);
    console.log(`   User ID: ${userId}`);
    console.log(`   Role: customer`);
    console.log(`   Vendor Status: pending`);

    // Create vendor application
    await db.insert(vendorApplications).values({
      id: applicationId,
      userId: userId,
      businessName: "Test Business Co.",
      businessType: "company",
      taxId: "12-3456789",
      businessPhone: "01712345678",
      businessAddress: JSON.stringify({
        street: "123 Test Street",
        city: "Dhaka",
        postalCode: "1000",
      }),
      yearsInBusiness: 2,
      storeName: "Test Store",
      storeDescription: "This is a test vendor application",
      productCategories: JSON.stringify(["Electronics", "Fashion"]),
      status: "pending",
    });

    console.log(`✅ Created application: ${applicationId}`);
    console.log(`   Business: Test Business Co.`);
    console.log(`   Store: Test Store`);
    console.log(`   Status: pending\n`);

    console.log("🎉 Test application created successfully!");
    console.log("\n📋 Next steps:");
    console.log("   1. Restart dev server if needed");
    console.log("   2. Clear browser cache (Ctrl+Shift+R)");
    console.log("   3. Open: http://localhost:3001/admin/vendor-applications");
    console.log("   4. Login as admin@test.com");
    console.log("   5. Verify the application appears in the list\n");

  } catch (error) {
    console.error("\n❌ Error creating test application:", error);
    throw error;
  }
}

createTestApplication();
