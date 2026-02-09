/**
 * Upload Sample Images to S3
 *
 * Downloads sample images and uploads them to your S3 bucket,
 * then updates product image URLs in the database.
 *
 * Run with: bun scripts/upload-sample-images.ts
 */

import { s3Client, getPublicUrl } from "../packages/storage/src/index";
import { db } from "../packages/db/src/index";
import { productImages } from "../packages/db/src/schema/products";
import { eq } from "drizzle-orm";

const SAMPLE_IMAGES = [
  "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&h=600&fit=crop", // balloons
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop", // party
  "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800&h=600&fit=crop", // sound
  "https://images.unsplash.com/photo-1519167758481-83f29da8c6c9?w=800&h=600&fit=crop", // furniture
  "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&h=600&fit=crop", // catering
  "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&h=600&fit=crop", // photography
  "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&h=600&fit=crop", // party supplies
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop", // clothing
  "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop", // stage
  "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&h=600&fit=crop", // floral
];

async function downloadImage(url: string): Promise<Blob> {
  console.log(`  Downloading: ${url.substring(0, 60)}...`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }
  return await response.blob();
}

async function uploadToS3(blob: Blob, key: string): Promise<string> {
  const file = s3Client.file(key);

  // Convert Blob to Buffer for Bun S3Client
  const buffer = await blob.arrayBuffer();
  await file.write(buffer, {
    type: blob.type,
  });

  return getPublicUrl(key);
}

async function main() {
  console.log("\n📤 Uploading Sample Images to S3...\n");

  try {
    // Get all product images from database
    const allProductImages = await db.select().from(productImages);
    console.log(`Found ${allProductImages.length} product images in database\n`);

    if (allProductImages.length === 0) {
      console.log("⚠️  No product images found. Run the seed script first:");
      console.log("   bun packages/db/src/seed-faker.ts\n");
      return;
    }

    // Upload sample images and store their S3 URLs
    console.log("Step 1: Uploading sample images to S3...");
    const uploadedUrls: string[] = [];

    for (let i = 0; i < SAMPLE_IMAGES.length; i++) {
      const imageUrl = SAMPLE_IMAGES[i]!;
      const key = `samples/sample-${i + 1}.jpg`;

      try {
        const blob = await downloadImage(imageUrl);
        const s3Url = await uploadToS3(blob, key);
        uploadedUrls.push(s3Url);
        console.log(`  ✓ Uploaded to: ${s3Url}`);
      } catch (error) {
        console.error(`  ❌ Failed to upload image ${i + 1}:`, error);
        // Use fallback external URL
        uploadedUrls.push(imageUrl);
      }
    }

    console.log(`\n✓ Uploaded ${uploadedUrls.length} sample images`);

    // Update product images to use S3 URLs
    console.log("\nStep 2: Updating product image URLs in database...");
    let updated = 0;

    for (const productImage of allProductImages) {
      // Assign one of the uploaded S3 URLs randomly
      const randomIndex = Math.floor(Math.random() * uploadedUrls.length);
      const s3Url = uploadedUrls[randomIndex]!;

      await db
        .update(productImages)
        .set({ url: s3Url })
        .where(eq(productImages.id, productImage.id));

      updated++;

      if (updated % 100 === 0) {
        console.log(`  ... ${updated}/${allProductImages.length} updated`);
      }
    }

    console.log(`✓ Updated ${updated} product images\n`);

    // Verification
    console.log("📊 Verification:");
    const updatedImages = await db.select().from(productImages);
    const s3Images = updatedImages.filter(img => img.url.includes(process.env.S3_PUBLIC_URL || 'storage'));
    const externalImages = updatedImages.filter(img => !img.url.includes(process.env.S3_PUBLIC_URL || 'storage'));

    console.log(`  S3 images: ${s3Images.length}`);
    console.log(`  External images: ${externalImages.length}`);

    if (s3Images.length > 0) {
      console.log(`  Sample S3 URL: ${s3Images[0]!.url}`);
    }

    console.log("\n✅ Sample images uploaded successfully!\n");
  } catch (error) {
    console.error("\n❌ Error uploading images:", error);
    throw error;
  }
}

main();
