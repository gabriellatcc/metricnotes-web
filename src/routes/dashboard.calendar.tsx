import { createFileRoute } from "@tanstack/react-router";

import { TasksCalendarPage } from "@/components/tasks/tasks-calendar-page";

export const Route = createFileRoute("/dashboard/calendar")({
  component: DashboardCalendarRoute,
});

function DashboardCalendarRoute() {
  return (
    <section className="rounded-2xl">
      <TasksCalendarPage embedded />
    </section>
  );
}
