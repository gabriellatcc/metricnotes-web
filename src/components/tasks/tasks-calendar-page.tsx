import { Loader2 } from "lucide-react";
import { useMemo } from "react";

import type { IUser } from "@/components/ui/imported-calendar/interfaces";
import { TasksCalendarShell } from "@/components/tasks/tasks-calendar-shell";
import { taskDueEventsForCalendar } from "@/components/tasks/task-calendar-events";
import { useAuthMe } from "@/generated/api/auth/auth";
import type { UserResource } from "@/generated/api/models/userResource";
import { useTaskIndex } from "@/generated/api/task/task";

const PER_PAGE = 250;

/** Página calendário: prazos das tarefas usando o UI [full-calendar ShadCN](https://github.com/yassir-jeraidi/full-calendar). */
export function TasksCalendarPage() {
  const me = useAuthMe();
  const apiUser = me.data?.data?.user as UserResource | undefined;

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
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 py-16">
        <Loader2 className="text-muted-foreground h-10 w-10 animate-spin" aria-hidden />
        <p className="text-muted-foreground text-sm">A carregar calendário…</p>
      </div>
    );
  }

  if (tasksQuery.isError) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-muted-foreground text-sm">Não foi possível carregar as tarefas para o calendário.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:pb-8 lg:px-8 lg:pt-2">
      <header className="mb-4 space-y-1">
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">Calendário de tarefas</h1>
        <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed">
          Cada marca corresponde ao prazo atual ou original de uma tarefa (dia completo, sem hora). Interface baseada
          no projeto{" "}
          <a
            href="https://github.com/yassir-jeraidi/full-calendar"
            className="text-primary font-medium underline underline-offset-2"
            target="_blank"
            rel="noreferrer noopener"
          >
            full-calendar
          </a>{" "}
          para ShadCN. Arrastar no calendário só altera a vista local; para gravar, usa o quadro ou editar tarefa.
        </p>
      </header>
      <TasksCalendarShell events={events} users={[calendarUser]} view="month" />
    </div>
  );
}
