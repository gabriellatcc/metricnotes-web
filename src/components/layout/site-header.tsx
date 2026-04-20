import { useCallback, useSyncExternalStore } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthMe } from "@/generated/api/auth/auth";
import { getAuthAccessToken, setAuthAccessToken } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ChevronDown, ClipboardList, Settings } from "lucide-react";

function subscribeToken(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("metricnotes-auth", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("metricnotes-auth", callback);
  };
}

function getTokenSnapshot() {
  return getAuthAccessToken() ?? "";
}

function getServerSnapshot() {
  return "";
}

export function SiteHeader() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const token = useSyncExternalStore(subscribeToken, getTokenSnapshot, getServerSnapshot);

  const loggedIn = Boolean(token);

  const me = useAuthMe({
    query: { enabled: loggedIn },
  });
  const user = me.data?.data?.user;

  const logout = useCallback(() => {
    setAuthAccessToken(null);
    navigate({ to: "/" });
  }, [navigate]);

  const showMarketingNav = pathname === "/";

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:gap-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-4 lg:gap-8">
          <Link
            to="/"
            className="shrink-0 text-lg font-semibold tracking-tight text-foreground hover:opacity-90"
          >
            MetricNotes
          </Link>
          {showMarketingNav ? (
            <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
              <a href="/#features" className="hover:text-foreground">
                Features
              </a>
              <a href="/#why" className="hover:text-foreground">
                Why us
              </a>
            </nav>
          ) : null}
          {loggedIn ? (
            <nav className="hidden items-center gap-1 sm:flex">
              <Link
                to="/tasks"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "gap-1.5",
                  pathname === "/tasks" && "bg-accent text-accent-foreground",
                )}
              >
                <ClipboardList className="size-4" aria-hidden />
                Tarefas
              </Link>
            </nav>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {loggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="max-w-[min(100%,220px)] gap-1.5"
                  aria-label="Menu da conta"
                >
                  <span className="truncate">{user?.name ?? (me.isLoading ? "…" : "Conta")}</span>
                  <ChevronDown className="size-3.5 shrink-0 opacity-70" aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {user?.email ? (
                  <>
                    <DropdownMenuLabel className="font-normal">
                      <span className="block truncate text-foreground">{user.name}</span>
                      <span className="block truncate text-xs font-normal text-muted-foreground">
                        {user.email}
                      </span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                  </>
                ) : null}
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex cursor-pointer items-center gap-2">
                    <Settings className="size-4 opacity-70" aria-hidden />
                    Configurações
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                  onSelect={() => logout()}
                >
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link
                to="/login"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                Login
              </Link>
              <Link to="/signup" className={cn(buttonVariants({ size: "sm" }))}>
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
      {loggedIn ? (
        <div className="flex border-t border-border/60 px-4 py-2 sm:hidden">
          <div className="flex w-full gap-1 overflow-x-auto">
            <Link
              to="/tasks"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "shrink-0",
                pathname === "/tasks" && "bg-accent",
              )}
            >
              Tarefas
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
