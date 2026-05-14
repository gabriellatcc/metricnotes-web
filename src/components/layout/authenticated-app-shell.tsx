import type { LucideIcon } from "lucide-react";
import { Menu, StickyNote, X } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";

import { AppShellTitle } from "@/components/layout/app-breadcrumbs";
import {
  APP_DASHBOARD_LEAVES,
  APP_DOCUMENT_TITLE_BRAND,
  APP_TASK_LEAVES,
  documentTitleFromPath,
  pathnameMatchesDashboardLeaf,
  pathnameMatchesTaskLeaf,
} from "@/components/layout/authenticated-nav-config";
import { AuthenticatedUserMenu } from "@/components/layout/authenticated-user-menu";
import { HeaderTaskNotifications } from "@/components/layout/header-task-notifications";
import { TasksHeaderNewTaskButton } from "@/components/tasks/tasks-header-new-task-button";
import { TasksNewTaskHeaderProvider } from "@/components/tasks/tasks-new-task-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function SidebarLeafLink({
  to,
  label,
  icon: Icon,
  pathname,
  isActive,
  onPick,
}: {
  to: string;
  label: string;
  icon: LucideIcon;
  pathname: string;
  isActive: (pathname: string, href: string) => boolean;
  onPick?: () => void;
}) {
  const active = isActive(pathname, to);

  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
        active
          ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground shadow-sm"
          : "text-sidebar-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
      )}
      onClick={onPick}
    >
      <Icon className="size-4 shrink-0 opacity-80" aria-hidden />
      {label}
    </Link>
  );
}

export function AuthenticatedAppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.title = documentTitleFromPath(pathname);
  }, [pathname]);

  useEffect(() => {
    return () => {
      document.title = APP_DOCUMENT_TITLE_BRAND;
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <TasksNewTaskHeaderProvider>
      <div className="flex min-h-svh flex-1">
        <button
          type="button"
          className={cn(
            "fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] transition-opacity md:hidden",
            mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
          )}
          aria-hidden={!mobileOpen}
          tabIndex={mobileOpen ? 0 : -1}
          onClick={() => setMobileOpen(false)}
        />

        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-[min(280px,88vw)] flex-col border-r border-sidebar-border bg-sidebar shadow-lg transition-transform duration-200 ease-out md:z-40 md:w-60 md:max-w-none md:shadow-none md:transition-none",
            mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          )}
          aria-label="Navegação principal"
          id="app-sidebar-nav"
        >
          <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-sidebar-border px-3">
            <Link
              to="/dashboard"
              className="truncate text-base font-semibold tracking-tight text-sidebar-foreground"
              onClick={() => setMobileOpen(false)}
            >
              MetricNotes
            </Link>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 text-sidebar-foreground md:hidden"
              aria-label="Fechar menu"
              onClick={() => setMobileOpen(false)}
            >
              <X className="size-5" />
            </Button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-2 py-3">
            <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Painel</p>
            <nav className="flex flex-col gap-0.5" aria-label="Vistas do painel">
              {APP_DASHBOARD_LEAVES.map((item) => (
                <SidebarLeafLink
                  key={item.to}
                  to={item.to}
                  label={item.label}
                  icon={item.icon}
                  pathname={pathname}
                  isActive={pathnameMatchesDashboardLeaf}
                  onPick={() => setMobileOpen(false)}
                />
              ))}
            </nav>

            <p className="mt-3 px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Tarefas
            </p>
            <nav className="flex flex-col gap-0.5" aria-label="Vistas de tarefas">
              {APP_TASK_LEAVES.map((item) => (
                <SidebarLeafLink
                  key={item.to}
                  to={item.to}
                  label={item.label}
                  icon={item.icon}
                  pathname={pathname}
                  isActive={pathnameMatchesTaskLeaf}
                  onPick={() => setMobileOpen(false)}
                />
              ))}
            </nav>

            <div className="mt-2 border-t border-sidebar-border pt-2">
              <SidebarLeafLink
                to="/notes"
                label="Notas"
                icon={StickyNote}
                pathname={pathname}
                isActive={(p, href) => p === href || p === `${href}/`}
                onPick={() => setMobileOpen(false)}
              />
            </div>
          </div>

          <div className="shrink-0 space-y-1 border-t border-sidebar-border px-2 py-3">
            <AuthenticatedUserMenu />
          </div>
        </aside>

        <div className="relative flex min-h-0 flex-1 flex-col md:pl-60">
          <header className="sticky top-0 z-30 flex shrink-0 items-center gap-2 border-b border-border bg-background/95 px-3 py-2.5 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:gap-4 md:px-5">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0 border-border md:hidden"
              aria-label="Abrir menu"
              aria-controls="app-sidebar-nav"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="size-5" aria-hidden />
            </Button>

            <AppShellTitle className="min-w-0 flex-1" />

            <div className="flex shrink-0 items-center gap-2">
              {pathname.startsWith("/tasks") ? <TasksHeaderNewTaskButton /> : null}
              <HeaderTaskNotifications enabled />
            </div>
          </header>

          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        </div>
      </div>
    </TasksNewTaskHeaderProvider>
  );
}
