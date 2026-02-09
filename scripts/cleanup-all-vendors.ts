/**
 * Complete Cleanup: ALL VENDORS
 *
 * ⚠️  DESTRUCTIVE OPERATION ⚠️
 * Removes ALL vendors and related data:
 * - All vendor profiles
 * - All products from all vendors
 * - All product images
 * - All vendor applications
 * - All S3 files (logos, banners, product images)
 * - Reverts all vendor users to customer role
 */

import { db } from "../packages/db/src/index";
import { user, vendors, products, productImages, vendorApplications } from "../packages/db/src/schema/index";
import { eq, inArray } from "drizzle-orm";
import { s3Client } from "../packages/storage/src/index";

console.log("\n🗑️  COMPLETE CLEANUP: ALL VENDORS\n");
console.log("⚠️  ⚠️  ⚠️  WARNING ⚠️  ⚠️  ⚠️");
console.log("\nThis will PERMANENTLY DELETE:");
console.log("  - ALL vendor profiles");
console.log("  - ALL products from all vendors");
console.log("  - ALL product images");
console.log("  - ALL vendor applications");
console.log("  - ALL S3 files (logos, banners, product images)");
console.log("  - Revert all vendor users to customer role\n");

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
    // Silently ignore "not found" errors
    if (error instanceof Error && error.message.includes("NoSuchKey")) {
      return false;
    }
    console.error(`   ⚠️  Failed to delete ${key}:`, error instanceof Error ? error.message : error);
    return false;
  }
}

async function cleanup() {
  // Step 1: Get all vendors
  console.log("📊 Step 1: Counting vendors...");
  const allVendors = await db.select().from(vendors);
  console.log(`   Found ${allVendors.length} vendor(s)\n`);

  if (allVendors.length === 0) {
    console.log("✅ No vendors to clean up!\n");
    return;
  }

  // Step 2: Get all products
  console.log("📊 Step 2: Counting products...");
  const allProducts = await db.select().from(products);
  console.log(`   Found ${allProducts.length} product(s)\n`);

  // Step 3: Get all product images
  console.log("📊 Step 3: Collecting product images...");
  const allProductImages = await db.select().from(productImages);
  console.log(`   Found ${allProductImages.length} product image(s)\n`);

  // Step 4: Get all vendor applications
  console.log("📊 Step 4: Counting vendor applications...");
  const allApplications = await db.select().from(vendorApplications);
  console.log(`   Found ${allApplications.length} application(s)\n`);

  // Step 5: Collect all S3 files to delete
  console.log("📊 Step 5: Collecting S3 files...");
  const s3FilesToDelete: string[] = [];

  // Vendor logos and banners
  for (const vendor of allVendors) {
    const logoKey = extractS3Key(vendor.logoUrl);
    const bannerKey = extractS3Key(vendor.bannerUrl);
    if (logoKey) s3FilesToDelete.push(logoKey);
    if (bannerKey) s3FilesToDelete.push(bannerKey);
  }

  // Product images
  for (const img of allProductImages) {
    const key = extractS3Key(img.url);
    if (key) s3FilesToDelete.push(key);
  }

  console.log(`   Vendor images: ${s3FilesToDelete.length - allProductImages.length}`);
  console.log(`   Product images: ${allProductImages.length}`);
  console.log(`   Total S3 files: ${s3FilesToDelete.length}\n`);

  // Step 6: Delete from S3
  console.log("🗑️  Step 6: Deleting files from S3...");
  let deletedCount = 0;
  let notFoundCount = 0;

  if (s3FilesToDelete.length > 0) {
    console.log(`   Processing ${s3FilesToDelete.length} files...`);
    for (const key of s3FilesToDelete) {
      const success = await deleteS3File(key);
      if (success) {
        deletedCount++;
        if (deletedCount % 50 === 0) {
          console.log(`   Deleted ${deletedCount}/${s3FilesToDelete.length}...`);
        }
      } else {
        notFoundCount++;
      }
    }
    console.log(`   ✅ Deleted: ${deletedCount}`);
    console.log(`   ℹ️  Not found: ${notFoundCount}`);
    console.log(`   Total: ${s3FilesToDelete.length}\n`);
  } else {
    console.log("   ℹ️  No files to delete\n");
  }

  // Step 7: Delete from database
  console.log("🗑️  Step 7: Deleting from database...");

  await db.transaction(async (tx) => {
    // Delete product images
    if (allProductImages.length > 0) {
      await tx.delete(productImages);
      console.log(`   ✅ Deleted ${allProductImages.length} product image records`);
    }

    // Delete products
    if (allProducts.length > 0) {
      await tx.delete(products);
      console.log(`   ✅ Deleted ${allProducts.length} products`);
    }

    // Delete vendor applications
    if (allApplications.length > 0) {
      await tx.delete(vendorApplications);
      console.log(`   ✅ Deleted ${allApplications.length} vendor applications`);
    }

    // Delete vendor profiles
    if (allVendors.length > 0) {
      await tx.delete(vendors);
      console.log(`   ✅ Deleted ${allVendors.length} vendor profiles`);
    }

    // Revert all vendor users to customer role
    const vendorUserIds = allVendors.map(v => v.userId);
    if (vendorUserIds.length > 0) {
      await tx
        .update(user)
        .set({
          role: "customer",
          vendorStatus: "none",
          updatedAt: new Date(),
        })
        .where(inArray(user.id, vendorUserIds));
      console.log(`   ✅ Reverted ${vendorUserIds.length} users to customer role`);
    }
  });

  console.log("\n" + "=".repeat(60));
  console.log("📊 CLEANUP SUMMARY");
  console.log("=".repeat(60));
  console.log(`  Vendors:           ${allVendors.length} deleted`);
  console.log(`  Products:          ${allProducts.length} deleted`);
  console.log(`  Product Images:    ${allProductImages.length} deleted`);
  console.log(`  Applications:      ${allApplications.length} deleted`);
  console.log(`  S3 Files:          ${deletedCount} deleted, ${notFoundCount} not found`);
  console.log(`  Users Reverted:    ${allVendors.length} (vendor → customer)`);
  console.log("=".repeat(60));

  console.log("\n🎉 Cleanup complete! The platform is now vendor-free.\n");
}

cleanup().catch((error) => {
  console.error("\n❌ Error during cleanup:", error);
  process.exit(1);
});
