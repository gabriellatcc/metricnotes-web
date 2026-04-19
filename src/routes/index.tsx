import { createFileRoute, redirect } from "@tanstack/react-router";

import { AUTH_TOKEN_STORAGE_KEY } from "@/lib/api-client";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (typeof localStorage === "undefined") return;
    if (!localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)) {
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
