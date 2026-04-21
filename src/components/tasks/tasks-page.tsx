import { useQueryClient } from "@tanstack/react-query";
import { Check, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
import { useTaskDelete, useTaskIndex, useTaskStore, useTaskUpdate } from "@/generated/api/task/task";
import { toastApiError, toastApiSuccessFromBody, toastApiWarning } from "@/lib/api-toast";
import { cn } from "@/lib/utils";

const inputClass =
  "flex min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50";

const STATUS_OPTIONS = [
  { value: "in_progress", label: "Em progresso" },
  { value: "completed", label: "Concluída" },
  { value: "postponed", label: "Adiada" },
];

const PRIORITY_OPTIONS = ["1", "2", "3", "4", "5"];

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

function PriorityDots({ value }: { value: string }) {
  const n = Math.min(5, Math.max(1, Number.parseInt(value, 10) || 1));
  return (
    <div className="flex gap-1" aria-label={`Prioridade ${n} de 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={cn(
            "h-2 w-2 rounded-full transition-colors",
            i < n ? "bg-foreground/75" : "bg-muted-foreground/20",
          )}
        />
      ))}
    </div>
  );
}

type TaskCardProps = {
  task: TaskResource;
  busy: boolean;
  onToggleComplete: (task: TaskResource) => void;
  onEdit: (task: TaskResource) => void;
  onDelete: (task: TaskResource) => void;
};

function TaskCard({ task, busy, onToggleComplete, onEdit, onDelete }: TaskCardProps) {
  const done = task.status === "completed";
  const menuRef = useRef<HTMLDetailsElement>(null);

  const closeMenu = () => {
    if (menuRef.current) menuRef.current.open = false;
  };

  return (
    <li
      className={cn(
        "group flex gap-3 rounded-2xl border border-border/80 bg-card p-4 shadow-sm transition-[box-shadow,transform] hover:shadow-md",
        done && "bg-muted/30",
      )}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={done}
        disabled={busy}
        onClick={() => onToggleComplete(task)}
        className={cn(
          "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          done
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/35 bg-background hover:border-primary/60",
        )}
      >
        {done ? <Check className="h-4 w-4" strokeWidth={2.5} /> : null}
      </button>

      <div className="min-w-0 flex-1">
        <h3
          className={cn(
            "text-base font-semibold leading-snug tracking-tight",
            done && "text-muted-foreground line-through decoration-muted-foreground/60",
          )}
        >
          {task.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{task.description}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="rounded-full bg-muted/80 px-2 py-0.5 font-medium text-foreground/80">
            {statusLabel(task.status)}
          </span>
          {task.current_due_date ? (
            <span>
              Prazo:{" "}
              <span className="font-mono text-[0.7rem]">{task.current_due_date.slice(0, 10)}</span>
            </span>
          ) : null}
          {task.created_at ? (
            <span title={task.created_at}>
              Criada: <span className="font-mono text-[0.7rem]">{formatTaskDateTime(task.created_at)}</span>
            </span>
          ) : null}
          {task.updated_at ? (
            <span title={task.updated_at}>
              Atualizada: <span className="font-mono text-[0.7rem]">{formatTaskDateTime(task.updated_at)}</span>
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end justify-between gap-2 pl-1">
        <div className="flex items-center gap-1.5">
          <PriorityDots value={task.priority} />
        </div>

        <details ref={menuRef} className="relative text-right">
          <summary
            className="list-none cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground [&::-webkit-details-marker]:hidden"
            aria-label="Mais opções"
          >
            <MoreHorizontal className="h-5 w-5" />
          </summary>
          <div className="absolute right-0 z-20 mt-1 min-w-[148px] rounded-xl border border-border bg-popover p-1 shadow-lg">
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-accent"
              onClick={() => {
                closeMenu();
                onEdit(task);
              }}
            >
              <Pencil className="h-4 w-4 opacity-70" />
              Editar
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
              onClick={() => {
                closeMenu();
                if (window.confirm("Excluir esta tarefa?")) onDelete(task);
              }}
            >
              <Trash2 className="h-4 w-4" />
              Excluir
            </button>
          </div>
        </details>
      </div>
    </li>
  );
}

export function TasksPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [filterTab, setFilterTab] = useState<(typeof FILTER_TABS)[number]["id"]>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

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
      onSuccess: (res) => {
        toastApiSuccessFromBody(res, "Tarefa excluída.");
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

  const startEdit = useCallback((task: TaskResource) => {
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

  const handleDelete = useCallback(
    (task: TaskResource) => {
      deleteMutation.mutate({ id: task.id });
    },
    [deleteMutation],
  );

  const busy =
    storeMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const formTitle = editingId ? "Editar tarefa" : "Nova tarefa";
  const formDesc = editingId
    ? "Atualize os campos e salve."
    : "Preencha para criar uma nova tarefa.";

  return (
    <main className="min-h-full flex-1 bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 border-b border-border pb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Tarefas</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Organize o que importa — marque como concluída, filtre e busque.
            </p>
          </div>
        </header>

        <div className="flex w-full flex-col gap-8">
          <div className="rounded-2xl bg-muted/60 px-4 py-3 shadow-inner">
            <label className="sr-only" htmlFor="task-search">
              Buscar tarefas
            </label>
            <Input
              id="task-search"
              placeholder="Buscar por nome ou descrição…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 rounded-xl border-0 bg-background shadow-sm"
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
                setEditingId(null);
                setForm(emptyForm());
                setCreateOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Nova tarefa
            </Button>
          </div>

          <section aria-label="Lista de tarefas">
            {indexQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Carregando lista…</p>
            ) : indexQuery.isError ? (
              <p className="text-sm text-muted-foreground">
                Não foi possível carregar a lista. Veja a notificação acima.
              </p>
            ) : filteredItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed bg-muted/20 px-6 py-14 text-center">
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
              <ul className="flex flex-col gap-3">
                {filteredItems.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    busy={busy}
                    onToggleComplete={toggleComplete}
                    onEdit={startEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </ul>
            )}
          </section>

          {pagination && pagination.last_page > 1 ? (
            <div className="flex items-center justify-between gap-2 border-t border-border pt-4">
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
