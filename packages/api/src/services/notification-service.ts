import { db } from "@my-better-t-app/db";
import { notifications, type NotificationType } from "@my-better-t-app/db/schema/index";
import { eq, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";

interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  orderId?: string;
  vendorApplicationId?: string;
  metadata?: Record<string, any>;
}

/**
 * Base function to create a notification
 */
export async function createNotification(input: CreateNotificationInput) {
  const notification = await db
    .insert(notifications)
    .values({
      id: nanoid(),
      ...input,
    })
    .returning();

  return notification[0];
}

/**
 * Notify customer when order is placed
 */
export async function notifyOrderPlaced(userId: string, orderId: string, orderNumber: string) {
  return createNotification({
    userId,
    type: "order_placed",
    title: "Order Placed Successfully",
    message: `Your order #${orderNumber} has been placed successfully.`,
    orderId,
    metadata: { orderNumber },
  });
}

/**
 * Notify vendor when they receive a new order
 */
export async function notifyVendorNewOrder(
  vendorUserId: string,
  orderId: string,
  orderNumber: string,
  itemCount: number
) {
  return createNotification({
    userId: vendorUserId,
    type: "new_order",
    title: "New Order Received",
    message: `You have received a new order #${orderNumber} with ${itemCount} item${itemCount > 1 ? "s" : ""}.`,
    orderId,
    metadata: { orderNumber, itemCount },
  });
}

/**
 * Notify customer when order status changes
 */
export async function notifyOrderStatusUpdate(
  userId: string,
  orderId: string,
  orderNumber: string,
  newStatus: string
) {
  const statusMessages: Record<string, { title: string; message: string; type: NotificationType }> = {
    payment_received: {
      title: "Payment Confirmed",
      message: `Your payment for order #${orderNumber} has been verified and confirmed.`,
      type: "payment_received",
    },
    payment_rejected: {
      title: "Payment Verification Failed",
      message: `Your payment for order #${orderNumber} could not be verified. Please check your payment details.`,
      type: "payment_rejected",
    },
    placed: {
      title: "Order Confirmed",
      message: `Your order #${orderNumber} has been confirmed and is being prepared.`,
      type: "order_confirmed",
    },
    shipped: {
      title: "Order Shipped",
      message: `Your order #${orderNumber} has been shipped and is on its way.`,
      type: "order_shipped",
    },
    delivered: {
      title: "Order Delivered",
      message: `Your order #${orderNumber} has been delivered. Thank you for shopping with us!`,
      type: "order_delivered",
    },
    cash_collected: {
      title: "Order Delivered",
      message: `Your order #${orderNumber} has been delivered and payment collected.`,
      type: "order_delivered",
    },
  };

  const statusInfo = statusMessages[newStatus];
  if (!statusInfo) {
    // For statuses we don't notify about, return null
    return null;
  }

  return createNotification({
    userId,
    type: statusInfo.type,
    title: statusInfo.title,
    message: statusInfo.message,
    orderId,
    metadata: { orderNumber, status: newStatus },
  });
}

/**
 * Notify vendor when application is approved
 */
export async function notifyVendorApproved(userId: string, vendorApplicationId: string, storeName: string) {
  return createNotification({
    userId,
    type: "vendor_approved",
    title: "Vendor Application Approved",
    message: `Congratulations! Your vendor application for "${storeName}" has been approved. You can now start selling on Ayojon.`,
    vendorApplicationId,
    metadata: { storeName },
  });
}

/**
 * Notify vendor when application is rejected
 */
export async function notifyVendorRejected(
  userId: string,
  vendorApplicationId: string,
  storeName: string,
  reason?: string
) {
  const message = reason
    ? `Your vendor application for "${storeName}" has been rejected. Reason: ${reason}`
    : `Your vendor application for "${storeName}" has been rejected. Please contact support for more information.`;

  return createNotification({
    userId,
    type: "vendor_rejected",
    title: "Vendor Application Rejected",
    message,
    vendorApplicationId,
    metadata: { storeName, reason },
  });
}

/**
 * Get user notifications with pagination
 */
export async function getUserNotifications(userId: string, limit = 20, offset = 0) {
  const userNotifications = await db.query.notifications.findMany({
    where: eq(notifications.userId, userId),
    orderBy: [desc(notifications.createdAt)],
    limit,
    offset,
  });

  return userNotifications;
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadCount(userId: string) {
  const unreadNotifications = await db.query.notifications.findMany({
    where: and(eq(notifications.userId, userId), eq(notifications.isRead, false)),
  });

  return unreadNotifications.length;
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId: string, userId: string) {
  const result = await db
    .update(notifications)
    .set({
      isRead: true,
      readAt: new Date(),
    })
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)))
    .returning();

  return result[0];
}

/**
 * Mark all user notifications as read
 */
export async function markAllAsRead(userId: string) {
  await db
    .update(notifications)
    .set({
      isRead: true,
      readAt: new Date(),
    })
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));

  return true;
}

/**
 * Delete notification
 */
export async function deleteNotification(notificationId: string, userId: string) {
  await db
    .delete(notifications)
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));

  return true;
}
