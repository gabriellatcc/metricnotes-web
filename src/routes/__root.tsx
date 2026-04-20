import { createRootRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { Toaster } from "sonner";

import { SiteHeader } from "@/components/layout/site-header";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hideHeader = pathname === "/login" || pathname === "/signup";

  return (
    <div className="flex min-h-screen flex-col">
      <Toaster
        position="top-right"
        richColors
        closeButton
        expand={false}
        duration={4800}
        className="z-[100]"
      />
      {!hideHeader ? <SiteHeader /> : null}
      <Outlet />
    </div>
  );
}
