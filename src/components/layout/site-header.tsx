import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";

/**
 * Cabeçalho para utilizadores **não autenticados** em rotas públicas (sem marketing inline).
 * Utilizadores ligados usam `AuthenticatedAppShell` e não passam por este componente.
 */
export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const showMarketingNav = pathname === "/";

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-4 lg:gap-8">
          <Link
            to="/"
            className="shrink-0 text-lg font-semibold tracking-tight text-foreground hover:opacity-90"
          >
            Metricnotes
          </Link>
          {showMarketingNav ? (
            <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
              <a href="/#features" className="hover:text-foreground">
                Funcionalidades
              </a>
              <a href="/#why" className="hover:text-foreground">
                Por que nós
              </a>
            </nav>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link to="/login" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            Entrar
          </Link>
          <Link to="/signup" className={cn(buttonVariants({ size: "sm" }))}>
            Criar conta
          </Link>
        </div>
      </div>
    </header>
  );
}
