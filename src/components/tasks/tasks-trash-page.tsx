import { useQueryClient } from "@tanstack/react-query";
import { Loader2, RotateCcw } from "lucide-react";
import { useCallback, useState } from "react";

import { Badge } from "@/components/ui/badge";
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
import { toast, toastApiError } from "@/lib/api-toast";
import { apiClient } from "@/lib/api-client";

import { formatTaskDateTime, parseEmbeddedTips, statusLabel } from "@/components/tasks/task-ui-constants";

export function TasksTrashPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const perPage = 25;
  const [viewTask, setViewTask] = useState<TaskResource | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const invalidateTasks = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["/api/task"] });
  }, [queryClient]);

  const indexQuery = useTaskIndex({ page, per_page: perPage, only_trashed: "true" });

  const items = indexQuery.data?.data?.items ?? [];
  const pagination = indexQuery.data?.data?.pagination;

  const restore = useCallback(
    async (id: string) => {
      setRestoringId(id);
      try {
        await apiClient<{ success?: boolean }>({
          url: `/api/task/${id}/restore`,
          method: "PATCH",
        });
        invalidateTasks();
        toast.success("Tarefa restaurada.");
      } catch (e) {
        toastApiError(e, "Não foi possível restaurar");
      } finally {
        setRestoringId(null);
      }
    },
    [invalidateTasks],
  );

  return (
    <main className="flex min-h-0 flex-1 flex-col gap-6 bg-background">
      <section className="min-h-0 flex-1">
        {indexQuery.isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border/40 py-20">
            <Loader2 className="h-9 w-9 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Carregando as tarefas na lixeira…</p>
          </div>
        ) : indexQuery.isError ? (
          <p className="text-sm text-muted-foreground">Não foi possível carregar. Veja a notificação.</p>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-muted/20 px-6 py-10 text-center">
            <p className="text-sm font-medium">A lixeira está vazia.</p>
            <p className="mt-1 text-xs text-muted-foreground">As tarefas excluídas do quadro ou da lista aparecem aqui.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map((task) => (
              <li
                key={task.id}
                className="flex flex-col gap-3 rounded-xl border border-border/40 bg-muted/15 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium text-foreground">{task.name}</p>
                    <Badge variant="secondary" className="shrink-0 font-normal">
                      {statusLabel(task.status)}
                    </Badge>
                    {parseEmbeddedTips(task.tips).map((tip) => (
                      <span
                        key={tip.id}
                        className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs opacity-80"
                        style={{ borderColor: tip.color, color: tip.color }}
                      >
                        <span className="size-1.5 rounded-full" style={{ backgroundColor: tip.color }} />
                        {tip.name}
                      </span>
                    ))}
                  </div>
                  <p className="line-clamp-2 text-xs text-muted-foreground">{task.description}</p>
                  <p className="text-[11px] text-muted-foreground">
                    Excluída em:{" "}
                    {task.updated_at ? formatTaskDateTime(task.updated_at) : task.created_at ? formatTaskDateTime(task.created_at) : "—"}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button type="button" size="sm" variant="outline" className="rounded-full" onClick={() => setViewTask(task)}>
                    Ver
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="rounded-full gap-1"
                    onClick={() => void restore(task.id)}
                    disabled={restoringId === task.id}
                  >
                    {restoringId === task.id ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <RotateCcw className="size-3.5" />
                    )}
                    Restaurar
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {pagination && pagination.last_page > 1 ? (
        <div className="flex flex-wrap items-center justify-center gap-2 border-t border-border pt-4">
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
            {pagination.current_page} / {pagination.last_page}
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

      <Dialog open={viewTask != null} onOpenChange={(open) => !open && setViewTask(null)}>
        <DialogContent className="gap-0 p-0 sm:max-w-lg" showClose>
          {viewTask ? (
            <>
              <DialogHeader>
                <DialogTitle className="pr-2">{viewTask.name}</DialogTitle>
                <DialogDescription>Tarefa na lixeira (somente leitura).</DialogDescription>
              </DialogHeader>
              <div className="max-h-[min(60vh,420px)] space-y-4 overflow-y-auto px-6 py-4">
                <p className="whitespace-pre-wrap text-sm">{viewTask.description}</p>
                <dl className="grid gap-2 text-sm">
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Status</dt>
                    <dd>{statusLabel(viewTask.status)}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Prioridade</dt>
                    <dd className="font-mono">{viewTask.priority}</dd>
                  </div>
                </dl>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </main>
  );
}
