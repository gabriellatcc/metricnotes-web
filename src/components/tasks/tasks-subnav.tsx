import { ClipboardCheck, ClipboardList, LayoutList, Palette, Trash2 } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Navegação entre vistas da área Tarefas: quadro, lista, lixeira, tipos e concluídas. */
export function TasksSubNav({ className }: { className?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const boardActive = pathname === "/tasks" || pathname === "/tasks/";
  const allActive = pathname === "/tasks/all";
  const trashActive = pathname === "/tasks/trash";
  const typesActive = pathname === "/tasks/types";
  const doneActive = pathname === "/tasks/completed";

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
      aria-label="Vistas de tarefas"
    >
      <Link to="/tasks" className={linkClass(boardActive)}>
        <ClipboardList className="size-4 shrink-0 opacity-70" aria-hidden />
        Quadro
      </Link>
      <Link to="/tasks/all" className={linkClass(allActive)}>
        <LayoutList className="size-4 shrink-0 opacity-70" aria-hidden />
        Todas
      </Link>
      <Link to="/tasks/trash" className={linkClass(trashActive)}>
        <Trash2 className="size-4 shrink-0 opacity-70" aria-hidden />
        Lixeira
      </Link>
      <Link to="/tasks/types" className={linkClass(typesActive)}>
        <Palette className="size-4 shrink-0 opacity-70" aria-hidden />
        Tipos
      </Link>
      <Link to="/tasks/completed" className={linkClass(doneActive)}>
        <ClipboardCheck className="size-4 shrink-0 opacity-70" aria-hidden />
        Concluídas
      </Link>
    </nav>
  );
}
