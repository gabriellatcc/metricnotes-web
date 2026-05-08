import { createFileRoute } from "@tanstack/react-router";

import { DashboardMonthPlaceholderPage } from "@/components/dashboard/dashboard-month-placeholder-page";

export const Route = createFileRoute("/dashboard/month")({
  component: DashboardMonthRoute,
});

function DashboardMonthRoute() {
  return <DashboardMonthPlaceholderPage />;
}
