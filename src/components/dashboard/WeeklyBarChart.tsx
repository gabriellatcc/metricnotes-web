import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { WeeklyAnalyticsData } from "./types";

const CHART = {
  bar: "var(--chart-1)",
  grid: "var(--border)",
  axis: "var(--muted-foreground)",
  tickLine: "var(--border)",
  tooltipBg: "var(--popover)",
  tooltipBorder: "var(--border)",
  tooltipFg: "var(--popover-foreground)",
  cursor: "color-mix(in oklch, var(--primary) 12%, transparent)",
} as const;

type Row = { day: string; total: number };

type WeeklyBarChartProps = {
  data: WeeklyAnalyticsData;
};

export function WeeklyBarChart({ data }: WeeklyBarChartProps) {
  const chartData: Row[] = data.tasksPerWeekday.map((d) => ({
    day: d.shortLabel,
    total: d.totalCompleted,
  }));

  return (
    <div className="flex h-full min-h-[280px] flex-col rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm">
      <div className="mb-2 shrink-0">
        <h3 className="text-sm font-semibold">Tasks completed by day</h3>
        <p className="text-xs text-muted-foreground">Monday → Sunday</p>
      </div>
      <div className="min-h-0 w-full flex-1 [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11 }}
              axisLine={{ stroke: CHART.tickLine }}
              tickLine={false}
            />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: CHART.cursor }}
              contentStyle={{
                borderRadius: "var(--radius-lg)",
                border: `1px solid ${CHART.tooltipBorder}`,
                background: CHART.tooltipBg,
                fontSize: "12px",
                color: CHART.tooltipFg,
                boxShadow: "var(--shadow-sm)",
              }}
              formatter={(value: number | undefined) => [`${value ?? 0} tasks`, "Completed"]}
            />
            <Bar dataKey="total" fill={CHART.bar} radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
