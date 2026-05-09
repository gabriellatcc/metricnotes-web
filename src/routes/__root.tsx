import { createRootRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { Toaster } from "sonner";

import { SiteHeader } from "@/components/layout/site-header";
import { useTheme } from "@/components/providers/theme-provider";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hideHeader =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname.startsWith("/forgot-password");
  const { theme } = useTheme();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Toasts ~20vh abaixo do topo para não cobrir o cabeçalho */}
      <Toaster
        position="top-right"
        theme={theme}
        richColors={false}
        closeButton={false}
        expand={false}
        duration={5200}
        offset={{ top: "20vh", right: "1rem" }}
        mobileOffset={{ top: "20vh", right: "1rem" }}
        className="z-[100]"
      />
      {!hideHeader ? <SiteHeader /> : null}
      <div className="flex min-h-0 flex-1 flex-col">
        <Outlet />
      </div>
    </div>
  );
}
