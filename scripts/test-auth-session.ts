/**
 * Test if Better Auth sessions are working
 */

async function testAuth() {
  console.log("\n🔐 Testing Authentication...\n");

  try {
    // Test the private endpoint which requires auth
    const response = await fetch("http://localhost:3000/api/private", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    console.log(`Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Authenticated!");
      console.log("User data:", JSON.stringify(data, null, 2));
    } else {
      const error = await response.text();
      console.log("❌ Not authenticated");
      console.log("Error:", error);
    }
  } catch (error) {
    console.error("❌ Request failed:", error);
  }

  console.log("\n💡 To test with an actual session:");
  console.log("   1. Log in via the web app (http://localhost:3001)");
  console.log("   2. Open browser dev tools → Application → Cookies");
  console.log("   3. Copy the session cookie value");
  console.log("   4. Test with: curl -H 'Cookie: better-auth.session_token=YOUR_TOKEN' http://localhost:3000/api/private\n");
}

testAuth();
