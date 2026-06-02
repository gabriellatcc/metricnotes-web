  import { Loader2 } from "lucide-react";
  import { useMemo } from "react";

  import type { IUser } from "@/components/ui/imported-calendar/interfaces";
  import { TasksCalendarShell } from "@/components/tasks/tasks-calendar-shell";
  import { taskEventsForCalendar } from "@/components/tasks/task-calendar-events";
  import { useAuthMe } from "@/generated/api/auth/auth";
  import type { UserResource } from "@/generated/api/models/userResource";
  import { useTaskIndex } from "@/generated/api/task/task";
  import { calendarMessagesPt } from "@/lib/i18n/calendar";
  import { cn } from "@/lib/utils";

  const PER_PAGE = 250;

  export type TasksCalendarPageProps = {
    embedded?: boolean;
  };

  /** Página calendário: prazos das tarefas usando o UI [full-calendar ShadCN](https://github.com/yassir-jeraidi/full-calendar). */
  export function TasksCalendarPage({ embedded = false }: TasksCalendarPageProps) {
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

    const events = useMemo(() => taskEventsForCalendar(items, calendarUser), [items, calendarUser]);

    const shell = cn("flex min-h-0 flex-1 flex-col", !embedded && "bg-background");

    if (tasksQuery.isLoading) {
      return (
        <div className={cn(shell)}>
          <div className={cn("flex w-full flex-1 flex-col items-center justify-center gap-3 py-12", embedded ? "min-h-[18vh]" : "min-h-[20vh]")}>
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" aria-hidden />
            <p className="text-sm text-muted-foreground">{m.loadingCalendar}</p>
          </div>
        </div>
      );
    }

    if (tasksQuery.isError) {
      return (
        <div className={shell}>
          <div className="w-full py-6">
            <p className="text-sm text-muted-foreground">{m.calendarLoadError}</p>
          </div>
        </div>
      );
    }

    return (
      <div className={shell}>
        <div className="flex min-h-0 w-full flex-1 flex-col">
          <p className="mb-4 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">
            {m.calendarPageIntro} {m.calendarPageFootnote}
          </p>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded border border-border/30 bg-background">
            <TasksCalendarShell events={events} users={[calendarUser]} view="month" />
          </div>
        </div>
      </div>
    );
  }
