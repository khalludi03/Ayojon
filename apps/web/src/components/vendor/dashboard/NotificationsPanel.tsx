import {
  AlertTriangle,
  Bell,
  ChevronRight,
  RotateCcw,
  ShoppingCart,
} from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { orpc, orpcClient } from '@/utils/orpc'

interface Notification {
  id: string
  type: 'order' | 'return' | 'stock'
  title: string
  description: string
  time: string
  unread: boolean
}

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'order':
      return <ShoppingCart className="h-4 w-4" />
    case 'return':
      return <RotateCcw className="h-4 w-4" />
    case 'stock':
      return <AlertTriangle className="h-4 w-4" />
    default:
      return <Bell className="h-4 w-4" />
  }
}

const getNotificationStyles = (type: Notification['type']) => {
  switch (type) {
    case 'order':
      return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
    case 'return':
      return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
    case 'stock':
      return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
    default:
      return 'bg-slate-100 text-slate-600 dark:bg-slate-800/30 dark:text-slate-400'
  }
}

export function NotificationsPanel() {
  const queryClient = useQueryClient()
  const { data: notifications } = useQuery(
    orpc.vendor.getNotifications.queryOptions(),
  )

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return await orpcClient.vendor.markAllNotificationsAsRead({})
    },
    onSuccess: () => {
      // Immediately update the UI to show empty state
      queryClient.setQueryData(
        orpc.vendor.getNotifications.queryOptions().queryKey,
        [],
      )
      // Refetch notifications list
      queryClient.refetchQueries({
        queryKey: orpc.vendor.getNotifications.queryOptions().queryKey,
      })
      // Also refetch the unread count in the navbar bell
      queryClient.refetchQueries({
        queryKey: ['vendor', 'getNotificationsUnreadCount'],
      })
      toast.success('All notifications cleared')
    },
    onError: () => {
      toast.error('Failed to clear notifications')
    },
  })

  const mockNotifications = notifications || []
  const unreadCount = mockNotifications.filter((n) => n.unread).length

  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] flex flex-col shadow-sm overflow-hidden transition-all hover:shadow-md">
      <div className="p-4 sm:p-6 border-b border-[hsl(var(--border))] flex items-center justify-between bg-[hsl(var(--muted))]/30">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <h3 className="text-lg sm:text-xl font-bold text-[hsl(var(--foreground))] tracking-tight">
            Activity
          </h3>
          {unreadCount > 0 && (
            <span className="flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-[9px] sm:text-[10px] font-black text-white">
              {unreadCount}
            </span>
          )}
        </div>
        <button
          onClick={() => markAllAsReadMutation.mutate({})}
          disabled={
            markAllAsReadMutation.isPending || mockNotifications.length === 0
          }
          className="text-[10px] sm:text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest hover:text-[hsl(var(--primary))] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {markAllAsReadMutation.isPending ? 'Clearing...' : 'Clear'}
        </button>
      </div>

      <div className="flex-1 divide-y divide-[hsl(var(--border))]">
        {mockNotifications.length > 0 ? (
          mockNotifications.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                'group p-4 transition-all hover:bg-[hsl(var(--muted))]/50 cursor-pointer flex gap-4',
                notification.unread && 'bg-[hsl(var(--primary))]/5',
              )}
            >
              <div
                className={cn(
                  'shrink-0 h-10 w-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110',
                  getNotificationStyles(notification.type),
                )}
              >
                {getNotificationIcon(notification.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={cn(
                      'text-sm leading-none tracking-tight',
                      notification.unread
                        ? 'font-bold text-[hsl(var(--foreground))]'
                        : 'font-semibold text-[hsl(var(--muted-foreground))]',
                    )}
                  >
                    {notification.title}
                  </p>
                  <span className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] uppercase whitespace-nowrap">
                    {notification.time}
                  </span>
                </div>
                <p className="text-xs text-[hsl(var(--muted-foreground))] font-medium mt-1.5 line-clamp-1">
                  {notification.description}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center">
            <Bell className="h-10 w-10 text-[hsl(var(--muted-foreground))] opacity-20 mx-auto mb-2" />
            <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
              No new activity
            </p>
          </div>
        )}
      </div>

      <div className="p-4 bg-[hsl(var(--muted))]/10 border-t border-[hsl(var(--border))] text-center">
        <button className="text-xs font-black text-[hsl(var(--primary))] uppercase tracking-[0.2em] flex items-center justify-center w-full hover:gap-2 transition-all">
          View History <ChevronRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}
