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
      <main className="flex min-h-0 flex-1 flex-col bg-background">
        <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col items-center justify-center gap-3 px-4 py-12 sm:px-6 lg:px-8">
          <Loader2 className="text-muted-foreground h-10 w-10 animate-spin" aria-hidden />
          <p className="text-muted-foreground text-sm">{m.loadingCalendar}</p>
        </div>
      </main>
    );
  }

  if (tasksQuery.isError) {
    return (
      <main className="flex min-h-0 flex-1 flex-col bg-background">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-muted-foreground text-sm">{m.calendarLoadError}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
        <header className="mb-3 shrink-0 border-b border-border pb-3 sm:mb-4 sm:pb-4">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{m.calendarPageTitle}</h1>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            {m.calendarPageIntro}{" "}
            {m.calendarPageFootnote}
          </p>
        </header>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded border border-border/30 bg-background">
          <TasksCalendarShell events={events} users={[calendarUser]} view="month" />
        </div>
      </div>
    </main>
  );
}
