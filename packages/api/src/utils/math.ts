/**
 * Calculate vendor payout amount after platform commission
 *
 * @param orderTotal - Total order amount
 * @param commissionRate - Platform commission rate (0-100)
 * @returns Object with vendorAmount and commissionAmount
 */
export function calculateVendorPayout(
  orderTotal: number,
  commissionRate: number,
): { vendorAmount: number; commissionAmount: number } {
  // Ensure commission rate is between 0 and 100
  const validRate = Math.max(0, Math.min(100, commissionRate))

  const commissionAmount = (orderTotal * validRate) / 100
  const vendorAmount = orderTotal - commissionAmount

  return {
    vendorAmount: Number(vendorAmount.toFixed(2)),
    commissionAmount: Number(commissionAmount.toFixed(2)),
  }
}
