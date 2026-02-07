import { ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VendorOrder, VendorOrderStatus } from '@/types/vendor-order';

interface OrdersTableProps {
  orders: VendorOrder[];
  onOrderClick: (order: VendorOrder) => void;
}

const getStatusColor = (status: VendorOrderStatus) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    case 'confirmed':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    case 'shipped':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
    case 'delivered':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    case 'cancelled':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    case 'returned':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  }
};

const getStatusLabel = (status: VendorOrderStatus) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const getPaymentMethodLabel = (method: string) => {
  const labels: Record<string, string> = {
    bkash: 'bKash',
    card: 'Card',
    cod: 'Cash on Delivery',
    bank: 'Bank Transfer',
  };
  return labels[method] || method;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export function OrdersTable({ orders, onOrderClick }: OrdersTableProps) {
  if (orders.length === 0) {
    return (
      <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-12 text-center">
        <ShoppingBag className="h-12 w-12 mx-auto text-[hsl(var(--muted-foreground))] mb-4" />
        <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-2">No orders found</h3>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50">
              <th className="p-3 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                Order ID
              </th>
              <th className="p-3 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                Customer
              </th>
              <th className="p-3 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                Items
              </th>
              <th className="p-3 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                Total
              </th>
              <th className="p-3 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                Payment
              </th>
              <th className="p-3 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                Order Date
              </th>
              <th className="p-3 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                Status
              </th>
              <th className="p-3 text-right text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border))]">
            {orders.map((order) => (
              <tr
                key={order.id}
                className="hover:bg-[hsl(var(--muted))]/30 transition-colors cursor-pointer"
                onClick={() => onOrderClick(order)}
              >
                <td className="p-3 text-sm font-medium text-[hsl(var(--foreground))]">
                  {order.orderNumber}
                </td>
                <td className="p-3">
                  <div>
                    <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                      {order.customer.name}
                    </p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      {order.customer.phone}
                    </p>
                  </div>
                </td>
                <td className="p-3 text-sm text-[hsl(var(--muted-foreground))]">
                  {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                </td>
                <td className="p-3 text-sm font-medium text-[hsl(var(--foreground))]">
                  ৳{order.total.toLocaleString()}
                </td>
                <td className="p-3">
                  <div>
                    <p className="text-sm text-[hsl(var(--foreground))]">
                      {getPaymentMethodLabel(order.payment.method)}
                    </p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      {order.payment.status === 'paid' ? 'Paid' : order.payment.status === 'pending' ? 'Pending' : 'Failed'}
                    </p>
                  </div>
                </td>
                <td className="p-3 text-sm text-[hsl(var(--muted-foreground))]">
                  {formatDate(order.createdAt)}
                </td>
                <td className="p-3">
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2 py-1 text-xs font-semibold',
                      getStatusColor(order.status)
                    )}
                  >
                    {getStatusLabel(order.status)}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOrderClick(order);
                    }}
                    className="text-sm text-[hsl(var(--primary))] hover:underline"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden divide-y divide-[hsl(var(--border))]">
        {orders.map((order) => (
          <div
            key={order.id}
            className="p-4 space-y-3 hover:bg-[hsl(var(--muted))]/30 transition-colors cursor-pointer"
            onClick={() => onOrderClick(order)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                  {order.orderNumber}
                </p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">{order.customer.name}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{order.customer.phone}</p>
              </div>
              <span
                className={cn(
                  'inline-flex rounded-full px-2 py-1 text-xs font-semibold shrink-0',
                  getStatusColor(order.status)
                )}
              >
                {getStatusLabel(order.status)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-[hsl(var(--muted-foreground))] text-xs block">Items</span>
                <span className="font-medium">
                  {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div>
                <span className="text-[hsl(var(--muted-foreground))] text-xs block">Total</span>
                <span className="font-medium">৳{order.total.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[hsl(var(--muted-foreground))] text-xs block">Payment</span>
                <span className="text-xs">{getPaymentMethodLabel(order.payment.method)}</span>
              </div>
              <div>
                <span className="text-[hsl(var(--muted-foreground))] text-xs block">Date</span>
                <span className="text-xs">{formatDate(order.createdAt)}</span>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onOrderClick(order);
              }}
              className="text-sm text-[hsl(var(--primary))] hover:underline"
            >
              View Details →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
