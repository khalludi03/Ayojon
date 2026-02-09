/**
 * Complete Cleanup: vendor@test.com
 *
 * Removes ALL data for vendor@test.com:
 * - Database: user, vendor profile, products, images
 * - S3: product images, vendor logo/banner
 */

import { db } from "../packages/db/src/index";
import { user, vendors, products, productImages } from "../packages/db/src/schema/index";
import { eq } from "drizzle-orm";
import { s3Client } from "../packages/storage/src/index";

console.log("\n🗑️  Complete Cleanup: vendor@test.com\n");
console.log("⚠️  This will delete ALL data for vendor@test.com!");
console.log("   - User account");
console.log("   - Vendor profile");
console.log("   - All products");
console.log("   - All S3 files\n");

// Helper to extract S3 key from URL
function extractS3Key(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(/\/images\/(.+?)(?:\?|$)/);
  if (match) return match[1];
  return null;
}

// Helper to delete S3 file
async function deleteS3File(key: string): Promise<boolean> {
  try {
    const file = s3Client.file(key);
    await file.delete();
    return true;
  } catch (error) {
    console.error(`   Failed to delete ${key}:`, error);
    return false;
  }
}

async function cleanup() {
  // Step 1: Find user
  console.log("Step 1: Finding user...");
  const [testUser] = await db
    .select()
    .from(user)
    .where(eq(user.email, "vendor@test.com"))
    .limit(1);

  if (!testUser) {
    console.log("   ❌ User not found - nothing to clean up");
    return;
  }

  console.log(`   ✅ Found user: ${testUser.name} (${testUser.email})`);
  console.log(`      User ID: ${testUser.id}\n`);

  // Step 2: Find vendor profile
  console.log("Step 2: Finding vendor profile...");
  const [testVendor] = await db
    .select()
    .from(vendors)
    .where(eq(vendors.userId, testUser.id))
    .limit(1);

  if (testVendor) {
    console.log(`   ✅ Found vendor: ${testVendor.name}`);
    console.log(`      Vendor ID: ${testVendor.id}`);
    console.log(`      Logo: ${testVendor.logoUrl || 'none'}`);
    console.log(`      Banner: ${testVendor.bannerUrl || 'none'}\n`);
  } else {
    console.log("   ℹ️  No vendor profile found\n");
  }

  // Step 3: Find products
  console.log("Step 3: Finding products...");
  const vendorProducts = testVendor
    ? await db
        .select()
        .from(products)
        .where(eq(products.vendorId, testVendor.id))
    : [];

  console.log(`   Found ${vendorProducts.length} product(s)\n`);

  // Step 4: Find product images
  console.log("Step 4: Finding product images...");
  const allImages: string[] = [];

  for (const product of vendorProducts) {
    const images = await db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, product.id));

    for (const img of images) {
      const key = extractS3Key(img.url);
      if (key) allImages.push(key);
    }
  }

  console.log(`   Found ${allImages.length} product image(s) to delete\n`);

  // Step 5: Collect vendor logo/banner
  const vendorFiles: string[] = [];
  if (testVendor) {
    const logoKey = extractS3Key(testVendor.logoUrl);
    const bannerKey = extractS3Key(testVendor.bannerUrl);
    if (logoKey) vendorFiles.push(logoKey);
    if (bannerKey) vendorFiles.push(bannerKey);
  }

  console.log(`   Found ${vendorFiles.length} vendor image(s) to delete\n`);

  // Step 6: Delete from S3
  console.log("Step 5: Deleting files from S3...");
  const allFilesToDelete = [...allImages, ...vendorFiles];

  if (allFilesToDelete.length > 0) {
    let deletedCount = 0;
    for (const key of allFilesToDelete) {
      const success = await deleteS3File(key);
      if (success) {
        console.log(`   ✅ Deleted: ${key}`);
        deletedCount++;
      }
    }
    console.log(`   Deleted ${deletedCount}/${allFilesToDelete.length} files from S3\n`);
  } else {
    console.log("   ℹ️  No files to delete from S3\n");
  }

  // Step 7: Delete from database
  console.log("Step 6: Deleting from database...");

  await db.transaction(async (tx) => {
    // Delete product images
    if (vendorProducts.length > 0) {
      for (const product of vendorProducts) {
        await tx
          .delete(productImages)
          .where(eq(productImages.productId, product.id));
      }
      console.log(`   ✅ Deleted product images records`);

      // Delete products
      await tx
        .delete(products)
        .where(eq(products.vendorId, testVendor!.id));
      console.log(`   ✅ Deleted ${vendorProducts.length} product(s)`);
    }

    // Delete vendor profile
    if (testVendor) {
      await tx
        .delete(vendors)
        .where(eq(vendors.id, testVendor.id));
      console.log(`   ✅ Deleted vendor profile`);
    }

    // Delete user account
    await tx
      .delete(user)
      .where(eq(user.id, testUser.id));
    console.log(`   ✅ Deleted user account`);
  });

  console.log("\n📊 Cleanup Summary:");
  console.log(`   User: ✅ Deleted`);
  console.log(`   Vendor: ${testVendor ? '✅ Deleted' : 'N/A'}`);
  console.log(`   Products: ✅ Deleted (${vendorProducts.length})`);
  console.log(`   S3 Files: ✅ Deleted (${allFilesToDelete.length})`);

  console.log("\n🎉 Cleanup complete!\n");
}

cleanup().catch((error) => {
  console.error("\n❌ Error during cleanup:", error);
  process.exit(1);
});
