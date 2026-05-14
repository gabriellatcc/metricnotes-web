import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type DashboardCardShellProps = {
  title: string;
  subtitle?: string;
  /** Lucide ícone ao lado do título, só traço — sem fundo nem borda. */
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
  /** Conteúdo opcional à direita do cabeçalho (filtros, ações). */
  headerAside?: ReactNode;
  /**
   * `plain` — título + conteúdo sem caixa (sem borda/fundo próprios).
   * Útil quando o bloco já está dentro de um layout alinhado à largura da página.
   */
  variant?: "card" | "plain";
};

/** Cartão padrão do painel estilo shadcn: ícone + título numa linha, descrição e corpo por baixo. */
export function DashboardCardShell({
  title,
  subtitle,
  icon: Icon,
  children,
  className,
  headerAside,
  variant = "card",
}: DashboardCardShellProps) {
  const isPlain = variant === "plain";

  return (
    <div
      className={cn(
        "flex h-full min-h-[200px] flex-col text-card-foreground shadow-none",
        isPlain
          ? "border-0 bg-transparent p-0"
          : "rounded-xl border border-border/70 bg-card p-4",
        className,
      )}
    >
      <div className={cn("flex shrink-0 items-start justify-between gap-3", isPlain ? "mb-3" : "mb-4")}>
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            {Icon ? <Icon className="size-4 shrink-0 stroke-[2] text-muted-foreground" aria-hidden /> : null}
            <h3 className="text-sm font-medium leading-none tracking-tight text-foreground">{title}</h3>
          </div>
          {subtitle ? <p className="text-xs leading-relaxed text-muted-foreground">{subtitle}</p> : null}
        </div>
        {headerAside}
      </div>
      <div className="relative min-h-0 w-full flex-1">{children}</div>
    </div>
  );
}
