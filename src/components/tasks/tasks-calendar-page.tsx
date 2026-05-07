import { Loader2 } from "lucide-react";
import { useMemo } from "react";

import type { IUser } from "@/components/ui/imported-calendar/interfaces";
import { TasksCalendarShell } from "@/components/tasks/tasks-calendar-shell";
import { taskDueEventsForCalendar } from "@/components/tasks/task-calendar-events";
import { useAuthMe } from "@/generated/api/auth/auth";
import type { UserResource } from "@/generated/api/models/userResource";
import { useTaskIndex } from "@/generated/api/task/task";
import { calendarMessagesPt } from "@/lib/i18n/calendar";

const PER_PAGE = 250;

/** Página calendário: prazos das tarefas usando o UI [full-calendar ShadCN](https://github.com/yassir-jeraidi/full-calendar). */
export function TasksCalendarPage() {
  const me = useAuthMe();
  const apiUser = me.data?.data?.user as UserResource | undefined;
  const m = calendarMessagesPt;

  const calendarUser: IUser = useMemo(
    () =>
      apiUser != null
        ? {
            id: apiUser.id,
            name: apiUser.name,
            picturePath: apiUser.avatar_url ?? null,
          }
        : { id: "me", name: "Eu", picturePath: null },
    [apiUser],
  );

  const tasksQuery = useTaskIndex({ page: 1, per_page: PER_PAGE });

  const items = tasksQuery.data?.data?.items ?? [];

  const events = useMemo(() => taskDueEventsForCalendar(items, calendarUser), [items, calendarUser]);

  if (tasksQuery.isLoading) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 py-12">
        <Loader2 className="text-muted-foreground h-10 w-10 animate-spin" aria-hidden />
        <p className="text-muted-foreground text-sm">{m.loadingCalendar}</p>
      </div>
    );
  }

  if (tasksQuery.isError) {
    return (
      <div className="mx-auto w-full px-4 py-6 sm:px-6 lg:px-8">
        <p className="text-muted-foreground text-sm">{m.calendarLoadError}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col px-3 pb-3 pt-2 sm:px-5 lg:px-6">
      <header className="mb-2 shrink-0 space-y-0.5">
        <h1 className="text-foreground text-lg font-semibold tracking-tight sm:text-xl">{m.calendarPageTitle}</h1>
        <p className="text-muted-foreground text-xs leading-snug sm:text-sm">
          {m.calendarPageIntro}{" "}
          <a
            href="https://github.com/yassir-jeraidi/full-calendar"
            className="text-primary font-medium underline underline-offset-2"
            target="_blank"
            rel="noreferrer noopener"
          >
            full-calendar
          </a>{" "}
          {m.calendarPageFootnote}
        </p>
      </header>
      <div className="min-h-0 flex-1">
        <TasksCalendarShell events={events} users={[calendarUser]} view="month" />
      </div>
    </div>
  );
}
