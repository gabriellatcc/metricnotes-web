
import { Link, useRouterState } from "@tanstack/react-router";

import { getAppShellTitleSegments } from "@/components/layout/authenticated-nav-config";
import { cn } from "@/lib/utils";

/**
 * Título contextual da app (substitui migalhas): **Painel** · Vista actual, alinhado à sidebar.
 */
export function AppShellTitle({ className }: { className?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const segments = getAppShellTitleSegments(pathname);

  if (segments.length === 1) {
    const s = segments[0];
    const body = s.href ? (
      <Link
        to={s.href}
        className="truncate font-semibold text-foreground transition-colors hover:text-foreground/90"
      >
        {s.label}
      </Link>
    ) : (
      <span className="truncate font-semibold text-foreground">{s.label}</span>
    );
    return (
      <div className={cn("min-w-0", className)}>
        <h1 className="flex min-h-10 min-w-0 items-center truncate text-base font-semibold tracking-tight sm:text-lg">{body}</h1>
      </div>
    );
  }

  const [first, leaf] = segments;

  return (
    <div className={cn("min-w-0", className)}>
      <h1 className="flex min-h-10 min-w-0 flex-wrap items-center gap-x-2 text-base font-semibold tracking-tight sm:text-lg md:text-xl">
        {first.href ? (
          <Link
            to={first.href}
            className="shrink-0 font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {first.label}
          </Link>
        ) : (
          <span className="shrink-0 font-medium text-muted-foreground">{first.label}</span>
        )}
        {leaf ? (
          <>
            <span className="mx-0.5 shrink-0 font-medium text-muted-foreground/60" aria-hidden>
              ·
            </span>
            <span className="min-w-0 truncate font-semibold text-foreground" aria-current="page">
              {leaf.label}
            </span>
          </>
        ) : null}
      </h1>
    </div>
  );
}