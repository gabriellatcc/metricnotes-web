import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { TasksSubNav } from "@/components/tasks/tasks-subnav";
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
  return (
    <div className="bg-background flex min-h-0 flex-1 flex-col">
      <div className="mx-auto w-full max-w-7xl shrink-0 px-4 pt-4 sm:px-6 lg:px-8">
        <TasksSubNav />
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <Outlet />
      </div>
    </div>
  );
}
