import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Loader2, Pencil, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { getRouteApi, useNavigate } from "@tanstack/react-router";

import {
  emptyForm,
  FILTER_TABS,
  formatTaskDateTime,
  inputClass,
  parseEmbeddedTips,
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
  type TaskFilterTabId,
  statusLabel,
  taskDueParts,
  canEditTaskDueDateInForm,
} from "@/components/tasks/task-ui-constants";
import {
  useRegisterOpenNewTaskFromHeader,
  useTasksNewTaskHeader,
} from "@/components/tasks/tasks-new-task-context";
import { TaskFormDueFields } from "@/components/tasks/task-form-due-fields";
import { TaskFormTipsPicker } from "@/components/tasks/task-form-tips-picker";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TaskResource } from "@/generated/api/models";
import type { TaskStoreBody } from "@/generated/api/models/taskStoreBody";
import {
  useTaskDelete,
  useTaskIndex,
  useTaskStore,
  useTaskUpdate,
} from "@/generated/api/task/task";
import { useTipIndex } from "@/generated/api/tip/tip";
import { toast, toastApiError, toastApiSuccessFromBody } from "@/lib/api-toast";
import { apiClient } from "@/lib/api-client";
import { assignTaskTipIds } from "@/lib/task-assign-tips";
import { readTasksAllPerPage, writeTasksAllPerPage } from "@/lib/tasks-all-pagination-cache";
import { tipListFromIndexPayload } from "@/lib/tip-index-normalize";
import { cn } from "@/lib/utils";

const tasksAllRouteApi = getRouteApi("/tasks/all");

const PER_PAGE_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

export function TasksAllPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(() => readTasksAllPerPage(PER_PAGE_OPTIONS));
  const [filterTab, setFilterTab] = useState<TaskFilterTabId>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [tipFilter, setTipFilter] = useState<string>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [viewTask, setViewTask] = useState<TaskResource | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TaskStoreBody>(() => emptyForm());
  const [selectedTipIds, setSelectedTipIds] = useState<string[]>([]);
  const [savingTaskAndTips, setSavingTaskAndTips] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => window.clearTimeout(id);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filterTab, tipFilter, perPage]);

  const invalidateTasks = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["/api/task"] });
  }, [queryClient]);

  const indexParams = useMemo(
    () =>
      ({
        page,
        per_page: perPage,
        ...(debouncedSearch.length > 0 ? { search: debouncedSearch } : {}),
        ...(filterTab !== "all" ? { status: filterTab } : {}),
        ...(tipFilter !== "all" ? { tip_id: tipFilter } : {}),
      }) as const,
    [page, perPage, debouncedSearch, filterTab, tipFilter],
  );

  const indexQuery = useTaskIndex(indexParams);

  const tipsQuery = useTipIndex({ per_page: 100, page: 1 });

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

  const items = indexQuery.data?.data?.items ?? [];
  const pagination = indexQuery.data?.data?.pagination;
  const tipItems = tipListFromIndexPayload(tipsQuery.data?.data);

  const busy = storeMutation.isPending || updateMutation.isPending || deleteMutation.isPending || savingTaskAndTips;

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setForm(emptyForm());
    setSelectedTipIds([]);
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

  const openNewTaskDialog = useCallback(() => {
    setViewTask(null);
    setEditingId(null);
    setForm(emptyForm());
    setSelectedTipIds([]);
    setCreateOpen(true);
  }, []);

  useRegisterOpenNewTaskFromHeader(openNewTaskDialog);

  const { beginNewTaskFlow } = useTasksNewTaskHeader();

  const { newTask } = tasksAllRouteApi.useSearch();

  useEffect(() => {
    if (!newTask) return;
    beginNewTaskFlow();
    void navigate({
      replace: true,
      to: "/tasks/all",
      search: { newTask: false },
    });
  }, [newTask, navigate, beginNewTaskFlow]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSavingTaskAndTips(true);
    try {
      if (editingId) {
        const due = dueDateEditable
          ? { due_date: form.due_date, due_time: form.due_time }
          : taskDueParts(editingTask ?? items.find((t) => t.id === editingId)!);
        await updateMutation.mutateAsync({
          id: editingId,
          data: {
            name: form.name,
            description: form.description,
            status: form.status,
            priority: form.priority,
            due_date: due.due_date,
            due_time: due.due_time,
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

      const res = await storeMutation.mutateAsync({ data: form });
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

  const formTitle = editingId ? "Editar tarefa" : "Nova tarefa";
  const formDesc = editingId ? "Atualize os campos e salve." : "Preencha para criar uma nova tarefa.";
  const editingTask = editingId ? items.find((t) => t.id === editingId) : undefined;
  const dueDateEditable = canEditTaskDueDateInForm(form.status);

  return (
    <main className="flex min-h-0 flex-1 flex-col gap-6 bg-background">
      <div className="rounded-xl bg-muted/45 ">
        <label className="sr-only" htmlFor="task-all-search">
          Buscar tarefas
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="task-all-search"
            placeholder="Buscar por nome ou descrição…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 rounded-lg border-0 bg-transparent pl-10 shadow-none ring-offset-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0"
          />
        </div>
      </div>
      <div className="grid grid-cols-2">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filtrar por status">
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
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[12rem] flex-1 space-y-1.5">
            <Select value={tipFilter} onValueChange={setTipFilter}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {tipItems.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    <span className="flex items-center gap-2">
                      <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: t.color }} />
                      {t.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
     
      <section className="min-h-0 flex-1">
        {indexQuery.isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border/40 py-20">
            <Loader2 className="h-9 w-9 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Carregando a lista de tarefas…</p>
          </div>
        ) : indexQuery.isError ? (
          <p className="text-sm text-muted-foreground">Não foi possível carregar. Veja a notificação.</p>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-muted/20 px-6 py-10 text-center">
            <p className="text-sm font-medium">Nenhuma tarefa neste filtro.</p>
            <p className="mt-1 text-xs text-muted-foreground">Ajuste busca, tipo ou status.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map((task) => (
              <li
                key={task.id}
                className={cn(
                  "flex cursor-pointer flex-col gap-3 rounded-xl border border-border/50 bg-card/40 px-4 py-3 outline-none transition-colors sm:flex-row sm:items-center sm:justify-between",
                  "hover:border-primary/30 hover:bg-accent/30 hover:shadow-sm",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                )}
                tabIndex={0}
                onClick={() => setViewTask(task)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setViewTask(task);
                  }
                }}
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
                        className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs"
                        style={{ borderColor: tip.color, color: tip.color }}
                      >
                        <span className="size-1.5 rounded-full" style={{ backgroundColor: tip.color }} />
                        {tip.name}
                      </span>
                    ))}
                  </div>
                  <p className="line-clamp-2 text-xs text-muted-foreground">{task.description}</p>
                  <p className="text-[11px] text-muted-foreground">
                    Prazo: {task.current_due_date?.slice(0, 10) ?? "—"} · Criada:{" "}
                    {task.created_at ? formatTaskDateTime(task.created_at) : "—"}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2" onClick={(event) => event.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="rounded-full gap-1"
                    onClick={() => startEdit(task)}
                    disabled={busy}
                  >
                    <Pencil className="size-3.5" />
                    Editar
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="rounded-full gap-1 border-destructive text-destructive hover:bg-destructive/10"
                    onClick={() => deleteMutation.mutate({ id: task.id })}
                    disabled={busy || deleteMutation.isPending}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/50 bg-muted/20 px-3 py-2.5 sm:px-4">
        <p className="text-xs text-muted-foreground">
          {indexQuery.isLoading
            ? "Carregando…"
            : pagination
              ? `${pagination.total} tarefa(s) ativa(s) · ${perPage} por página · página ${pagination.current_page} de ${pagination.last_page}`
              : ""}
        </p>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <label className="whitespace-nowrap text-xs font-medium text-muted-foreground" htmlFor="task-all-per-page">
              Por página
            </label>
            <Select
              value={String(perPage)}
              onValueChange={(v) => {
                const next = Number(v);
                setPerPage(next);
                writeTasksAllPerPage(next);
              }}
            >
              <SelectTrigger id="task-all-per-page" className="h-8 w-[4.75rem] rounded-lg text-xs" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {PER_PAGE_OPTIONS.map((n) => (
                  <SelectItem key={n} value={String(n)} className="text-xs">
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {pagination && pagination.total > 0 ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full gap-1 px-3"
                disabled={pagination.current_page <= 1 || indexQuery.isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                aria-label="Página anterior"
              >
                <ChevronLeft className="size-4" aria-hidden />
                <span className="hidden sm:inline">Anterior</span>
              </Button>
              <span className="min-w-[3.5rem] text-center text-xs tabular-nums text-muted-foreground sm:min-w-[4rem]">
                {pagination.current_page}/{pagination.last_page}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full gap-1 px-3"
                disabled={pagination.current_page >= pagination.last_page || indexQuery.isFetching}
                onClick={() => setPage((p) => Math.min(pagination.last_page, p + 1))}
                aria-label="Próxima página"
              >
                <span className="hidden sm:inline">Próxima</span>
                <ChevronRight className="size-4" aria-hidden />
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      <Dialog open={viewTask != null} onOpenChange={(open) => !open && setViewTask(null)}>
        <DialogContent className="gap-0 p-0 sm:max-w-lg" showClose>
          {viewTask ? (
            <>
              <DialogHeader>
                <DialogTitle className="pr-2">{viewTask.name}</DialogTitle>
                <DialogDescription>Somente leitura.</DialogDescription>
              </DialogHeader>
              <div className="max-h-[min(60vh,420px)] space-y-4 overflow-y-auto px-6 py-4">
                <p className="whitespace-pre-wrap text-sm">{viewTask.description}</p>
                <dl className="grid gap-2 text-sm">
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Status</dt>
                    <dd>{statusLabel(viewTask.status)}</dd>
                  </div>
                  {/**
                   * <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Prioridade</dt>
                    <dd className="font-mono">{viewTask.priority}</dd>
                  </div>
                   */} 
                </dl>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={createOpen} onOpenChange={(open) => !open && cancelEdit()}>
        <DialogContent className="gap-0 p-0 sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{formTitle}</DialogTitle>
            <DialogDescription>{formDesc}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex max-h-[min(70vh,560px)] flex-col">
            <div className="space-y-4 overflow-y-auto px-6 py-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="all-task-name">Nome</FieldLabel>
                  <FieldContent>
                    <Input
                      id="all-task-name"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      required
                      className="rounded-xl"
                    />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="all-task-desc">Descrição</FieldLabel>
                  <FieldContent>
                    <textarea
                      id="all-task-desc"
                      className={cn(inputClass, "min-h-24 rounded-xl")}
                      value={form.description}
                      onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                      required
                    />
                  </FieldContent>
                </Field>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Field>
                    <FieldLabel>Status</FieldLabel>
                    <FieldContent>
                      <select
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
                  {/*
                  <Field>
                    <FieldLabel>Prioridade</FieldLabel>
                    <FieldContent>
                      <select
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
                  </Field> */}
                  <TaskFormDueFields
                    idPrefix="all-task"
                    dueDate={form.due_date}
                    dueTime={form.due_time}
                    editable={dueDateEditable}
                    busy={busy}
                    onDueDateChange={(value) => setForm((f) => ({ ...f, due_date: value }))}
                    onDueTimeChange={(value) => setForm((f) => ({ ...f, due_time: value }))}
                  />
                </div>
                <TaskFormTipsPicker selectedIds={selectedTipIds} onChange={setSelectedTipIds} disabled={busy} />
              </FieldGroup>
            </div>
            <DialogFooter className="gap-2 sm:gap-2">
              <Button type="button" variant="outline" className="rounded-full" onClick={cancelEdit} disabled={busy}>
                Cancelar
              </Button>
              <Button type="submit" disabled={busy} className="rounded-full">
                {editingId ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
