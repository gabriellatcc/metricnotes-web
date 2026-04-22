import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { getAuthAccessToken } from "@/lib/api-client";

export const Route = createFileRoute("/tasks")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    if (!getAuthAccessToken()) {
      throw redirect({ to: "/login" });
    }
  },
  component: TasksLayout,
});

function TasksLayout() {
  return <Outlet />;
}
