import { db } from "@my-better-t-app/db";
import { orders, orderItems, payments, vendorPayouts, type OrderStatus, type PaymentMethod } from "@my-better-t-app/db/schema/orders";
import { vendors } from "@my-better-t-app/db/schema/index";
import { eq, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { validateStatusTransition, getInitialOrderStatus } from "./order-state-machine";
import { notifyOrderPlaced, notifyVendorNewOrder, notifyOrderStatusUpdate } from "./notification-service";
import { updateVendorScore } from "./vendor-service";

/**
 * Order Service
 *
 * Contains business logic for order management including:
 * - Creating orders with proper initial status
 * - Transitioning order status with validation
 * - Retrieving order details with related data
 */

/**
 * Calculate vendor payout amount after platform commission
 *
 * @param orderTotal - Total order amount
 * @param commissionRate - Platform commission rate (0-100)
 * @returns Object with vendorAmount and commissionAmount
 */
export function calculateVendorPayout(
  orderTotal: number,
  commissionRate: number
): { vendorAmount: number; commissionAmount: number } {
  // Ensure commission rate is between 0 and 100
  const validRate = Math.max(0, Math.min(100, commissionRate));

  const commissionAmount = (orderTotal * validRate) / 100;
  const vendorAmount = orderTotal - commissionAmount;

  return {
    vendorAmount: Number(vendorAmount.toFixed(2)),
    commissionAmount: Number(commissionAmount.toFixed(2)),
  };
}

/**
 * Create a new order with proper initial status based on payment method
 *
 * @param orderData - Order details
 * @returns Created order with initial status
 */
export async function createOrder(orderData: {
  userId: string;
  orderNumber: string;
  paymentMethod: PaymentMethod;
  items: Array<{
    productId: string;
    vendorId: string;
    title: string;
    price: number;
    quantity: number;
    variantInfo?: string;
    imageUrl?: string;
  }>;
  totals: {
    subtotal: number;
    shippingCost: number;
    tax: number;
    discount: number;
    total: number;
  };
  shipping: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    division: string;
    postalCode: string;
  };
  deliveryMethod?: string;
  customerNote?: string;
  paymentDetails?: {
    transactionId?: string;
    senderMobile?: string;
  };
}) {
  const orderId = nanoid();

  // Determine initial status based on payment method
  let initialStatus = getInitialOrderStatus(orderData.paymentMethod);

  // If we have a transaction ID, we can move directly to payment_submitted for prepaid methods
  if (
    orderData.paymentDetails?.transactionId &&
    (orderData.paymentMethod === "bkash" ||
      orderData.paymentMethod === "nagad" ||
      orderData.paymentMethod === "card")
  ) {
    initialStatus = "payment_submitted";
  }

  return await db.transaction(async (tx) => {
    // 1. Create the order with correct initial status
    const [order] = await tx
      .insert(orders)
      .values({
        id: orderId,
        orderNumber: orderData.orderNumber,
        userId: orderData.userId,
        status: initialStatus,
        paymentMethod: orderData.paymentMethod,
        paymentTransactionId: orderData.paymentDetails?.transactionId,
        subtotal: orderData.totals.subtotal.toString(),
        shippingCost: orderData.totals.shippingCost.toString(),
        tax: orderData.totals.tax.toString(),
        discount: orderData.totals.discount.toString(),
        total: orderData.totals.total.toString(),
        shippingName: orderData.shipping.fullName,
        shippingPhone: orderData.shipping.phone,
        shippingAddressLine1: orderData.shipping.addressLine1,
        shippingAddressLine2: orderData.shipping.addressLine2,
        shippingCity: orderData.shipping.city,
        shippingDivision: orderData.shipping.division,
        shippingPostalCode: orderData.shipping.postalCode,
        deliveryMethod: orderData.deliveryMethod,
        customerNote: orderData.customerNote,
      })
      .returning();

    // 2. Create order items
    for (const item of orderData.items) {
      await tx.insert(orderItems).values({
        id: nanoid(),
        orderId,
        productId: item.productId,
        vendorId: item.vendorId,
        title: item.title,
        price: item.price.toString(),
        quantity: item.quantity,
        variantInfo: item.variantInfo,
        imageUrl: (item as any).imageUrl,
      });
    }

    // 3. Create initial payment record
    await tx.insert(payments).values({
      id: nanoid(),
      orderId,
      amount: orderData.totals.total.toString(),
      method: orderData.paymentMethod,
      status: orderData.paymentDetails?.transactionId ? "submitted" : "pending",
      transactionId: orderData.paymentDetails?.transactionId,
      senderMobile: orderData.paymentDetails?.senderMobile,
    });

    // 4. Collect vendor user IDs for notifications (do this inside transaction)
    const vendorItemsMap = new Map<string, number>();
    for (const item of orderData.items) {
      const currentCount = vendorItemsMap.get(item.vendorId) || 0;
      vendorItemsMap.set(item.vendorId, currentCount + item.quantity);
    }

    const vendorNotifications: Array<{ userId: string; itemCount: number }> = [];
    for (const [vendorId, itemCount] of vendorItemsMap.entries()) {
      // Get vendor's userId
      const [vendor] = await tx
        .select({ userId: vendors.userId })
        .from(vendors)
        .where(eq(vendors.id, vendorId))
        .limit(1);

      if (vendor) {
        vendorNotifications.push({ userId: vendor.userId, itemCount });
      }

      // Update Vendor Score
      await updateVendorScore(vendorId, tx);
    }

    // Return both order and notification data
    return { order: order!, vendorNotifications };
  }).then(async (result) => {
    // 5. Send notifications AFTER transaction is committed
    // This prevents foreign key constraint errors
    try {
      // Notify customer that order was placed
      await notifyOrderPlaced(orderData.userId, orderId, orderData.orderNumber);

      // Notify each vendor about their new order
      for (const { userId, itemCount } of result.vendorNotifications) {
        await notifyVendorNewOrder(userId, orderId, orderData.orderNumber, itemCount);
      }
    } catch (error) {
      // Log notification errors but don't fail the order
      console.error("Failed to send order notifications:", error);
    }

    return result.order;
  });
}

/**
 * Transition order to a new status with validation
 *
 * @param orderId - Order ID
 * @param newStatus - New status to transition to
 * @param adminId - ID of admin performing the action (for audit)
 * @returns Updated order or error
 */
export async function transitionOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  adminId?: string
): Promise<{ success: boolean; order?: typeof orders.$inferSelect; error?: string }> {
  return await db.transaction(async (tx) => {
    // 1. Get current order
    const [order] = await tx
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    // 2. Validate transition
    const validation = validateStatusTransition(
      order.status,
      newStatus,
      order.paymentMethod
    );

    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // 3. Update order status
    const [updatedOrder] = await tx
      .update(orders)
      .set({
        status: newStatus,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId))
      .returning();

    // 4. Update scores for all involved vendors
    const involvedVendors = await tx
      .select({ vendorId: orderItems.vendorId })
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId))
      .groupBy(orderItems.vendorId);

    for (const { vendorId } of involvedVendors) {
      await updateVendorScore(vendorId, tx);
    }

    return { success: true, order: updatedOrder!, userId: order.userId, orderNumber: order.orderNumber };
  }).then(async (result) => {
    // 5. Send customer notification for status updates AFTER transaction is committed
    if (result.success && result.order) {
      try {
        await notifyOrderStatusUpdate(result.userId, orderId, result.orderNumber, newStatus);
      } catch (error) {
        // Log notification errors but don't fail the status update
        console.error("Failed to send order status notification:", error);
      }
    }

    return { success: result.success, order: result.order };
  });
}

/**
 * Get order details with all related data
 *
 * @param orderId - Order ID
 * @param userId - User ID (for authorization check)
 * @returns Order with items, payments, and payouts
 */
export async function getOrderDetails(orderId: string, userId?: string) {
  const conditions = userId
    ? and(eq(orders.id, orderId), eq(orders.userId, userId))
    : eq(orders.id, orderId);

  const order = await db.query.orders.findFirst({
    where: conditions,
    with: {
      items: true,
      payments: true,
      payouts: true,
      user: true,
    },
  });

  return order;
}

/**
 * Get order by order number (public tracking)
 * 
 * @param orderNumber - The visible order number (e.g. AYJ-2026-123456)
 * @returns Order with essential tracking data
 */
export async function getOrderByNumber(orderNumber: string) {
  return await db.query.orders.findFirst({
    where: eq(orders.orderNumber, orderNumber),
    with: {
      items: true,
    },
  });
}

/**
 * Get orders for a specific vendor
 *
 * @param vendorId - Vendor ID
 * @param statusFilter - Optional status filter
 * @returns List of orders containing vendor's products
 */
export async function getVendorOrders(
  vendorId: string,
  statusFilter?: OrderStatus
) {
  // Get order IDs that contain items from this vendor
  const vendorOrderItems = await db
    .select({ orderId: orderItems.orderId })
    .from(orderItems)
    .where(eq(orderItems.vendorId, vendorId))
    .groupBy(orderItems.orderId);

  const orderIds = vendorOrderItems.map((item) => item.orderId);

  if (orderIds.length === 0) {
    return [];
  }

  // Get full order details
  const ordersData = await db.query.orders.findMany({
    where: statusFilter
      ? and(
          eq(orders.status, statusFilter),
          // TODO: Use inArray when available or loop through orderIds
        )
      : undefined,
    with: {
      items: {
        where: eq(orderItems.vendorId, vendorId),
      },
      payments: true,
    },
    orderBy: [desc(orders.createdAt)],
  });

  // Filter to only include orders with vendor's items
  return ordersData.filter((order) =>
    orderIds.includes(order.id)
  );
}

/**
 * Check if a vendor owns items in an order
 *
 * @param orderId - Order ID
 * @param vendorId - Vendor ID
 * @returns True if vendor has items in the order
 */
export async function vendorOwnsOrderItems(
  orderId: string,
  vendorId: string
): Promise<boolean> {
  const items = await db
    .select()
    .from(orderItems)
    .where(and(eq(orderItems.orderId, orderId), eq(orderItems.vendorId, vendorId)))
    .limit(1);

  return items.length > 0;
}

/**
 * Update order tracking number (vendor action)
 *
 * @param orderId - Order ID
 * @param trackingNumber - Tracking number
 * @param vendorId - Vendor ID (for authorization)
 * @returns Updated order or error
 */
export async function updateOrderTracking(
  orderId: string,
  trackingNumber: string,
  vendorId: string
): Promise<{ success: boolean; order?: typeof orders.$inferSelect; error?: string }> {
  // Verify vendor owns items in this order
  const hasItems = await vendorOwnsOrderItems(orderId, vendorId);
  if (!hasItems) {
    return { success: false, error: "You do not have permission to update this order" };
  }

  return await db.transaction(async (tx) => {
    const [updatedOrder] = await tx
      .update(orders)
      .set({
        trackingNumber,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId))
      .returning();

    if (!updatedOrder) {
      return { success: false, error: "Order not found" };
    }

    return { success: true, order: updatedOrder };
  });
}
