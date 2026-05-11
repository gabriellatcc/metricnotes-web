import { createFileRoute } from "@tanstack/react-router";

import { TasksCalendarPage } from "@/components/tasks/tasks-calendar-page";

export const Route = createFileRoute("/dashboard/calendar")({
  component: DashboardCalendarRoute,
});

function DashboardCalendarRoute() {
  return (
    <section className="rounded-2xl" aria-labelledby="painel-tab-cal">
      <header className="mb-6">
        <p className="mt-1 max-w-2xl text-pretty text-sm text-muted-foreground">
          Prazos das tarefas no calendário mensal. As alterações refletem o mesmo conjunto de tarefas do quadro.
        </p>
      </header>
      <TasksCalendarPage embedded />
    </section>
  );
}
