import { db } from '@my-better-t-app/db'
import {
  orderItems,
  orders,
  products,
  vendors,
} from '@my-better-t-app/db/schema/index'
import { and, avg, countDistinct, eq, inArray, sql } from 'drizzle-orm'
import { COMPLETED_ORDER_STATUSES } from '../utils/constants'
import { logger } from '../lib/logger'

/**
 * Calculates and updates the Vendor Score based on the formula:
 * Vendor Score = (Avg Product Rating × 65%) + (Order Completion Rate × 35%)
 *
 * Order Completion Rate = (Successful Orders / Total Orders)
 * Successful Orders = Statuses like delivered, vendor_paid, cash_collected, etc.
 * Total Orders = All orders excluding those that were cancelled for reasons
 * outside vendor control? No, usually all orders assigned to vendor.
 */
export async function updateVendorScore(vendorId: string, tx: any = db) {
  try {
    // 1. Get Avg Product Rating
    // We average the 'ratingAverage' of all active products belonging to the vendor
    const productStats = await tx
      .select({
        avgRating: avg(products.ratingAverage),
        totalRatings: sql<number>`sum(${products.ratingCount})`,
      })
      .from(products)
      .where(
        and(eq(products.vendorId, vendorId), eq(products.status, 'active')),
      )

    const avgProductRating = Number(productStats[0]?.avgRating) || 0
    const ratingCount = Number(productStats[0]?.totalRatings) || 0

    // 2. Get Order Completion Rate
    // We need to look at unique orders for this vendor via orderItems

    // Total orders assigned to this vendor (excluding those still awaiting payment if we want to be fair)
    // Actually, usually all orders count.
    const totalOrdersResult = await tx
      .select({
        count: countDistinct(orderItems.orderId),
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(
        and(
          eq(orderItems.vendorId, vendorId),
          // We exclude 'cancelled' orders from total orders?
          // No, usually they count against the rate if they were cancelled after placement.
          // But if we want 'Completion Rate' we need denominator to be all legitimate orders.
        ),
      )

    const totalOrders = Number(totalOrdersResult[0]?.count) || 0

    if (totalOrders === 0) {
      // If no orders, score is just based on product ratings (normalized to 0-1)
      const normalizedRating = avgProductRating / 5
      const score = normalizedRating * 0.65
      await tx
        .update(vendors)
        .set({
          ratingAverage: avgProductRating,
          ratingCount: ratingCount,
          score: score,
          updatedAt: new Date(),
        })
        .where(eq(vendors.id, vendorId))
      return
    }

    const completedOrdersResult = await tx
      .select({
        count: countDistinct(orderItems.orderId),
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(
        and(
          eq(orderItems.vendorId, vendorId),
          inArray(orders.status, [...COMPLETED_ORDER_STATUSES]),
        ),
      )

    const completedOrders = Number(completedOrdersResult[0]?.count) || 0
    const completionRate = completedOrders / totalOrders

    // 3. Calculate Final Score
    // Normalize Avg Product Rating to 0-1 scale (it's 1-5)
    const normalizedRating = avgProductRating / 5

    // Score formula: (Avg Rating % * 65%) + (Completion Rate * 35%)
    // The result will be between 0 and 1.
    const score = normalizedRating * 0.65 + completionRate * 0.35

    // 4. Update Vendor
    await tx
      .update(vendors)
      .set({
        ratingAverage: avgProductRating,
        ratingCount: ratingCount,
        score: score,
        updatedAt: new Date(),
      })
      .where(eq(vendors.id, vendorId))

    logger.info(
      `[updateVendorScore] Updated vendor ${vendorId}: AvgRating=${avgProductRating}, CompletionRate=${completionRate.toFixed(2)}, Score=${score.toFixed(2)}`,
    )
  } catch (error) {
    logger.error(
      { err: error },
      `[updateVendorScore] Error for vendor ${vendorId}`,
    )
  }
}
