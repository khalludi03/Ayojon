import { db } from '@my-better-t-app/db'
import {
  orderItems,
  orders,
  platformSettings,
  vendorPayouts,
  vendors,
} from '@my-better-t-app/db/schema/index'
import { and, desc, eq, sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { logger } from '../lib/logger'
import { calculateVendorPayout } from '../utils/math'
import { OrderActions } from './order-state-machine'
import * as notificationService from './notification-service'
import type { PayoutStatus } from '@my-better-t-app/db/schema/index'

/**
 * Payout Service
 *
 * Handles vendor payout operations including:
 * - Creating payout records when orders are complete
 * - Admin processing of payouts
 * - Payout history tracking
 *
 * Payout Flow:
 * bKash: delivered → admin processes payout → vendor_paid
 * COD: cash_collected → settlement_ready → admin processes payout → vendor_settled
 *
 * Platform commission is deducted from order total before paying vendor.
 */

/**
 * Get platform commission rate from settings
 *
 * @returns Commission rate as percentage (0-100)
 */
async function getPlatformCommissionRate(): Promise<number> {
  const settings = await db.query.platformSettings.findFirst({
    where: eq(platformSettings.id, 'current'),
  })

  // Default to 10% if not configured
  return settings?.platformCommission ?? 10
}

/**
 * Create payout records for an order
 *
 * Called when order reaches a state where payout should be initiated:
 * - bKash: when order is delivered
 * - COD: when cash is collected
 *
 * Creates one payout record per vendor in the order.
 *
 * @param orderId - Order ID
 * @returns Array of created payout records
 */
export async function createPayoutForOrder(orderId: string): Promise<{
  success: boolean
  payouts?: Array<typeof vendorPayouts.$inferSelect>
  error?: string
}> {
  return await db.transaction(async (tx) => {
    // 1. Get order details
    const [order] = await tx
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1)

    if (!order) {
      return { success: false, error: 'Order not found' }
    }

    // 2. Check if payouts already exist
    const existingPayouts = await tx
      .select()
      .from(vendorPayouts)
      .where(eq(vendorPayouts.orderId, orderId))

    if (existingPayouts.length > 0) {
      return { success: false, error: 'Payouts already exist for this order' }
    }

    // 3. Get order items grouped by vendor
    const items = await tx
      .select({
        vendorId: orderItems.vendorId,
        totalAmount: sql<string>`sum(${orderItems.price} * ${orderItems.quantity})`,
      })
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId))
      .groupBy(orderItems.vendorId)

    if (items.length === 0) {
      return { success: false, error: 'No items found for order' }
    }

    // 4. Get commission rate
    const commissionRate = await getPlatformCommissionRate()

    // 5. Create payout record for each vendor
    const createdPayouts = []
    for (const item of items) {
      const vendorTotal = parseFloat(item.totalAmount)
      const { vendorAmount, commissionAmount } = calculateVendorPayout(
        vendorTotal,
        commissionRate,
      )

      const [payout] = await tx
        .insert(vendorPayouts)
        .values({
          id: nanoid(),
          orderId,
          vendorId: item.vendorId,
          amount: vendorAmount.toString(),
          platformCommission: commissionAmount.toString(),
          status: 'pending',
        })
        .returning()

      createdPayouts.push(payout!)
    }

    // 6. Update order status
    const newStatus =
      order.paymentMethod === 'bkash' ? 'delivered' : 'settlement_ready'
    await tx
      .update(orders)
      .set({
        status: newStatus,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId))

    return { success: true, payouts: createdPayouts }
  })
}

/**
 * Process payout to vendor (admin action)
 *
 * Admin manually sends payment to vendor and records it in the system.
 * Updates order to final status: vendor_paid (bKash) or vendor_settled (COD)
 *
 * @param payoutId - Payout ID
 * @param adminId - Admin user ID
 * @param paymentDetails - Payment method and reference
 * @param notes - Optional notes
 * @returns Updated payout record
 */
export async function processPayout(
  payoutId: string,
  adminId: string,
  paymentDetails: {
    paymentMethod: string // e.g., "bank_transfer", "bkash", "nagad"
    paymentReference: string // Transaction ID or reference
  },
  notes?: string,
): Promise<{
  success: boolean
  payout?: typeof vendorPayouts.$inferSelect
  error?: string
}> {
  const result = await db.transaction(async (tx) => {
    // 1. Get payout record
    const [payout] = await tx
      .select()
      .from(vendorPayouts)
      .where(eq(vendorPayouts.id, payoutId))
      .limit(1)

    if (!payout) {
      return { success: false, error: 'Payout not found' }
    }

    // 2. Verify payout is pending
    if (payout.status !== 'pending') {
      return {
        success: false,
        error: `Payout is already ${payout.status}`,
      }
    }

    // 3. Get order to check status
    const [order] = await tx
      .select()
      .from(orders)
      .where(eq(orders.id, payout.orderId))
      .limit(1)

    if (!order) {
      return { success: false, error: 'Order not found' }
    }

    // 4. Verify order is ready for payout
    if (!OrderActions.canProcessPayout(order.status, order.paymentMethod)) {
      return {
        success: false,
        error: `Cannot process payout for order in status: ${order.status}`,
      }
    }

    // 5. Update payout record
    const [updatedPayout] = await tx
      .update(vendorPayouts)
      .set({
        status: 'completed',
        paymentMethod: paymentDetails.paymentMethod,
        paymentReference: paymentDetails.paymentReference,
        processedBy: adminId,
        processedAt: new Date(),
        notes,
        updatedAt: new Date(),
      })
      .where(eq(vendorPayouts.id, payoutId))
      .returning()

    // 6. Check if all payouts for this order are completed
    const allPayouts = await tx
      .select()
      .from(vendorPayouts)
      .where(eq(vendorPayouts.orderId, payout.orderId))

    const allCompleted = allPayouts.every((p) => p.status === 'completed')

    // 7. If all payouts completed, update order to final status
    if (allCompleted) {
      const isPrepaid = order.paymentMethod === 'bkash'
      const finalStatus = isPrepaid ? 'vendor_paid' : 'vendor_settled'
      await tx
        .update(orders)
        .set({
          status: finalStatus,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, payout.orderId))
    }

    return { success: true, payout: updatedPayout!, orderId: order.id }
  })

  // Send notification after transaction commits successfully
  if (result.success && result.payout) {
    try {
      // Get vendor's userId
      const [vendor] = await db
        .select({ userId: vendors.userId })
        .from(vendors)
        .where(eq(vendors.id, result.payout.vendorId))
        .limit(1)

      if (vendor) {
        await notificationService.notifyPayoutProcessed(
          vendor.userId,
          result.payout.id,
          result.payout.amount,
          result.orderId,
        )
      }
    } catch (error) {
      // Log error but don't fail the payout
      logger.error({ err: error }, 'Failed to send payout notification')
    }
  }

  return result
}

/**
 * Mark payout as failed (admin action)
 *
 * @param payoutId - Payout ID
 * @param adminId - Admin user ID
 * @param reason - Failure reason
 * @returns Updated payout record
 */
export async function markPayoutFailed(
  payoutId: string,
  adminId: string,
  reason: string,
): Promise<{
  success: boolean
  payout?: typeof vendorPayouts.$inferSelect
  error?: string
}> {
  return await db.transaction(async (tx) => {
    const [updatedPayout] = await tx
      .update(vendorPayouts)
      .set({
        status: 'failed',
        failureReason: reason,
        processedBy: adminId,
        processedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(vendorPayouts.id, payoutId))
      .returning()

    if (!updatedPayout) {
      return { success: false, error: 'Payout not found' }
    }

    return { success: true, payout: updatedPayout }
  })
}

/**
 * Get pending payouts awaiting admin processing
 *
 * @param limit - Maximum number of payouts to return
 * @param offset - Pagination offset
 * @returns List of pending payouts with order and vendor details
 */
export async function getPendingPayouts(
  limit: number = 50,
  offset: number = 0,
) {
  const pendingPayouts = await db.query.vendorPayouts.findMany({
    where: eq(vendorPayouts.status, 'pending'),
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
      vendor: {
        columns: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
    orderBy: [desc(vendorPayouts.createdAt)],
    limit,
    offset,
  })

  return pendingPayouts
}

/**
 * Get payout history for a specific vendor
 *
 * @param vendorId - Vendor ID
 * @param statusFilter - Optional status filter
 * @param limit - Maximum number of payouts to return
 * @param offset - Pagination offset
 * @returns List of vendor's payouts
 */
export async function getVendorPayouts(
  vendorId: string,
  statusFilter?: PayoutStatus,
  limit: number = 50,
  offset: number = 0,
) {
  const conditions = statusFilter
    ? and(
        eq(vendorPayouts.vendorId, vendorId),
        eq(vendorPayouts.status, statusFilter),
      )
    : eq(vendorPayouts.vendorId, vendorId)

  const payouts = await db.query.vendorPayouts.findMany({
    where: conditions,
    with: {
      order: {
        columns: {
          id: true,
          orderNumber: true,
          total: true,
          createdAt: true,
        },
      },
      processor: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: [desc(vendorPayouts.createdAt)],
    limit,
    offset,
  })

  return payouts
}

/**
 * Get payout statistics for a vendor
 *
 * @param vendorId - Vendor ID
 * @returns Statistics about vendor's payouts
 */
export async function getVendorPayoutStats(vendorId: string) {
  const [stats] = await db
    .select({
      totalPending: sql<string>`sum(case when ${vendorPayouts.status} = 'pending' then ${vendorPayouts.amount} else 0 end)`,
      totalCompleted: sql<string>`sum(case when ${vendorPayouts.status} = 'completed' then ${vendorPayouts.amount} else 0 end)`,
      countPending:
        sql<number>`count(case when ${vendorPayouts.status} = 'pending' then 1 end)`.mapWith(
          Number,
        ),
      countCompleted:
        sql<number>`count(case when ${vendorPayouts.status} = 'completed' then 1 end)`.mapWith(
          Number,
        ),
    })
    .from(vendorPayouts)
    .where(eq(vendorPayouts.vendorId, vendorId))

  return {
    totalPending: parseFloat(stats?.totalPending ?? '0'),
    totalCompleted: parseFloat(stats?.totalCompleted ?? '0'),
    countPending: stats?.countPending ?? 0,
    countCompleted: stats?.countCompleted ?? 0,
  }
}

/**
 * Get payout details by ID
 *
 * @param payoutId - Payout ID
 * @returns Payout with full details
 */
export async function getPayoutDetails(payoutId: string) {
  const payout = await db.query.vendorPayouts.findFirst({
    where: eq(vendorPayouts.id, payoutId),
    with: {
      order: {
        with: {
          items: true,
          user: {
            columns: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      vendor: true,
      processor: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })

  return payout
}
