import { db } from "../packages/db/src/index";
import { user, vendors, products } from "../packages/db/src/schema/index";
import { orders, orderItems, payments } from "../packages/db/src/schema/orders";
import { eq } from "drizzle-orm";

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

import * as orderService from "../packages/api/src/services/order-service";
import * as paymentService from "../packages/api/src/services/payment-service";

console.log("\n🧪 COD ORDER FLOW TEST\n");

async function runTest() {
  const timestamp = Date.now();
  const testEmail = `test-user-${timestamp}@example.com`;
  const vendorEmail = `test-vendor-${timestamp}@example.com`;
  
  let userId = generateId();
  let vendorId = generateId();
  let productId = generateId();
  let orderId: string | undefined;
  let cancelOrderId: string | undefined;
  let vendorUserId = generateId();

  try {
    // 1. Setup Test Data
    console.log("📝 Step 1: Setting up test data (user, vendor, product)...");
    
    await db.insert(user).values({
      id: userId,
      email: testEmail,
      name: "Test Customer",
      role: "customer",
    });

    await db.insert(user).values({
        id: vendorUserId,
        email: vendorEmail,
        name: "Test Vendor User",
        role: "vendor",
    });

    await db.insert(vendors).values({
      id: vendorId,
      userId: vendorUserId,
      name: "Test Store",
      slug: `test-store-${timestamp}`,
      email: vendorEmail,
      location: "Dhaka",
      address: "Test Address",
      phone: "01711111111",
      isVerified: true,
      isActive: true,
    });

    await db.insert(products).values({
      id: productId,
      vendorId: vendorId,
      title: "Test Product",
      slug: `test-product-${timestamp}`,
      description: "Test description",
      price: "100.00",
      stock: 10,
      status: "active",
      categoryId: "decorations",
    });

    console.log("   ✅ Test data ready");

    // 2. Place COD Order
    console.log("\n📦 Step 2: Placing COD order...");
    const orderResult = await orderService.createOrder({
      userId,
      orderNumber: `TEST-COD-${timestamp}`,
      paymentMethod: "cod",
      items: [{
        productId,
        vendorId,
        title: "Test Product",
        price: 100,
        quantity: 1,
        imageUrl: "http://example.com/image.jpg"
      }],
      totals: {
        subtotal: 100,
        shippingCost: 50,
        tax: 0,
        discount: 0,
        total: 150,
      },
      shipping: {
        fullName: "Test Customer",
        phone: "01700000000",
        addressLine1: "Test Address",
        city: "Dhaka",
        division: "Dhaka",
        postalCode: "1200",
      }
    });

    orderId = orderResult.id;
    console.log(`   ✅ Order placed: ${orderId}, Status: ${orderResult.status}`);

    if (orderResult.status !== "placed") {
      throw new Error(`Expected status "placed", got "${orderResult.status}"`);
    }

    // 3. Confirm Order
    console.log("\n✅ Step 3: Confirming order...");
    const confirmResult = await orderService.transitionOrderStatus(orderId, "confirmed");
    console.log(`   ✅ Order confirmed, Status: ${confirmResult.order?.status}`);
    
    if (confirmResult.order?.status !== "confirmed") {
      throw new Error(`Expected status "confirmed", got "${confirmResult.order?.status}"`);
    }

    // 4. Ship Order
    console.log("\n🚚 Step 4: Shipping order...");
    const shipResult = await orderService.transitionOrderStatus(orderId, "shipped");
    console.log(`   ✅ Order shipped, Status: ${shipResult.order?.status}`);

    if (shipResult.order?.status !== "shipped") {
      throw new Error(`Expected status "shipped", got "${shipResult.order?.status}"`);
    }

    // 5. Deliver Order & Collect Cash
    console.log("\n💰 Step 5: Delivering order and collecting cash...");
    const deliverResult = await paymentService.recordCashCollection(orderId, "proof-url", "Collected 150 BDT");
    
    const [finalOrder] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    const [finalPayment] = await db.select().from(payments).where(eq(payments.orderId, orderId)).limit(1);

    console.log(`\n📊 Final Results:`);
    console.log(`   Order Status: ${finalOrder?.status} (Expected: delivered)`);
    console.log(`   Payment Status: ${finalPayment?.status} (Expected: cash_collected)`);

    if (finalOrder?.status === "delivered" && finalPayment?.status === "cash_collected") {
      console.log("\n🎉 COD FLOW TEST PASSED!");
    } else {
      console.log("\n❌ COD FLOW TEST FAILED!");
    }

    // 6. Test Cancellation with reason
    console.log("\n✖️ Step 6: Testing cancellation with reason...");
    cancelOrderId = generateId();
    await db.insert(orders).values({
        id: cancelOrderId,
        orderNumber: `TEST-CANCEL-${timestamp}`,
        userId,
        status: "placed",
        paymentMethod: "cod",
        subtotal: "100.00",
        total: "150.00",
        shippingName: "Test",
        shippingPhone: "017",
        shippingAddressLine1: "Addr",
        shippingCity: "City",
        shippingDivision: "Div",
        shippingPostalCode: "1200"
    });

    const cancelReason = "Customer changed their mind";
    await orderService.transitionOrderStatus(cancelOrderId, "cancelled", undefined, cancelReason);
    
    const [cancelledOrder] = await db.select().from(orders).where(eq(orders.id, cancelOrderId)).limit(1);
    console.log(`   ✅ Order cancelled, Status: ${cancelledOrder?.status}`);
    console.log(`   ✅ Cancellation Reason: ${cancelledOrder?.cancellationReason}`);

    if (cancelledOrder?.status === "cancelled" && cancelledOrder?.cancellationReason === cancelReason) {
        console.log("   ✅ Cancellation with reason works!");
    } else {
        console.log("   ❌ Cancellation with reason failed!");
    }

    // Cleanup
    console.log("\n🗑️  Cleaning up test data...");
    if (orderId) {
        await db.delete(payments).where(eq(payments.orderId, orderId));
        await db.delete(orderItems).where(eq(orderItems.orderId, orderId));
        await db.delete(orders).where(eq(orders.id, orderId));
    }
    if (cancelOrderId) {
        await db.delete(orders).where(eq(orders.id, cancelOrderId));
    }
    await db.delete(products).where(eq(products.id, productId));
    await db.delete(vendors).where(eq(vendors.id, vendorId));
    await db.delete(user).where(eq(user.id, userId));
    await db.delete(user).where(eq(user.id, vendorUserId));
    console.log("   ✅ Test data cleaned up");

  } catch (error) {
    console.error("\n❌ Test failed:", error);
    // Best effort cleanup
    try {
        if (orderId) {
            await db.delete(payments).where(eq(payments.orderId, orderId));
            await db.delete(orderItems).where(eq(orderItems.orderId, orderId));
            await db.delete(orders).where(eq(orders.id, orderId));
        }
        if (cancelOrderId) {
            await db.delete(orders).where(eq(orders.id, cancelOrderId));
        }
        await db.delete(products).where(eq(products.id, productId));
        await db.delete(vendors).where(eq(vendors.id, vendorId));
        await db.delete(user).where(eq(user.id, userId));
        await db.delete(user).where(eq(user.id, vendorUserId));
    } catch (e) {}
    process.exit(1);
  }
}

runTest();