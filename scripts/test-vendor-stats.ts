
import { db } from "../packages/db/src/index";
import { 
  vendors, 
  orders, 
  orderItems,
  platformSettings
} from "../packages/db/src/schema/index";
import { eq, and } from "drizzle-orm";
import * as orderService from "../packages/api/src/services/order-service";

async function testStats() {
  try {
    console.log("Testing getDashboardStats logic...");
    
    // Get a vendor
    const [vendor] = await db.select().from(vendors).limit(1);
    if (!vendor) {
      console.log("No vendor found to test.");
      return;
    }
    
    console.log("Testing for vendor:", vendor.id);
    const vendorId = vendor.id;

    // Get platform commission
    const [settings] = await db
      .select({ commission: platformSettings.platformCommission })
      .from(platformSettings)
      .where(eq(platformSettings.id, "current"))
      .limit(1);
    
    const commissionRate = settings?.commission ?? 7;
    console.log("Commission Rate:", commissionRate);

    // Get total revenue
    const vendorItems = await db
      .select({
        price: orderItems.price,
        quantity: orderItems.quantity,
        status: orders.status,
        createdAt: orders.createdAt,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(eq(orderItems.vendorId, vendorId));

    const totalRevenue = vendorItems
      .filter(item => ["delivered", "vendor_paid", "cash_collected", "settlement_ready", "vendor_settled"].includes(item.status))
      .reduce((sum, item) => {
        const itemTotal = parseFloat(item.price) * item.quantity;
        const { vendorAmount } = orderService.calculateVendorPayout(itemTotal, commissionRate);
        return sum + vendorAmount;
      }, 0);

    console.log("Total Revenue:", totalRevenue.toFixed(2));
    console.log("✅ Stats logic works!");
  } catch (e) {
    console.error("❌ Stats logic failed:", e);
  }
}

testStats().catch(console.error);
