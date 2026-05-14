import { Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";

import { getDashboardLeafLabel } from "@/components/layout/authenticated-nav-config";

const APP_DOCUMENT_TITLE = "MetricNotes";

/** Layout partilhado pelas vistas do painel (sub-rotas). Título + descrição no conteúdo; navegação na sidebar e breadcrumbs no shell. */
export function DashboardRouteLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const tabLabel = getDashboardLeafLabel(pathname);

  useEffect(() => {
    document.title = tabLabel
      ? `${tabLabel} · Painel · ${APP_DOCUMENT_TITLE}`
      : `Painel · ${APP_DOCUMENT_TITLE}`;
  }, [tabLabel]);

  useEffect(() => {
    return () => {
      document.title = APP_DOCUMENT_TITLE;
    };
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 border-b border-border/70 pb-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                <span className="font-medium text-muted-foreground">Painel</span>
                {tabLabel ? (
                  <>
                    <span className="mx-2 text-muted-foreground/60" aria-hidden>
                      ·
                    </span>
                    {tabLabel}
                  </>
                ) : null}
              </h1>
              <p className="mt-1 max-w-2xl text-pretty text-sm text-muted-foreground">
                Explore o que pode fazer já, visualize padrões dos últimos sete dias, veja uma vista mensal quando estiver
                pronta ou use o calendário de prazos.
              </p>
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
