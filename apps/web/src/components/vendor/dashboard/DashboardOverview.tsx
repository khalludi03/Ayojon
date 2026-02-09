import { KPICards } from './KPICards';
import { RevenueChart } from './RevenueChart';
import { RecentOrdersTable } from './RecentOrdersTable';
import { NotificationsPanel } from './NotificationsPanel';
import { authClient } from '@/lib/auth-client';

export function DashboardOverview() {
  const { data: session } = authClient.useSession();
  const userName = session?.user?.name?.split(' ')[0] || 'Vendor';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-[hsl(var(--foreground))] tracking-tight">
            Welcome back, {userName}! 👋
          </h2>
          <p className="text-sm font-medium text-[hsl(var(--muted-foreground))] mt-1">
            Here's what's happening with your store today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest bg-[hsl(var(--muted))]/50 px-4 py-2 rounded-lg border border-[hsl(var(--border))]">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          Live System Status: Normal
        </div>
      </div>

      {/* KPI Cards */}
      <KPICards />

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 space-y-8">
          <RevenueChart />
          <RecentOrdersTable />
        </div>

        {/* Sidebar Area */}
        <div className="space-y-8">
          <NotificationsPanel />
          
          {/* Quick Setup Card */}
          <div className="rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white shadow-lg overflow-hidden relative group">
            <div className="relative z-10">
              <h4 className="text-lg font-bold mb-2">Get Started! 🚀</h4>
              <p className="text-sm text-white/80 mb-4 font-medium leading-relaxed">
                Complete your store profile and list your first product to start reaching customers on Ayojon.
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs font-bold text-white/90 bg-white/10 px-2 py-1.5 rounded-lg border border-white/10">
                  <div className="h-4 w-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</div>
                  Update Store Settings
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-white/90 bg-white/10 px-2 py-1.5 rounded-lg border border-white/10">
                  <div className="h-4 w-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">2</div>
                  Add Your Products
                </div>
              </div>
            </div>
            {/* Decorative circles */}
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <div className="absolute -left-4 -bottom-4 h-24 w-24 rounded-full bg-black/10 blur-2xl group-hover:scale-150 transition-transform duration-700" />
          </div>
        </div>
      </div>
    </div>
  );
}
