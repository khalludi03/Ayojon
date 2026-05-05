import { useMutation, useQueryClient } from '@tanstack/react-query'
import { NotificationList } from './NotificationList'
import { Button } from '@/components/ui/button'
import { orpc } from '@/utils/orpc'

export function NotificationDropdown() {
  const queryClient = useQueryClient()

  const markAllReadMutation = useMutation({
    ...orpc.notifications.markAllRead.mutationOptions(),
    onSuccess: () => {
      // Invalidate both list and count queries
      queryClient.invalidateQueries({ queryKey: orpc.notifications.list.key() })
      queryClient.invalidateQueries({
        queryKey: orpc.notifications.unreadCount.key(),
      })
    },
  })

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate({})
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="font-semibold">Notifications</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleMarkAllRead}
          disabled={markAllReadMutation.isPending}
          className="h-8 text-xs"
        >
          Mark all read
        </Button>
      </div>

      {/* Body */}
      <div className="max-h-[400px] overflow-y-auto">
        <NotificationList />
      </div>
    </div>
  )
}
