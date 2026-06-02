import { addMinutes, endOfDay, parseISO, set, startOfDay } from "date-fns";

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

/** Um evento por tarefa: dia do prazo (se houver) com hora de criação; sem hora de conclusão. */
export function taskEventsForCalendar(tasks: TaskResource[], user: IUser): IEvent[] {
  const events: IEvent[] = [];

  for (const t of tasks) {
    const customColor = tipColor(t);
    const baseColor = (customColor || taskStatusColor(t.status)) as TEventColor;

    const created = parseDateTime(t.created_at);
    const due = parseDateTime(t.current_due_date) ?? parseDateTime(t.original_due_date);
    const dayAnchor = due ?? created;
    if (!dayAnchor) continue;

    let startDate: string;
    let endDate: string;

    if (created) {
      const start =
        due != null
          ? set(startOfDay(due), {
              hours: created.getHours(),
              minutes: created.getMinutes(),
              seconds: created.getSeconds(),
              milliseconds: created.getMilliseconds(),
            })
          : created;
      startDate = start.toISOString();
      endDate = addMinutes(start, 30).toISOString();
    } else {
      startDate = startOfDay(dayAnchor).toISOString();
      endDate = endOfDay(dayAnchor).toISOString();
    }

    events.push({
      id: `${t.id}:task`,
      title: t.name,
      description: t.description ?? "",
      startDate,
      endDate,
      color: baseColor,
      user,
      sourceTaskId: t.id,
      taskEventKind: "due",
    });
  }

  return events;
}

/** @deprecated Use taskEventsForCalendar */
export const taskDueEventsForCalendar = taskEventsForCalendar;
