import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { getAuthAccessToken, setAuthAccessToken } from "@/lib/api-client";

export const Route = createFileRoute("/app")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    if (!getAuthAccessToken()) {
      throw redirect({ to: "/login" });
    }
  },
  component: AppHomePage,
});

function AppHomePage() {
  const navigate = useNavigate();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-16">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold tracking-tight">You are in</h1>
        <p className="mt-2 text-muted-foreground">
          This is your space after sign-in. Hook up tasks and notes here as you build the product.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button type="button" variant="outline" onClick={() => navigate({ to: "/" })}>
            Back to home
          </Button>
          <Button
            type="button"
            onClick={() => {
              setAuthAccessToken(null);
              navigate({ to: "/" });
            }}
          >
            Log out
          </Button>
        </div>
      </div>
    </main>
  );
}
