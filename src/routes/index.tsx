import { createFileRoute, redirect } from "@tanstack/react-router";

import { getAuthAccessToken } from "@/lib/api-client";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    if (!getAuthAccessToken()) {
      throw redirect({ to: "/login" });
    }
  },
  component: HomePage,
});

function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-muted/40 p-4">
      <p className="text-sm text-muted-foreground">You are signed in.</p>
    </main>
  );
}
