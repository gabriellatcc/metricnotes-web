import { AnimatePresence, motion } from "framer-motion";
import { useRouterState } from "@tanstack/react-router";

import { APP_DASHBOARD_LEAVES, pathnameMatchesDashboardLeaf } from "@/components/layout/authenticated-nav-config";
import { cn } from "@/lib/utils";

/** Descrições do cabeçalho por vista do painel (alinhadas à sidebar). */
const DASHBOARD_TAB_COPY = {
  today:
    "Visualização diária agregada com os mesmos princípios do painel — ainda em construção. Use Últimos 7 dias ou o calendário de prazos enquanto esta vista evolui.",
  week:
    "Mapa por dia × faixa horária e barras por dia da semanal. Sem conclusões registadas há bastante tempo, aparece um convite para regressar ao quadro.",
  month:
    "Visualização mensal agregada com os mesmos princípios do painel — ainda em construção. Use Últimos 7 dias ou o calendário de prazos enquanto esta vista evolui.",
  calendar:
    "Prazos das tarefas no calendário mensal. As alterações refletem o mesmo conjunto de tarefas do quadro.",
} as const;

type DashboardSegment = keyof typeof DASHBOARD_TAB_COPY;

function dashboardDescriptionSegment(pathname: string): DashboardSegment {
  for (const leaf of APP_DASHBOARD_LEAVES) {
    if (!pathnameMatchesDashboardLeaf(pathname, leaf.to)) continue;
    switch (leaf.to) {
      case "/dashboard":
        return "today";
      case "/dashboard/week":
        return "week";
      case "/dashboard/month":
        return "month";
      case "/dashboard/calendar":
        return "calendar";
      default:
        break;
    }
  }
  return "today";
}

export function DashboardAreaDescription({ className }: { className?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const segment = dashboardDescriptionSegment(pathname);
  const text = DASHBOARD_TAB_COPY[segment];

  return (
    <div className={cn("mt-1", className)} aria-live="polite" aria-atomic="true">
      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={segment}
          className="max-w-2xl text-pretty text-sm text-muted-foreground"
          initial={{ opacity: 0, y: 6, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -6, filter: "blur(6px)" }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {text}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
