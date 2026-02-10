import { DollarSign, ShoppingCart, Calendar, Clock, Star, Eye, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
  clickable?: boolean;
  onClick?: () => void;
  isLoading?: boolean;
}

function KPICard({ title, value, icon: Icon, trend, color, clickable, onClick, isLoading }: KPICardProps) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm transition-all duration-300',
        clickable && 'cursor-pointer hover:border-[hsl(var(--primary))] hover:shadow-lg hover:-translate-y-1'
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
            {title}
          </p>
          <div className="flex items-baseline gap-1">
            <h3 className="text-3xl font-extrabold text-[hsl(var(--foreground))] tracking-tight">
              {isLoading ? (
                <span className="inline-block h-8 w-20 bg-[hsl(var(--muted))] animate-pulse rounded" />
              ) : (
                value
              )}
            </h3>
          </div>

          {trend && !isLoading && (
            <div className="flex items-center gap-1.5 pt-1">
              <div className={cn(
                "flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-bold",
                trend.isPositive
                  ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                  : "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400"
              )}>
                {trend.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {trend.isPositive ? '+' : ''}{trend.value}%
              </div>
              <span className="text-xs text-[hsl(var(--muted-foreground))] font-medium">
                vs last month
              </span>
            </div>
          )}
        </div>

        <div className={cn(
          "rounded-2xl p-3 transition-colors duration-300",
          color ? color : "bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]"
        )}>
          <Icon className="h-6 w-6" />
        </div>
      </div>

      {/* Decorative background element */}
      <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-gradient-to-br from-transparent to-[hsl(var(--primary))]/5 opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  );
}

export function KPICards() {
  const { data: stats, isLoading } = useQuery({
    ...orpc.vendor.getDashboardStats.queryOptions(),
    ssr: false,
  } as any);

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <KPICard
        title="Total Revenue"
        value={stats ? `৳${parseFloat(stats.totalRevenue).toLocaleString()}` : '৳0'}
        icon={DollarSign}
        color="bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
        isLoading={isLoading}
        trend={stats?.revenueGrowth ? { value: stats.revenueGrowth, isPositive: stats.revenueGrowth > 0 } : undefined}
      />
      <KPICard
        title="Orders This Month"
        value={stats?.ordersThisMonth ?? 0}
        icon={ShoppingCart}
        color="bg-blue-100 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400"
        isLoading={isLoading}
        trend={stats?.ordersGrowth ? { value: stats.ordersGrowth, isPositive: stats.ordersGrowth > 0 } : undefined}
      />
      <KPICard
        title="Active Rentals"
        value={stats?.activeRentals ?? 0}
        icon={Calendar}
        color="bg-purple-100 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400"
        isLoading={isLoading}
      />
      <KPICard
        title="Pending Orders"
        value={stats?.pendingOrders ?? 0}
        icon={Clock}
        color="bg-amber-100 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400"
        isLoading={isLoading}
      />
      <KPICard
        title="Store Rating"
        value={stats?.storeRating.toFixed(1) ?? '0.0'}
        icon={Star}
        color="bg-orange-100 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400"
        isLoading={isLoading}
      />
      <KPICard
        title="Store Views"
        value={stats?.storeViews ?? 0}
        icon={Eye}
        color="bg-pink-100 text-pink-600 dark:bg-pink-950/30 dark:text-pink-400"
        isLoading={isLoading}
      />
    </div>
  );
}
