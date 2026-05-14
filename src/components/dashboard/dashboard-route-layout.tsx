import { Outlet } from "@tanstack/react-router";

import { DashboardAreaDescription } from "@/components/dashboard/dashboard-area-description";

/** Layout partilhado pelas visulizações do painel (sub-rotas). Introduções no corpo; título na barra superior. */
export function DashboardRouteLayout() {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 border-b border-border/70 pb-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <DashboardAreaDescription />
            </div>
          </div>
        </header>
        <div className="flex min-h-0 flex-1 flex-col">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
