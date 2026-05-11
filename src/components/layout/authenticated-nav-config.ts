import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  CalendarClock,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  LayoutList,
  Palette,
  SunMedium,
  Trash2,
} from "lucide-react";

export type AppNavLeaf = {
  readonly to: string;
  readonly label: string;
  readonly icon: LucideIcon;
};

export const APP_DASHBOARD_LEAVES: AppNavLeaf[] = [
  { to: "/dashboard", label: "Hoje", icon: SunMedium },
  { to: "/dashboard/week", label: "Últimos 7 dias", icon: BarChart3 },
  { to: "/dashboard/month", label: "Último mês", icon: CalendarClock },
  { to: "/dashboard/calendar", label: "Calendário", icon: CalendarDays },
];

export const APP_TASK_LEAVES: AppNavLeaf[] = [
  { to: "/tasks", label: "Quadro", icon: ClipboardList },
  { to: "/tasks/all", label: "Todas", icon: LayoutList },
  { to: "/tasks/trash", label: "Lixeira", icon: Trash2 },
  { to: "/tasks/types", label: "Tipos", icon: Palette },
  { to: "/tasks/completed", label: "Concluídas", icon: ClipboardCheck },
];

/** Match rules mirror previous SubNav helpers (exact paths vs prefix where needed). */
export function pathnameMatchesDashboardLeaf(pathname: string, to: string): boolean {
  if (to === "/dashboard") return pathname === "/dashboard" || pathname === "/dashboard/";
  return pathname === to;
}

export function pathnameMatchesTaskLeaf(pathname: string, to: string): boolean {
  if (to === "/tasks") return pathname === "/tasks" || pathname === "/tasks/";
  return pathname === to;
}
