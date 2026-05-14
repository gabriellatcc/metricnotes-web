import { createFileRoute } from "@tanstack/react-router";

import { TasksCalendarPage } from "@/components/tasks/tasks-calendar-page";

export const Route = createFileRoute("/dashboard/calendar")({
  component: DashboardCalendarRoute,
});

function DashboardCalendarRoute() {
  return (
    <section className="rounded-2xl" aria-labelledby="painel-cal-intro">
      <header className="mb-6">
        <p id="painel-cal-intro" className="max-w-2xl text-pretty text-sm text-muted-foreground">
          Prazos das tarefas no calendário mensal. As alterações refletem o mesmo conjunto de tarefas do quadro.
        </p>
      </header>
      <TasksCalendarPage embedded />
    </section>
  );
}
