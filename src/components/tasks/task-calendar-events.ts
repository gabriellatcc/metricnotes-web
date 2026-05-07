import { endOfDay, parseISO, startOfDay } from "date-fns";

import type { IUser, IEvent } from "@/components/ui/imported-calendar/interfaces";
import type { TEventColor } from "@/components/ui/imported-calendar/types";
import type { TaskResource } from "@/generated/api/models";

function parseDue(raw: string | null | undefined): Date | null {
  if (!raw || typeof raw !== "string" || raw.trim() === "") return null;
  const d = parseISO(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

function taskStatusColor(status: string): TEventColor {
  if (status === "completed") return "green";
  if (status === "postponed") return "orange";
  if (status === "canceled") return "red";
  return "blue";
}

/** Uma entrada por prazo atual ou original da tarefa (dia inteiro local). */
export function taskDueEventsForCalendar(tasks: TaskResource[], user: IUser): IEvent[] {
  const events: IEvent[] = [];

  for (const t of tasks) {
    const due = parseDue(t.current_due_date) ?? parseDue(t.original_due_date);
    if (!due) continue;

    const dayStart = startOfDay(due);
    const dayEnd = endOfDay(due);

    events.push({
      id: t.id,
      title: t.name,
      description: t.description ?? "",
      startDate: dayStart.toISOString(),
      endDate: dayEnd.toISOString(),
      color: taskStatusColor(t.status),
      user,
      sourceTaskId: t.id,
    });
  }

  return events;
}
