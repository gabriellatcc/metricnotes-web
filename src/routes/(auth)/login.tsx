import { createFileRoute, redirect } from "@tanstack/react-router";

import { AuthPageLayout } from "@/components/auth/auth-page-layout";
import { LoginForm } from "@/components/auth/login-form";
import { getAuthAccessToken } from "@/lib/api-client";

export const Route = createFileRoute("/(auth)/login")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    if (getAuthAccessToken()) {
      throw redirect({ to: "/dashboard", replace: true });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  return (
    <main>
      <AuthPageLayout variant="login">
        <LoginForm />
      </AuthPageLayout>
    </main>
  );
}
