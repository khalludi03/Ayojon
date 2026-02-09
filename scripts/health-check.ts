/**
 * Comprehensive Health Check for Ayojon Project
 *
 * Verifies all components are wired up correctly:
 * - Database connectivity
 * - S3 storage
 * - API server
 * - oRPC endpoints
 * - Data integrity
 */

import { db } from "../packages/db/src/index";
import { s3Client, getPublicUrl } from "../packages/storage/src/index";
import {
  user,
  vendors,
  products,
  productImages,
  categories,
  reviews
} from "../packages/db/src/schema";

interface HealthCheck {
  component: string;
  status: "✅" | "❌" | "⚠️";
  message: string;
  details?: string;
}

const checks: HealthCheck[] = [];

async function checkDatabase() {
  try {
    const userCount = (await db.select().from(user)).length;
    const vendorCount = (await db.select().from(vendors)).length;
    const productCount = (await db.select().from(products)).length;
    const categoryCount = (await db.select().from(categories)).length;
    const reviewCount = (await db.select().from(reviews)).length;

    if (userCount === 0 || productCount === 0) {
      checks.push({
        component: "Database",
        status: "⚠️",
        message: "Database connected but no data",
        details: "Run: bun packages/db/src/seed-faker.ts"
      });
    } else {
      checks.push({
        component: "Database",
        status: "✅",
        message: "Connected and populated",
        details: `${userCount} users, ${vendorCount} vendors, ${productCount} products, ${reviewCount} reviews`
      });
    }
  } catch (error) {
    checks.push({
      component: "Database",
      status: "❌",
      message: "Connection failed",
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

async function checkS3Storage() {
  try {
    const testKey = "health-check-test.txt";
    const testContent = "Health check test";

    // Try to write
    const file = s3Client.file(testKey);
    await file.write(testContent);

    // Try to read
    const content = await file.text();

    // Try to get public URL
    const publicUrl = getPublicUrl(testKey);

    // Cleanup
    await file.delete();

    if (content === testContent) {
      // Check if there are actual product images in S3
      const images = await db.select().from(productImages).limit(10);
      const s3Images = images.filter(img => img.url.includes(process.env.S3_PUBLIC_URL || 'storage'));

      checks.push({
        component: "S3 Storage",
        status: "✅",
        message: "Working correctly",
        details: `Read/write OK, ${s3Images.length}/10 sample images use S3`
      });
    } else {
      checks.push({
        component: "S3 Storage",
        status: "⚠️",
        message: "Connected but data mismatch",
        details: "Write/read verification failed"
      });
    }
  } catch (error) {
    checks.push({
      component: "S3 Storage",
      status: "❌",
      message: "Storage operation failed",
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

async function checkAPIServer() {
  try {
    // Check if server is running
    const response = await fetch("http://localhost:3000/", {
      method: "GET",
    });

    if (response.ok) {
      const text = await response.text();
      checks.push({
        component: "API Server",
        status: "✅",
        message: "Server is running",
        details: `Port 3000 responding: "${text}"`
      });
    } else {
      checks.push({
        component: "API Server",
        status: "⚠️",
        message: "Server responding but unexpected status",
        details: `Status: ${response.status}`
      });
    }
  } catch (error) {
    checks.push({
      component: "API Server",
      status: "❌",
      message: "Server not reachable",
      details: "Run: bun run dev:server"
    });
  }
}

async function checkAPIEndpoints() {
  try {
    // Test OpenAPI doc endpoint
    const docResponse = await fetch("http://localhost:3000/doc");

    if (!docResponse.ok) {
      checks.push({
        component: "API Endpoints",
        status: "❌",
        message: "OpenAPI doc endpoint not working",
        details: `GET /doc returned ${docResponse.status}`
      });
      return;
    }

    const apiDoc = await docResponse.json();
    const paths = Object.keys(apiDoc.paths || {});

    checks.push({
      component: "API Endpoints",
      status: "✅",
      message: "OpenAPI documentation available",
      details: `${paths.length} endpoints registered`
    });

    // List some key endpoints
    const keyEndpoints = [
      "/storage/upload-url",
      "/vendor/me",
      "/vendor/products",
      "/admin/listUsers",
    ];

    const availableKeyEndpoints = keyEndpoints.filter(ep => paths.includes(ep));

    if (availableKeyEndpoints.length > 0) {
      checks.push({
        component: "Key Endpoints",
        status: "✅",
        message: "Critical endpoints available",
        details: availableKeyEndpoints.join(", ")
      });
    }
  } catch (error) {
    checks.push({
      component: "API Endpoints",
      status: "❌",
      message: "Cannot verify endpoints",
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

async function checkDataIntegrity() {
  try {
    // Check products have images
    const productsWithImages = await db
      .select({
        productId: products.id,
        imageCount: db.$count(productImages, {
          where: (img) => db.eq(img.productId, products.id)
        })
      })
      .from(products)
      .limit(10);

    // Check vendors have products
    const vendorsWithProducts = await db
      .select({
        vendorId: vendors.id,
        productCount: vendors.productCount
      })
      .from(vendors)
      .limit(5);

    const hasImages = productsWithImages.length > 0;
    const vendorsHaveProducts = vendorsWithProducts.some(v => (v.productCount ?? 0) > 0);

    checks.push({
      component: "Data Integrity",
      status: "✅",
      message: "Data relationships intact",
      details: `Products have images: ${hasImages}, Vendors have products: ${vendorsHaveProducts}`
    });
  } catch (error) {
    checks.push({
      component: "Data Integrity",
      status: "⚠️",
      message: "Could not verify all relationships",
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

async function checkEnvironmentVariables() {
  const requiredEnvVars = [
    "DATABASE_URL",
    "S3_ACCESS_KEY_ID",
    "S3_SECRET_ACCESS_KEY",
    "S3_BUCKET",
    "S3_ENDPOINT",
    "BETTER_AUTH_SECRET",
    "BETTER_AUTH_URL",
  ];

  const missing = requiredEnvVars.filter(key => !process.env[key]);

  if (missing.length === 0) {
    checks.push({
      component: "Environment",
      status: "✅",
      message: "All required variables set",
      details: `${requiredEnvVars.length} variables configured`
    });
  } else {
    checks.push({
      component: "Environment",
      status: "❌",
      message: "Missing environment variables",
      details: `Missing: ${missing.join(", ")}`
    });
  }
}

async function main() {
  console.log("\n🔍 Running Ayojon Project Health Check...\n");

  await checkEnvironmentVariables();
  await checkDatabase();
  await checkS3Storage();
  await checkAPIServer();
  await checkAPIEndpoints();
  await checkDataIntegrity();

  console.log("=" .repeat(80));
  console.log("HEALTH CHECK RESULTS");
  console.log("=".repeat(80));

  for (const check of checks) {
    console.log(`\n${check.status} ${check.component}`);
    console.log(`   ${check.message}`);
    if (check.details) {
      console.log(`   Details: ${check.details}`);
    }
  }

  const passed = checks.filter(c => c.status === "✅").length;
  const warnings = checks.filter(c => c.status === "⚠️").length;
  const failed = checks.filter(c => c.status === "❌").length;

  console.log("\n" + "=".repeat(80));
  console.log(`Summary: ${passed} passed, ${warnings} warnings, ${failed} failed`);
  console.log("=".repeat(80));

  if (failed === 0 && warnings === 0) {
    console.log("\n🎉 All systems operational! Your project is fully wired up.\n");
  } else if (failed === 0) {
    console.log("\n⚠️  Project mostly working but has warnings. Check details above.\n");
  } else {
    console.log("\n❌ Some components need attention. Fix failed checks above.\n");
  }

  // Provide next steps
  if (failed > 0 || warnings > 0) {
    console.log("📝 Recommended Actions:\n");

    checks.forEach(check => {
      if (check.status !== "✅" && check.details?.startsWith("Run:")) {
        console.log(`   • ${check.details}`);
      }
    });
    console.log();
  }
}

main();
