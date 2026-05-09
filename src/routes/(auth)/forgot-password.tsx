import { createFileRoute, Outlet } from "@tanstack/react-router";

import { AuthPageLayout } from "@/components/auth/auth-page-layout";

export const Route = createFileRoute("/(auth)/forgot-password")({
  component: ForgotPasswordLayout,
});

function ForgotPasswordLayout() {
  return (
    <main>
      <AuthPageLayout variant="login">
        <Outlet />
      </AuthPageLayout>
    </main>
  );
}
