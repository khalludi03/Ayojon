/**
 * Test upload endpoint with a real user session
 */

import { auth } from "../packages/auth/src/index";
import { db } from "../packages/db/src/index";
import { user } from "../packages/db/src/schema/auth";
import { eq } from "drizzle-orm";

async function testUploadEndpoint() {
  console.log("\n🧪 Testing Upload Endpoint with User Auth...\n");

  try {
    // Get vendor@test.com user
    const [vendorUser] = await db
      .select()
      .from(user)
      .where(eq(user.email, "vendor@test.com"))
      .limit(1);

    if (!vendorUser) {
      console.error("❌ vendor@test.com not found");
      return;
    }

    console.log("✅ Found user:", vendorUser.email);
    console.log(`   Role: ${vendorUser.role}, Status: ${vendorUser.vendorStatus}`);

    // Create a session for testing
    console.log("\n📝 To test the upload in your browser:");
    console.log("   1. Make sure you're logged in as vendor@test.com");
    console.log("   2. Open browser console (F12)");
    console.log("   3. Run this command:");
    console.log(`
    fetch('http://localhost:3000/api/storage/upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        key: 'test/logo.jpg',
        type: 'image/jpeg'
      })
    })
    .then(r => r.json())
    .then(console.log)
    .catch(console.error);
    `);

    console.log("\n   If you get { url, publicUrl, key }, it's working!");
    console.log("   If you get an error about UNAUTHORIZED, the session cookie isn't being sent.\n");

  } catch (error) {
    console.error("❌ Error:", error);
  }
}

testUploadEndpoint();
