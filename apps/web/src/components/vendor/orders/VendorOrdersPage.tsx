import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Calendar, Loader2, ShoppingBag } from 'lucide-react';
import { orpc } from '@/utils/orpc';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { OrdersTable } from './OrdersTable';

export function VendorOrdersPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('');
  const [dateRangeFilter, setDateRangeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch orders from backend
  const { data: ordersResponse, isLoading } = useQuery({
    ...orpc.vendor.getOrders.queryOptions({
      input: {
        status: statusFilter || undefined,
      }
    } as any),
    ssr: false, // Disable SSR for this query
  } as any);

  const orders = (ordersResponse as any)?.data || [];

  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

    // Search (frontend side)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (o: any) =>
          o.orderNumber.toLowerCase().includes(query) ||
          o.shippingName?.toLowerCase().includes(query) ||
          o.shippingPhone?.includes(query) ||
          o.user?.name?.toLowerCase().includes(query)
      );
    }

    // Payment method filter
    if (paymentMethodFilter) {
      filtered = filtered.filter((o: any) => o.paymentMethod === paymentMethodFilter);
    }

    // Date range filter
    if (dateRangeFilter !== 'all') {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(startOfToday);
      startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      filtered = filtered.filter((o: any) => {
        const orderDate = new Date(o.createdAt);
        switch (dateRangeFilter) {
          case 'today':
            return orderDate >= startOfToday;
          case 'week':
            return orderDate >= startOfWeek;
          case 'month':
            return orderDate >= startOfMonth;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [orders, searchQuery, paymentMethodFilter, dateRangeFilter]);

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setPaymentMethodFilter('');
    setDateRangeFilter('all');
  };

  const activeFilterCount =
    (searchQuery ? 1 : 0) +
    (statusFilter ? 1 : 0) +
    (paymentMethodFilter ? 1 : 0) +
    (dateRangeFilter !== 'all' ? 1 : 0);

  const handleOrderClick = (order: any) => {
    navigate({
      to: '/vendor/orders/$orderId',
      params: { orderId: order.id },
    });
  };

  // Stats
  const stats = {
    total: orders.length,
    pending: orders.filter((o: any) => o.status === 'pending').length,
    confirmed: orders.filter((o: any) => o.status === 'confirmed').length,
    delivered: orders.filter((o: any) => o.status === 'delivered').length,
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Orders</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Manage and fulfill customer orders ({filteredOrders.length} order
            {filteredOrders.length !== 1 ? 's' : ''})
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Total Orders</p>
            <p className="text-2xl font-bold text-[hsl(var(--foreground))]">{isLoading ? '...' : stats.total}</p>
          </div>
          <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Pending</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{isLoading ? '...' : stats.pending}</p>
          </div>
          <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Confirmed</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{isLoading ? '...' : stats.confirmed}</p>
          </div>
          <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Delivered</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{isLoading ? '...' : stats.delivered}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by order ID, customer name, or phone..."
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="shrink-0"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-2 px-1.5 py-0.5 text-xs bg-[hsl(var(--primary))] text-white rounded">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>

          {showFilters && (
            <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="text-sm font-medium text-[hsl(var(--foreground))] mb-2 block">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full rounded-md border px-3 py-2 text-sm bg-[hsl(var(--background))] border-[hsl(var(--border))]"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="returned">Returned</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-[hsl(var(--foreground))] mb-2 block">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethodFilter}
                    onChange={(e) => setPaymentMethodFilter(e.target.value)}
                    className="w-full rounded-md border px-3 py-2 text-sm bg-[hsl(var(--background))] border-[hsl(var(--border))]"
                  >
                    <option value="">All Methods</option>
                    <option value="bkash">bKash</option>
                    <option value="card">Card</option>
                    <option value="cod">Cash on Delivery</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-[hsl(var(--foreground))] mb-2 block">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Date Range
                  </label>
                  <select
                    value={dateRangeFilter}
                    onChange={(e) => setDateRangeFilter(e.target.value as any)}
                    className="w-full rounded-md border px-3 py-2 text-sm bg-[hsl(var(--background))] border-[hsl(var(--border))]"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>
              </div>

              {activeFilterCount > 0 && (
                <div className="mt-4 flex justify-end">
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Orders Table */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))] mb-4" />
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Loading your orders...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <OrdersTable orders={filteredOrders} onOrderClick={handleOrderClick} />
        ) : (
          <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-12 text-center">
            <ShoppingBag className="h-12 w-12 mx-auto text-[hsl(var(--muted-foreground))] mb-4" />
            <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-2">No orders found</h3>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              {activeFilterCount > 0 ? 'Try adjusting your filters' : 'You haven\'t received any orders yet'}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
