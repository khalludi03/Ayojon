import type { OrderStatus, PaymentMethod } from "@my-better-t-app/db/schema/orders";

/**
 * Order State Machine
 *
 * This module defines and validates state transitions for orders based on payment method.
 *
 * Two distinct flows:
 *
 * 1. bKash Prepaid Flow:
 *    awaiting_payment → payment_submitted → payment_received → shipped → delivered → vendor_paid
 *    - Customer pays first, then order is fulfilled
 *    - Admin verifies payment before shipping
 *    - Vendor gets paid after delivery confirmation
 *
 * 2. Cash on Delivery (COD) Flow:
 *    placed → shipped → cash_collected → settlement_ready → vendor_settled
 *    - Order placed without payment
 *    - Payment collected on delivery
 *    - Vendor gets paid after cash collection
 *
 * Both flows can transition to 'cancelled' at any point before delivery.
 */

/**
 * Valid state transitions for prepaid orders (bKash)
 */
const PREPAID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  // Initial state for prepaid orders
  awaiting_payment: ["payment_submitted", "cancelled"],

  // Customer submitted transaction ID, waiting for admin verification
  payment_submitted: ["payment_received", "payment_rejected", "awaiting_payment", "cancelled"],

  // Payment verified by admin, ready for vendor to ship
  payment_received: ["shipped", "cancelled"],

  // Payment rejected by admin
  payment_rejected: ["payment_submitted", "cancelled"],

  // Vendor marked as shipped
  shipped: ["delivered", "cancelled"],

  // Order delivered to customer
  delivered: ["vendor_paid"],

  // Final state: vendor has been paid
  vendor_paid: [],

  // Terminal states and states not used in prepaid flow
  placed: [],
  cash_collected: [],
  settlement_ready: [],
  vendor_settled: [],
  cancelled: [],
};

/**
 * Valid state transitions for COD orders
 */
const COD_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  // Initial state for COD orders
  placed: ["shipped", "cancelled"],

  // Vendor marked as shipped
  shipped: ["cash_collected", "cancelled"],

  // Delivery person collected cash from customer
  cash_collected: ["settlement_ready"],

  // Ready for admin to pay vendor
  settlement_ready: ["vendor_settled"],

  // Final state: vendor has been paid
  vendor_settled: [],

  // Terminal states and states not used in COD flow
  awaiting_payment: [],
  payment_submitted: [],
  payment_received: [],
  payment_rejected: [],
  delivered: [],
  vendor_paid: [],
  cancelled: [],
};

/**
 * Get valid transitions for an order based on payment method
 */
function getValidTransitions(
  currentStatus: OrderStatus,
  paymentMethod: PaymentMethod
): OrderStatus[] {
  const transitions = (paymentMethod === "bkash") 
    ? PREPAID_TRANSITIONS 
    : COD_TRANSITIONS;
  return transitions[currentStatus] || [];
}

/**
 * Validate if a status transition is allowed
 *
 * @param currentStatus - Current order status
 * @param newStatus - Desired new status
 * @param paymentMethod - Payment method (bkash or cod)
 * @returns Object with valid flag and error message if invalid
 */
export function validateStatusTransition(
  currentStatus: OrderStatus,
  newStatus: OrderStatus,
  paymentMethod: PaymentMethod
): { valid: boolean; error?: string } {
  // Same status is always valid (idempotent)
  if (currentStatus === newStatus) {
    return { valid: true };
  }

  const validTransitions = getValidTransitions(currentStatus, paymentMethod);

  if (!validTransitions.includes(newStatus)) {
    return {
      valid: false,
      error: `Invalid status transition: Cannot move from "${currentStatus}" to "${newStatus}" for ${paymentMethod} orders. Valid transitions: ${validTransitions.join(", ") || "none"}`,
    };
  }

  return { valid: true };
}

/**
 * Get the initial status for a new order based on payment method
 *
 * @param paymentMethod - Payment method (bkash or cod)
 * @returns Initial order status
 */
export function getInitialOrderStatus(paymentMethod: PaymentMethod): OrderStatus {
  return (paymentMethod === "bkash") 
    ? "awaiting_payment" 
    : "placed";
}

/**
 * Check if an order status is terminal (no more transitions allowed)
 *
 * @param status - Order status to check
 * @param paymentMethod - Payment method (bkash or cod)
 * @returns True if status is terminal
 */
export function isTerminalStatus(
  status: OrderStatus,
  paymentMethod: PaymentMethod
): boolean {
  const validTransitions = getValidTransitions(status, paymentMethod);
  return validTransitions.length === 0;
}

/**
 * Get all possible next statuses for an order
 *
 * @param currentStatus - Current order status
 * @param paymentMethod - Payment method (bkash or cod)
 * @returns Array of possible next statuses
 */
export function getNextStatuses(
  currentStatus: OrderStatus,
  paymentMethod: PaymentMethod
): OrderStatus[] {
  return getValidTransitions(currentStatus, paymentMethod);
}

/**
 * Check if a specific action is allowed for the current order status
 */
export const OrderActions = {
  /**
   * Can customer submit payment proof? (bKash only)
   */
  canSubmitPayment: (status: OrderStatus, paymentMethod: PaymentMethod): boolean => {
    return (paymentMethod === "bkash") && 
      (status === "awaiting_payment" || status === "payment_rejected");
  },

  /**
   * Can admin verify payment? (bKash only)
   */
  canVerifyPayment: (status: OrderStatus, paymentMethod: PaymentMethod): boolean => {
    return (paymentMethod === "bkash") && status === "payment_submitted";
  },

  /**
   * Can vendor mark as shipped?
   */
  canMarkShipped: (status: OrderStatus, paymentMethod: PaymentMethod): boolean => {
    if (paymentMethod === "bkash") {
      return status === "payment_received";
    }
    return status === "placed";
  },

  /**
   * Can mark as delivered? (bKash only)
   */
  canMarkDelivered: (status: OrderStatus, paymentMethod: PaymentMethod): boolean => {
    return (paymentMethod === "bkash") && status === "shipped";
  },

  /**
   * Can mark cash collected? (COD only)
   */
  canMarkCashCollected: (status: OrderStatus, paymentMethod: PaymentMethod): boolean => {
    return paymentMethod === "cod" && status === "shipped";
  },

  /**
   * Can admin process vendor payout?
   */
  canProcessPayout: (status: OrderStatus, paymentMethod: PaymentMethod): boolean => {
    if (paymentMethod === "bkash") {
      return status === "delivered";
    }
    return status === "settlement_ready";
  },

  /**
   * Can order be cancelled?
   */
  canCancel: (status: OrderStatus, paymentMethod: PaymentMethod): boolean => {
    // Cannot cancel if already in final states
    const finalStates: OrderStatus[] = ["vendor_paid", "vendor_settled", "cancelled"];
    if (finalStates.includes(status)) {
      return false;
    }
    // For bKash, can't cancel after delivery
    if ((paymentMethod === "bkash") && status === "delivered") {
      return false;
    }
    // For COD, can't cancel after cash collection
    if (paymentMethod === "cod" && (status === "cash_collected" || status === "settlement_ready")) {
      return false;
    }
    return true;
  },
};