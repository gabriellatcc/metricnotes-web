import { addMinutes, endOfDay, parseISO, startOfDay } from "date-fns";

import type { IUser, IEvent } from "@/components/ui/imported-calendar/interfaces";
import type { TEventColor } from "@/components/ui/imported-calendar/types";
import type { TaskResource } from "@/generated/api/models";

function parseDateTime(raw: string | null | undefined): Date | null {
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

function tipColor(t: TaskResource): TEventColor | string | null {
  const tips = t.tips as Array<{ name: string; color: string }> | undefined;
  return tips && tips.length > 0 ? tips[0].color : null;
}

function isCompletedTask(t: TaskResource): boolean {
  return t.status === "completed" || (t.completed_at != null && t.completed_at !== "");
}

/** Prazos (dia inteiro) e conclusões (hora real) das tarefas para o calendário. */
export function taskEventsForCalendar(tasks: TaskResource[], user: IUser): IEvent[] {
  const events: IEvent[] = [];

  for (const t of tasks) {
    const customColor = tipColor(t);
    const baseColor = (customColor || taskStatusColor(t.status)) as TEventColor;

    const due = parseDateTime(t.current_due_date) ?? parseDateTime(t.original_due_date);
    if (due) {
      const dayStart = startOfDay(due);
      const dayEnd = endOfDay(due);
      events.push({
        id: `${t.id}:due`,
        title: t.name,
        description: t.description ?? "",
        startDate: dayStart.toISOString(),
        endDate: dayEnd.toISOString(),
        color: baseColor,
        user,
        sourceTaskId: t.id,
        taskEventKind: "due",
      });
    }

    if (isCompletedTask(t)) {
      const completedAt = parseDateTime(t.completed_at);
      if (completedAt) {
        const end = addMinutes(completedAt, 30);
        events.push({
          id: `${t.id}:completed`,
          title: t.name,
          description: t.description ?? "",
          startDate: completedAt.toISOString(),
          endDate: end.toISOString(),
          color: "green",
          user,
          sourceTaskId: t.id,
          taskEventKind: "completed",
        });
      }
    }
  }

  return events;
}

/** @deprecated Use taskEventsForCalendar */
export const taskDueEventsForCalendar = taskEventsForCalendar;
