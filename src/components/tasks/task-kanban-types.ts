import type { TaskResource } from "@/generated/api/models";

export type KanbanColumnId = "progress" | "p1" | "p2" | "p3" | "done";

export const KANBAN_COLUMNS: {
  id: KanbanColumnId;
  title: string;
  description: string;
}[] = [
  { id: "progress", title: "Em progresso", description: "Prazo e trabalho ativo" },
  { id: "p1", title: "1.º adiamento", description: "Primeiro adiamento" },
  { id: "p2", title: "2.º adiamento", description: "Segundo adiamento" },
  { id: "p3", title: "3.º adiamento", description: "Terceiro adiamento" },
  { id: "done", title: "Concluída", description: "Tarefas concluídas" },
];

export function getKanbanColumnId(task: TaskResource): KanbanColumnId {
  if (task.status === "completed") return "done";
  if (task.status === "in_progress") return "progress";
  if (task.status === "postponed") {
    const c = task.postponed_count ?? 0;
    if (c <= 1) return "p1";
    if (c === 2) return "p2";
    return "p3";
  }
  return "progress";
}
