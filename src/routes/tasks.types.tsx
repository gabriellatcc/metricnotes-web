import { createFileRoute } from "@tanstack/react-router";

import { TaskTipTypesPage } from "@/components/tasks/task-tip-types-page";

export const Route = createFileRoute("/tasks/types")({
  component: TaskTipTypesRoute,
});

function TaskTipTypesRoute() {
  return <TaskTipTypesPage />;
}
