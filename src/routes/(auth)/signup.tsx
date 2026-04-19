import { createFileRoute } from "@tanstack/react-router";

import { AuthPageLayout } from "@/routes/(auth)/_layout";
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