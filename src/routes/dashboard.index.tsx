import { createFileRoute } from "@tanstack/react-router";

import { DashboardTodayPage } from "@/components/dashboard/dashboard-today-page";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardIndexRoute,
});

function DashboardIndexRoute() {
  return <DashboardTodayPage />;
}
