import type { TaskResource } from "@/generated/api/models/taskResource";
import type { TaskStoreBody } from "@/generated/api/models/taskStoreBody";
import type { TaskUpdateBody } from "@/generated/api/models/taskUpdateBody";

export const inputClass =
  "flex min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50";

export const STATUS_OPTIONS = [
  { value: "in_progress", label: "Em progresso" },
  { value: "completed", label: "Concluída" },
  { value: "postponed", label: "Adiada" },
] as const;

export const PRIORITY_OPTIONS = ["1", "2", "3", "4", "5"];

export const FILTER_TABS = [
  { id: "all" as const, label: "Todas" },
  { id: "in_progress" as const, label: "Em progresso" },
  { id: "completed" as const, label: "Concluídas" },
  { id: "postponed" as const, label: "Adiadas" },
];

export type TaskFilterTabId = (typeof FILTER_TABS)[number]["id"];

export function statusLabel(status: string): string {
  return STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;
}

export function formatTaskDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 19).replace("T", " ");
  return d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

/** Normaliza `TaskResource.tips` (gerado como `unknown[]`) para exibição na UI. */
export function parseEmbeddedTips(
  tips: unknown[],
): Array<{ id: string; name: string; color: string }> {
  const out: Array<{ id: string; name: string; color: string }> = [];
  for (const t of tips) {
    if (!t || typeof t !== "object") continue;
    const o = t as Record<string, unknown>;
    if (typeof o.id === "string" && typeof o.name === "string" && typeof o.color === "string") {
      out.push({ id: o.id, name: o.name, color: o.color });
    }
  }
  return out;
}

export function emptyForm(): TaskStoreBody {
  const d = new Date();
  const due = `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
  return {
    name: "",
    description: "",
    status: "in_progress",
    priority: "2",
    due_date: due,
    due_time: "09:00",
  };
}

/** Extrai `due_date` (DD-MM-AAAA) e `due_time` (HH:MM) a partir da tarefa para formulários e PUT. */
export function taskDueParts(task: TaskResource): Pick<TaskStoreBody, "due_date" | "due_time"> {
  const raw = task.current_due_date || task.original_due_date || "";
  const fallback = emptyForm();
  if (!raw) {
    return { due_date: fallback.due_date, due_time: fallback.due_time };
  }
  if (raw.includes("T")) {
    const [datePart, rest] = raw.split("T");
    let due_date = fallback.due_date;
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
      const [y, m, d] = datePart.split("-");
      due_date = `${d}-${m}-${y}`;
    }
    let due_time = fallback.due_time;
    const hm = (rest ?? "").slice(0, 5);
    if (/^\d{2}:\d{2}$/.test(hm)) {
      due_time = hm;
    }
    return { due_date, due_time };
  }
  const iso = raw.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [y, m, d] = iso.split("-");
    return { due_date: `${d}-${m}-${y}`, due_time: fallback.due_time };
  }
  if (/^\d{2}-\d{2}-\d{4}$/.test(raw.slice(0, 10))) {
    return { due_date: raw.slice(0, 10), due_time: fallback.due_time };
  }
  return { due_date: fallback.due_date, due_time: fallback.due_time };
}

export function taskToUpdateBody(task: TaskResource, patch: Partial<TaskUpdateBody> = {}): TaskUpdateBody {
  const parts = taskDueParts(task);
  return {
    name: task.name,
    description: task.description,
    status: task.status,
    priority: String(task.priority),
    due_date: parts.due_date,
    due_time: parts.due_time,
    ...patch,
  };
}
