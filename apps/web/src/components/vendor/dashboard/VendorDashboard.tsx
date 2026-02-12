import { DashboardOverview } from './DashboardOverview';

export function VendorDashboard() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 py-4 sm:py-8 md:py-12">
        <DashboardOverview />
      </div>
    </div>
  );
}
