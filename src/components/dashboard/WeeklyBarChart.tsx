import { BarChart3 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { DashboardCardShell } from "./dashboard-card-shell";
import { WeeklyChartsStalePlaceholder } from "./dashboard-weekly-charts-feedback";
import type { WeeklyAnalyticsData } from "./types";

const CHART = {
  bar: "var(--chart-1)",
  grid: "var(--border)",
  tickLine: "var(--border)",
  tooltipBg: "var(--popover)",
  tooltipBorder: "var(--border)",
  tooltipFg: "var(--popover-foreground)",
  cursor: "color-mix(in oklch, var(--primary) 12%, transparent)",
} as const;

type Row = { day: string; total: number };

type WeeklyBarChartProps = {
  data: WeeklyAnalyticsData;
  chartsStale?: boolean;
  staleDays?: number;
};

export function WeeklyBarChart({ data, chartsStale = false, staleDays = 7 }: WeeklyBarChartProps) {
  const chartData: Row[] = data.tasksPerWeekday.map((d) => ({
    day: d.shortLabel,
    total: d.totalCompleted,
  }));

  /** Altura explícita: evita ResponsiveContainer sem altura (gráfico invisível com flex pai). */
  const chartViewport = "min-h-[240px] h-[clamp(232px,32vw,300px)] w-full shrink-0";

  return (
    <DashboardCardShell
      icon={BarChart3}
      title="Tarefas concluídas por dia"
      subtitle="Barras agrupadas por dia da série semanal atual (Seg–Dom)"
    >
      {chartsStale ? (
        <WeeklyChartsStalePlaceholder staleDays={staleDays} />
      ) : (
        <div className={`${chartViewport} pb-px [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11 }}
                axisLine={{ stroke: CHART.tickLine }}
                tickLine={false}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
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
                formatter={(value: number | string | undefined) => [
                  `${typeof value === "number" ? value : Number(value) || 0} tarefas`,
                  "Concluídas",
                ]}
              />
              <Bar dataKey="total" fill={CHART.bar} radius={[4, 4, 0, 0]} maxBarSize={42} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </DashboardCardShell>
  );
}
