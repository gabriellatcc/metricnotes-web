import { CalendarDays, ClipboardCheck, ClipboardList } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Navegação entre vistas da área Tarefas (quadro / calendário / concluídas). */
export function TasksSubNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const boardActive = pathname === "/tasks" || pathname === "/tasks/";
  const calActive = pathname === "/tasks/calendar";
  const doneActive = pathname === "/tasks/completed";

  const linkClass = (active: boolean) =>
    cn(
      buttonVariants({ variant: "ghost", size: "sm" }),
      "gap-2 rounded-full px-4 transition-colors",
      active && "bg-foreground text-background hover:bg-foreground hover:text-background",
    );

  return (
    <nav
      className="border-border flex flex-wrap justify-center gap-1 border-b pb-3 sm:gap-2"
      aria-label="Vistas de tarefas"
    >
      <Link to="/tasks" className={linkClass(boardActive)}>
        <ClipboardList className="size-4 shrink-0 opacity-70" aria-hidden />
        Quadro
      </Link>
      <Link to="/tasks/calendar" className={linkClass(calActive)}>
        <CalendarDays className="size-4 shrink-0 opacity-70" aria-hidden />
        Calendário
      </Link>
      <Link to="/tasks/completed" className={linkClass(doneActive)}>
        <ClipboardCheck className="size-4 shrink-0 opacity-70" aria-hidden />
        Concluídas
      </Link>
    </nav>
  );
}
