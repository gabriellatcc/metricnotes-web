import type { WeeklyPerformanceSummary } from "./types";

type WeeklySummaryCardProps = {
  summary: WeeklyPerformanceSummary;
};

export function WeeklySummaryCard({ summary }: WeeklySummaryCardProps) {
  return (
    <div className="flex h-full min-h-[200px] flex-col rounded-xl border border-border bg-card p-3 text-card-foreground shadow-sm sm:p-4">
      <h3 className="text-sm font-semibold">Desempenho na semana</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">Resumo do conjunto de dados atual</p>

      <div className="mt-3 space-y-4 text-sm">
        <section>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Geral</h4>
          <dl className="mt-1.5 grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-muted/60 px-2.5 py-1.5">
              <dt className="text-[10px] font-medium uppercase text-muted-foreground">Total de tarefas</dt>
              <dd className="text-base font-semibold tabular-nums text-foreground">{summary.totalTasksWeek}</dd>
            </div>
            <div className="rounded-lg bg-muted/60 px-2.5 py-1.5">
              <dt className="text-[10px] font-medium uppercase text-muted-foreground">Média diária</dt>
              <dd className="text-base font-semibold tabular-nums text-foreground">
                {summary.dailyAverage.toFixed(1)}
              </dd>
            </div>
          </dl>
        </section>

        <section>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Productivity peaks
          </h4>
          <ul className="mt-1.5 space-y-1.5">
            <li className="flex items-start justify-between gap-2 rounded-lg border border-border/80 bg-muted/30 px-2.5 py-1.5">
              <span className="text-muted-foreground">Best day</span>
              <span className="text-right font-medium text-foreground">
                {summary.bestDay.label}
                <span className="ml-2 tabular-nums text-muted-foreground">({summary.bestDay.total})</span>
              </span>
            </li>
            <li className="flex items-start justify-between gap-2 rounded-lg border border-border/80 bg-muted/30 px-2.5 py-1.5">
              <span className="text-muted-foreground">Melhor faixa horária</span>
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
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Destaques</h4>
          <ul className="mt-1.5 list-disc space-y-1 pl-4 text-xs leading-snug text-muted-foreground">
            {summary.insights.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
