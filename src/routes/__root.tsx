import { createRootRoute, Outlet, useRouterState } from "@tanstack/react-router";

import { SiteHeader } from "@/components/layout/site-header";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hideHeader = pathname === "/login" || pathname === "/signup";

  return (
    <div className="flex min-h-screen flex-col">
      {!hideHeader ? <SiteHeader /> : null}
      <Outlet />
    </div>
  );
}
