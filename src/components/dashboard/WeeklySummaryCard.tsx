import type { WeeklyPerformanceSummary } from "./types";

type WeeklySummaryCardProps = {
  summary: WeeklyPerformanceSummary;
};

export function WeeklySummaryCard({ summary }: WeeklySummaryCardProps) {
  return (
    <div className="flex h-full min-h-[280px] flex-col rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm">
      <h3 className="text-sm font-semibold">Weekly performance</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">Snapshot from the current dataset</p>

      <div className="mt-5 space-y-6 text-sm">
        <section>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">General</h4>
          <dl className="mt-2 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/60 px-3 py-2">
              <dt className="text-[10px] font-medium uppercase text-muted-foreground">Total tasks</dt>
              <dd className="text-lg font-semibold tabular-nums text-foreground">{summary.totalTasksWeek}</dd>
            </div>
            <div className="rounded-lg bg-muted/60 px-3 py-2">
              <dt className="text-[10px] font-medium uppercase text-muted-foreground">Daily avg</dt>
              <dd className="text-lg font-semibold tabular-nums text-foreground">
                {summary.dailyAverage.toFixed(1)}
              </dd>
            </div>
          </dl>
        </section>

        <section>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Productivity peaks
          </h4>
          <ul className="mt-2 space-y-2">
            <li className="flex items-start justify-between gap-2 rounded-lg border border-border/80 bg-muted/30 px-3 py-2">
              <span className="text-muted-foreground">Best day</span>
              <span className="text-right font-medium text-foreground">
                {summary.bestDay.label}
                <span className="ml-2 tabular-nums text-muted-foreground">({summary.bestDay.total})</span>
              </span>
            </li>
            <li className="flex items-start justify-between gap-2 rounded-lg border border-border/80 bg-muted/30 px-3 py-2">
              <span className="text-muted-foreground">Best time block</span>
              <span className="text-right font-medium text-foreground">
                {summary.bestTimeBlock.label}
                <span className="ml-2 tabular-nums text-muted-foreground">
                  ({summary.bestTimeBlock.total})
                </span>
              </span>
            </li>
          </ul>
        </section>

        <section>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Insights</h4>
          <ul className="mt-2 list-disc space-y-1.5 pl-4 text-xs leading-relaxed text-muted-foreground">
            {summary.insights.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
