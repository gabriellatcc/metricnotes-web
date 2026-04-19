import { createFileRoute } from "@tanstack/react-router";

import { AuthPageLayout } from "@/routes/(auth)/_layout";
import { LoginForm } from "@/components/auth/login-form";

export const Route = createFileRoute("/(auth)/login")({
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
