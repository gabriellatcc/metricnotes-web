import { createFileRoute, redirect } from "@tanstack/react-router";

import { getAuthAccessToken } from "@/lib/api-client";

/** Legacy `/app` URL: send authenticated users to the dashboard. */
export const Route = createFileRoute("/app")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    if (!getAuthAccessToken()) {
      throw redirect({ to: "/login" });
    }
    throw redirect({ to: "/dashboard", replace: true });
  },
  component: () => null,
});
