import { createFileRoute } from "@tanstack/react-router";

import { SignupForm } from "@/components/auth/signup-form";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <SignupForm />
    </main>
  );
}
