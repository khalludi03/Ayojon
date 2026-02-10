import { db } from "@my-better-t-app/db";
import { orders, payments, type PaymentStatus } from "@my-better-t-app/db/schema/orders";
import { eq, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { transitionOrderStatus } from "./order-service";
import { OrderActions } from "./order-state-machine";

/**
 * Payment Service
 *
 * Handles payment operations including:
 * - Customer payment submission (bKash transaction ID)
 * - Admin payment verification
 * - Payment status tracking
 *
 * Payment Flow:
 * 1. Customer places order → awaiting_payment status
 * 2. Customer submits bKash transaction ID → payment_submitted status
 * 3. Admin verifies payment → payment_received status → order can be fulfilled
 * 4. If admin rejects → back to awaiting_payment status
 */

/**
 * Submit payment proof (customer action for bKash orders)
 *
 * Customer provides bKash transaction ID after making payment.
 * This moves order from awaiting_payment → payment_submitted
 *
 * @param data - Payment proof details
 * @returns Updated payment record
 */
export async function submitPaymentProof(data: {
  orderId: string;
  transactionId: string;
  senderMobile: string;
  amount: number;
  userId: string;
}): Promise<{ success: boolean; payment?: typeof payments.$inferSelect; error?: string }> {
  const { orderId, transactionId, senderMobile, amount, userId } = data;

  return await db.transaction(async (tx) => {
    // 1. Get order and verify ownership
    const [order] = await tx
      .select()
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
      .limit(1);

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    // 2. Verify order is in correct state for payment submission
    if (!OrderActions.canSubmitPayment(order.status, order.paymentMethod)) {
      return {
        success: false,
        error: `Cannot submit payment for order in status: ${order.status}`,
      };
    }

    // 3. Get payment record
    const [existingPayment] = await tx
      .select()
      .from(payments)
      .where(eq(payments.orderId, orderId))
      .limit(1);

    if (!existingPayment) {
      return { success: false, error: "Payment record not found" };
    }

    // 4. Update payment with transaction ID and mobile
    const [updatedPayment] = await tx
      .update(payments)
      .set({
        transactionId,
        senderMobile,
        amount: amount.toString(),
        status: "submitted",
        updatedAt: new Date(),
      })
      .where(eq(payments.id, existingPayment.id))
      .returning();

    // 5. Update order status
    await tx
      .update(orders)
      .set({
        status: "payment_submitted",
        paymentTransactionId: transactionId,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    return { success: true, payment: updatedPayment! };
  });
}

/**
 * Verify payment (admin action)
 *
 * Admin manually verifies the bKash transaction and approves payment.
 * This moves order from payment_submitted → payment_received
 *
 * @param orderId - Order ID
 * @param adminId - Admin user ID
 * @param notes - Optional verification notes
 * @returns Updated payment record
 */
export async function verifyPayment(
  orderId: string,
  adminId: string,
  notes?: string
): Promise<{ success: boolean; payment?: typeof payments.$inferSelect; error?: string }> {
  return await db.transaction(async (tx) => {
    // 1. Get order
    const [order] = await tx
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    // 2. Verify order is in correct state
    if (!OrderActions.canVerifyPayment(order.status, order.paymentMethod)) {
      return {
        success: false,
        error: `Cannot verify payment for order in status: ${order.status}`,
      };
    }

    // 3. Get payment record
    const [existingPayment] = await tx
      .select()
      .from(payments)
      .where(eq(payments.orderId, orderId))
      .limit(1);

    if (!existingPayment) {
      return { success: false, error: "Payment record not found" };
    }

    // 4. Update payment status
    const [updatedPayment] = await tx
      .update(payments)
      .set({
        status: "verified",
        verifiedBy: adminId,
        verifiedAt: new Date(),
        notes,
        updatedAt: new Date(),
      })
      .where(eq(payments.id, existingPayment.id))
      .returning();

    // 5. Update order status to payment_received
    await tx
      .update(orders)
      .set({
        status: "payment_received",
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    return { success: true, payment: updatedPayment! };
  });
}

/**
 * Reject payment (admin action)
 *
 * Admin rejects the payment if transaction is invalid.
 * This moves order back from payment_submitted → awaiting_payment
 *
 * @param orderId - Order ID
 * @param adminId - Admin user ID
 * @param reason - Rejection reason
 * @returns Updated payment record
 */
export async function rejectPayment(
  orderId: string,
  adminId: string,
  reason: string
): Promise<{ success: boolean; payment?: typeof payments.$inferSelect; error?: string }> {
  return await db.transaction(async (tx) => {
    // 1. Get order
    const [order] = await tx
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    // 2. Verify order is in correct state
    if (!OrderActions.canVerifyPayment(order.status, order.paymentMethod)) {
      return {
        success: false,
        error: `Cannot reject payment for order in status: ${order.status}`,
      };
    }

    // 3. Get payment record
    const [existingPayment] = await tx
      .select()
      .from(payments)
      .where(eq(payments.orderId, orderId))
      .limit(1);

    if (!existingPayment) {
      return { success: false, error: "Payment record not found" };
    }

    // 4. Update payment status
    const [updatedPayment] = await tx
      .update(payments)
      .set({
        status: "rejected",
        verifiedBy: adminId,
        verifiedAt: new Date(),
        rejectionReason: reason,
        updatedAt: new Date(),
      })
      .where(eq(payments.id, existingPayment.id))
      .returning();

    // 5. Update order status back to payment_rejected
    await tx
      .update(orders)
      .set({
        status: "payment_rejected",
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    return { success: true, payment: updatedPayment! };
  });
}

/**
 * Get pending payments awaiting admin verification
 *
 * @param limit - Maximum number of payments to return
 * @param offset - Pagination offset
 * @returns List of payments with order details
 */
export async function getPendingPayments(limit: number = 50, offset: number = 0) {
  const pendingPayments = await db.query.payments.findMany({
    where: eq(payments.status, "submitted"),
    with: {
      order: {
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: [desc(payments.createdAt)],
    limit,
    offset,
  });

  return pendingPayments;
}

/**
 * Get payment details for an order
 *
 * @param orderId - Order ID
 * @returns Payment record with details
 */
export async function getOrderPayment(orderId: string) {
  const payment = await db.query.payments.findFirst({
    where: eq(payments.orderId, orderId),
    with: {
      verifier: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return payment;
}

/**
 * Record COD cash collection
 *
 * When delivery person collects cash, this records it and updates order status.
 * This moves order from shipped → cash_collected
 *
 * @param orderId - Order ID
 * @param collectionProof - Optional proof URL (photo of collected cash)
 * @param notes - Optional notes
 * @returns Updated payment record
 */
export async function recordCashCollection(
  orderId: string,
  collectionProof?: string,
  notes?: string
): Promise<{ success: boolean; payment?: typeof payments.$inferSelect; error?: string }> {
  return await db.transaction(async (tx) => {
    // 1. Get order
    const [order] = await tx
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    // 2. Verify it's a COD order
    if (order.paymentMethod !== "cod") {
      return {
        success: false,
        error: "This is not a COD order",
      };
    }

    // 3. Verify order is shipped
    if (!OrderActions.canMarkCashCollected(order.status, order.paymentMethod)) {
      return {
        success: false,
        error: `Cannot record cash collection for order in status: ${order.status}`,
      };
    }

    // 4. Get payment record
    const [existingPayment] = await tx
      .select()
      .from(payments)
      .where(eq(payments.orderId, orderId))
      .limit(1);

    if (!existingPayment) {
      return { success: false, error: "Payment record not found" };
    }

    // 5. Update payment record
    const [updatedPayment] = await tx
      .update(payments)
      .set({
        status: "verified",
        collectionProof,
        notes,
        updatedAt: new Date(),
      })
      .where(eq(payments.id, existingPayment.id))
      .returning();

    // 6. Update order status to cash_collected
    await tx
      .update(orders)
      .set({
        status: "cash_collected",
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    return { success: true, payment: updatedPayment! };
  });
}
