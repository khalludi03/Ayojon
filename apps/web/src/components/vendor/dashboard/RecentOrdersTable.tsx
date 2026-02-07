import { Button } from '@/components/ui/button';
import { Eye, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  items: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
}

const mockOrders: Order[] = [
  { id: '1', orderNumber: 'AYJ12345678', customerName: 'John Doe', items: 3, total: 2500, status: 'pending', date: '2026-02-07' },
  { id: '2', orderNumber: 'AYJ12345679', customerName: 'Jane Smith', items: 1, total: 850, status: 'processing', date: '2026-02-07' },
  { id: '3', orderNumber: 'AYJ12345680', customerName: 'Bob Johnson', items: 2, total: 1200, status: 'shipped', date: '2026-02-06' },
  { id: '4', orderNumber: 'AYJ12345681', customerName: 'Alice Williams', items: 4, total: 3200, status: 'delivered', date: '2026-02-06' },
  { id: '5', orderNumber: 'AYJ12345682', customerName: 'Charlie Brown', items: 1, total: 450, status: 'pending', date: '2026-02-05' },
  { id: '6', orderNumber: 'AYJ12345683', customerName: 'Diana Prince', items: 2, total: 1800, status: 'processing', date: '2026-02-05' },
  { id: '7', orderNumber: 'AYJ12345684', customerName: 'Eve Adams', items: 3, total: 2100, status: 'shipped', date: '2026-02-04' },
  { id: '8', orderNumber: 'AYJ12345685', customerName: 'Frank Miller', items: 1, total: 950, status: 'delivered', date: '2026-02-04' },
  { id: '9', orderNumber: 'AYJ12345686', customerName: 'Grace Lee', items: 5, total: 4500, status: 'cancelled', date: '2026-02-03' },
  { id: '10', orderNumber: 'AYJ12345687', customerName: 'Henry Ford', items: 2, total: 1500, status: 'delivered', date: '2026-02-03' },
];

const getStatusColor = (status: Order['status']) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    case 'processing':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    case 'shipped':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
    case 'delivered':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    case 'cancelled':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  }
};

export function RecentOrdersTable() {
  const handleViewOrder = (orderId: string) => {
    console.log('View order:', orderId);
  };

  const handleFulfillOrder = (orderId: string) => {
    console.log('Fulfill order:', orderId);
  };

  return (
    <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">
            Recent Orders
          </h3>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Last 10 orders
          </p>
        </div>
        <Button variant="outline" size="sm">
          View All Orders
        </Button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[hsl(var(--border))]">
              <th className="pb-3 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                Order ID
              </th>
              <th className="pb-3 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                Customer
              </th>
              <th className="pb-3 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                Items
              </th>
              <th className="pb-3 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                Total
              </th>
              <th className="pb-3 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                Status
              </th>
              <th className="pb-3 text-right text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border))]">
            {mockOrders.map((order) => (
              <tr key={order.id} className="hover:bg-[hsl(var(--muted))]/50 transition-colors">
                <td className="py-4 text-sm font-medium text-[hsl(var(--foreground))]">
                  {order.orderNumber}
                </td>
                <td className="py-4 text-sm text-[hsl(var(--foreground))]">
                  {order.customerName}
                </td>
                <td className="py-4 text-sm text-[hsl(var(--muted-foreground))]">
                  {order.items} {order.items === 1 ? 'item' : 'items'}
                </td>
                <td className="py-4 text-sm font-medium text-[hsl(var(--foreground))]">
                  ৳{order.total.toLocaleString()}
                </td>
                <td className="py-4">
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2 py-1 text-xs font-semibold',
                      getStatusColor(order.status)
                    )}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </td>
                <td className="py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewOrder(order.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    {(order.status === 'pending' || order.status === 'processing') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFulfillOrder(order.id)}
                      >
                        <Package className="h-4 w-4 mr-1" />
                        Fulfill
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {mockOrders.map((order) => (
          <div
            key={order.id}
            className="rounded-lg border border-[hsl(var(--border))] p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">{order.orderNumber}</span>
              <span
                className={cn(
                  'inline-flex rounded-full px-2 py-1 text-xs font-semibold',
                  getStatusColor(order.status)
                )}
              >
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
            <div className="text-sm text-[hsl(var(--muted-foreground))]">
              <p>{order.customerName}</p>
              <p>{order.items} items • ৳{order.total.toLocaleString()}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleViewOrder(order.id)}
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              {(order.status === 'pending' || order.status === 'processing') && (
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => handleFulfillOrder(order.id)}
                >
                  <Package className="h-4 w-4 mr-1" />
                  Fulfill
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
