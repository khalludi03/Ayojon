import { KPICards } from './KPICards';
import { RevenueChart } from './RevenueChart';
import { RecentOrdersTable } from './RecentOrdersTable';
import { QuickActions } from './QuickActions';
import { NotificationsPanel } from './NotificationsPanel';

export function DashboardOverview() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <KPICards />

      {/* Revenue Chart & Notifications */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div>
          <NotificationsPanel />
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Recent Orders */}
      <RecentOrdersTable />
    </div>
  );
}
