import { createFileRoute, redirect } from "@tanstack/react-router";

import { CompletedTasksPage } from "@/components/tasks/completed-tasks-page";
import { getAuthAccessToken } from "@/lib/api-client";

export const Route = createFileRoute("/tasks/completed")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    if (!getAuthAccessToken()) {
      throw redirect({ to: "/login" });
    }
  },
  component: CompletedTasksRoute,
});

function CompletedTasksRoute() {
  return <CompletedTasksPage />;
}
