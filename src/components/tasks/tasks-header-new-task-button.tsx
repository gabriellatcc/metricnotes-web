import { Plus } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

import { useTasksNewTaskHeader } from "@/components/tasks/tasks-new-task-context";
import { Button } from "@/components/ui/button";

export function TasksHeaderNewTaskButton() {
  const navigate = useNavigate();
  const { triggerNewTaskFromHeader } = useTasksNewTaskHeader();

  return (
    <Button
      type="button"
      className="shrink-0 gap-2 rounded-full"
      onClick={() => {
        if (triggerNewTaskFromHeader()) return;
        void navigate({ to: "/tasks/all", search: { newTask: true } });
      }}
    >
      <Plus className="h-4 w-4" aria-hidden />
      Nova tarefa
    </Button>
  );
}
