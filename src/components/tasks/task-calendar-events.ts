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

export function taskDueEventsForCalendar(tasks: TaskResource[], user: IUser): IEvent[] {
  const events: IEvent[] = [];

  for (const t of tasks) {
    const due = parseDue(t.current_due_date) ?? parseDue(t.original_due_date);
    if (!due) continue;

    const dayStart = startOfDay(due);
    const dayEnd = endOfDay(due);

    const tips = t.tips as Array<{ name: string; color: string }> | undefined;
    const customTipColor = tips && tips.length > 0 ? tips[0].color : null;

    events.push({
      id: t.id,
      title: t.name,
      description: t.description ?? "",
      startDate: dayStart.toISOString(),
      endDate: dayEnd.toISOString(),
      color: (customTipColor || taskStatusColor(t.status)) as TEventColor,
      user,
      sourceTaskId: t.id,
    });
  }

  return events;
}