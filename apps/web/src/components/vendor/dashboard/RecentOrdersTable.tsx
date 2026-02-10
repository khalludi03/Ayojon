import { Button } from '@/components/ui/button';
import { Package, ChevronRight, User } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { OrderStatusBadge } from '@/components/ui/order-status-badge';

export function RecentOrdersTable() {
  const { data: ordersResponse, isLoading } = useQuery({
    ...orpc.vendor.getRecentOrders.queryOptions({
      input: { limit: 5 },
    } as any),
    ssr: false,
  } as any);

  const orders = (ordersResponse as any) || [];

  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden shadow-sm">
      <div className="p-6 border-b border-[hsl(var(--border))] flex items-center justify-between bg-[hsl(var(--muted))]/30">
        <div>
          <h3 className="text-xl font-bold text-[hsl(var(--foreground))] tracking-tight">
            Incoming Orders
          </h3>
          <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
            Review and fulfill your latest customer requests
          </p>
        </div>
        <Button variant="ghost" size="sm" className="font-bold text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/10" asChild>
          <Link to="/vendor/orders">
            View All <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[hsl(var(--muted))]/10">
              <th className="px-6 py-4 text-left text-[10px] font-black text-[hsl(var(--muted-foreground))] uppercase tracking-[0.1em]">Order Details</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-[hsl(var(--muted-foreground))] uppercase tracking-[0.1em]">Customer</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-[hsl(var(--muted-foreground))] uppercase tracking-[0.1em]">Items</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-[hsl(var(--muted-foreground))] uppercase tracking-[0.1em]">Revenue</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-[hsl(var(--muted-foreground))] uppercase tracking-[0.1em]">Status</th>
              <th className="px-6 py-4 text-right text-[10px] font-black text-[hsl(var(--muted-foreground))] uppercase tracking-[0.1em]">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border))]">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 border-4 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Loading orders...</p>
                  </div>
                </td>
              </tr>
            ) : orders.length > 0 ? (
              orders.map((order: any) => (
                <tr key={order.id} className="group hover:bg-[hsl(var(--muted))]/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[hsl(var(--foreground))]">{order.orderNumber}</span>
                      <span className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] uppercase">{new Date(order.date).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-[hsl(var(--primary))]/10 flex items-center justify-center">
                        <User className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />
                      </div>
                      <span className="text-sm font-semibold text-[hsl(var(--foreground))]">{order.customerName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[hsl(var(--muted-foreground))]">
                    {order.items}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-[hsl(var(--foreground))]">
                    ৳{parseFloat(order.total).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 font-bold text-xs px-4 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      asChild
                    >
                      <Link to="/vendor/orders" search={{ orderId: order.id }}>
                        Manage
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Package className="h-10 w-10 text-[hsl(var(--muted-foreground))] opacity-20" />
                    <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">No orders found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden divide-y divide-[hsl(var(--border))]">
        {orders.length > 0 ? (
          orders.map((order: any) => (
            <div key={order.id} className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-bold">{order.orderNumber}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] font-medium">{order.customerName}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-sm font-black">৳{parseFloat(order.total).toLocaleString()}</span>
                <OrderStatusBadge status={order.status} />
              </div>
            </div>
          ))
        ) : (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
}
