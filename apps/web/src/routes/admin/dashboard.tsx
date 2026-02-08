import { createFileRoute, redirect, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  Store, 
  Package, 
  ShoppingBag, 
  DollarSign, 
  TrendingUp,
  UserPlus,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { getUser } from '@/functions/get-user';
import { orpc } from '@/utils/orpc';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/admin/dashboard' as any)({
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
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const { data, isLoading } = useQuery(orpc.getPlatformMetrics.queryOptions());

  if (isLoading) {
    return <div className="p-8">Loading metrics...</div>;
  }

  const metrics = data?.metrics;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <ShieldCheck className="h-8 w-8 text-indigo-600" />
              Platform Overview
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
              Monitoring Ayojon Marketplace health and growth.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="bg-white dark:bg-slate-900">Download Report</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">Live View</Button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          <MetricCard 
            title="Total Users" 
            value={metrics?.totalUsers} 
            icon={Users} 
            color="text-blue-600" 
            bg="bg-blue-100" 
          />
          <MetricCard 
            title="Total Vendors" 
            value={metrics?.totalVendors} 
            icon={Store} 
            color="text-purple-600" 
            bg="bg-purple-100" 
          />
          <MetricCard 
            title="Total Products" 
            value={metrics?.totalProducts} 
            icon={Package} 
            color="text-orange-600" 
            bg="bg-orange-100" 
          />
          <MetricCard 
            title="Orders (MTD)" 
            value={metrics?.monthlyOrders} 
            icon={ShoppingBag} 
            color="text-emerald-600" 
            bg="bg-emerald-100" 
          />
          <MetricCard 
            title="Revenue (MTD)" 
            value={`৳${metrics?.monthlyRevenue.toLocaleString()}`} 
            icon={DollarSign} 
            color="text-indigo-600" 
            bg="bg-indigo-100" 
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Recent Orders Widget */}
          <ActivityWidget 
            title="Recent Orders" 
            link="/admin/orders"
            icon={ShoppingBag}
          >
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {data?.recentOrders.map((order: any) => (
                <div key={order.id} className="py-4 flex items-center justify-between group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 px-2 rounded-lg transition-colors">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Order #{order.id.slice(0, 8)}</span>
                    <span className="text-xs text-slate-500 font-medium">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-black text-slate-900 dark:text-white">৳{parseFloat(order.total).toLocaleString()}</span>
                    <div className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-700">
                      {order.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ActivityWidget>

          {/* Recent Signups Widget */}
          <ActivityWidget 
            title="New User Signups" 
            link="/admin/users"
            icon={UserPlus}
          >
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {data?.recentUsers.map((user: any) => (
                <div key={user.id} className="py-4 flex items-center justify-between group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 px-2 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-bold text-xs">
                      {user.name[0]}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</span>
                      <span className="text-xs text-slate-500 font-medium">{user.email}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400">{user.role}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </ActivityWidget>
        </div>

        {/* Quick Links */}
        <div className="bg-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-200 dark:shadow-none">
          <div className="relative z-10 grid gap-8 md:grid-cols-4">
            <QuickLink label="Manage Users" count={metrics?.totalUsers} to="/admin/users" />
            <QuickLink label="Vendor Requests" count={metrics?.totalVendors} to="/admin/vendors" />
            <QuickLink label="Live Inventory" count={metrics?.totalProducts} to="/admin/products" />
            <QuickLink label="Total Fulfillment" count={metrics?.monthlyOrders} to="/admin/orders" />
          </div>
          {/* Decorative shapes */}
          <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -left-10 -top-10 h-64 w-64 rounded-full bg-black/10 blur-3xl" />
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, color, bg }: any) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
      <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center mb-4", bg, color)}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{title}</p>
      <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{value}</h3>
    </div>
  );
}

function ActivityWidget({ title, link, icon: Icon, children }: any) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Icon className="h-4 w-4 text-indigo-600" />
          {title}
        </h3>
        <Link to={link as any} className="text-xs font-bold text-indigo-600 hover:underline flex items-center">
          Manage All <ArrowRight className="h-3 w-3 ml-1" />
        </Link>
      </div>
      <div className="p-6 flex-1">
        {children}
      </div>
    </div>
  );
}

function QuickLink({ label, count, to }: any) {
  return (
    <Link to={to as any} className="flex flex-col group">
      <span className="text-xs font-bold text-indigo-100 uppercase tracking-wider group-hover:text-white transition-colors">{label}</span>
      <span className="text-3xl font-black mt-1 flex items-center gap-2">
        {count}
        <ArrowRight className="h-5 w-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
      </span>
    </Link>
  );
}
