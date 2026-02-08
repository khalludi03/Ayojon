import { createFileRoute, redirect, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  Store, 
  Package, 
  ShoppingBag, 
  DollarSign, 
  UserPlus,
  ArrowRight,
  ShieldCheck,
  Activity
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
  const { data, isLoading } = useQuery(orpc.admin.getPlatformMetrics.queryOptions());

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Loading Platform Metrics...</p>
        </div>
      </div>
    );
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
              Real-time monitoring of Ayojon Marketplace ecosystem.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] bg-white dark:bg-slate-900 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            System Live
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          <MetricCard 
            title="Total Users" 
            value={metrics?.totalUsers} 
            icon={Users} 
            color="text-blue-600" 
            bg="bg-blue-100 dark:bg-blue-950/30" 
          />
          <MetricCard 
            title="Total Vendors" 
            value={metrics?.totalVendors} 
            icon={Store} 
            color="text-purple-600" 
            bg="bg-purple-100 dark:bg-purple-950/30" 
          />
          <MetricCard 
            title="Total Products" 
            value={metrics?.totalProducts} 
            icon={Package} 
            color="text-orange-600" 
            bg="bg-orange-100 dark:bg-orange-950/30" 
          />
          <MetricCard 
            title="Orders (MTD)" 
            value={metrics?.monthlyOrders} 
            icon={ShoppingBag} 
            color="text-emerald-600" 
            bg="bg-emerald-100 dark:bg-emerald-950/30" 
          />
          <MetricCard 
            title="Revenue (MTD)" 
            value={`৳${metrics?.monthlyRevenue.toLocaleString()}`} 
            icon={DollarSign} 
            color="text-indigo-600" 
            bg="bg-indigo-100 dark:bg-indigo-950/30" 
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Recent Orders Widget */}
          <ActivityWidget 
            title="Recent Orders" 
            link="/admin/orders"
            icon={Activity}
          >
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {data?.recentOrders.length === 0 ? (
                <div className="py-8 text-center text-slate-500 font-medium">No orders recorded this month.</div>
              ) : data?.recentOrders.map((order: any) => (
                <div key={order.id} className="py-4 flex items-center justify-between group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 px-2 rounded-lg transition-colors">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Order #{order.id.slice(0, 8)}</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-black text-slate-900 dark:text-white">৳{parseFloat(order.total).toLocaleString()}</span>
                    <div className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200">
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
                    <div className="h-9 w-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-black text-sm transition-transform group-hover:scale-110">
                      {user.name[0]}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{user.name}</span>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{user.email}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={cn(
                      "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter",
                      user.role === 'admin' ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-700"
                    )}>
                      {user.role}
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase">{new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </ActivityWidget>
        </div>

        {/* Quick Access Control Bar */}
        <div className="bg-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-200 dark:shadow-none">
          <div className="relative z-10">
            <h3 className="text-lg font-black uppercase tracking-[0.2em] mb-8 text-indigo-100">Management Console</h3>
            <div className="grid gap-12 md:grid-cols-4">
              <QuickLink label="Users & Permissions" count={metrics?.totalUsers} to="/admin/users" />
              <QuickLink label="Active Vendors" count={metrics?.totalVendors} to="/admin/vendors" />
              <QuickLink label="Global Inventory" count={metrics?.totalProducts} to="/admin/products" />
              <QuickLink label="Sales & Fulfillment" count={metrics?.monthlyOrders} to="/admin/orders" />
            </div>
          </div>
          {/* Decorative accents */}
          <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -left-10 -top-10 h-64 w-64 rounded-full bg-black/10 blur-3xl" />
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, color, bg }: any) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 group">
      <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", bg, color)}>
        <Icon className="h-6 w-6" />
      </div>
      <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em]">{title}</p>
      <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">{value}</h3>
    </div>
  );
}

function ActivityWidget({ title, link, icon: Icon, children }: any) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
        <h3 className="font-black uppercase tracking-wider text-slate-900 dark:text-white text-xs flex items-center gap-2">
          <Icon className="h-4 w-4 text-indigo-600" />
          {title}
        </h3>
        <Link to={link as any} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-3 py-1.5 rounded-lg transition-all border border-transparent hover:border-indigo-100">
          Manage All
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
      <span className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.15em] group-hover:text-white transition-colors">{label}</span>
      <span className="text-4xl font-black mt-2 flex items-center gap-3 tracking-tighter">
        {count}
        <ArrowRight className="h-6 w-6 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-indigo-300" />
      </span>
    </Link>
  );
}
