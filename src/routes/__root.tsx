import { createRootRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { Toaster } from "sonner";

import { SiteHeader } from "@/components/layout/site-header";
import { useTheme } from "@/components/providers/theme-provider";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hideHeader = pathname === "/login" || pathname === "/signup";
  const { theme } = useTheme();

  return (
    <div className="flex min-h-screen flex-col">
      <Toaster
        position="top-right"
        theme={theme}
        richColors={false}
        closeButton={false}
        expand={false}
        duration={5200}
        className="z-[100]"
      />
      {!hideHeader ? <SiteHeader /> : null}
      <Outlet />
    </div>
  );
}
