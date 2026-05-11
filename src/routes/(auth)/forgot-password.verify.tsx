import { createFileRoute, redirect } from "@tanstack/react-router";

import { ForgotPasswordVerifyForm } from "@/components/auth/forgot-password-verify-form";

const emailLooksValid = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const Route = createFileRoute("/(auth)/forgot-password/verify")({
  validateSearch: (search: Record<string, unknown>): { email: string } => ({
    email: typeof search.email === "string" ? search.email.trim() : "",
  }),
  beforeLoad: ({ search }) => {
    if (!search.email || !emailLooksValid(search.email)) {
      throw redirect({ to: "/forgot-password" });
    }
  },
  component: ForgotPasswordVerifyPage,
});

function ForgotPasswordVerifyPage() {
  const { email } = Route.useSearch();

  return <ForgotPasswordVerifyForm email={email} />;
}
