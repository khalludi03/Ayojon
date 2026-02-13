import {
  AlertCircle,
  Bell,
  CheckCircle,
  Package,
  ShoppingCart,
  Truck,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import { orpc } from '@/utils/orpc'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: Date
  orderId?: string | null
  vendorApplicationId?: string | null
}

interface NotificationItemProps {
  notification: Notification
}

const notificationIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  order_placed: ShoppingCart,
  order_confirmed: CheckCircle,
  order_shipped: Truck,
  order_delivered: Package,
  payment_received: CheckCircle,
  payment_rejected: AlertCircle,
  vendor_approved: CheckCircle,
  vendor_rejected: AlertCircle,
  new_order: ShoppingCart,
  order_status_updated: Bell,
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const queryClient = useQueryClient()

  const markAsReadMutation = useMutation({
    ...orpc.notifications.markAsRead.mutationOptions(),
    onSuccess: () => {
      // Invalidate both list and count queries
      queryClient.invalidateQueries({ queryKey: orpc.notifications.list.key() })
      queryClient.invalidateQueries({
        queryKey: orpc.notifications.unreadCount.key(),
      })
    },
  })

  const handleClick = () => {
    if (!notification.isRead) {
      markAsReadMutation.mutate({ notificationId: notification.id })
    }
  }

  const Icon = notificationIcons[notification.type] ?? Bell

  return (
    <div
      onClick={handleClick}
      className={cn(
        'flex cursor-pointer gap-3 p-4 transition-colors hover:bg-muted/50',
        !notification.isRead && 'bg-blue-50/50 dark:bg-blue-950/20',
      )}
    >
      {/* Icon */}
      <div className="flex-shrink-0">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full',
            notification.type.includes('rejected') ||
              notification.type.includes('payment_rejected')
              ? 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400'
              : 'bg-primary/10 text-primary',
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              'text-sm',
              notification.isRead ? 'font-medium' : 'font-semibold',
            )}
          >
            {notification.title}
          </p>
          {!notification.isRead && (
            <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
          )}
        </div>
        <p className="text-sm text-muted-foreground">{notification.message}</p>
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true,
          })}
        </p>
      </div>
    </div>
  )
}
