import type { ReactNode } from "react";

import { AuthAnimatedSide, AuthMobileBackdrop } from "@/components/auth/auth-animated-side";
import { cn } from "@/lib/utils";

type AuthPageLayoutProps = {
  children: ReactNode;
  variant?: "login" | "signup";
};

export function AuthPageLayout({ children, variant = "login" }: AuthPageLayoutProps) {
  return (
    <div className="relative min-h-screen lg:grid lg:grid-cols-2">      
      <div 
        className="absolute left-1/2 top-0 hidden h-[45vh] w-px -translate-x-1/2 bg-gradient-to-b from-chart-4 to-transparent lg:block" 
        aria-hidden="true" 
      />

      <AuthAnimatedSide variant={variant} />
      <div className="relative flex min-h-screen items-center justify-center bg-muted/30 p-4 lg:bg-muted/50">
        <AuthMobileBackdrop />
        <div className="relative z-10 w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}

export function authFormCardClassName(extra?: string) {
  return cn("border-border/80 bg-card/95 shadow-sm backdrop-blur-sm lg:bg-card", extra);
}