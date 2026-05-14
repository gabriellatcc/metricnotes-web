import { AnimatePresence, motion } from "framer-motion";
import { useRouterState } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

/** Descrições do cabeçalho da área Tarefas, alinhadas à subaba atual. */
const TASKS_TAB_COPY: Record<"board" | "all" | "trash" | "types" | "completed", string> =
  {
    board:
      "Arraste cartas entre colunas, crie pelo quadro e acompanhe o fluxo sem sair desta vista. Para prazos no calendário, use o Painel.",
    all:
      "Lista de todas as tarefas ativas: busca, filtro por status, filtro por tipo e paginação. Clique num cartão para ver detalhes; edite ou envie para a lixeira pelos botões.",
    trash:
      "Tarefas que removeu ficam aqui até restaurá-las. Pode desfazer sempre que precisar.",
    types:
      "Crie tipos com nome e cor para identificar tarefas no quadro e nas listas. Edite ou remova quando as convenções mudarem.",
    completed:
      "Aqui pode ver o histórico por data das tarefas já concluídas recentemente, sem misturar com o trabalho em aberto.",
  };

function tasksDescriptionSegment(pathname: string): keyof typeof TASKS_TAB_COPY {
  if (pathname === "/tasks" || pathname === "/tasks/") return "board";
  if (pathname.startsWith("/tasks/all")) return "all";
  if (pathname.startsWith("/tasks/trash")) return "trash";
  if (pathname.startsWith("/tasks/types")) return "types";
  if (pathname.startsWith("/tasks/completed")) return "completed";
  return "board";
}

export function TasksAreaDescription({ className }: { className?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const segment = tasksDescriptionSegment(pathname);
  const text = TASKS_TAB_COPY[segment];

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
