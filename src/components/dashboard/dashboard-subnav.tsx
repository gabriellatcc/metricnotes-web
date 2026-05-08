import { BarChart3, CalendarClock, CalendarDays, SunMedium } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Navegação entre vistas principais do painel (equivalente à de Tarefas). */
export function DashboardSubNav({ className }: { className?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const todayActive = pathname === "/dashboard" || pathname === "/dashboard/";
  const weekActive = pathname === "/dashboard/week";
  const monthActive = pathname === "/dashboard/month";
  const calActive = pathname === "/dashboard/calendar";

  const linkClass = (active: boolean) =>
    cn(
      buttonVariants({ variant: "ghost", size: "sm" }),
      "gap-2 rounded-full px-4 transition-colors",
      active && "bg-foreground text-background hover:bg-foreground hover:text-background",
    );

  return (
    <nav
      role="navigation"
      className={cn("flex flex-wrap justify-start gap-1 sm:gap-2", className)}
      aria-label="Vistas do painel"
    >
      <Link to="/dashboard" className={linkClass(todayActive)}>
        <SunMedium className="size-4 shrink-0 opacity-70" aria-hidden />
        Hoje
      </Link>
      <Link to="/dashboard/week" className={linkClass(weekActive)}>
        <BarChart3 className="size-4 shrink-0 opacity-70" aria-hidden />
        Últimos 7 dias
      </Link>
      <Link to="/dashboard/month" className={linkClass(monthActive)}>
        <CalendarClock className="size-4 shrink-0 opacity-70" aria-hidden />
        Último mês
      </Link>
      <Link to="/dashboard/calendar" className={linkClass(calActive)}>
        <CalendarDays className="size-4 shrink-0 opacity-70" aria-hidden />
        Calendário
      </Link>
    </nav>
  );
}
