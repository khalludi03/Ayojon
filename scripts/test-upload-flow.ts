/**
 * Test the complete upload flow
 */

import { s3Client, getPublicUrl, getUploadPresignedUrl } from "../packages/storage/src/index";

async function testUploadFlow() {
  console.log("\n🧪 Testing Upload Flow...\n");

  try {
    // Step 1: Generate presigned URL
    console.log("Step 1: Generating presigned URL...");
    const testKey = "test-upload/logo-test.jpg";

    const presignedUrl = getUploadPresignedUrl(testKey, {
      type: "image/jpeg",
      expiresIn: 3600,
    });

    console.log("✅ Presigned URL generated:");
    console.log(`   ${presignedUrl.substring(0, 100)}...`);

    // Step 2: Test upload with a fake file
    console.log("\nStep 2: Testing upload with sample data...");
    const fakeImageData = Buffer.from("fake image data for testing");

    const uploadResponse = await fetch(presignedUrl, {
      method: "PUT",
      body: fakeImageData,
      headers: {
        "Content-Type": "image/jpeg",
      },
    });

    if (!uploadResponse.ok) {
      console.error("❌ Upload failed:");
      console.error(`   Status: ${uploadResponse.status} ${uploadResponse.statusText}`);
      const errorText = await uploadResponse.text();
      console.error(`   Response: ${errorText}`);
      return;
    }

    console.log("✅ Upload successful!");
    console.log(`   Status: ${uploadResponse.status}`);

    // Step 3: Verify file exists
    console.log("\nStep 3: Verifying file exists...");
    const file = s3Client.file(testKey);
    const exists = await file.exists();

    if (exists) {
      console.log("✅ File exists in S3!");
      const publicUrl = getPublicUrl(testKey);
      console.log(`   Public URL: ${publicUrl}`);
    } else {
      console.log("❌ File not found in S3");
    }

    // Step 4: Test public access
    console.log("\nStep 4: Testing public access...");
    const publicUrl = getPublicUrl(testKey);
    const publicResponse = await fetch(publicUrl);

    if (publicResponse.ok) {
      console.log("✅ File is publicly accessible!");
    } else {
      console.error("❌ File not publicly accessible");
      console.error(`   Status: ${publicResponse.status}`);
    }

    // Cleanup
    console.log("\nCleaning up...");
    await file.delete();
    console.log("✅ Test file deleted");

    console.log("\n🎉 Upload flow test completed successfully!\n");
  } catch (error) {
    console.error("\n❌ Upload flow test failed:");
    console.error(error);
    console.log();
  }
}

testUploadFlow();
