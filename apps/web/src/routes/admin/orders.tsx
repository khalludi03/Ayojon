import { createFileRoute, redirect } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShoppingBag,
  Search,
  MoreVertical,
  CheckCircle,
  Clock,
  Truck,
  Package,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Mail,
  Calendar,
  DollarSign,
  ArrowUpRight,
  Filter,
  RefreshCw,
  Smartphone,
  Hash
} from 'lucide-react';
import { getUser } from '@/functions/get-user';
import { orpc } from '@/utils/orpc';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';

export const Route = createFileRoute('/admin/orders' as any)({
  beforeLoad: async () => {
    const session = await getUser();
    if (!session) {
      throw redirect({ to: '/login' });
    }
    const user = session.user as any;
    if (user.role !== 'admin') {
      throw redirect({ to: '/' });
    }
    return { session };
  },
  component: AdminOrdersPage,
});

const ITEMS_PER_PAGE = 50;

const STATUS_CONFIG = {
  // bKash/Prepaid flow
  awaiting_payment: { label: 'Awaiting Payment', icon: Clock, color: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800' },
  payment_submitted: { label: 'Payment Submitted', icon: Clock, color: 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-800' },
  payment_received: { label: 'Payment Received', icon: CheckCircle, color: 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border-indigo-300 dark:border-indigo-800' },
  payment_rejected: { label: 'Payment Rejected', icon: XCircle, color: 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800' },
  
  // COD flow
  placed: { label: 'Order Placed', icon: ShoppingBag, color: 'bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-400 border-sky-300 dark:border-sky-800' },
  
  // Shared flow
  pending: { label: 'Pending', icon: Clock, color: 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-800' },
  processing: { label: 'Processing', icon: Package, color: 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-800' },
  shipped: { label: 'Shipped', icon: Truck, color: 'bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-800' },
  delivered: { label: 'Delivered', icon: CheckCircle, color: 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-800' },
  
  // COD specific outcomes
  cash_collected: { label: 'Cash Collected', icon: DollarSign, color: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800' },
  settlement_ready: { label: 'Settlement Ready', icon: RefreshCw, color: 'bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-400 border-cyan-300 dark:border-cyan-800' },
  
  // Final payout statuses
  vendor_paid: { label: 'Vendor Paid', icon: DollarSign, color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-800' },
  vendor_settled: { label: 'Vendor Settled', icon: DollarSign, color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-800' },
  
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-800' },
};

function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Queries
  const { data, isLoading } = useQuery(orpc.admin.listOrders.queryOptions({
    input: {
      search: searchQuery || undefined,
      status: statusFilter !== 'all' ? statusFilter as any : undefined,
      limit: ITEMS_PER_PAGE,
      offset: (currentPage - 1) * ITEMS_PER_PAGE,
    }
  }));

  // Mutations
  const updateStatusMutation = useMutation(orpc.admin.updateOrderStatus.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orpc.admin.listOrders.key() });
      toast.success('Order status updated successfully');
    },
    onError: (error) => toast.error(error.message),
  }));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const updateStatus = (orderId: string, newStatus: string) => {
    updateStatusMutation.mutate({
      id: orderId,
      status: newStatus as any,
    });
  };

  const totalPages = Math.ceil((data?.totalCount ?? 0) / ITEMS_PER_PAGE);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!data?.orders) return { pending: 0, processing: 0, shipped: 0, delivered: 0, totalRevenue: 0 };

    const pending = data.orders.filter(o => o.status === 'pending').length;
    const processing = data.orders.filter(o => o.status === 'processing').length;
    const shipped = data.orders.filter(o => o.status === 'shipped').length;
    const delivered = data.orders.filter(o => o.status === 'delivered').length;
    const totalRevenue = data.orders.reduce((sum, o) => sum + parseFloat(o.total), 0);

    return { pending, processing, shipped, delivered, totalRevenue };
  }, [data?.orders]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50 dark:from-slate-950 dark:via-indigo-950/10 dark:to-slate-950 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/50">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Order Management
              </h1>
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-medium ml-[52px]">
              Monitor and manage all platform orders in real-time
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => queryClient.invalidateQueries({ queryKey: orpc.admin.listOrders.key() })}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatsCard
            label="Total Orders"
            value={data?.totalCount ?? 0}
            icon={ShoppingBag}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
            trend="+12%"
          />
          <StatsCard
            label="Pending"
            value={stats.pending}
            icon={Clock}
            color="bg-gradient-to-br from-yellow-500 to-amber-600"
          />
          <StatsCard
            label="Processing"
            value={stats.processing}
            icon={Package}
            color="bg-gradient-to-br from-purple-500 to-purple-600"
          />
          <StatsCard
            label="Shipped"
            value={stats.shipped}
            icon={Truck}
            color="bg-gradient-to-br from-indigo-500 to-indigo-600"
          />
          <StatsCard
            label="Delivered"
            value={stats.delivered}
            icon={CheckCircle}
            color="bg-gradient-to-br from-green-500 to-emerald-600"
          />
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl shadow-slate-200/50 dark:shadow-none">
          <div className="flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleSearch} className="flex gap-3 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by order ID, customer name or email..."
                  className="pl-12 h-12 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
              <Button type="submit" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold h-12 px-6 rounded-xl shadow-lg shadow-indigo-500/30 transition-all hover:shadow-xl hover:shadow-indigo-500/40">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-full sm:w-[200px] h-12 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">🟡 Pending</SelectItem>
                <SelectItem value="processing">🔵 Processing</SelectItem>
                <SelectItem value="shipped">🟣 Shipped</SelectItem>
                <SelectItem value="delivered">🟢 Delivered</SelectItem>
                <SelectItem value="cancelled">🔴 Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-800/30 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Order ID</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Customer</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Total</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {isLoading ? (
                  <tr><td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-8 w-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                      <p className="text-slate-500 font-medium">Loading orders...</p>
                    </div>
                  </td></tr>
                ) : data?.orders.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-16 w-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <ShoppingBag className="h-8 w-8 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-slate-900 dark:text-white font-bold mb-1">No orders found</p>
                        <p className="text-sm text-slate-500">Try adjusting your search or filters</p>
                      </div>
                    </div>
                  </td></tr>
                ) : data?.orders.map((order) => {
                  const statusConfig = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG];
                  const StatusIcon = statusConfig.icon;

                  return (
                    <tr key={order.id} className="group hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/30 dark:hover:from-indigo-950/20 dark:hover:to-purple-950/10 transition-all duration-200">
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-indigo-500 group-hover:animate-pulse" />
                          <span className="text-sm font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                            #{order.orderNumber}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/30">
                            {order.userName[0].toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                              {order.userName}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                              <Mail className="h-3 w-3" />
                              {order.userEmail}
                            </span>
                            {order.paymentMethod === 'bkash' && (order.status === 'payment_submitted' || order.status === 'payment_received') && (
                              <div className="mt-1 pt-1 border-t border-slate-100 dark:border-slate-800 space-y-0.5">
                                {order.senderMobile && (
                                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1">
                                    <Smartphone className="h-2.5 w-2.5" />
                                    {order.senderMobile}
                                  </span>
                                )}
                                {order.paymentTransactionId && (
                                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1">
                                    <Hash className="h-2.5 w-2.5" />
                                    {order.paymentTransactionId}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-950/30 flex items-center justify-center">
                            <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            ৳{parseFloat(order.total).toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={cn(
                          "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-wider border-2 shadow-sm transition-all hover:shadow-md",
                          statusConfig.color
                        )}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                          <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <Calendar className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl">
                            {order.status === 'payment_submitted' && (
                              <>
                                <DropdownMenuItem onClick={() => updateStatus(order.id, 'payment_received')}>
                                  <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                  <span className="text-green-600 font-bold">Approve Payment</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateStatus(order.id, 'payment_rejected')}>
                                  <XCircle className="mr-2 h-4 w-4 text-red-600" />
                                  <span className="text-red-600 font-bold">Reject Payment</span>
                                </DropdownMenuItem>
                                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                              </>
                            )}
                            <DropdownMenuItem onClick={() => updateStatus(order.id, 'shipped')}>
                              <Truck className="mr-2 h-4 w-4" /> Mark Shipped
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateStatus(order.id, 'delivered')}>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                              <span className="text-green-600">Mark Delivered</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateStatus(order.id, 'cancelled')}>
                              <XCircle className="mr-2 h-4 w-4 text-red-600" />
                              <span className="text-red-600">Cancel Order</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-5 bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-800/30 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <p className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Page {currentPage} of {totalPages}
                </p>
                <span className="text-xs text-slate-500 dark:text-slate-500">
                  ({data?.totalCount ?? 0} total orders)
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="rounded-lg disabled:opacity-50 h-9 px-4"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="rounded-lg disabled:opacity-50 h-9 px-4"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatsCard({ label, value, icon: Icon, color, trend }: any) {
  return (
    <div className="group relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className={cn("p-3 rounded-xl shadow-lg", color)}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          {trend && (
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-xs font-bold">
              <ArrowUpRight className="h-3 w-3" />
              {trend}
            </div>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {value.toLocaleString()}
          </p>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {label}
          </p>
        </div>
      </div>
      <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity", color)} />
    </div>
  );
}
