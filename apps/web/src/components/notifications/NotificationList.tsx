import { useQuery } from '@tanstack/react-query'
import { Bell, Loader2 } from 'lucide-react'
import { NotificationItem } from './NotificationItem'
import { orpc } from '@/utils/orpc'
import { authClient } from '@/lib/auth-client'

export function NotificationList() {
  const { data: session } = authClient.useSession()
  const isAuthenticated = !!session?.user

  const { data: notifications = [], isLoading } = useQuery({
    ...orpc.notifications.list.queryOptions({
      input: { limit: 20, offset: 0 },
    }),
    enabled: isAuthenticated,
  })

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Bell className="mb-2 h-12 w-12 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">No notifications yet</p>
      </div>
    )
  }

  return (
    <div className="divide-y">
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </div>
  )
}
