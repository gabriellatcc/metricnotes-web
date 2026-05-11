import { createFileRoute } from "@tanstack/react-router";

import { TasksTrashPage } from "@/components/tasks/tasks-trash-page";

export const Route = createFileRoute("/tasks/trash")({
  component: TasksTrashRoute,
});

function TasksTrashRoute() {
  return <TasksTrashPage />;
}
