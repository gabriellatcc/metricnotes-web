import { createFileRoute, redirect } from "@tanstack/react-router";

import { Dashboard } from "@/components/dashboard/Dashboard";
import { getAuthAccessToken } from "@/lib/api-client";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    if (!getAuthAccessToken()) {
      throw redirect({ to: "/login" });
    }
  },
  component: DashboardRoute,
});

function DashboardRoute() {
  return <Dashboard />;
}
