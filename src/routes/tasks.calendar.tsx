import { createFileRoute, redirect } from "@tanstack/react-router";

import { TasksCalendarPage } from "@/components/tasks/tasks-calendar-page";
import { getAuthAccessToken } from "@/lib/api-client";

export const Route = createFileRoute("/tasks/calendar")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    if (!getAuthAccessToken()) {
      throw redirect({ to: "/login" });
    }
  },
  component: TasksCalendarRoute,
});

function TasksCalendarRoute() {
  return <TasksCalendarPage />;
}
