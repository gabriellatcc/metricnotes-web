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
  /** Temporariamente indisponível na navegação (tooltip em vez de link). */
  readonly comingSoon?: boolean;
};

export const DASHBOARD_MONTH_COMING_SOON_TOOLTIP =
  "Em construção! Por agora, explore Últimos 7 dias.";

export const APP_DASHBOARD_LEAVES: AppNavLeaf[] = [
  { to: "/dashboard", label: "Hoje", icon: SunMedium },
  { to: "/dashboard/week", label: "Últimos 7 dias", icon: BarChart3 },
  { to: "/dashboard/month", label: "Último mês", icon: CalendarClock, comingSoon: true },
  { to: "/dashboard/calendar", label: "Calendário", icon: CalendarDays },
];

export const APP_TASK_LEAVES: AppNavLeaf[] = [
  { to: "/tasks", label: "Quadro", icon: ClipboardList },
  { to: "/tasks/all", label: "Todas", icon: LayoutList },
  { to: "/tasks/trash", label: "Lixeira", icon: Trash2 },
  { to: "/tasks/types", label: "Tipos", icon: Palette },
  { to: "/tasks/completed", label: "Concluídas", icon: ClipboardCheck },
];

export type AppShellTitleSegment = {
  readonly label: string;
  /** Ligação até à raíz da área (só aplicada aos segmentos que não são o último). */
  readonly href?: string;
};

/**
 * Segmentos para o título da barra (estilo Painel · Hoje).
 * O último segmento é sempre a página actual; os anteriores ligam à raíz da secção quando `href` está definido.
 */
export function getAppShellTitleSegments(pathname: string): AppShellTitleSegment[] {
  const p = pathname || "";
  if (p === "/" || p === "") {
    return [{ label: "Início", href: "/" }];
  }
  if (p.startsWith("/dashboard")) {
    const leaf = APP_DASHBOARD_LEAVES.find((l) => pathnameMatchesDashboardLeaf(p, l.to));
    if (leaf) {
      return [{ label: "Painel", href: "/dashboard" }, { label: leaf.label }];
    }
    return [{ label: "Painel", href: "/dashboard" }];
  }
  if (p.startsWith("/tasks")) {
    const leaf = APP_TASK_LEAVES.find((l) => pathnameMatchesTaskLeaf(p, l.to));
    if (leaf) {
      return [{ label: "Tarefas", href: "/tasks" }, { label: leaf.label }];
    }
    return [{ label: "Tarefas", href: "/tasks" }];
  }
  if (p.startsWith("/notes")) {
    return [{ label: "Notas" }];
  }
  if (p.startsWith("/settings")) {
    return [{ label: "Configurações" }];
  }
  return [{ label: "Metricnotes" }];
}

export const APP_DOCUMENT_TITLE_BRAND = "Metricnotes";

/** Para `<title>` da página — espelha os segmentos do cabeçalho (aba · área · app). */
export function documentTitleFromPath(pathname: string): string {
  const segments = getAppShellTitleSegments(pathname);
  if (segments.length >= 2) {
    const root = segments[0];
    const leaf = segments[segments.length - 1];
    return `${leaf.label} · ${root.label} · ${APP_DOCUMENT_TITLE_BRAND}`;
  }
  return `${segments[0].label} · ${APP_DOCUMENT_TITLE_BRAND}`;
}

/** Match rules mirror previous SubNav helpers (exact paths vs prefix where needed). */
export function pathnameMatchesDashboardLeaf(pathname: string, to: string): boolean {
  if (to === "/dashboard") return pathname === "/dashboard" || pathname === "/dashboard/";
  return pathname === to;
}

export function pathnameMatchesTaskLeaf(pathname: string, to: string): boolean {
  if (to === "/tasks") return pathname === "/tasks" || pathname === "/tasks/";
  return pathname === to;
}
