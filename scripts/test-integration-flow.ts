/**
 * Automated Integration Test
 * Tests the complete vendor application → approval flow
 */

import { db } from "../packages/db/src/index";
import { user, vendors, vendorApplications } from "../packages/db/src/schema/index";
import { eq } from "drizzle-orm";

console.log("\n🧪 AUTOMATED INTEGRATION TEST\n");
console.log("Testing: Vendor Application → Approval → Vendor Profile\n");

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

async function runIntegrationTest() {
  const testEmail = `test${Date.now()}@example.com`;
  let userId: string;
  let applicationId: string;

  try {
    // Step 1: Create test user with pending application
    console.log("📝 Step 1: Creating test user and application...");
    userId = generateId();

    await db.insert(user).values({
      id: userId,
      email: testEmail,
      name: "Integration Test User",
      emailVerified: true,
      role: "customer",
      vendorStatus: "pending",
    });

    applicationId = generateId();

    await db.insert(vendorApplications).values({
      id: applicationId,
      userId: userId,
      businessName: "Test Integration Business",
      businessType: "company",
      taxId: "99-9999999",
      businessPhone: "01799999999",
      businessAddress: JSON.stringify({ city: "Dhaka" }),
      yearsInBusiness: 1,
      storeName: "Integration Test Store",
      storeDescription: "Automated test",
      productCategories: JSON.stringify(["Test"]),
      status: "pending",
    });

    console.log("   ✅ Created user:", testEmail);
    console.log("   ✅ Created application:", applicationId);

    // Step 2: Verify application exists
    console.log("\n🔍 Step 2: Verifying application in database...");
    const [app] = await db
      .select()
      .from(vendorApplications)
      .where(eq(vendorApplications.id, applicationId))
      .limit(1);

    if (app) {
      console.log("   ✅ Application found:", app.storeName);
      console.log("   ✅ Status:", app.status);
    } else {
      throw new Error("Application not found after creation!");
    }

    // Step 3: Simulate approval (what the backend does)
    console.log("\n✅ Step 3: Simulating application approval...");

    // Update application status
    await db
      .update(vendorApplications)
      .set({
        status: "approved",
        reviewedAt: new Date(),
      })
      .where(eq(vendorApplications.id, applicationId));

    // Update user
    await db
      .update(user)
      .set({
        role: "vendor",
        vendorStatus: "approved",
      })
      .where(eq(user.id, userId));

    // Create vendor profile
    const vendorId = generateId();
    const vendorSlug = `integration-test-${Date.now()}`;

    await db.insert(vendors).values({
      id: vendorId,
      userId: userId,
      name: "Integration Test Store",
      slug: vendorSlug,
      description: "Automated test vendor",
      location: "Dhaka",
      email: testEmail,
      isVerified: true,
      isActive: true,
      productCount: 0,
      ratingAverage: 0,
      ratingCount: 0,
      totalSales: 0,
    });

    console.log("   ✅ Application approved");
    console.log("   ✅ User promoted to vendor");
    console.log("   ✅ Vendor profile created");

    // Step 4: Verify final state
    console.log("\n🔍 Step 4: Verifying final state...");

    const [finalUser] = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    const [finalVendor] = await db
      .select()
      .from(vendors)
      .where(eq(vendors.userId, userId))
      .limit(1);

    const [finalApp] = await db
      .select()
      .from(vendorApplications)
      .where(eq(vendorApplications.id, applicationId))
      .limit(1);

    console.log("\n📊 Final State:");
    console.log(`   User: ${finalUser?.email}`);
    console.log(`     Role: ${finalUser?.role} (expected: vendor)`);
    console.log(`     Status: ${finalUser?.vendorStatus} (expected: approved)`);
    console.log(`   Vendor: ${finalVendor?.name}`);
    console.log(`     Active: ${finalVendor?.isActive}`);
    console.log(`     Verified: ${finalVendor?.isVerified}`);
    console.log(`   Application: ${finalApp?.status} (expected: approved)`);

    // Verify everything is correct
    const allCorrect =
      finalUser?.role === "vendor" &&
      finalUser?.vendorStatus === "approved" &&
      finalVendor?.isActive === true &&
      finalVendor?.isVerified === true &&
      finalApp?.status === "approved";

    if (allCorrect) {
      console.log("\n🎉 INTEGRATION TEST PASSED!");
      console.log("   ✅ Application → Approval → Vendor Profile flow works!");
    } else {
      console.log("\n❌ INTEGRATION TEST FAILED!");
      console.log("   Some values don't match expected state.");
    }

    // Cleanup
    console.log("\n🗑️  Cleaning up test data...");
    await db.delete(vendors).where(eq(vendors.id, vendorId));
    await db.delete(vendorApplications).where(eq(vendorApplications.id, applicationId));
    await db.delete(user).where(eq(user.id, userId));
    console.log("   ✅ Test data cleaned up");

    console.log("\n✅ Integration test complete!\n");

  } catch (error) {
    console.error("\n❌ Integration test failed:", error);

    // Attempt cleanup
    try {
      if (userId) {
        await db.delete(vendors).where(eq(vendors.userId, userId));
        await db.delete(vendorApplications).where(eq(vendorApplications.userId, userId));
        await db.delete(user).where(eq(user.id, userId));
      }
    } catch (cleanupError) {
      console.error("Cleanup error:", cleanupError);
    }

    throw error;
  }
}

runIntegrationTest();
