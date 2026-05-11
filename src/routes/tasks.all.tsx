import { createFileRoute } from "@tanstack/react-router";

import { TasksAllPage } from "@/components/tasks/tasks-all-page";

export const Route = createFileRoute("/tasks/all")({
  validateSearch: (search: Record<string, unknown>): { newTask: boolean } => ({
    newTask:
      search.newTask === true ||
      search.newTask === "true" ||
      search.newTask === 1 ||
      search.newTask === "1",
  }),
  component: TasksAllRoute,
});

function TasksAllRoute() {
  return <TasksAllPage />;
}
