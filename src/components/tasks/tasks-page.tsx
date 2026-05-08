import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { TaskKanbanBoard } from "@/components/tasks/task-kanban-board";
import { getKanbanColumnId, type KanbanColumnId } from "@/components/tasks/task-kanban-types";
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
import {
  toast,
  toastApiError,
  toastApiSuccessFromBody,
  toastApiWarning,
} from "@/lib/api-toast";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";

const inputClass =
  "flex min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50";

const STATUS_OPTIONS = [
  { value: "in_progress", label: "Em progresso" },
  { value: "completed", label: "Concluída" },
  { value: "postponed", label: "Adiada" },
];

const PRIORITY_OPTIONS = ["1", "2", "3", "4", "5"];

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
  data: { priority: number | string; current_due_date: string; postponed_count: number; status: string } & Record<string, unknown>,
): TaskResource {
  return { ...work, ...data, priority: String(data.priority) } as TaskResource;
}

function targetPostponedCountForColumn(to: "p1" | "p2" | "p3"): 1 | 2 | 3 {
  if (to === "p1") return 1;
  if (to === "p2") return 2;
  return 3;
}

const FILTER_TABS = [
  { id: "all" as const, label: "Todas" },
  { id: "in_progress" as const, label: "Em progresso" },
  { id: "completed" as const, label: "Concluídas" },
  { id: "postponed" as const, label: "Adiadas" },
];

function statusLabel(status: string): string {
  return STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;
}

function formatTaskDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 19).replace("T", " ");
  return d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

/** Tarefas concluídas não abrem sessão nem acumulam novo tempo neste fluxo de visualização. */
function taskQualifiesForViewSession(task: TaskResource): boolean {
  return task.status !== "completed" && (task.completed_at == null || task.completed_at === "");
}

function emptyForm(): TaskStoreBody {
  const d = new Date();
  const due = `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
  return {
    name: "",
    description: "",
    status: "in_progress",
    priority: "2",
    due_date: due,
  };
}

export function TasksPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const perPage = 100;
  const [filterTab, setFilterTab] = useState<(typeof FILTER_TABS)[number]["id"]>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [viewTask, setViewTask] = useState<TaskResource | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => window.clearTimeout(id);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    setPage(1);
  }, [filterTab]);

  const invalidateTasks = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["/api/task"] });
  }, [queryClient]);

  const indexQuery = useTaskIndex(
    {
      page,
      per_page: perPage,
      ...(debouncedSearch.length > 0 ? { search: debouncedSearch } : {}),
    },
    {
      query: {
        onError: (error) => {
          toastApiError(error, "Não foi possível carregar as tarefas");
        },
        onSuccess: (res) => {
          if (res.success === false) {
            toastApiWarning(res.message ?? "A API indicou falha ao listar tarefas.");
          } else if (res.data == null) {
            toastApiWarning("Resposta sem dados de tarefas.");
          }
        },
      },
    },
  );

  const storeMutation = useTaskStore({
    mutation: {
      onSuccess: (res) => {
        toastApiSuccessFromBody(res, "Tarefa criada.");
        invalidateTasks();
        setForm(emptyForm());
        setEditingId(null);
        setCreateOpen(false);
      },
      onError: (error) => toastApiError(error),
    },
  });

  const updateMutation = useTaskUpdate({
    mutation: {
      onSuccess: (res) => {
        toastApiSuccessFromBody(res, "Tarefa atualizada.");
        invalidateTasks();
        setEditingId(null);
        setForm(emptyForm());
        setCreateOpen(false);
      },
      onError: (error) => toastApiError(error),
    },
  });

  const deleteMutation = useTaskDelete({
    mutation: {
      onSuccess: (_res, variables) => {
        const deletedId = variables.id;
        invalidateTasks();
        toast.success("Tarefa excluída.", {
          duration: 10_000,
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

  const items = indexQuery.data?.data?.items ?? [];
  const pagination = indexQuery.data?.data?.pagination;

  const filteredItems = useMemo(() => {
    if (filterTab === "all") return items;
    return items.filter((t) => t.status === filterTab);
  }, [items, filterTab]);

  const openViewTask = useCallback((task: TaskResource) => {
    setViewTask(task);
    setCreateOpen(false);
  }, []);

  const startEdit = useCallback((task: TaskResource) => {
    setViewTask(null);
    setEditingId(task.id);
    setCreateOpen(true);
    const raw = task.current_due_date || task.original_due_date || "";
    let due = emptyForm().due_date;
    if (raw) {
      const iso = raw.slice(0, 10);
      if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
        const [y, m, d] = iso.split("-");
        due = `${d}-${m}-${y}`;
      } else if (raw.match(/^\d{2}-\d{2}-\d{4}$/)) {
        due = raw.slice(0, 10);
      }
    }
    setForm({
      name: task.name,
      description: task.description,
      status: task.status,
      priority: String(task.priority),
      due_date: due,
    });
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setForm(emptyForm());
    setCreateOpen(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        data: {
          name: form.name,
          description: form.description,
          status: form.status,
          priority: form.priority,
          current_due_date: form.due_date,
        },
      });
    } else {
      storeMutation.mutate({ data: form });
    }
  };

  const toggleComplete = useCallback(
    (task: TaskResource) => {
      const next = task.status === "completed" ? "in_progress" : "completed";
      updateMutation.mutate({
        id: task.id,
        data: { status: next },
      });
    },
    [updateMutation],
  );

  const moveTaskOnBoard = useCallback(
    async (task: TaskResource, to: KanbanColumnId) => {
      const from = getKanbanColumnId(task);
      if (from === to) return;
      let work: TaskResource = { ...task };

      if (to === "done") {
        await updateMutation.mutateAsync({ id: work.id, data: { status: "completed" } });
        return;
      }

      if (to === "progress") {
        if (work.status === "in_progress") return;
        await updateMutation.mutateAsync({ id: work.id, data: { status: "in_progress" } });
        return;
      }

      if (work.status === "completed") {
        const u = await updateMutation.mutateAsync({ id: work.id, data: { status: "in_progress" } });
        if (u.success && u.data) work = u.data;
      }

      const want = targetPostponedCountForColumn(to);
      const eff = work.status === "postponed" ? Math.max(0, work.postponed_count) : 0;
      let need = want - eff;

      if (need < 0) {
        const u = await updateMutation.mutateAsync({ id: work.id, data: { status: "in_progress" } });
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
          work = applyPostponedResponse(work, p.data as { priority: number; current_due_date: string; postponed_count: number; status: string } & Record<string, unknown>);
        }
      }
    },
    [postponeMutation, updateMutation],
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
    postponeMutation.isPending;

  const formTitle = editingId ? "Editar tarefa" : "Nova tarefa";
  const formDesc = editingId
    ? "Atualize os campos e salve."
    : "Preencha para criar uma nova tarefa.";

  const boardShellClass =
    "w-full rounded border border-border/30 bg-background px-4 py-3 sm:px-6 lg:px-8";

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="flex w-full flex-col gap-3 sm:gap-4">
          <div className="rounded-xl bg-muted/45 px-3 py-2 sm:px-3.5 sm:py-2.5">
            <label className="sr-only" htmlFor="task-search">
              Buscar tarefas
            </label>
            <Input
              id="task-search"
              placeholder="Buscar por nome ou descrição…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 rounded-lg border-0 bg-transparent shadow-none ring-offset-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0"
            />
          </div>

          <div
            className="flex flex-wrap gap-2"
            role="tablist"
            aria-label="Filtrar por status"
          >
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={filterTab === tab.id}
                onClick={() => setFilterTab(tab.id)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  filterTab === tab.id
                    ? "bg-foreground text-background"
                    : "bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {pagination
                ? `${pagination.total} tarefa(s) — página ${pagination.current_page} de ${pagination.last_page}`
                : indexQuery.isLoading
                  ? "Carregando…"
                  : ""}
            </p>
            <Button
              type="button"
              className="rounded-full gap-2"
              onClick={() => {
                setViewTask(null);
                setEditingId(null);
                setForm(emptyForm());
                setCreateOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Nova tarefa
            </Button>
          </div>
      </div>

      <section className="w-full px-0 pb-6" aria-label="Quadro de tarefas">
        {indexQuery.isLoading ? (
          <div className={`${boardShellClass} flex flex-col items-center justify-center gap-3 py-20`}>
            <Loader2 className="h-9 w-9 animate-spin text-muted-foreground" aria-hidden />
            <p className="text-sm text-muted-foreground">A carregar quadro…</p>
          </div>
        ) : indexQuery.isError ? (
          <div className={boardShellClass}>
            <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
              <p className="text-sm text-muted-foreground">
                Não foi possível carregar as tarefas. Veja a notificação acima.
              </p>
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="my-2 rounded-2xl border border-dashed bg-muted/20 px-6 py-10 text-center sm:my-3">
            <p className="text-sm font-medium text-foreground/80">
              {items.length === 0 ? "Nenhuma tarefa ainda." : "Nenhuma tarefa neste filtro."}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {items.length === 0
                ? "Crie uma tarefa ou ajuste a busca."
                : "Tente outro filtro ou limpe a busca."}
            </p>
          </div>
        ) : (
          <div className={boardShellClass}>
            <TaskKanbanBoard
              tasks={filteredItems}
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
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                      {viewTask.description}
                    </p>
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
                  <div className="grid gap-4 sm:grid-cols-3">
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
                    <Field>
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
                    <Field>
                      <FieldLabel htmlFor="task-due">Prazo</FieldLabel>
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
                  </div>
                </FieldGroup>
              </div>
              <DialogFooter className="gap-2 sm:gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  onClick={cancelEdit}
                  disabled={busy}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={busy} className="rounded-full">
                  {editingId ? "Salvar alterações" : "Criar tarefa"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
