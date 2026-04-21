import { useMemo } from "react";

import { cn } from "@/lib/utils";

import type { WeekdayIndex, WeeklyAnalyticsData } from "./types";

const WEEKDAY_LABELS: readonly string[] = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function cellKey(day: WeekdayIndex, row: number) {
  return `${day}-${row}`;
}

/** Density using theme chart tokens for a richer ramp than primary-only */
function intensityClass(value: number, max: number): string {
  if (max <= 0 || value <= 0) return "bg-muted";
  const t = value / max;
  if (t < 0.14) return "bg-muted";
  if (t < 0.26) return "bg-chart-3/30";
  if (t < 0.38) return "bg-chart-4/45";
  if (t < 0.5) return "bg-chart-2/55";
  if (t < 0.62) return "bg-chart-1/45";
  if (t < 0.74) return "bg-chart-1/70";
  if (t < 0.86) return "bg-chart-1/85";
  return "bg-chart-5";
}

type HeatmapChartProps = {
  data: WeeklyAnalyticsData;
};

export function HeatmapChart({ data }: HeatmapChartProps) {
  const { matrix, max } = useMemo(() => {
    const map = new Map<string, number>();
    let maxVal = 0;
    for (const c of data.heatmap) {
      const k = cellKey(c.dayIndex, c.timeBlockIndex);
      map.set(k, c.completedCount);
      if (c.completedCount > maxVal) maxVal = c.completedCount;
    }
    return { matrix: map, max: maxVal };
  }, [data.heatmap]);

  const rows = data.timeBlocks.length;

  return (
    <div className="flex h-full min-h-[200px] flex-col rounded-xl border border-border bg-card p-3 text-card-foreground shadow-sm sm:p-4">
      <div className="mb-2">
        <h3 className="text-sm font-semibold">Densidade de conclusões</h3>
        <p className="text-xs text-muted-foreground">
          Dia da semana × faixa horária · última semana (7 dias)
        </p>
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-x-auto">
        <div
          className="grid w-full min-w-[300px] gap-0.5 sm:gap-1"
          style={{
            gridTemplateColumns: `minmax(4rem,5rem) repeat(7, minmax(0,1fr))`,
            gridTemplateRows: `auto repeat(${rows}, minmax(1.25rem,1.5rem))`,
          }}
        >
          <div />
          {WEEKDAY_LABELS.map((d) => (
            <div
              key={d}
              className="flex items-end justify-center pb-1 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
            >
              {d}
            </div>
          ))}
          {data.timeBlocks.map((block, row) => (
            <div key={block} className="contents">
              <div className="flex items-center pr-1 text-[10px] font-medium leading-tight text-muted-foreground">
                {block}
              </div>
              {([0, 1, 2, 3, 4, 5, 6] as const).map((day) => {
                const v = matrix.get(cellKey(day, row)) ?? 0;
                return (
                  <div
                    key={cellKey(day, row)}
                    title={`${WEEKDAY_LABELS[day]} ${block}: ${v} tarefas`}
                    className={cn(
                      "rounded-md ring-1 ring-border/20 transition-transform duration-200 hover:z-[1] hover:scale-110 hover:ring-2 hover:ring-primary/40",
                      intensityClass(v, max),
                    )}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
