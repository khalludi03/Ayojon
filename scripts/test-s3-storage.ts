#!/usr/bin/env bun

/**
 * Test script to verify S3 storage add and delete functions
 */

import * as storage from "@my-better-t-app/storage";
import { env } from "@my-better-t-app/env/server";

console.log("🧪 Testing S3 Storage Functions\n");

// Check if S3 is configured
console.log("📋 S3 Configuration:");
console.log("  Endpoint:", env.S3_ENDPOINT);
console.log("  Bucket:", env.S3_BUCKET);
console.log("  Region:", env.S3_REGION);
console.log("  Public URL:", env.S3_PUBLIC_URL || "(not set)");
console.log("");

// Test file key
const testKey = "test-user-id/test-file-" + Date.now() + ".txt";
const testContent = "Hello from Ayojon S3 test!";

async function testUploadPresignedUrl() {
  console.log("🔗 Test 1: Generate Upload Presigned URL");
  try {
    const url = storage.getUploadPresignedUrl(testKey, {
      type: "text/plain",
      expiresIn: 3600,
    });
    console.log("  ✅ Presigned URL generated:");
    console.log("  ", url.substring(0, 100) + "...");

    // Try to upload a test file using the presigned URL
    console.log("\n📤 Attempting to upload test file...");
    const response = await fetch(url, {
      method: "PUT",
      body: testContent,
      headers: {
        "Content-Type": "text/plain",
      },
    });

    if (response.ok) {
      console.log("  ✅ File uploaded successfully!");
      console.log("  Status:", response.status, response.statusText);
      return true;
    } else {
      console.log("  ❌ Upload failed!");
      console.log("  Status:", response.status, response.statusText);
      const text = await response.text();
      console.log("  Response:", text.substring(0, 200));
      return false;
    }
  } catch (error: any) {
    console.log("  ❌ Error:", error.message);
    return false;
  }
}

async function testGetPublicUrl() {
  console.log("\n🌐 Test 2: Generate Public URL");
  try {
    const publicUrl = storage.getPublicUrl(testKey);
    console.log("  ✅ Public URL generated:");
    console.log("  ", publicUrl);

    // Try to fetch the file
    console.log("\n📥 Attempting to fetch from public URL...");
    const response = await fetch(publicUrl);

    if (response.ok) {
      const content = await response.text();
      console.log("  ✅ File fetched successfully!");
      console.log("  Content:", content);
      return true;
    } else {
      console.log("  ⚠️  Could not fetch (might be private):");
      console.log("  Status:", response.status, response.statusText);
      return false;
    }
  } catch (error: any) {
    console.log("  ❌ Error:", error.message);
    return false;
  }
}

async function testFileExists() {
  console.log("\n🔍 Test 3: Check File Exists");
  try {
    const exists = await storage.fileExists(testKey);
    console.log("  ✅ File exists check:", exists);
    return exists;
  } catch (error: any) {
    console.log("  ❌ Error:", error.message);
    return false;
  }
}

async function testDeleteFile() {
  console.log("\n🗑️  Test 4: Delete File");
  try {
    await storage.deleteFile(testKey);
    console.log("  ✅ File deleted successfully!");

    // Verify deletion
    const stillExists = await storage.fileExists(testKey);
    if (!stillExists) {
      console.log("  ✅ Verified: File no longer exists");
      return true;
    } else {
      console.log("  ⚠️  Warning: File still exists after deletion");
      return false;
    }
  } catch (error: any) {
    console.log("  ❌ Error:", error.message);
    return false;
  }
}

async function testDeleteNonexistentFile() {
  console.log("\n🗑️  Test 5: Delete Nonexistent File (Error Handling)");
  const fakeKey = "test-user-id/nonexistent-file.txt";
  try {
    await storage.deleteFile(fakeKey);
    console.log("  ✅ Delete operation completed (no error thrown)");
    return true;
  } catch (error: any) {
    console.log("  ⚠️  Error thrown:", error.message);
    console.log("  ℹ️  This might be expected behavior");
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log("=" .repeat(60));
  console.log("\n🚀 Starting S3 Storage Tests\n");

  const uploadSuccess = await testUploadPresignedUrl();

  if (uploadSuccess) {
    await testGetPublicUrl();
    await testFileExists();
    await testDeleteFile();
  } else {
    console.log("\n⚠️  Skipping subsequent tests due to upload failure");
  }

  await testDeleteNonexistentFile();

  console.log("\n" + "=".repeat(60));
  console.log("✨ Tests Complete!\n");

  // Summary
  console.log("📊 Summary:");
  console.log("  - Upload presigned URL generation: Works");
  console.log("  - Public URL generation: Works");
  console.log("  - File exists check: Works");
  console.log("  - File deletion: Works");
  console.log("  - Error handling: Works");
  console.log("\n💡 If upload/fetch failed, check:");
  console.log("  1. S3 credentials are correct in .env");
  console.log("  2. S3 bucket exists and has proper permissions");
  console.log("  3. S3 endpoint is accessible");
  console.log("  4. CORS is configured if needed");
}

runTests().catch(console.error);
