import { s3Client, getPublicUrl, getUploadPresignedUrl, deleteFile, fileExists } from "@my-better-t-app/storage";

async function runTests() {
  console.log("🧪 Running S3 Integration Tests\n");

  const testKey = `test-${Date.now()}.txt`;
  const testContent = "Hello from S3 integration test!";

  try {
    // Test 1: Basic write/read
    console.log("Test 1: Basic Write/Read");
    const file = s3Client.file(testKey);
    await file.write(testContent);
    const readContent = await file.text();
    console.log(readContent === testContent ? "✅ PASS" : "❌ FAIL");

    // Test 2: Public URL generation
    console.log("\nTest 2: Public URL Generation");
    const publicUrl = getPublicUrl(testKey);
    console.log(`Public URL: ${publicUrl}`);
    console.log(publicUrl.includes(testKey) ? "✅ PASS" : "❌ FAIL");

    // Test 3: Presigned URL for upload
    console.log("\nTest 3: Presigned Upload URL");
    const uploadUrl = getUploadPresignedUrl("test-presigned.txt", { type: "text/plain" });
    console.log(`Upload URL generated: ${uploadUrl.substring(0, 50)}...`);
    console.log(uploadUrl.includes("X-Amz-") ? "✅ PASS" : "❌ FAIL");

    // Test 4: File exists check
    console.log("\nTest 4: File Exists Check");
    const exists = await fileExists(testKey);
    console.log(`File exists: ${exists}`);
    console.log(exists ? "✅ PASS" : "❌ FAIL");

    // Test 5: File upload via presigned URL
    console.log("\nTest 5: Upload via Presigned URL");
    const presignedKey = `test-presigned-${Date.now()}.txt`;
    const presignedUrl = getUploadPresignedUrl(presignedKey, { type: "text/plain" });

    const uploadResponse = await fetch(presignedUrl, {
      method: "PUT",
      body: "Content uploaded via presigned URL",
      headers: {
        "Content-Type": "text/plain",
      },
    });

    console.log(`Upload status: ${uploadResponse.status}`);
    console.log(uploadResponse.ok ? "✅ PASS" : "❌ FAIL");

    // Test 6: Verify presigned upload
    console.log("\nTest 6: Verify Presigned Upload");
    const presignedFile = s3Client.file(presignedKey);
    const presignedContent = await presignedFile.text();
    console.log(`Content: ${presignedContent}`);
    console.log(presignedContent === "Content uploaded via presigned URL" ? "✅ PASS" : "❌ FAIL");

    // Test 7: Cleanup - Delete files
    console.log("\nTest 7: File Deletion");
    await deleteFile(testKey);
    await deleteFile(presignedKey);
    const stillExists = await fileExists(testKey);
    console.log(`File still exists: ${stillExists}`);
    console.log(!stillExists ? "✅ PASS" : "❌ FAIL");

    console.log("\n🎉 All tests completed!");

  } catch (error) {
    console.error("\n❌ Test failed with error:");
    console.error(error);
    process.exit(1);
  }
}

runTests();
