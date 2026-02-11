import { db } from "../packages/db/src/index";
import { user, vendors, products, platformSettings } from "../packages/db/src/schema/index";
import { orders, orderItems, payments } from "../packages/db/src/schema/orders";
import { eq } from "drizzle-orm";

function generateId() {
  return Math.random().toString(36).substring(2, 15);
}

import * as orderService from "../packages/api/src/services/order-service";
import * as paymentService from "../packages/api/src/services/payment-service";

async function runMathVerification() {
  console.log("🧪 VERIFYING SETTLEMENT MATH...");
  
  const timestamp = Date.now();
  const userId = generateId();
  const vendorUserId = generateId();
  const vendorId = generateId();
  const productId = generateId();

  try {
    // 1. Setup platform with 7% commission
    await db.insert(platformSettings).values({
        id: "current",
        platformName: "Ayojon",
        contactEmail: "admin@example.com",
        supportPhone: "01700000000",
        platformCommission: 7,
        platformBalance: "0.00",
    }).onConflictDoUpdate({
        target: platformSettings.id,
        set: { platformCommission: 7 }
    });

    // 2. Setup Vendor with PREVIOUS 122.00 balance
    await db.insert(user).values({ id: userId, email: `u${timestamp}@test.com`, name: "User" });
    await db.insert(user).values({ id: vendorUserId, email: `v${timestamp}@test.com`, name: "Vendor" });
    
    await db.insert(vendors).values({
      id: vendorId,
      userId: vendorUserId,
      name: "Math Test Store",
      slug: `math-store-${timestamp}`,
      location: "Dhaka",
      walletBalance: "122.00", // PREVIOUS BALANCE
      isVerified: true,
      isActive: true,
    });

    await db.insert(products).values({
      id: productId,
      vendorId: vendorId,
      title: "Expensive Product",
      slug: `prod-${timestamp}`,
      description: "Test",
      price: "488.00", // NEW PRODUCT PRICE
      stock: 10,
      status: "active",
      categoryId: "decorations",
    });

    // 3. Place order for 488.00
    const orderResult = await orderService.createOrder({
      userId,
      orderNumber: `MATH-${timestamp}`,
      paymentMethod: "cod",
      items: [{
        productId,
        vendorId,
        title: "Expensive Product",
        price: 488,
        quantity: 1,
      }],
      totals: {
        subtotal: 488,
        shippingCost: 50,
        tax: 0,
        discount: 0,
        total: 538,
      },
      shipping: {
        fullName: "Math Student",
        phone: "017",
        addressLine1: "School",
        city: "Dhaka",
        division: "Dhaka",
        postalCode: "1200",
      }
    });

    const orderId = orderResult.id;
    console.log("📦 Order placed for 488.00 (Subtotal)");

    // 4. Move through flow to Delivered
    await orderService.transitionOrderStatus(orderId, "confirmed");
    await orderService.transitionOrderStatus(orderId, "shipped");
    
    console.log("💰 Marking as Delivered (triggers settlement)...");
    const [prePlatform] = await db.select().from(platformSettings).where(eq(platformSettings.id, "current")).limit(1);
    await paymentService.recordCashCollection(orderId, "proof", "Done");

    // 5. Check Final Balance
    const [finalVendor] = await db.select().from(vendors).where(eq(vendors.id, vendorId)).limit(1);
    const [postPlatform] = await db.select().from(platformSettings).where(eq(platformSettings.id, "current")).limit(1);
    
    const platformDiff = parseFloat(postPlatform?.platformBalance || "0") - parseFloat(prePlatform?.platformBalance || "0");

    console.log("\n📊 Math Result:");
    console.log("   Initial Vendor Balance: 122.00");
    console.log("   Product Price:          488.00");
    console.log("   Vendor Cut (93%):       453.84");
    console.log("   ------------------------------");
    console.log("   Expected Vendor Total:  575.84");
    console.log("   Actual Vendor Balance:  " + finalVendor?.walletBalance);
    console.log(`   Platform Gain (Net):    +${platformDiff.toFixed(2)}`);
    console.log(`   (Exp: 488*0.07 + 50 = 34.16 + 50 = 84.16)`);

    if (finalVendor?.walletBalance === "575.84" && platformDiff.toFixed(2) === "84.16") {
      console.log("\n✅ MATH VERIFIED! Both Vendor and Admin balances are correct.");
    } else {
      console.log("\n❌ MATH FAILED! Balance mismatch.");
      if (finalVendor?.walletBalance !== "575.84") console.log("      Vendor mismatch");
      if (platformDiff.toFixed(2) !== "84.16") console.log("      Platform mismatch: got " + platformDiff.toFixed(2));
    }

    // Cleanup
    await db.delete(orderItems).where(eq(orderItems.orderId, orderId));
    await db.delete(payments).where(eq(payments.orderId, orderId));
    await db.delete(orders).where(eq(orders.id, orderId));
    await db.delete(products).where(eq(products.id, productId));
    await db.delete(vendors).where(eq(vendors.id, vendorId));
    await db.delete(user).where(eq(user.id, userId));
    await db.delete(user).where(eq(user.id, vendorUserId));

  } catch (e) {
    console.error(e);
  }
}

runMathVerification();