import { ChevronRight } from "lucide-react";
import { Fragment } from "react";
import { Link, useRouterState } from "@tanstack/react-router";

import { APP_DASHBOARD_LEAVES, APP_TASK_LEAVES, pathnameMatchesDashboardLeaf, pathnameMatchesTaskLeaf } from "@/components/layout/authenticated-nav-config";
import { cn } from "@/lib/utils";

export type Crumb = { readonly to?: string; readonly label: string };

function breadcrumbsForPath(pathname: string): Crumb[] {
  if (pathname === "/" || pathname === "") return [{ to: "/", label: "Início" }];

  if (pathname.startsWith("/dashboard")) {
    const leaf = APP_DASHBOARD_LEAVES.find((l) => pathnameMatchesDashboardLeaf(pathname, l.to));
    if (leaf)
      return [
        { to: "/dashboard", label: "Painel" },
        { to: leaf.to, label: leaf.label },
      ];
    return [{ to: "/dashboard", label: "Painel" }];
  }

  if (pathname.startsWith("/tasks")) {
    const leaf = APP_TASK_LEAVES.find((l) => pathnameMatchesTaskLeaf(pathname, l.to));
    if (leaf)
      return [
        { to: "/tasks", label: "Tarefas" },
        { to: leaf.to, label: leaf.label },
      ];
    return [{ to: "/tasks", label: "Tarefas" }];
  }

  if (pathname.startsWith("/notes")) return [{ to: "/notes", label: "Notas" }];

  if (pathname.startsWith("/settings")) return [{ to: "/settings", label: "Configurações" }];

  return [{ label: "MetricNotes" }];
}

export function AppBreadcrumbs({ className }: { className?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const items = breadcrumbsForPath(pathname);

  return (
    <nav aria-label="Navegação estrutural" className={cn("flex flex-wrap items-center gap-1 text-sm", className)}>
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, idx) => {
          const last = idx === items.length - 1;
          return (
            <Fragment key={`${item.label}-${idx}`}>
              {idx > 0 ? <ChevronRight className="mx-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden /> : null}
              <li className="min-w-0">
                {!last && item.to ? (
                  <Link
                    to={item.to}
                    className="max-w-[12rem] truncate text-muted-foreground transition-colors hover:text-foreground sm:max-w-none"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="max-w-[14rem] truncate font-medium text-foreground sm:max-w-none" aria-current={last ? "page" : undefined}>
                    {item.label}
                  </span>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
