import { createFileRoute } from "@tanstack/react-router";

import { TasksCalendarPage } from "@/components/tasks/tasks-calendar-page";

export const Route = createFileRoute("/dashboard/calendar")({
  component: DashboardCalendarRoute,
});

function DashboardCalendarRoute() {
  return (
    <section className="rounded-2xl border border-border/60 bg-card/30 p-5 sm:p-6" aria-labelledby="painel-tab-cal">
      <header className="mb-6">
        <h2 id="painel-tab-cal" className="text-lg font-semibold tracking-tight text-foreground">
          Calendário de prazos
        </h2>
        <p className="mt-1 max-w-2xl text-pretty text-sm text-muted-foreground">
          Prazos das tarefas no calendário mensal. As alterações refletem o mesmo conjunto de tarefas do quadro.
        </p>
      </header>
      <TasksCalendarPage embedded />
    </section>
  );
}
