import { createFileRoute } from "@tanstack/react-router";

import { AuthPageLayout } from "@/components/auth/auth-page-layout";
import { SignupForm } from "@/components/auth/signup-form";

export const Route = createFileRoute("/(auth)/signup")({
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