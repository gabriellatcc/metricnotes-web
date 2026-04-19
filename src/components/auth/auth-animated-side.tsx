import { cn } from "@/lib/utils";

type AuthAnimatedSideProps = {
  variant?: "login" | "signup";
  className?: string;
};

export function AuthAnimatedSide({ variant = "login", className }: AuthAnimatedSideProps) {
  const title = variant === "login" ? "Bem vindo de volta" : "Se junte ao Metricnotes";
  const subtitle =
    variant === "login"
      ? "Continue onde você parou."
      : "Crie uma conta e comece a organizar.";

  return (
    <div
      className={cn(
        "relative hidden min-h-[240px] overflow-hidden bg-gradient-to-br from-primary/15 via-background to-accent/20 lg:flex lg:min-h-screen",
        className,
      )}
      aria-hidden
    >
      {/* Floating blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="auth-blob auth-blob-1 absolute -left-20 top-1/4 size-72 rounded-full bg-primary/25 blur-3xl" />
        <div className="auth-blob auth-blob-2 absolute bottom-1/4 right-[-10%] size-96 rounded-full bg-accent/30 blur-3xl" />
        <div className="auth-blob auth-blob-3 absolute left-1/3 top-[-20%] size-64 rounded-full bg-secondary/40 blur-2xl" />
      </div>

      <div className="relative z-10 flex w-full flex-col justify-center gap-8 px-10 py-12 lg:px-14">
        <div className="space-y-2">
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
            {title}
          </h1>
          <p className="max-w-sm text-muted-foreground">{subtitle}</p>
        </div>

        {/* Simple line illustration */}
        <div className="auth-illustration text-primary/90">
          <svg
            viewBox="0 0 400 280"
            className="h-auto w-full max-w-md"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Notes illustration</title>
            <rect
              x="48"
              y="40"
              width="220"
              height="200"
              rx="12"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M80 88h156M80 120h120M80 152h140"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="320" cy="72" r="36" stroke="currentColor" strokeWidth="2" />
            <path
              d="M304 72l10 10 22-22"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect
              x="260"
              y="160"
              width="92"
              height="72"
              rx="8"
              stroke="currentColor"
              strokeWidth="2"
              className="auth-float-slow opacity-80"
            />
            <path d="M276 188h60M276 204h44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="opacity-70" />
          </svg>
        </div>
      </div>
    </div>
  );
}

/** Mobile-only subtle animated backdrop behind the form */
export function AuthMobileBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden lg:hidden" aria-hidden>
      <div className="auth-blob auth-blob-1 absolute -right-16 top-0 size-56 rounded-full bg-primary/20 blur-3xl" />
      <div className="auth-blob auth-blob-2 absolute bottom-20 left-[-20%] size-64 rounded-full bg-accent/25 blur-3xl" />
    </div>
  );
}
