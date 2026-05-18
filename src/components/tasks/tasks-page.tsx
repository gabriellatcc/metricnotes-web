import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  emptyForm,
  formatTaskDateTime,
  inputClass,
  parseEmbeddedTips,
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
  statusLabel,
  taskDueParts,
  taskToUpdateBody,
} from "@/components/tasks/task-ui-constants";
import { TaskFormTipsPicker } from "@/components/tasks/task-form-tips-picker";
import { useRegisterOpenNewTaskFromHeader } from "@/components/tasks/tasks-new-task-context";
import { TaskKanbanBoard } from "@/components/tasks/task-kanban-board";
import { getKanbanColumnId, KANBAN_COLUMNS, type KanbanColumnId } from "@/components/tasks/task-kanban-types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldContent, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { TaskResource } from "@/generated/api/models";
import type { TaskStoreBody } from "@/generated/api/models/taskStoreBody";
import {
  taskEndViewSession,
  taskStartViewSession,
  useTaskDelete,
  useTaskIndex,
  useTaskStore,
  useTaskUpdate,
  useTaskUpdatePostpone,
} from "@/generated/api/task/task";
import { toast, toastApiError, toastApiSuccessFromBody } from "@/lib/api-toast";
import { apiClient } from "@/lib/api-client";
import { assignTaskTipIds } from "@/lib/task-assign-tips";
import { cn } from "@/lib/utils";

function nextPostponeDueDate(task: TaskResource): string {
  const raw = task.current_due_date || task.original_due_date;
  if (raw) {
    const d = new Date(raw);
    if (!Number.isNaN(d.getTime())) {
      d.setDate(d.getDate() + 7);
      return d.toISOString().slice(0, 10);
    }
  }
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
}

function applyPostponedResponse(
  work: TaskResource,
  data: { priority: number | string; current_due_date: string; postponed_count: number; status: string } & Record<
    string,
    unknown
  >,
): TaskResource {
  return { ...work, ...data, priority: String(data.priority) } as TaskResource;
}

function targetPostponedCountForColumn(to: "p1" | "p2" | "p3"): 1 | 2 | 3 {
  if (to === "p1") return 1;
  if (to === "p2") return 2;
  return 3;
}

function taskQualifiesForViewSession(task: TaskResource): boolean {
  return task.status !== "completed" && (task.completed_at == null || task.completed_at === "");
}

export function TasksPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const perPage = 100;
  const [createOpen, setCreateOpen] = useState(false);
  const [viewTask, setViewTask] = useState<TaskResource | null>(null);

  const invalidateTasks = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["/api/task"] });
  }, [queryClient]);

  const indexQuery = useTaskIndex({ page, per_page: perPage });

  const storeMutation = useTaskStore({
    mutation: {
      onSuccess: (res) => {
        toastApiSuccessFromBody(res, "Tarefa criada.");
        invalidateTasks();
      },
      onError: (error) => toastApiError(error),
    },
  });

  const updateMutation = useTaskUpdate({
    mutation: {
      onSuccess: (res) => {
        toastApiSuccessFromBody(res, "Tarefa atualizada.");
        invalidateTasks();
      },
      onError: (error) => toastApiError(error),
    },
  });

  const deleteMutation = useTaskDelete({
    mutation: {
      onSuccess: (_res, variables) => {
        const deletedId = variables.id;
        invalidateTasks();
        toast.success("Tarefa enviada para a lixeira.", {
          duration: 8000,
          action: {
            label: "Desfazer",
            onClick: () => {
              void (async () => {
                try {
                  await apiClient<{ success?: boolean }>({
                    url: `/api/task/${deletedId}/restore`,
                    method: "PATCH",
                  });
                  invalidateTasks();
                  toast.success("Tarefa restaurada.");
                } catch (e) {
                  toastApiError(e, "Não foi possível restaurar");
                }
              })();
            },
          },
        });
      },
      onError: (error) => toastApiError(error),
    },
  });

  const viewSessionRef = useRef<{ taskId: string; sessionId: string } | null>(null);

  useEffect(() => {
    if (!viewTask) {
      return undefined;
    }
    if (!taskQualifiesForViewSession(viewTask)) {
      return undefined;
    }

    const taskId = viewTask.id;
    let cancelled = false;

    void taskStartViewSession(taskId)
      .then((res) => {
        if (cancelled || res.success !== true) return;
        const sid =
          typeof res.data === "object" && res.data !== null && "session_id" in res.data
            ? (res.data as { session_id?: unknown }).session_id
            : undefined;
        if (typeof sid === "string" && sid.length > 0) {
          viewSessionRef.current = { taskId, sessionId: sid };
        }
      })
      .catch(() => {
        //
      });

    return () => {
      cancelled = true;
      const held = viewSessionRef.current;
      if (held?.taskId === taskId && held.sessionId) {
        void taskEndViewSession(taskId, { session_id: held.sessionId }).catch(() => {
          //
        });
      }
      viewSessionRef.current = null;
    };
  }, [viewTask]);

  const postponeMutation = useTaskUpdatePostpone({
    mutation: {
      onSuccess: () => {
        invalidateTasks();
      },
      onError: (error) => toastApiError(error),
    },
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TaskStoreBody>(() => emptyForm());
  const [selectedTipIds, setSelectedTipIds] = useState<string[]>([]);
  const [pendingPostpone, setPendingPostpone] = useState<{ task: TaskResource; to: KanbanColumnId } | null>(
    null,
  );
  const [postponeBusy, setPostponeBusy] = useState(false);
  const [savingTaskAndTips, setSavingTaskAndTips] = useState(false);

  const items = indexQuery.data?.data?.items ?? [];
  const pagination = indexQuery.data?.data?.pagination;

  const openViewTask = useCallback((task: TaskResource) => {
    setViewTask(task);
    setCreateOpen(false);
  }, []);

  const startEdit = useCallback((task: TaskResource) => {
    setViewTask(null);
    setEditingId(task.id);
    setCreateOpen(true);
    const { due_date, due_time } = taskDueParts(task);
    setForm({
      name: task.name,
      description: task.description,
      status: task.status,
      priority: String(task.priority),
      due_date,
      due_time,
    });
    setSelectedTipIds(parseEmbeddedTips(task.tips).map((x) => x.id));
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setForm(emptyForm());
    setSelectedTipIds([]);
    setCreateOpen(false);
  }, []);

  const openNewTaskDialog = useCallback(() => {
    setViewTask(null);
    setEditingId(null);
    setForm(emptyForm());
    setSelectedTipIds([]);
    setCreateOpen(true);
  }, []);

  useRegisterOpenNewTaskFromHeader(openNewTaskDialog);

  const applyKanbanMove = useCallback(
    async (task: TaskResource, to: KanbanColumnId) => {
      const from = getKanbanColumnId(task);
      if (from === to) return;
      let work: TaskResource = { ...task };

      if (to === "done") {
        await updateMutation.mutateAsync({
          id: work.id,
          data: taskToUpdateBody(work, { status: "completed" }),
        });
        return;
      }

      if (to === "progress") {
        if (work.status === "in_progress") return;
        await updateMutation.mutateAsync({
          id: work.id,
          data: taskToUpdateBody(work, { status: "in_progress" }),
        });
        return;
      }

      if (work.status === "completed") {
        const u = await updateMutation.mutateAsync({
          id: work.id,
          data: taskToUpdateBody(work, { status: "in_progress" }),
        });
        if (u.success && u.data) work = u.data;
      }

      const want = targetPostponedCountForColumn(to);
      const eff = work.status === "postponed" ? Math.max(0, work.postponed_count) : 0;
      let need = want - eff;

      if (need < 0) {
        const u = await updateMutation.mutateAsync({
          id: work.id,
          data: taskToUpdateBody(work, { status: "in_progress" }),
        });
        if (u.success && u.data) work = u.data;
        const eff2 = work.status === "postponed" ? Math.max(0, work.postponed_count) : 0;
        need = want - eff2;
      }

      for (let i = 0; i < need; i += 1) {
        const due = nextPostponeDueDate(work);
        const p = await postponeMutation.mutateAsync({
          id: work.id,
          data: { current_due_date: due },
        });
        if (p.success && p.data) {
          work = applyPostponedResponse(
            work,
            p.data as {
              priority: number;
              current_due_date: string;
              postponed_count: number;
              status: string;
            } & Record<string, unknown>,
          );
        }
      }
    },
    [postponeMutation, updateMutation],
  );

  const moveTaskOnBoard = useCallback(
    async (task: TaskResource, to: KanbanColumnId) => {
      const from = getKanbanColumnId(task);
      if (from === to) return;

      if (task.status === "in_progress" && (to === "p1" || to === "p2" || to === "p3")) {
        setPendingPostpone({ task, to });
        return;
      }

      await applyKanbanMove(task, to);
    },
    [applyKanbanMove],
  );

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTaskAndTips(true);
    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          data: {
            name: form.name,
            description: form.description,
            status: form.status,
            priority: "1",
            due_date: form.due_date,
            due_time: form.due_time,
          },
        });
        try {
          await assignTaskTipIds(editingId, selectedTipIds);
        } catch (err) {
          toastApiError(err, "Tarefa guardada, mas falhou associar tipos.");
          return;
        }
        setForm(emptyForm());
        setEditingId(null);
        setSelectedTipIds([]);
        setCreateOpen(false);
        return;
      }

      // INJETANDO PRIORIDADE 1 NA CRIAÇÃO
      const payloadComPrioridade = { ...form, priority: "1" };
      const res = await storeMutation.mutateAsync({ data: payloadComPrioridade });
      
      const newId = res.success && res.data?.id ? res.data.id : null;
      if (newId) {
        try {
          await assignTaskTipIds(newId, selectedTipIds);
        } catch (err) {
          toastApiError(err, "Tarefa criada, mas falhou associar tipos.");
          return;
        }
      }
      setForm(emptyForm());
      setEditingId(null);
      setSelectedTipIds([]);
      setCreateOpen(false);
    } finally {
      setSavingTaskAndTips(false);
    }
  };

  const toggleComplete = useCallback(
    (task: TaskResource) => {
      const next = task.status === "completed" ? "in_progress" : "completed";
      updateMutation.mutate({
        id: task.id,
        data: taskToUpdateBody(task, { status: next }),
      });
    },
    [updateMutation],
  );

  const handleDelete = useCallback(
    (task: TaskResource) => {
      deleteMutation.mutate({ id: task.id });
    },
    [deleteMutation],
  );

  const busy =
    storeMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    postponeMutation.isPending ||
    savingTaskAndTips ||
    postponeBusy;

  const formTitle = editingId ? "Editar tarefa" : "Nova tarefa";
  const formDesc = editingId ? "Atualize os campos e salve." : "Preencha para criar uma nova tarefa.";

  const postponeColumnTitle = pendingPostpone
    ? (KANBAN_COLUMNS.find((c) => c.id === pendingPostpone.to)?.title ?? "Coluna de adiamento")
    : "";

  const boardShellClass =
    "w-full bg-background ";

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-background">
      <section className="w-full px-0 pb-6" aria-label="Quadro de tarefas">
        {indexQuery.isLoading ? (
          <div className={`${boardShellClass} flex flex-col items-center justify-center gap-3 py-20`}>
            <Loader2 className="h-9 w-9 animate-spin text-muted-foreground" aria-hidden />
            <p className="text-sm text-muted-foreground">Carregando o quadro…</p>
          </div>
        ) : indexQuery.isError ? (
          <div className={boardShellClass}>
            <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
              <p className="text-sm text-muted-foreground">
                Não foi possível carregar as tarefas. Veja a notificação acima.
              </p>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="my-2 rounded-2xl border border-dashed bg-muted/20 px-6 py-10 text-center sm:my-3">
            <p className="text-sm font-medium text-foreground/80">Nenhuma tarefa ainda nesta página.</p>
            <p className="mt-1 text-xs text-muted-foreground">Crie uma tarefa ou avance páginas se existirem mais.</p>
          </div>
        ) : (
          <div className={boardShellClass}>
            <TaskKanbanBoard
              tasks={items}
              busy={busy}
              isLoading={false}
              onView={openViewTask}
              onEdit={startEdit}
              onDelete={handleDelete}
              onToggleComplete={toggleComplete}
              onMove={moveTaskOnBoard}
            />
          </div>
        )}
      </section>
      <div className="self-end gap-3 sm:gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs text-muted-foreground">
            {pagination
              ? `${pagination.total} no quadro (página ${pagination.current_page} de ${pagination.last_page})`
              : indexQuery.isLoading
                ? "Carregando…"
                : ""}
          </p>
        </div>
      </div>
      {pagination && pagination.last_page > 1 ? (
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2 border-t border-border px-4 py-3 sm:px-6 lg:px-8">
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

      <div className="mx-auto w-full max-w-7xl px-4 pb-6 sm:px-6 sm:pb-8 lg:px-8">
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
                    Somente leitura.
                    {taskQualifiesForViewSession(viewTask)
                      ? " O tempo neste painel conta para suas estatísticas de foco na tarefa."
                      : " Tarefas concluídas não registram novo tempo de visualização."}
                  </DialogDescription>
                </DialogHeader>
                <div className="max-h-[min(60vh,420px)] space-y-4 overflow-y-auto px-6 py-4">
                  <div>
                    <p className="text-xs font-medium uppercase text-muted-foreground">Descrição</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground">{viewTask.description}</p>
                  </div>
                  <dl className="grid gap-2 text-sm">
                    <div className="flex flex-wrap justify-between gap-2">
                      <dt className="text-muted-foreground">Status</dt>
                      <dd className="font-medium">{statusLabel(viewTask.status)}</dd>
                    </div>
                    <div className="flex flex-wrap justify-between gap-2">
                      <dt className="text-muted-foreground">Prioridade</dt>
                      <dd className="font-mono font-medium">{viewTask.priority}</dd>
                    </div>
                    {viewTask.current_due_date ? (
                      <div className="flex flex-wrap justify-between gap-2">
                        <dt className="text-muted-foreground">Prazo atual</dt>
                        <dd className="font-mono text-xs">{viewTask.current_due_date.slice(0, 10)}</dd>
                      </div>
                    ) : null}
                    {viewTask.created_at ? (
                      <div className="flex flex-wrap justify-between gap-2">
                        <dt className="text-muted-foreground">Criada</dt>
                        <dd className="font-mono text-xs">{formatTaskDateTime(viewTask.created_at)}</dd>
                      </div>
                    ) : null}
                    {viewTask.updated_at ? (
                      <div className="flex flex-wrap justify-between gap-2">
                        <dt className="text-muted-foreground">Atualizada</dt>
                        <dd className="font-mono text-xs">{formatTaskDateTime(viewTask.updated_at)}</dd>
                      </div>
                    ) : null}
                  </dl>
                </div>
              </>
            ) : null}
          </DialogContent>
        </Dialog>

        <Dialog
          open={createOpen}
          onOpenChange={(open) => {
            if (!open) cancelEdit();
          }}
        >
          <DialogContent className="gap-0 p-0 sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{formTitle}</DialogTitle>
              <DialogDescription>{formDesc}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="flex max-h-[min(70vh,560px)] flex-col">
              <div className="space-y-4 overflow-y-auto px-6 py-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="task-name">Nome</FieldLabel>
                    <FieldContent>
                      <Input
                        id="task-name"
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        required
                        className="rounded-xl"
                      />
                    </FieldContent>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="task-desc">Descrição</FieldLabel>
                    <FieldContent>
                      <textarea
                        id="task-desc"
                        className={cn(inputClass, "min-h-24 rounded-xl")}
                        value={form.description}
                        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                        required
                      />
                    </FieldContent>
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Field>
                      <FieldLabel htmlFor="task-status">Status</FieldLabel>
                      <FieldContent>
                        <select
                          id="task-status"
                          className={cn(inputClass, "rounded-xl")}
                          value={form.status}
                          onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                        >
                          {STATUS_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </FieldContent>
                    </Field>
                    {/**
                     * <Field>
                      <FieldLabel htmlFor="task-priority">Prioridade</FieldLabel>
                      <FieldContent>
                        <select
                          id="task-priority"
                          className={cn(inputClass, "rounded-xl")}
                          value={form.priority}
                          onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                        >
                          {PRIORITY_OPTIONS.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      </FieldContent>
                    </Field>
                     */}
                    <Field>
                      <FieldLabel htmlFor="task-due">Prazo (data)</FieldLabel>
                      <FieldContent>
                        <Input
                          id="task-due"
                          value={form.due_date}
                          onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
                          placeholder="DD-MM-AAAA"
                          required
                          className="rounded-xl"
                        />
                      </FieldContent>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="task-due-time">Hora</FieldLabel>
                      <FieldContent>
                        <Input
                          id="task-due-time"
                          type="time"
                          value={form.due_time}
                          onChange={(e) => setForm((f) => ({ ...f, due_time: e.target.value }))}
                          required
                          className="rounded-xl"
                        />
                      </FieldContent>
                    </Field>
                  </div>
                  <TaskFormTipsPicker selectedIds={selectedTipIds} onChange={setSelectedTipIds} disabled={busy} />
                </FieldGroup>
              </div>
              <DialogFooter className="gap-2 sm:gap-2">
                <Button type="button" variant="outline" className="rounded-full" onClick={cancelEdit} disabled={busy}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={busy} className="rounded-full">
                  {savingTaskAndTips ? (
                    <>
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                      A guardar…
                    </>
                  ) : editingId ? (
                    "Salvar alterações"
                  ) : (
                    "Criar tarefa"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog
          open={pendingPostpone != null}
          onOpenChange={(open) => {
            if (!open && !postponeBusy) setPendingPostpone(null);
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirmar adiamento</DialogTitle>
              <DialogDescription asChild>
                <div className="space-y-2 text-muted-foreground">
                  <p>
                    A tarefa <span className="font-medium text-foreground">&quot;{pendingPostpone?.task.name}&quot;</span> está{" "}
                    <span className="font-medium text-foreground">em progresso</span>. Ao mover para{" "}
                    <span className="font-medium text-foreground">{postponeColumnTitle}</span>, o estado passa a{" "}
                    <span className="font-medium text-foreground">Adiada</span> e o prazo atual é prolongado segundo as regras do
                    quadro (até ao limite de adiamentos).
                  </p>
                </div>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                disabled={postponeBusy}
                onClick={() => {
                  if (!postponeBusy) setPendingPostpone(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                className="rounded-full gap-2"
                disabled={postponeBusy}
                onClick={() => {
                  const p = pendingPostpone;
                  if (!p) return;
                  setPostponeBusy(true);
                  void (async () => {
                    try {
                      await applyKanbanMove(p.task, p.to);
                    } finally {
                      setPostponeBusy(false);
                      setPendingPostpone(null);
                    }
                  })();
                }}
              >
                {postponeBusy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                Confirmar adiamento
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
    </main>
  );
}
