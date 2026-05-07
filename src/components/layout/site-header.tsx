import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HeaderTaskNotifications } from "@/components/layout/header-task-notifications";
import { useAuthMe } from "@/generated/api/auth/auth";
import { getAuthAccessToken, setAuthAccessToken } from "@/lib/api-client";
import { resolveLaravelStorageUrl } from "@/lib/resolve-media-url";
import { cn, initialsFromName } from "@/lib/utils";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { BarChart3, ClipboardList, Settings, StickyNote } from "lucide-react";

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

  const avatarSrc = resolveLaravelStorageUrl(
    (user as { avatar_url?: string | null } | undefined)?.avatar_url ?? undefined,
  );
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [avatarSrc]);

  const showAvatar = Boolean(avatarSrc) && !avatarLoadFailed;

  const logout = useCallback(() => {
    setAuthAccessToken(null);
    navigate({ to: "/" });
  }, [navigate]);

  const showMarketingNav = pathname === "/";

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8">
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
                Funcionalidades
              </a>
              <a href="/#why" className="hover:text-foreground">
                Por que nós
              </a>
            </nav>
          ) : null}
          {loggedIn ? (
            <nav className="hidden items-center gap-1 sm:flex">
              <Link
                to="/dashboard"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "gap-1.5",
                  pathname === "/dashboard" && "bg-accent text-accent-foreground",
                )}
              >
                <BarChart3 className="size-4" aria-hidden />
                Painel
              </Link>
              <Link
                to="/tasks"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "gap-1.5",
                  (pathname === "/tasks" || pathname.startsWith("/tasks/")) &&
                    "bg-accent text-accent-foreground",
                )}
              >
                <ClipboardList className="size-4" aria-hidden />
                Tarefas
              </Link>
              <Link
                to="/notes"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "gap-1.5",
                  pathname === "/notes" && "bg-accent text-accent-foreground",
                )}
              >
                <StickyNote className="size-4" aria-hidden />
                Notas
              </Link>
            </nav>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {loggedIn ? (
            <>
            <HeaderTaskNotifications enabled={loggedIn} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-9 max-w-[min(100%,260px)] gap-2 rounded-full pl-1.5 pr-2.5 font-normal"
                  aria-label="Menu da conta"
                >
                  <span
                    className="relative flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-xs font-semibold text-foreground"
                    aria-hidden
                  >
                    {me.isLoading ? (
                      "…"
                    ) : showAvatar ? (
                      <img
                        src={avatarSrc}
                        alt=""
                        className="size-full object-cover"
                        onError={() => setAvatarLoadFailed(true)}
                      />
                    ) : (
                      initialsFromName(user?.name)
                    )}
                  </span>
                  <span className="truncate text-left text-sm text-foreground">
                    {user?.name ?? (me.isLoading ? "Carregando…" : "Conta")}
                  </span>
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
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                Entrar
              </Link>
              <Link to="/signup" className={cn(buttonVariants({ size: "sm" }))}>
                Criar conta
              </Link>
            </>
          )}
        </div>
      </div>
      {loggedIn ? (
        <div className="mx-auto flex w-full max-w-7xl border-t border-border/60 px-4 py-2 sm:hidden sm:px-6 lg:px-8">
          <div className="flex w-full gap-1 overflow-x-auto">
            <Link
              to="/dashboard"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "shrink-0",
                pathname === "/dashboard" && "bg-accent",
              )}
            >
              Painel
            </Link>
            <Link
              to="/tasks"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "shrink-0",
                (pathname === "/tasks" || pathname.startsWith("/tasks/")) && "bg-accent",
              )}
            >
              Tarefas
            </Link>
            <Link
              to="/notes"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "shrink-0",
                pathname === "/notes" && "bg-accent",
              )}
            >
              Notas
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
