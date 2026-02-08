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

const generateRevenueData = () => {
  const data = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: Math.floor(Math.random() * 800) + 700,
    });
  }
  return data;
};

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
  const data = generateRevenueData();
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
            <span className="text-3xl font-black text-[hsl(var(--foreground))] tracking-tighter">৳{totalRevenue.toLocaleString()}</span>
            <div className="flex items-center text-xs font-bold text-green-600 bg-green-100 dark:bg-green-950/30 px-2 py-0.5 rounded-full">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12.5%
            </div>
          </div>
        </div>
        <div className="space-y-1 sm:border-l sm:border-[hsl(var(--border))] sm:pl-8">
          <p className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest">Average Daily</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[hsl(var(--foreground))] tracking-tighter">৳{Math.floor(totalRevenue / data.length).toLocaleString()}</span>
            <span className="text-xs font-bold text-[hsl(var(--muted-foreground))]">/ day</span>
          </div>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
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
      </div>
    </div>
  );
}
