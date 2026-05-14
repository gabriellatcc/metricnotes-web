import { createFileRoute, redirect } from "@tanstack/react-router";

import { AuthPageLayout } from "@/components/auth/auth-page-layout";
import { SignupForm } from "@/components/auth/signup-form";
import { getAuthAccessToken } from "@/lib/api-client";

export const Route = createFileRoute("/(auth)/signup")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    if (getAuthAccessToken()) {
      throw redirect({ to: "/dashboard", replace: true });
    }
  },
  component: SignupPage,
});

function SignupPage() {
  return (
    <main>
      <AuthPageLayout variant="signup">
        <SignupForm />
      </AuthPageLayout>
    </main>
  );
}