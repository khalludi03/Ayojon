import { ShoppingBag } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import { OrderStatusBadge } from '@/components/ui/order-status-badge';

interface OrdersTableProps {
  orders: any[];
}

const getPaymentMethodLabel = (method: string) => {
  const labels: Record<string, string> = {
    bkash: 'bKash',
    card: 'Card',
    cod: 'Cash on Delivery',
  };
  return labels[method] || method;
};

const formatDate = (date: any) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export function OrdersTable({ orders }: OrdersTableProps) {
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
                Vendor Revenue
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
            {orders.map((order) => {
              const vendorSubtotal = (order.items || []).reduce((sum: number, item: any) => sum + (parseFloat(item.price) * item.quantity), 0);
              return (
                <tr
                  key={order.id}
                  className="hover:bg-[hsl(var(--muted))]/30 transition-colors"
                >
                  <td className="p-3 text-sm font-medium text-[hsl(var(--foreground))]">
                    {order.orderNumber}
                  </td>
                  <td className="p-3">
                    <div>
                      <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                        {order.shippingName || order.user?.name}
                      </p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        {order.shippingPhone}
                      </p>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-[hsl(var(--muted-foreground))]">
                    {(order.items || []).length} item{(order.items || []).length !== 1 ? 's' : ''}
                  </td>
                  <td className="p-3 text-sm font-medium text-[hsl(var(--foreground))]">
                    ৳{vendorSubtotal.toLocaleString()}
                  </td>
                  <td className="p-3">
                    <div>
                      <p className="text-sm text-[hsl(var(--foreground))]">
                        {getPaymentMethodLabel(order.paymentMethod)}
                      </p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase">
                        {order.paymentStatus}
                      </p>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-[hsl(var(--muted-foreground))]">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="p-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="p-3 text-right">
                    <Link
                      to="/vendor/orders/$orderId"
                      params={{ orderId: order.id }}
                      className="text-sm text-[hsl(var(--primary))] hover:underline"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden divide-y divide-[hsl(var(--border))]">
        {orders.map((order) => {
          const vendorSubtotal = (order.items || []).reduce((sum: number, item: any) => sum + (parseFloat(item.price) * item.quantity), 0);
          return (
            <div
              key={order.id}
              className="p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                    {order.orderNumber}
                  </p>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">{order.shippingName || order.user?.name}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{order.shippingPhone}</p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-[hsl(var(--muted-foreground))] text-xs block">Items</span>
                  <span className="font-medium">
                    {(order.items || []).length} item{(order.items || []).length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div>
                  <span className="text-[hsl(var(--muted-foreground))] text-xs block">Revenue</span>
                  <span className="font-medium">৳{vendorSubtotal.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[hsl(var(--muted-foreground))] text-xs block">Payment</span>
                  <span className="text-xs">{getPaymentMethodLabel(order.paymentMethod)}</span>
                </div>
                <div>
                  <span className="text-[hsl(var(--muted-foreground))] text-xs block">Date</span>
                  <span className="text-xs">{formatDate(order.createdAt)}</span>
                </div>
              </div>

              <Link
                to="/vendor/orders/$orderId"
                params={{ orderId: order.id }}
                className="text-sm text-[hsl(var(--primary))] hover:underline inline-block"
              >
                View Details →
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
