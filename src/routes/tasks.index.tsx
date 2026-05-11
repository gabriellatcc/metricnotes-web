import { createFileRoute } from "@tanstack/react-router";

import { TasksPage } from "@/components/tasks/tasks-page";

export const Route = createFileRoute("/tasks/")({
  component: TasksIndex,
});

function TasksIndex() {
  return <TasksPage />;
}
