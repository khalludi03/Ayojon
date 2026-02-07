import { DollarSign, ShoppingCart, Calendar, Clock, Star, Eye, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  clickable?: boolean;
  onClick?: () => void;
}

function KPICard({ title, value, icon, trend, clickable, onClick }: KPICardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm transition-all',
        clickable && 'cursor-pointer hover:border-[hsl(var(--primary))] hover:shadow-md'
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold text-[hsl(var(--foreground))]">
            {value}
          </p>
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              {trend.isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span
                className={cn(
                  'text-sm font-medium',
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                )}
              >
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-[hsl(var(--muted-foreground))]">
                vs last month
              </span>
            </div>
          )}
        </div>
        <div className="rounded-full bg-[hsl(var(--primary))]/10 p-3">
          {icon}
        </div>
      </div>
    </div>
  );
}

export function KPICards() {
  const handlePendingOrdersClick = () => {
    // Navigate to orders with pending filter
    console.log('Navigate to pending orders');
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <KPICard
        title="Total Revenue"
        value="৳24,500"
        icon={<DollarSign className="h-6 w-6 text-[hsl(var(--primary))]" />}
        trend={{ value: 12.5, isPositive: true }}
      />
      <KPICard
        title="Orders This Month"
        value="87"
        icon={<ShoppingCart className="h-6 w-6 text-[hsl(var(--primary))]" />}
        trend={{ value: 8.2, isPositive: true }}
      />
      <KPICard
        title="Active Rentals"
        value="23"
        icon={<Calendar className="h-6 w-6 text-[hsl(var(--primary))]" />}
        trend={{ value: -3.1, isPositive: false }}
      />
      <KPICard
        title="Pending Orders"
        value="5"
        icon={<Clock className="h-6 w-6 text-[hsl(var(--primary))]" />}
        clickable
        onClick={handlePendingOrdersClick}
      />
      <KPICard
        title="Store Rating"
        value={
          <div className="flex items-center gap-2">
            <span>4.8</span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    'h-5 w-5',
                    star <= 4.8
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  )}
                />
              ))}
            </div>
          </div>
        }
        icon={<Star className="h-6 w-6 text-[hsl(var(--primary))]" />}
      />
      <KPICard
        title="Store Views"
        value="1,234"
        icon={<Eye className="h-6 w-6 text-[hsl(var(--primary))]" />}
        trend={{ value: 15.3, isPositive: true }}
      />
    </div>
  );
}
