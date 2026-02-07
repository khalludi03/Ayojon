import { s3Client, getPublicUrl } from "@my-better-t-app/storage";

async function test() {
  console.log("🚀 Testing S3 Connection...");
  console.log("Endpoint:", process.env.S3_ENDPOINT);
  console.log("Bucket:", process.env.S3_BUCKET);

  const testKey = "test-connection.txt";
  const content = "Hello from Ayojon Bun S3!";

  try {
    const file = s3Client.file(testKey);
    console.log("✍️ Attempting to write file...");
    await file.write(content);
    
    console.log("✅ Upload successful!");
    
    const publicUrl = getPublicUrl(testKey);
    console.log("🔗 Public URL:", publicUrl);
    
    console.log("📖 Verifying content...");
    const text = await file.text();
    if (text === content) {
      console.log("🎉 Verification passed! Data matches.");
    } else {
      console.log("⚠️ Data mismatch. Expected:", content, "Got:", text);
    }
  } catch (err) {
    console.error("❌ S3 Test Failed!");
    console.error(err);
    console.log("\n💡 Make sure you created a PUBLIC bucket named 'images' in Supabase Storage.");
  }
}

test();