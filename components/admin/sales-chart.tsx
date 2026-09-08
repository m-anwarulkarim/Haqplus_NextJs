"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface SalesChartProps {
  data?: {
    name: string;
    revenue: number;
    orders: number;
  }[];
}

const DEFAULT_SALES_DATA = [
  { name: "Mon", revenue: 2400, orders: 18 },
  { name: "Tue", revenue: 1398, orders: 12 },
  { name: "Wed", revenue: 4800, orders: 34 },
  { name: "Thu", revenue: 3908, orders: 28 },
  { name: "Fri", revenue: 6800, orders: 46 },
  { name: "Sat", revenue: 7800, orders: 58 },
  { name: "Sun", revenue: 5300, orders: 39 },
];

export function SalesChart({ data = DEFAULT_SALES_DATA }: SalesChartProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            tickFormatter={(val) => `৳${val}`}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-2xl border border-border/80 bg-popover p-3 shadow-xl text-xs">
                    <p className="font-bold text-foreground mb-1">{label}</p>
                    <p className="text-primary font-bold">
                      Revenue: ৳{Number(payload[0]?.value || 0).toLocaleString()}
                    </p>
                    <p className="text-muted-foreground">
                      Orders: {payload[0]?.payload?.orders}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="var(--primary)"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#revenueGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
