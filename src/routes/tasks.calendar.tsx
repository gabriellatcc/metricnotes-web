import { createFileRoute, redirect } from "@tanstack/react-router";

import { getAuthAccessToken } from "@/lib/api-client";

/** Calendário de tarefas vive em `/dashboard/calendar`. Esta rota só redireciona marcadores antigos. */
export const Route = createFileRoute("/tasks/calendar")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    if (!getAuthAccessToken()) {
      throw redirect({ to: "/login" });
    }
    throw redirect({ to: "/dashboard/calendar", replace: true });
  },
  component: () => null,
});
