import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { WeeklyAnalyticsData } from "./types";

const CHART = {
  stroke: "var(--chart-1)",
  fillStart: "var(--chart-1)",
  grid: "var(--border)",
  tickLine: "var(--border)",
  tooltipBg: "var(--popover)",
  tooltipBorder: "var(--border)",
  tooltipFg: "var(--popover-foreground)",
} as const;

type Row = { block: string; volume: number };

type TaskDistributionAreaChartProps = {
  data: WeeklyAnalyticsData;
};

export function TaskDistributionAreaChart({ data }: TaskDistributionAreaChartProps) {
  const chartData: Row[] = data.distributionByTimeBlock.map((d) => ({
    block: d.label,
    volume: d.totalCompleted,
  }));

  return (
    <div className="flex h-full min-h-[200px] flex-col rounded-xl border border-border bg-card p-3 text-card-foreground shadow-sm sm:p-4">
      <div className="mb-1.5 shrink-0">
        <h3 className="text-sm font-semibold">Volume de tarefas por faixa horária</h3>
        <p className="text-xs text-muted-foreground">Agregado ao longo da semana</p>
      </div>
      <div className="min-h-0 w-full flex-1 [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="fillVolume" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART.fillStart} stopOpacity={0.35} />
                <stop offset="100%" stopColor={CHART.fillStart} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
            <XAxis
              dataKey="block"
              tick={{ fontSize: 10 }}
              axisLine={{ stroke: CHART.tickLine }}
              tickLine={false}
            />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                borderRadius: "var(--radius-lg)",
                border: `1px solid ${CHART.tooltipBorder}`,
                background: CHART.tooltipBg,
                fontSize: "12px",
                color: CHART.tooltipFg,
                boxShadow: "var(--shadow-sm)",
              }}
              formatter={(value: number | undefined) => [`${value ?? 0} tarefas`, "Volume"]}
            />
            <Area
              type="monotone"
              dataKey="volume"
              stroke={CHART.stroke}
              strokeWidth={2}
              fill="url(#fillVolume)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
