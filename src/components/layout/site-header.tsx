import { useCallback, useSyncExternalStore } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { getAuthAccessToken, setAuthAccessToken } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";

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

  const logout = useCallback(() => {
    setAuthAccessToken(null);
    navigate({ to: "/" });
  }, [navigate]);

  const showMarketingNav = pathname === "/";

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="text-lg font-semibold tracking-tight text-foreground hover:opacity-90"
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
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {loggedIn ? (
            <>
              <Link
                to="/app"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  pathname === "/app" && "bg-accent",
                )}
              >
                Dashboard
              </Link>
              <Button type="button" variant="outline" size="sm" onClick={logout}>
                Log out
              </Button>
            </>
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
    </header>
  );
}
