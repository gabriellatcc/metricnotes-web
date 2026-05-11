import { createRootRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { useMemo, useSyncExternalStore } from "react";
import { Toaster } from "sonner";

import { AuthenticatedAppShell } from "@/components/layout/authenticated-app-shell";
import { SiteHeader } from "@/components/layout/site-header";
import { useTheme } from "@/components/providers/theme-provider";
import { getAuthAccessToken } from "@/lib/api-client";

export const Route = createRootRoute({
  component: RootLayout,
});

function subscribeToken(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener("metricnotes-auth", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("metricnotes-auth", callback);
  };
}

function snapshotToken() {
  return getAuthAccessToken() ?? "";
}

function serverTokenSnapshot() {
  return "";
}

function RootLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const token = useSyncExternalStore(subscribeToken, snapshotToken, serverTokenSnapshot);
  const loggedIn = Boolean(token);

  const isAuthPortal =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password");

  const hideMarketingStyleHeader =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname.startsWith("/forgot-password");

  /** Visitantes: cabeçalho clássico em rotas públicas da app (marketing continua só com hero interno). */
  const showSiteHeader = !loggedIn && !hideMarketingStyleHeader;

  /** Utilizadores autenticados: shell com sidebar responsiva exceto páginas de auth. */
  const showAuthenticatedShell = loggedIn && !isAuthPortal;

  const { theme } = useTheme();

  const toasterOffset = useMemo(
    () => (showAuthenticatedShell ? { top: "4.75rem", right: "1rem" } : { top: "20vh", right: "1rem" }),
    [showAuthenticatedShell],
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Toaster
        position="top-right"
        theme={theme}
        richColors={false}
        closeButton={false}
        expand={false}
        duration={5200}
        offset={toasterOffset}
        mobileOffset={toasterOffset}
        className="z-[100]"
      />
      {showSiteHeader ? <SiteHeader /> : null}

      {showAuthenticatedShell ? (
        <AuthenticatedAppShell>
          <Outlet />
        </AuthenticatedAppShell>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          <Outlet />
        </div>
      )}
    </div>
  );
}
