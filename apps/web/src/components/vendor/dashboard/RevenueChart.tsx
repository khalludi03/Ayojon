import { TrendingUp } from 'lucide-react';

// Mock data for last 30 days
const generateRevenueData = () => {
  const data = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Generate random revenue between 500-1500
    const revenue = Math.floor(Math.random() * 1000) + 500;

    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue,
    });
  }

  return data;
};

export function RevenueChart() {
  const data = generateRevenueData();
  const maxRevenue = Math.max(...data.map((d) => d.revenue));
  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
  const avgRevenue = Math.floor(totalRevenue / data.length);

  return (
    <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">
            Revenue Overview
          </h3>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Last 30 days
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-950/20 px-3 py-1.5">
          <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
          <span className="text-sm font-medium text-green-600 dark:text-green-400">
            +12.5%
          </span>
        </div>
      </div>

      {/* Chart Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Total Revenue</p>
          <p className="text-2xl font-bold text-[hsl(var(--foreground))]">
            ৳{totalRevenue.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Daily Average</p>
          <p className="text-2xl font-bold text-[hsl(var(--foreground))]">
            ৳{avgRevenue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Simple Line Chart */}
      <div className="relative h-64">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-[hsl(var(--muted-foreground))]">
          <span>৳{maxRevenue}</span>
          <span>৳{Math.floor(maxRevenue / 2)}</span>
          <span>৳0</span>
        </div>

        {/* Chart area */}
        <div className="ml-12 h-full">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Grid lines */}
            <line
              x1="0"
              y1="0"
              x2="100"
              y2="0"
              stroke="currentColor"
              strokeWidth="0.2"
              className="text-[hsl(var(--border))]"
            />
            <line
              x1="0"
              y1="50"
              x2="100"
              y2="50"
              stroke="currentColor"
              strokeWidth="0.2"
              className="text-[hsl(var(--border))]"
            />
            <line
              x1="0"
              y1="100"
              x2="100"
              y2="100"
              stroke="currentColor"
              strokeWidth="0.2"
              className="text-[hsl(var(--border))]"
            />

            {/* Revenue line */}
            <polyline
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="0.5"
              points={data
                .map((d, i) => {
                  const x = (i / (data.length - 1)) * 100;
                  const y = 100 - (d.revenue / maxRevenue) * 100;
                  return `${x},${y}`;
                })
                .join(' ')}
            />

            {/* Area under curve */}
            <polygon
              fill="hsl(var(--primary))"
              fillOpacity="0.1"
              points={
                data
                  .map((d, i) => {
                    const x = (i / (data.length - 1)) * 100;
                    const y = 100 - (d.revenue / maxRevenue) * 100;
                    return `${x},${y}`;
                  })
                  .join(' ') + ' 100,100 0,100'
              }
            />
          </svg>

          {/* X-axis labels */}
          <div className="mt-2 flex justify-between text-xs text-[hsl(var(--muted-foreground))]">
            <span>{data[0]?.date}</span>
            <span>{data[Math.floor(data.length / 2)]?.date}</span>
            <span>{data[data.length - 1]?.date}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
