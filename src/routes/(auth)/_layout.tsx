import type { ReactNode } from "react";

import { AuthAnimatedSide, AuthMobileBackdrop } from "@/components/auth/auth-animated-side";
import { cn } from "@/lib/utils";

type AuthPageLayoutProps = {
  children: ReactNode;
  variant?: "login" | "signup";
};

export function AuthPageLayout({ children, variant = "login" }: AuthPageLayoutProps) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      <AuthAnimatedSide variant={variant} />
      <div className="relative flex min-h-screen items-center justify-center bg-muted/30 p-4 lg:bg-background">
        <AuthMobileBackdrop />
        <div className="relative z-10 w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}

export function authFormCardClassName(extra?: string) {
  return cn("border-border/80 bg-card/95 shadow-sm backdrop-blur-sm lg:bg-card", extra);
}
