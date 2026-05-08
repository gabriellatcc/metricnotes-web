import { createFileRoute } from "@tanstack/react-router";

import { DashboardWeekPage } from "@/components/dashboard/dashboard-week-page";

export const Route = createFileRoute("/dashboard/week")({
  component: DashboardWeekRoute,
});

function DashboardWeekRoute() {
  return <DashboardWeekPage />;
}
