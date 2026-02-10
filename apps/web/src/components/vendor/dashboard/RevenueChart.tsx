import { TrendingUp, DollarSign } from 'lucide-react';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 shadow-xl">
        <p className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest mb-1">{label}</p>
        <p className="text-sm font-black text-[hsl(var(--primary))]">
          ৳{payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export function RevenueChart() {
  const { data: revenueResponse, isLoading } = useQuery({
    ...orpc.vendor.getRevenueData.queryOptions(),
    ssr: false,
  } as any);

  const data = (revenueResponse as any) || [];
  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);

  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 shadow-sm transition-all hover:shadow-md">
      <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-[hsl(var(--primary))]">
            <div className="h-2 w-2 rounded-full bg-current animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Live Analytics</span>
          </div>
          <h3 className="text-2xl font-black text-[hsl(var(--foreground))] tracking-tight">
            Revenue Performance
          </h3>
        </div>

        <div className="flex items-center gap-2 bg-[hsl(var(--muted))]/50 p-1 rounded-xl border border-[hsl(var(--border))]">
          <button className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">14D</button>
          <button className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-[hsl(var(--card))] text-[hsl(var(--primary))] shadow-sm border border-[hsl(var(--border))]">30D</button>
        </div>
      </div>

      <div className="mb-10 grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest">Total Gross Revenue</p>
          <div className="flex items-baseline gap-2">
            {isLoading ? (
              <span className="inline-block h-9 w-32 bg-[hsl(var(--muted))] animate-pulse rounded" />
            ) : (
              <span className="text-3xl font-black text-[hsl(var(--foreground))] tracking-tighter">৳{totalRevenue.toLocaleString()}</span>
            )}
          </div>
        </div>
        <div className="space-y-1 sm:border-l sm:border-[hsl(var(--border))] sm:pl-8">
          <p className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest">Average Daily</p>
          <div className="flex items-baseline gap-2">
            {isLoading ? (
              <span className="inline-block h-9 w-32 bg-[hsl(var(--muted))] animate-pulse rounded" />
            ) : (
              <>
                <span className="text-3xl font-black text-[hsl(var(--foreground))] tracking-tighter">৳{Math.floor(totalRevenue / (data.length || 1)).toLocaleString()}</span>
                <span className="text-xs font-bold text-[hsl(var(--muted-foreground))]">/ day</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="h-72 w-full min-h-[300px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="h-8 w-8 border-4 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" minHeight={300} minWidth={0}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                opacity={0.5}
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 700 }}
                minTickGap={30}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 700 }}
                tickFormatter={(value) => `৳${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRevenue)"
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
