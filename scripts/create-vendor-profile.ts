/**
 * Create a vendor profile for vendor@test.com
 */

import { db } from "../packages/db/src/index";
import { vendors, user } from "../packages/db/src/schema/index";
import { eq } from "drizzle-orm";

// Simple ID generator
function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

async function createVendorProfile() {
  console.log("\n🏪 Creating Vendor Profile...\n");

  try {
    // Get the user
    const [testUser] = await db
      .select()
      .from(user)
      .where(eq(user.email, "vendor@test.com"))
      .limit(1);

    if (!testUser) {
      console.error("❌ vendor@test.com not found");
      return;
    }

    console.log(`Found user: ${testUser.email}`);

    // Check if vendor profile already exists
    const existingVendor = await db
      .select()
      .from(vendors)
      .where(eq(vendors.userId, testUser.id))
      .limit(1);

    if (existingVendor.length > 0) {
      console.log("✅ Vendor profile already exists!");
      console.log(existingVendor[0]);
      return;
    }

    // Create vendor profile
    const vendorId = generateId();

    const [newVendor] = await db
      .insert(vendors)
      .values({
        id: vendorId,
        userId: testUser.id,
        name: "Test Vendor Store",
        slug: "test-vendor-store",
        description: "Professional event supplies for all occasions",
        location: "Dhaka",
        address: "123 Test Street, Dhaka",
        phone: "+8801712345678",
        email: "vendor@test.com",
        isVerified: true,
        isActive: true,
        ratingAverage: 4.5,
        ratingCount: 0,
        productCount: 0,
        totalSales: 0,
      })
      .returning();

    console.log("\n✅ Vendor profile created successfully!");
    console.log({
      id: newVendor?.id,
      name: newVendor?.name,
      slug: newVendor?.slug,
      location: newVendor?.location,
    });

    console.log("\n🎉 You can now update your vendor profile!\n");
  } catch (error) {
    console.error("\n❌ Error:", error);
  }
}

createVendorProfile();
