import { ChevronRight, Loader2 } from "lucide-react";
import { useMemo } from "react";
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

/** Contagens para o mesmo conjunto já carregado no painel (`per_page` limitado pela API). */
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

type RowTone = {
  ring: string;
  numBg: string;
  text: string;
  bar: string;
};

const ROWS: { key: keyof ReturnType<typeof computeBuckets>; label: string; tone: RowTone }[] = [
  {
    key: "inProgress",
    label: "Em progresso",
    tone: {
      ring: "ring-emerald-500/35",
      numBg: "bg-emerald-500/18 text-emerald-700 dark:text-emerald-300",
      text: "text-emerald-700 dark:text-emerald-300",
      bar: "from-emerald-500/55",
    },
  },
  {
    key: "postponed",
    label: "Adiadas",
    tone: {
      ring: "ring-amber-500/35",
      numBg: "bg-amber-500/18 text-amber-800 dark:text-amber-200",
      text: "text-amber-800 dark:text-amber-200",
      bar: "from-amber-500/55",
    },
  },
  {
    key: "completed",
    label: "Concluídas",
    tone: {
      ring: "ring-sky-500/35",
      numBg: "bg-sky-500/18 text-sky-800 dark:text-sky-200",
      text: "text-sky-800 dark:text-sky-200",
      bar: "from-sky-500/55",
    },
  },
  {
    key: "overdue",
    label: "Atrasadas",
    tone: {
      ring: "ring-rose-500/40",
      numBg: "bg-rose-500/18 text-rose-700 dark:text-rose-300",
      text: "text-rose-700 dark:text-rose-300",
      bar: "from-rose-500/55",
    },
  },
];

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
        "relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-b from-muted/50 to-muted/25 p-3 shadow-sm dark:border-slate-800 dark:from-slate-900/90 dark:to-slate-950/95",
        className,
      )}
      aria-labelledby="dashboard-task-status-heading"
    >
      <div className="mb-2.5 flex items-center justify-between gap-2 px-1">
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
                className="flex animate-pulse flex-col items-center gap-2 rounded-xl bg-muted/80 px-4 py-5 dark:bg-slate-800/80"
              >
                <div className="size-11 rounded-full bg-muted dark:bg-slate-700" />
                <div className="h-3 w-24 rounded-md bg-muted dark:bg-slate-700" />
              </div>
            ))
          : ROWS.map((row) => {
              const n = counts[row.key];
              const { tone } = row;
              return (
                <div
                  key={row.key}
                  className={cn(
                    "relative flex flex-col items-center gap-1.5 rounded-xl border border-border/40 bg-card/80 px-4 py-3 shadow-sm ring-1 ring-inset backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-800/70",
                    tone.ring,
                  )}
                >
                  <div
                    className={cn(
                      "flex size-11 items-center justify-center rounded-full text-lg font-bold tabular-nums ring-2 ring-background/80",
                      tone.numBg,
                    )}
                  >
                    {n}
                  </div>
                  <p className={cn("text-center text-xs font-semibold uppercase tracking-wide", tone.text)}>{row.label}</p>
                  <div
                    className={cn(
                      "pointer-events-none absolute inset-x-0 bottom-0 h-0.5 rounded-b-xl bg-gradient-to-r opacity-90",
                      tone.bar,
                      "via-transparent to-transparent",
                    )}
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
        <p className="mt-2 px-1 text-center text-[10px] leading-snug text-muted-foreground">
          {items.length === 0
            ? "Sem tarefas neste lote. Abra o quadro para criar ou carregar mais."
            : `Com base nas primeiras ${items.length} tarefas carregadas. Abra o quadro para o conjunto completo.`}
        </p>
      )}
    </section>
  );
}
