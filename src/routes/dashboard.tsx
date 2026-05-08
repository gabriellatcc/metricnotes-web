import { createFileRoute, redirect } from "@tanstack/react-router";

import { DashboardRouteLayout } from "@/components/dashboard/dashboard-route-layout";
import { getAuthAccessToken } from "@/lib/api-client";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    if (!getAuthAccessToken()) {
      throw redirect({ to: "/login" });
    }
  },
  component: DashboardLayoutRoute,
});

function DashboardLayoutRoute() {
  return <DashboardRouteLayout />;
}
