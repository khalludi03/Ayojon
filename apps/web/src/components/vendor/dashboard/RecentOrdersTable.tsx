import { Button } from '@/components/ui/button';
import { Eye, Package, ChevronRight, User } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  items: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
}

const getStatusStyles = (status: Order['status']) => {
  switch (status) {
    case 'pending':
      return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
    case 'processing':
      return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
    case 'shipped':
      return 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800';
    case 'delivered':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800';
    case 'cancelled':
      return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/30 dark:text-slate-400 dark:border-slate-700';
  }
};

export function RecentOrdersTable() {
  const { data: orders, isLoading } = useQuery(
    orpc.vendor.getRecentOrders.queryOptions({
      input: { limit: 5 },
    })
  );

  const mockOrders = orders || [];

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
            ) : mockOrders.length > 0 ? (
              mockOrders.map((order) => (
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
                    ৳{order.total.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider border',
                        getStatusStyles(order.status)
                      )}
                    >
                      <span className="mr-1 h-1 w-1 rounded-full bg-current" />
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 font-bold text-xs px-4 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      asChild
                    >
                      <Link to="/vendor/orders/$orderId" params={{ orderId: order.id }}>
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

      {/* Mobile View remains similar but simplified */}
      <div className="md:hidden divide-y divide-[hsl(var(--border))]">
        {mockOrders.length > 0 ? (
          mockOrders.map((order) => (
            <div key={order.id} className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-bold">{order.orderNumber}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] font-medium">{order.customerName}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-sm font-black">৳{order.total.toLocaleString()}</span>
                <span className={cn(
                  'rounded-full px-2 py-0.5 text-[9px] font-black uppercase border',
                  getStatusStyles(order.status)
                )}>
                  {order.status}
                </span>
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
