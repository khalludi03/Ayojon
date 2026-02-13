import type {
  OrderStatus,
  PaymentMethod,
} from '@my-better-t-app/db/schema/orders'

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
const PREPAID_TRANSITIONS: Record<OrderStatus, Array<OrderStatus>> = {
  awaiting_payment: ['payment_submitted', 'cancelled'],
  payment_submitted: [
    'payment_received',
    'payment_rejected',
    'awaiting_payment',
    'cancelled',
  ],
  payment_received: ['shipped', 'cancelled'],
  payment_rejected: ['payment_submitted', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: ['vendor_paid'],
  vendor_paid: [],
  placed: [],
  confirmed: [],
  cash_collected: [],
  settlement_ready: [],
  vendor_settled: [],
  cancelled: [],
}

const COD_TRANSITIONS: Record<OrderStatus, Array<OrderStatus>> = {
  placed: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: ['settlement_ready'],
  settlement_ready: ['vendor_settled'],
  vendor_settled: [],
  awaiting_payment: [],
  payment_submitted: [],
  payment_received: [],
  payment_rejected: [],
  cash_collected: [],
  vendor_paid: [],
  cancelled: [],
}

/**
 * Get valid transitions for an order based on payment method
 */
function getValidTransitions(
  currentStatus: OrderStatus,
  paymentMethod: PaymentMethod,
): Array<OrderStatus> {
  const transitions =
    paymentMethod === 'bkash' ? PREPAID_TRANSITIONS : COD_TRANSITIONS
  return transitions[currentStatus]
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
  paymentMethod: PaymentMethod,
): { valid: boolean; error?: string } {
  // Same status is always valid (idempotent)
  if (currentStatus === newStatus) {
    return { valid: true }
  }

  const validTransitions = getValidTransitions(currentStatus, paymentMethod)

  if (!validTransitions.includes(newStatus)) {
    return {
      valid: false,
      error: `Invalid status transition: Cannot move from "${currentStatus}" to "${newStatus}" for ${paymentMethod} orders. Valid transitions: ${validTransitions.join(', ') || 'none'}`,
    }
  }

  return { valid: true }
}

/**
 * Get the initial status for a new order based on payment method
 *
 * @param paymentMethod - Payment method (bkash or cod)
 * @returns Initial order status
 */
export function getInitialOrderStatus(
  paymentMethod: PaymentMethod,
): OrderStatus {
  return paymentMethod === 'bkash' ? 'awaiting_payment' : 'placed'
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
  paymentMethod: PaymentMethod,
): boolean {
  const validTransitions = getValidTransitions(status, paymentMethod)
  return validTransitions.length === 0
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
  paymentMethod: PaymentMethod,
): Array<OrderStatus> {
  return getValidTransitions(currentStatus, paymentMethod)
}

/**
 * Check if a specific action is allowed for the current order status
 */
export const OrderActions = {
  /**
   * Can customer submit payment proof? (bKash only)
   */
  canSubmitPayment: (
    status: OrderStatus,
    paymentMethod: PaymentMethod,
  ): boolean => {
    return (
      paymentMethod === 'bkash' &&
      (status === 'awaiting_payment' || status === 'payment_rejected')
    )
  },

  /**
   * Can admin verify payment? (bKash only)
   */
  canVerifyPayment: (
    status: OrderStatus,
    paymentMethod: PaymentMethod,
  ): boolean => {
    return paymentMethod === 'bkash' && status === 'payment_submitted'
  },

  /**
   * Can vendor/admin confirm order? (COD only)
   */
  canConfirmOrder: (
    status: OrderStatus,
    paymentMethod: PaymentMethod,
  ): boolean => {
    return paymentMethod === 'cod' && status === 'placed'
  },

  /**
   * Can vendor mark as shipped?
   */
  canMarkShipped: (
    status: OrderStatus,
    paymentMethod: PaymentMethod,
  ): boolean => {
    if (paymentMethod === 'bkash') {
      return status === 'payment_received'
    }
    return status === 'confirmed'
  },

  /**
   * Can mark as delivered?
   */
  canMarkDelivered: (status: OrderStatus): boolean => {
    return status === 'shipped'
  },

  /**
   * Can admin process vendor payout?
   */
  canProcessPayout: (
    status: OrderStatus,
    paymentMethod: PaymentMethod,
  ): boolean => {
    if (paymentMethod === 'bkash') {
      return status === 'delivered'
    }
    return status === 'settlement_ready'
  },

  /**
   * Can order be cancelled?
   */
  canCancel: (status: OrderStatus, paymentMethod: PaymentMethod): boolean => {
    // Cannot cancel if already in final states
    const finalStates: Array<OrderStatus> = [
      'vendor_paid',
      'vendor_settled',
      'cancelled',
    ]
    if (finalStates.includes(status)) {
      return false
    }
    // For bKash, can't cancel after delivery
    if (paymentMethod === 'bkash' && status === 'delivered') {
      return false
    }
    // For COD, can't cancel after delivery
    if (
      paymentMethod === 'cod' &&
      (status === 'delivered' || status === 'settlement_ready')
    ) {
      return false
    }
    return true
  },
}
