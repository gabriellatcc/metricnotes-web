import { createFileRoute, redirect } from "@tanstack/react-router";

import { TasksPage } from "@/components/tasks/tasks-page";
import { getAuthAccessToken } from "@/lib/api-client";

export const Route = createFileRoute("/tasks")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    if (!getAuthAccessToken()) {
      throw redirect({ to: "/login" });
    }
  },
  component: TasksRoute,
});

function TasksRoute() {
  return <TasksPage />;
}
