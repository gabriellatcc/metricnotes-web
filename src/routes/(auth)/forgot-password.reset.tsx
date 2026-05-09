import { createFileRoute, redirect } from "@tanstack/react-router";

import { ForgotPasswordResetForm } from "@/components/auth/forgot-password-reset-form";
import { getPasswordRecoveryCredentials } from "@/lib/password-recovery-session";

export const Route = createFileRoute("/(auth)/forgot-password/reset")({
  beforeLoad: () => {
    if (!getPasswordRecoveryCredentials()) {
      throw redirect({ to: "/forgot-password" });
    }
  },
  component: ForgotPasswordResetForm,
});
