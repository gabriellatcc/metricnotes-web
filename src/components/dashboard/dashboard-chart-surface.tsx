import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

const surfaceGradient =
  "relative flex h-full min-h-[200px] flex-col overflow-hidden rounded-2xl " +
  "border border-border/50 bg-gradient-to-br from-primary/[0.05] via-card to-muted/25 " +
  "p-3 text-card-foreground shadow-md shadow-primary/[0.07] " +
  "ring-1 ring-inset ring-white/15 dark:ring-white/5 sm:p-4";

const surfaceFlat =
  "relative flex h-full min-h-[200px] flex-col overflow-hidden rounded-2xl " +
  "border border-border bg-card p-3 text-card-foreground shadow-sm sm:p-4";

const shine =
  "pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-primary/15 blur-3xl";

type DashboardChartSurfaceProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  className?: string;
  /** Optional icon in the title row */
  icon?: ReactNode;
  /** Solid card, no background gradient (e.g. heatmap) */
  plain?: boolean;
};

export function DashboardChartSurface({ title, subtitle, children, className, icon, plain }: DashboardChartSurfaceProps) {
  return (
    <div className={cn(plain ? surfaceFlat : surfaceGradient, className)}>
      {plain ? null : <span className={shine} aria-hidden />}
      <div className="relative mb-2 flex shrink-0 items-start justify-between gap-2">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
            {icon ? <span className="text-primary/90">{icon}</span> : null}
            {title}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="relative min-h-0 w-full flex-1">{children}</div>
    </div>
  );
}
