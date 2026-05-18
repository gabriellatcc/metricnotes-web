import { AnimatePresence, motion } from "framer-motion";
import { useRouterState } from "@tanstack/react-router";

import { APP_DASHBOARD_LEAVES, pathnameMatchesDashboardLeaf } from "@/components/layout/authenticated-nav-config";
import { cn } from "@/lib/utils";

const DASHBOARD_TAB_COPY = {
  today:
    "Acompanhe suas métricas e tarefas de hoje. Para um panorama maior, explore a visão semanal ou o calendário.",
  week:
    "Analise seu ritmo ao longo da semana. Descubra seus horários mais produtivos e retome facilmente as tarefas do quadro.",
  month:
    "Um resumo consolidado do seu mês (em aprimoramento). Por enquanto, recomendamos explorar a visão semanal ou o calendário.",
  calendar:
    "Visualize e gerencie os prazos das suas tarefas. Todas as alterações são sincronizadas automaticamente com o seu quadro principal.",
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