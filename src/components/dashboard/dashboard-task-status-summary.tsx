import { ChevronRight, Loader2 } from "lucide-react";
import { useMemo, type CSSProperties } from "react";
import { Link } from "@tanstack/react-router";

import type { TaskResource } from "@/generated/api/models";
import { parseTaskDueDate, startOfTodayLocal } from "@/lib/parse-task-due-date";
import { cn } from "@/lib/utils";

function startOfDueDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

function isCompleted(t: TaskResource): boolean {
  return t.status === "completed" || (t.completed_at != null && t.completed_at !== "");
}

function computeBuckets(items: TaskResource[]) {
  const today0 = startOfTodayLocal();
  let inProgress = 0;
  let postponed = 0;
  let completed = 0;
  let overdue = 0;

  for (const t of items) {
    if (isCompleted(t)) {
      completed++;
      continue;
    }
    if (t.status === "postponed") postponed++;
    else if (t.status === "in_progress") inProgress++;

    const due = parseTaskDueDate(t.current_due_date || t.original_due_date);
    if (due && startOfDueDay(due).getTime() < today0.getTime()) overdue++;
  }

  return { inProgress, postponed, completed, overdue };
}

type ChartVar = "--chart-1" | "--chart-2" | "--chart-3" | "--chart-4";

const ROWS: { key: keyof ReturnType<typeof computeBuckets>; label: string; chart: ChartVar }[] = [
  { key: "inProgress", label: "Em progresso", chart: "--chart-1" },
  { key: "postponed", label: "Adiadas", chart: "--chart-3" },
  { key: "completed", label: "Concluídas", chart: "--chart-4" },
  { key: "overdue", label: "Atrasadas", chart: "--chart-2" },
];

function chartInk(chart: ChartVar): CSSProperties {
  const v = `var(${chart})`;
  return {
    color: v,
    backgroundImage: `linear-gradient(to right, ${v} 0%, transparent 72%)`,
  };
}

function chartChipStyle(chart: ChartVar): CSSProperties {
  const v = `var(${chart})`;
  return {
    color: v,
    backgroundColor: `color-mix(in oklch, ${v} 18%, transparent)`,
    boxShadow: `inset 0 0 0 2px color-mix(in oklch, ${v} 42%, transparent)`,
  };
}

export function DashboardTaskStatusSummary({
  items,
  loading,
  className,
}: {
  items: TaskResource[];
  loading?: boolean;
  className?: string;
}) {
  const counts = useMemo(() => computeBuckets(items), [items]);

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-xl border border-border/70 bg-card p-4 text-card-foreground shadow-none",
        className,
      )}
      aria-labelledby="dashboard-task-status-heading"
    >
      <div className="mb-2.5 flex items-center justify-between gap-2 px-0.5">
        <h2 id="dashboard-task-status-heading" className="text-sm font-semibold tracking-tight text-foreground">
          Resumo das tarefas
        </h2>
        <Link
          to="/tasks"
          className="inline-flex items-center gap-0.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Ver quadro
          <ChevronRight className="size-3.5 opacity-70" aria-hidden />
        </Link>
      </div>

      <div className="flex flex-col gap-2 lg:grid lg:grid-cols-4 lg:gap-2">
        {loading
          ? ROWS.map((row) => (
              <div
                key={row.key}
                className="flex animate-pulse flex-col items-center gap-2 rounded-xl border border-border/50 bg-muted/30 px-4 py-5"
              >
                <div className="size-11 rounded-full bg-muted" />
                <div className="h-3 w-24 rounded-md bg-muted" />
              </div>
            ))
          : ROWS.map((row) => {
              const n = counts[row.key];
              const { chart } = row;
              return (
                <div
                  key={row.key}
                  className={cn(
                    "relative flex flex-col items-center gap-1.5 overflow-hidden rounded-xl border border-border/60 bg-muted/[0.08] px-4 py-3",
                  )}
                >
                  <div
                    className="flex size-11 items-center justify-center rounded-full text-lg font-bold tabular-nums"
                    style={chartChipStyle(chart)}
                  >
                    {n}
                  </div>
                  <p
                    className="text-center text-xs font-semibold uppercase tracking-wide"
                    style={{ color: `var(${chart})` }}
                  >
                    {row.label}
                  </p>
                  <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-px opacity-85"
                    style={chartInk(chart)}
                    aria-hidden
                  />
                </div>
              );
            })}
      </div>

      {loading ? (
        <p className="mt-2 flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" aria-hidden />
          A carregar totais…
        </p>
      ) : (
        <p className="mt-2 px-0.5 text-center text-[10px] leading-snug text-muted-foreground">
          {items.length === 0
            ? "Sem tarefas neste lote. Abra o quadro para criar ou carregar mais."
            : `Com base nas primeiras ${items.length} tarefas carregadas. Abra o quadro para o conjunto completo.`}
        </p>
      )}
    </section>
  );
}
