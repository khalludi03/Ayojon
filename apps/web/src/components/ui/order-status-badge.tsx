import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export type OrderStatus =
  | 'awaiting_payment'
  | 'payment_submitted'
  | 'payment_received'
  | 'placed'
  | 'confirmed'
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cash_collected'
  | 'settlement_ready'
  | 'vendor_paid'
  | 'vendor_settled'
  | 'cancelled'
  | 'returned'

interface OrderStatusBadgeProps {
  status: OrderStatus | string
  className?: string
}

const statusConfig: Record<string, { label: string; className: string }> = {
  awaiting_payment: {
    label: 'Awaiting Payment',
    className:
      'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
  },
  payment_submitted: {
    label: 'Payment Submitted',
    className:
      'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
  },
  payment_received: {
    label: 'Payment Received',
    className:
      'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800',
  },
  placed: {
    label: 'Placed',
    className:
      'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-800',
  },
  confirmed: {
    label: 'Confirmed',
    className:
      'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800',
  },
  pending: {
    label: 'Pending',
    className:
      'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
  },
  processing: {
    label: 'Processing',
    className:
      'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
  },
  shipped: {
    label: 'Shipped',
    className:
      'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
  },
  delivered: {
    label: 'Delivered',
    className:
      'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
  },
  cash_collected: {
    label: 'Cash Collected',
    className:
      'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
  },
  settlement_ready: {
    label: 'Settlement Ready',
    className:
      'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400 dark:border-cyan-800',
  },
  vendor_paid: {
    label: 'Vendor Paid',
    className:
      'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
  },
  vendor_settled: {
    label: 'Vendor Settled',
    className:
      'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
  },
  cancelled: {
    label: 'Cancelled',
    className:
      'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  },
  returned: {
    label: 'Returned',
    className:
      'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
  },
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const config = statusConfig[status.toLowerCase()] ?? {
    label: status,
    className:
      'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-semibold uppercase tracking-wider px-2.5 py-0.5',
        config.className,
        className,
      )}
    >
      {config.label}
    </Badge>
  )
}
