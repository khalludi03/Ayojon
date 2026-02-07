import { Bell, ShoppingCart, RotateCcw, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'order' | 'return' | 'stock';
  title: string;
  description: string;
  time: string;
  unread: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'order',
    title: 'New Order Received',
    description: 'Order #AYJ12345678 for ৳2,500',
    time: '5 minutes ago',
    unread: true,
  },
  {
    id: '2',
    type: 'order',
    title: 'New Order Received',
    description: 'Order #AYJ12345679 for ৳850',
    time: '1 hour ago',
    unread: true,
  },
  {
    id: '3',
    type: 'return',
    title: 'Return Request',
    description: 'Customer requested return for Order #AYJ12345655',
    time: '2 hours ago',
    unread: true,
  },
  {
    id: '4',
    type: 'stock',
    title: 'Low Stock Alert',
    description: 'Product "Wireless Headphones" has only 3 items left',
    time: '3 hours ago',
    unread: false,
  },
  {
    id: '5',
    type: 'stock',
    title: 'Low Stock Alert',
    description: 'Product "Smart Watch" has only 2 items left',
    time: '5 hours ago',
    unread: false,
  },
];

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'order':
      return <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
    case 'return':
      return <RotateCcw className="h-5 w-5 text-orange-600 dark:text-orange-400" />;
    case 'stock':
      return <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />;
    default:
      return <Bell className="h-5 w-5" />;
  }
};

const getNotificationColor = (type: Notification['type']) => {
  switch (type) {
    case 'order':
      return 'bg-blue-50 dark:bg-blue-950/20';
    case 'return':
      return 'bg-orange-50 dark:bg-orange-950/20';
    case 'stock':
      return 'bg-red-50 dark:bg-red-950/20';
    default:
      return 'bg-gray-50 dark:bg-gray-950/20';
  }
};

export function NotificationsPanel() {
  const unreadCount = mockNotifications.filter((n) => n.unread).length;

  return (
    <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm h-full">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-xs font-semibold text-white">
              {unreadCount}
            </span>
          )}
        </div>
        <button className="text-sm text-[hsl(var(--primary))] hover:underline">
          View All
        </button>
      </div>

      <div className="space-y-3">
        {mockNotifications.map((notification) => (
          <div
            key={notification.id}
            className={cn(
              'rounded-lg p-3 transition-colors hover:bg-[hsl(var(--muted))]/50 cursor-pointer',
              notification.unread && 'border-l-2 border-[hsl(var(--primary))]',
              getNotificationColor(notification.type)
            )}
          >
            <div className="flex gap-3">
              <div className="shrink-0 mt-0.5">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  'text-sm text-[hsl(var(--foreground))]',
                  notification.unread && 'font-semibold'
                )}>
                  {notification.title}
                </p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                  {notification.description}
                </p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                  {notification.time}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
