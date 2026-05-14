import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  defaultDropAnimationSideEffects,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DropAnimation,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Link } from "@tanstack/react-router";
import { ChevronRight, CircleCheck, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useMemo, useRef, useState, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import type { TaskResource } from "@/generated/api/models";

import { getKanbanColumnId, KANBAN_COLUMNS, type KanbanColumnId } from "./task-kanban-types";

const DONE_PREVIEW_MAX = 3;

function sortDoneByCompletedDesc(list: TaskResource[]): TaskResource[] {
  return [...list].sort((a, b) => {
    const ta = a.completed_at || a.updated_at;
    const tb = b.completed_at || b.updated_at;
    return String(tb).localeCompare(String(ta));
  });
}

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: { active: { opacity: "0.5" } },
  }),
};

function formatShortDate(iso: string): string {
  return iso.slice(0, 10);
}

function partitionByColumn(tasks: TaskResource[]): Record<KanbanColumnId, TaskResource[]> {
  const out: Record<KanbanColumnId, TaskResource[]> = {
    progress: [],
    p1: [],
    p2: [],
    p3: [],
    done: [],
  };
  for (const t of tasks) {
    out[getKanbanColumnId(t)].push(t);
  }
  return out;
}

type TaskCardVisualProps = {
  task: TaskResource;
  busy: boolean;
  style?: CSSProperties;
  dragHandleProps?: HTMLAttributes<HTMLButtonElement>;
  isOverlay?: boolean;
  onToggleComplete: (task: TaskResource) => void;
  onView: (task: TaskResource) => void;
  onEdit: (task: TaskResource) => void;
  onRequestDelete: (task: TaskResource) => void;
};

function TaskCardVisual({
  task,
  busy,
  style,
  dragHandleProps,
  isOverlay,
  onToggleComplete,
  onView,
  onEdit,
  onRequestDelete,
}: TaskCardVisualProps) {
  const done = task.status === "completed";
  const menuRef = useRef<HTMLDetailsElement>(null);
  const closeMenu = () => {
    if (menuRef.current) menuRef.current.open = false;
  };

  return (
    <div style={style}>
      <div
        className={cn(
          "group rounded-xl border border-border/80 bg-card p-2.5 shadow-sm transition-shadow",
          !isOverlay && "hover:border-primary/30 hover:shadow-md",
          isOverlay && "scale-[1.02] cursor-grabbing shadow-lg ring-2 ring-primary/25",
        )}
        onClick={() => {
          if (!isOverlay) onView(task);
        }}
        role="button"
        tabIndex={isOverlay ? -1 : 0}
        title="Clique para detalhes — arrasta pelo canto"
      >
        <div className="flex gap-2">
          <button
            type="button"
            className="mt-0.5 shrink-0 touch-none cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
            title="Arrastar"
            onClick={(e) => e.stopPropagation()}
            {...dragHandleProps}
          >
            <span className="inline-block h-6 w-3 bg-[length:3px_3px] bg-repeat-y opacity-60 [background-image:radial-gradient(circle,currentColor_1px,transparent_1px)]" />
          </button>
          <div className="min-w-0 flex-1">
            <h3
              className={cn(
                "line-clamp-2 text-left text-sm font-semibold leading-snug",
                done && "text-muted-foreground line-through",
              )}
            >
              {task.name}
            </h3>
            {task.postponed_count > 0 ? (
              <div className="mt-1.5 text-[0.65rem] text-muted-foreground">
                <span>Ad. {task.postponed_count}×</span>
              </div>
            ) : null}
            <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 font-mono text-[0.6rem] text-muted-foreground">
              {task.original_due_date ? <span>Orig.: {formatShortDate(task.original_due_date)}</span> : null}
              {task.current_due_date ? <span>Atual: {formatShortDate(task.current_due_date)}</span> : null}
            </div>
          </div>
          <div className="shrink-0 self-start" onClick={(e) => e.stopPropagation()}>
            <details ref={menuRef} className="relative">
              <summary
                className="list-none cursor-pointer rounded p-1 text-muted-foreground hover:bg-muted [&::-webkit-details-marker]:hidden"
                aria-label="Mais"
              >
                <MoreHorizontal className="h-4 w-4" />
              </summary>
              <div className="absolute right-0 z-20 mt-1 min-w-[140px] rounded-lg border border-border bg-popover p-1 text-left text-sm shadow-md">
                <button
                  type="button"
                  className="flex w-full items-center gap-1.5 rounded px-2 py-1.5 hover:bg-accent disabled:opacity-50"
                  disabled={busy}
                  onClick={() => {
                    closeMenu();
                    onToggleComplete(task);
                  }}
                >
                  <CircleCheck className="h-3.5 w-3.5" />
                  {done ? "Reabrir" : "Concluir"}
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-1.5 rounded px-2 py-1.5 hover:bg-accent"
                  onClick={() => {
                    closeMenu();
                    onEdit(task);
                  }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Editar
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-1.5 rounded px-2 py-1.5 text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    closeMenu();
                    onRequestDelete(task);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Excluir
                </button>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}

function DraggableTaskCard(
  props: Omit<TaskCardVisualProps, "style" | "dragHandleProps" | "isOverlay">,
) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: props.task.id,
    data: { type: "task", task: props.task },
  });

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.45 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      className="w-[11rem] min-w-0 max-w-full shrink-0 sm:w-44"
    >
      <TaskCardVisual
        {...props}
        style={style}
        dragHandleProps={listeners as HTMLAttributes<HTMLButtonElement>}
      />
    </div>
  );
}

function KanbanSwimLane({
  col,
  children,
  count,
  isEmpty,
  endSlot,
}: {
  col: (typeof KANBAN_COLUMNS)[number];
  children: ReactNode;
  count: number;
  isEmpty: boolean;
  endSlot?: ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id, data: { type: "column" } });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-full min-w-0 flex-col gap-0 rounded-xl border border-border/50 bg-muted/20 sm:flex-row sm:items-stretch",
        isOver && "border-primary/45 bg-primary/[0.06] ring-1 ring-primary/20",
      )}
    >
      <div className="flex shrink-0 flex-col justify-center gap-0.5 border-border/30 px-2.5 py-2 sm:w-40 sm:border-r sm:py-2.5 md:w-44">
        <div className="flex items-baseline justify-between gap-1 sm:justify-start sm:gap-2">
          <h2 className="text-left text-sm font-semibold leading-tight text-foreground">{col.title}</h2>
          <span className="rounded-full bg-background/80 px-1.5 py-0.5 font-mono text-[0.7rem] text-muted-foreground">
            {count}
          </span>
        </div>
        <p className="line-clamp-2 text-[0.65rem] leading-snug text-muted-foreground">{col.description}</p>
      </div>
      <div className="min-h-[5.25rem] min-w-0 flex-1 p-1.5 pt-0 sm:min-h-0 sm:py-2 sm:pl-1.5">
        {isEmpty ? (
          <div className="text-muted-foreground/70 flex h-full min-h-[4.5rem] w-full min-w-0 items-center justify-center rounded-lg border border-dashed border-border/50 px-2 text-center text-[0.65rem] sm:min-w-[8rem]">
            Arraste tarefas para aqui
          </div>
        ) : (
          <div className="flex w-full min-w-0 flex-row flex-wrap content-start items-stretch gap-2">
            {children}
            {endSlot}
          </div>
        )}
      </div>
    </div>
  );
}

type TaskKanbanBoardProps = {
  tasks: TaskResource[];
  busy: boolean;
  isLoading: boolean;
  onView: (task: TaskResource) => void;
  onEdit: (task: TaskResource) => void;
  onDelete: (task: TaskResource) => void;
  onToggleComplete: (task: TaskResource) => void;
  onMove: (task: TaskResource, to: KanbanColumnId) => Promise<void>;
};

function resolveDropColumn(overId: UniqueIdentifier, taskMap: Map<string, TaskResource>): KanbanColumnId | null {
  const s = String(overId);
  if (KANBAN_COLUMNS.some((c) => c.id === s)) {
    return s as KanbanColumnId;
  }
  const t = taskMap.get(s);
  if (t) return getKanbanColumnId(t);
  return null;
}

export function TaskKanbanBoard({
  tasks,
  busy,
  isLoading,
  onView,
  onEdit,
  onDelete,
  onToggleComplete,
  onMove,
}: TaskKanbanBoardProps) {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [pendingDelete, setPendingDelete] = useState<TaskResource | null>(null);
  const byColumn = useMemo(() => partitionByColumn(tasks), [tasks]);
  const taskMap = useMemo(() => new Map(tasks.map((t) => [t.id, t])), [tasks]);
  const activeTask = activeId != null ? taskMap.get(String(activeId)) : undefined;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;
    const task = taskMap.get(String(active.id));
    if (!task) return;
    const from = getKanbanColumnId(task);
    const to = resolveDropColumn(over.id, taskMap);
    if (to == null || from === to) return;
    try {
      await onMove(task, to);
    } catch {
      /* toasts in parent */
    }
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Carregando o quadro…</p>;
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed bg-muted/20 px-6 py-12 text-center">
        <p className="text-sm font-medium">Nenhuma tarefa.</p>
        <p className="mt-1 text-xs text-muted-foreground">Cria uma tarefa ou ajusta a pesquisa.</p>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-full flex-col">
      <DndContext
        sensors={sensors}
        onDragStart={({ active }) => setActiveId(active.id)}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div className="flex w-full flex-col gap-2 pb-1">
          {KANBAN_COLUMNS.map((col) => {
            const raw = byColumn[col.id];
            const list = col.id === "done" ? sortDoneByCompletedDesc(raw) : raw;
            const visible = col.id === "done" ? list.slice(0, DONE_PREVIEW_MAX) : list;
            const showVerMais = col.id === "done" && list.length > DONE_PREVIEW_MAX;
            return (
              <KanbanSwimLane
                key={col.id}
                col={col}
                count={list.length}
                isEmpty={list.length === 0}
                endSlot={
                  showVerMais ? (
                    <Link
                      to="/tasks/completed"
                      className="text-primary hover:text-primary/90 group flex w-[11rem] min-w-0 max-w-full shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl border border-dashed border-primary/40 bg-primary/[0.04] p-2.5 text-sm font-medium transition-colors hover:bg-primary/10 sm:w-44"
                    >
                      <span className="inline-flex items-center gap-0.5">
                        Ver mais
                        <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.5} />
                      </span>
                      <span className="text-center text-[0.65rem] font-normal text-muted-foreground group-hover:text-muted-foreground/90">
                        +{list.length - DONE_PREVIEW_MAX}{" "}
                        {list.length - DONE_PREVIEW_MAX === 1 ? "tarefa" : "tarefas"}
                      </span>
                    </Link>
                  ) : null
                }
              >
                {visible.map((t) => (
                  <DraggableTaskCard
                    key={t.id}
                    task={t}
                    busy={busy}
                    onView={onView}
                    onEdit={onEdit}
                    onRequestDelete={setPendingDelete}
                    onToggleComplete={onToggleComplete}
                  />
                ))}
              </KanbanSwimLane>
            );
          })}
        </div>
      <DragOverlay dropAnimation={dropAnimation}>
        {activeTask ? (
          <TaskCardVisual
            task={activeTask}
            busy={busy}
            isOverlay
            onView={() => {}}
            onEdit={() => {}}
            onRequestDelete={() => {}}
            onToggleComplete={() => {}}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
      <AlertDialog
        open={pendingDelete != null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir tarefa?</AlertDialogTitle>
            <AlertDialogDescription>
              Isto remove “{pendingDelete?.name ?? ""}”.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              type="button"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (pendingDelete) onDelete(pendingDelete);
                setPendingDelete(null);
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
