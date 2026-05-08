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
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 border-b border-border pb-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">Tarefas</h1>
              <p className="mt-1 max-w-2xl text-pretty text-sm text-muted-foreground">
                Organize cartas no quadro e consulte as concluídas. Crie, filtre e acompanhe o fluxo das suas entregas. Para
                prazos no calendário, use o Painel.
              </p>
            </div>
          </div>
          <TasksSubNav className="mt-6" />
        </header>
        <div className="flex min-h-0 flex-1 flex-col">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
