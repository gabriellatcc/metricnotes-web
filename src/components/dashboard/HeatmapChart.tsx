import { useMemo } from "react";

import { cn } from "@/lib/utils";

import type { WeekdayIndex, WeeklyAnalyticsData } from "./types";

const WEEKDAY_LABELS: readonly string[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function cellKey(day: WeekdayIndex, row: number) {
  return `${day}-${row}`;
}

/** Density steps using theme `primary` + `muted` (shadcn tokens). */
function intensityClass(value: number, max: number): string {
  if (max <= 0 || value <= 0) return "bg-muted";
  const t = value / max;
  if (t < 0.15) return "bg-muted";
  if (t < 0.28) return "bg-primary/15";
  if (t < 0.4) return "bg-primary/28";
  if (t < 0.52) return "bg-primary/40";
  if (t < 0.64) return "bg-primary/52";
  if (t < 0.76) return "bg-primary/65";
  if (t < 0.88) return "bg-primary/78";
  return "bg-primary";
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
    <div className="flex h-full min-h-[260px] flex-col rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm">
      <div className="mb-3">
        <h3 className="text-sm font-semibold">Completion density</h3>
        <p className="text-xs text-muted-foreground">Day of week × time block</p>
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-x-auto">
        <div
          className="grid w-full min-w-[320px] gap-1"
          style={{
            gridTemplateColumns: `minmax(4.5rem,5.5rem) repeat(7, minmax(0,1fr))`,
            gridTemplateRows: `auto repeat(${rows}, minmax(1.75rem,2rem))`,
          }}
        >
          <div />
          {WEEKDAY_LABELS.map((d) => (
            <div
              key={d}
              className="flex items-end justify-center pb-1 text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
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
                    title={`${WEEKDAY_LABELS[day]} ${block}: ${v} tasks`}
                    className={cn("rounded-sm transition-colors", intensityClass(v, max))}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-end gap-2 text-[10px] text-muted-foreground">
          <span>Lower</span>
          <div className="flex gap-0.5">
            <span className="h-3 w-5 rounded-sm bg-muted" />
            <span className="h-3 w-5 rounded-sm bg-primary/40" />
            <span className="h-3 w-5 rounded-sm bg-primary/70" />
            <span className="h-3 w-5 rounded-sm bg-primary" />
          </div>
          <span>Higher</span>
        </div>
      </div>
    </div>
  );
}
