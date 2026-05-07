"use client";

import { CalendarBody } from "@/components/ui/imported-calendar/calendar-body";
import { CalendarProvider } from "@/components/ui/imported-calendar/calendar-context";
import { CalendarHeader } from "@/components/ui/imported-calendar/calendar-header";
import { DndProvider } from "@/components/ui/imported-calendar/dnd-context";
import type { IEvent, IUser } from "@/components/ui/imported-calendar/interfaces";
import type { TCalendarView } from "@/components/ui/imported-calendar/types";

/** Calendário (registo [full-calendar ShadCN](https://github.com/yassir-jeraidi/full-calendar)), alimentado por eventos externos. */
export function TasksCalendarShell({
  events,
  users,
  view = "month",
}: {
  events: IEvent[];
  users: IUser[];
  view?: TCalendarView;
}) {
  return (
    <CalendarProvider integrationsMode="tasks" badge="colored" events={events} users={users} view={view}>
      <DndProvider>
        <div className="bg-card border-border flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-xl border shadow-sm">
          <CalendarHeader />
          <CalendarBody />
        </div>
      </DndProvider>
    </CalendarProvider>
  );
}
