import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Calendar } from 'lucide-react';
import { getVendorOrders } from '@/stores/vendor-order-store';
import type { VendorOrder, VendorOrderStatus, PaymentMethod } from '@/types/vendor-order';
import { OrdersTable } from './OrdersTable';
import { OrderDetailModal } from './OrderDetailModal';
import { cn } from '@/lib/utils';

export function VendorOrdersPage() {
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<VendorOrder | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<VendorOrderStatus | ''>('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<PaymentMethod | ''>('');
  const [dateRangeFilter, setDateRangeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Mock vendor ID - in real app, get from auth context
  const vendorId = 'vendor-1';

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    const vendorOrders = getVendorOrders(vendorId);
    setOrders(vendorOrders);
  };

  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(query) ||
          o.customer.name.toLowerCase().includes(query) ||
          o.customer.email.toLowerCase().includes(query) ||
          o.customer.phone.includes(query)
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter((o) => o.status === statusFilter);
    }

    // Payment method filter
    if (paymentMethodFilter) {
      filtered = filtered.filter((o) => o.payment.method === paymentMethodFilter);
    }

    // Date range filter
    if (dateRangeFilter !== 'all') {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(startOfToday);
      startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      filtered = filtered.filter((o) => {
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
  }, [orders, searchQuery, statusFilter, paymentMethodFilter, dateRangeFilter]);

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

  const handleOrderClick = (order: VendorOrder) => {
    setSelectedOrder(order);
  };

  const handleCloseDetail = () => {
    setSelectedOrder(null);
    loadOrders(); // Refresh orders after potential status update
  };

  // Stats
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    confirmed: orders.filter((o) => o.status === 'confirmed').length,
    shipped: orders.filter((o) => o.status === 'shipped').length,
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
            <p className="text-2xl font-bold text-[hsl(var(--foreground))]">{stats.total}</p>
          </div>
          <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Pending</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
          </div>
          <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Confirmed</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.confirmed}</p>
          </div>
          <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Shipped</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.shipped}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
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

          {/* Filters Panel */}
          {showFilters && (
            <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="text-sm font-medium text-[hsl(var(--foreground))] mb-2 block">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as VendorOrderStatus | '')}
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
                    onChange={(e) => setPaymentMethodFilter(e.target.value as PaymentMethod | '')}
                    className="w-full rounded-md border px-3 py-2 text-sm bg-[hsl(var(--background))] border-[hsl(var(--border))]"
                  >
                    <option value="">All Methods</option>
                    <option value="bkash">bKash</option>
                    <option value="card">Card</option>
                    <option value="cod">Cash on Delivery</option>
                    <option value="bank">Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-[hsl(var(--foreground))] mb-2 block">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Date Range
                  </label>
                  <select
                    value={dateRangeFilter}
                    onChange={(e) => setDateRangeFilter(e.target.value as 'all' | 'today' | 'week' | 'month')}
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
        <OrdersTable orders={filteredOrders} onOrderClick={handleOrderClick} />

        {/* Order Detail Modal */}
        {selectedOrder && (
          <OrderDetailModal order={selectedOrder} onClose={handleCloseDetail} />
        )}
      </div>
    </div>
  );
}
