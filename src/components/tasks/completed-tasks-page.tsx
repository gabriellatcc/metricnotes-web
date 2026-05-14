import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { TaskResource } from "@/generated/api/models";
import { useTaskIndex } from "@/generated/api/task/task";
import { cn } from "@/lib/utils";

const perPage = 100;

function formatTaskDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 19).replace("T", " ");
  return d.toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" });
}

/** Dia local para agrupar (YYYY-MM-DD) */
function dayKey(iso: string | null | undefined): string {
  if (!iso) return "_nodate";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "_nodate";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function labelForDayKey(key: string): string {
  if (key === "_nodate") return "Sem data de conclusão";
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  if (Number.isNaN(date.getTime())) return key;
  return date.toLocaleDateString("pt-PT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function sortCompletedDesc(a: TaskResource, b: TaskResource): number {
  const ta = a.completed_at || a.updated_at;
  const tb = b.completed_at || b.updated_at;
  return String(tb).localeCompare(String(ta));
}

export function CompletedTasksPage() {
  const [page, setPage] = useState(1);
  const [viewTask, setViewTask] = useState<TaskResource | null>(null);

  const indexQuery = useTaskIndex({ page, per_page: perPage });

  const items = indexQuery.data?.data?.items ?? [];
  const pagination = indexQuery.data?.data?.pagination;

  const completed = useMemo(
    () => items.filter((t) => t.status === "completed").sort(sortCompletedDesc),
    [items],
  );

  const byDay = useMemo(() => {
    const m = new Map<string, TaskResource[]>();
    for (const t of completed) {
      const k = dayKey(t.completed_at ?? t.updated_at);
      const list = m.get(k) ?? [];
      list.push(t);
      m.set(k, list);
    }
    for (const list of m.values()) {
      list.sort(sortCompletedDesc);
    }
    return m;
  }, [completed]);

  const dayKeys = useMemo(() => {
    const keys = [...byDay.keys()];
    keys.sort((a, b) => {
      if (a === "_nodate") return 1;
      if (b === "_nodate") return -1;
      return b.localeCompare(a);
    });
    return keys;
  }, [byDay]);

  const statusLabel = (s: string) =>
    ({ in_progress: "Em progresso", completed: "Concluída", postponed: "Adiada" } as Record<string, string>)[s] ?? s;

  return (
    <main className="min-h-full flex-1 bg-background">
      <div className="w-full pb-6 sm:pb-8">
        {indexQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando as tarefas concluídas…</p>
        ) : indexQuery.isError ? (
          <p className="text-sm text-muted-foreground">Não foi possível carregar. Tenta de novo.</p>
        ) : completed.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-muted/20 px-6 py-12 text-center">
            <p className="text-sm text-muted-foreground">Nenhuma tarefa concluída nesta página de resultados.</p>
            {pagination && pagination.last_page > 1 ? (
              <p className="mt-2 text-xs text-muted-foreground">Tenta a página anterior ou a seguinte.</p>
            ) : null}
          </div>
        ) : (
          <div className="space-y-8">
            {dayKeys.map((key) => {
              const list = byDay.get(key) ?? [];
              return (
                <section key={key} className="space-y-2">
                  <h2 className="border-b border-border pb-1.5 text-sm font-semibold capitalize text-foreground">
                    {labelForDayKey(key)}
                    <span className="ml-2 font-mono text-xs font-normal text-muted-foreground">({list.length})</span>
                  </h2>
                  <ul className="space-y-1.5">
                    {list.map((task) => {
                      const when = task.completed_at || task.updated_at;
                      return (
                        <li key={task.id}>
                          <button
                            type="button"
                            onClick={() => {
                              setViewTask(task);
                            }}
                            className={cn(
                              "group flex w-full items-center justify-between gap-3 rounded-lg border border-border/80 bg-card px-3 py-2.5 text-left text-sm",
                              "transition-colors hover:border-primary/30 hover:bg-muted/40",
                            )}
                          >
                            <span className="min-w-0 flex-1 truncate font-medium text-foreground">{task.name}</span>
                            <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                              {when ? (
                                <time dateTime={when} className="font-mono tabular-nums">
                                  {formatTaskDateTime(when)}
                                </time>
                              ) : null}
                              <ChevronRight className="h-4 w-4 text-muted-foreground/80 group-hover:text-foreground" />
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
          </div>
        )}

        {pagination && pagination.last_page > 1 ? (
          <div className="mt-8 flex items-center justify-between gap-2 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              disabled={page <= 1 || indexQuery.isFetching}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </Button>
            <span className="text-xs text-muted-foreground">
              Página {pagination.current_page} / {pagination.last_page}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              disabled={page >= pagination.last_page || indexQuery.isFetching}
              onClick={() => setPage((p) => p + 1)}
            >
              Próxima
            </Button>
          </div>
        ) : null}
      </div>

      <Dialog
        open={viewTask != null}
        onOpenChange={(open) => {
          if (!open) setViewTask(null);
        }}
      >
        <DialogContent className="gap-0 p-0 sm:max-w-lg" showClose>
          {viewTask ? (
            <>
              <DialogHeader>
                <DialogTitle className="pr-2">{viewTask.name}</DialogTitle>
                <DialogDescription>
                  Concluída. Tempo de foco na tarefa não é contabilizado após a conclusão.
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-[min(60vh,420px)] space-y-4 overflow-y-auto px-6 py-4">
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">Descrição</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                    {viewTask.description}
                  </p>
                </div>
                <dl className="grid gap-2 text-sm">
                  <div className="flex flex-wrap justify-between gap-2">
                    <dt className="text-muted-foreground">Status</dt>
                    <dd className="font-medium">{statusLabel(viewTask.status)}</dd>
                  </div>
                  {viewTask.completed_at ? (
                    <div className="flex flex-wrap justify-between gap-2">
                      <dt className="text-muted-foreground">Concluída em</dt>
                      <dd className="font-mono text-xs">{formatTaskDateTime(viewTask.completed_at)}</dd>
                    </div>
                  ) : null}
                  {viewTask.current_due_date ? (
                    <div className="flex flex-wrap justify-between gap-2">
                      <dt className="text-muted-foreground">Prazo (à data)</dt>
                      <dd className="font-mono text-xs">{viewTask.current_due_date.slice(0, 10)}</dd>
                    </div>
                  ) : null}
                </dl>
                <p className="text-[0.65rem] text-muted-foreground">
                  Para reabrir ou editar, volta ao{" "}
                  <Link to="/tasks" className="text-primary underline-offset-2 hover:underline">
                    quadro de tarefas
                  </Link>
                  .
                </p>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </main>
  );
}
