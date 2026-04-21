import { useQuery } from "@tanstack/react-query";

import type { WeeklyAnalyticsData } from "./types";

/**
 * Dados de exemplo: representam uma **última semana** (7 dias, Seg–Dom) de tarefas concluídas.
 * Suficiente volume para o mapa de calor e os gráficos.
 */
export const MOCK_WEEKLY_ANALYTICS: WeeklyAnalyticsData = {
  timeBlocks: ["06:00–09:00", "09:00–12:00", "12:00–15:00", "15:00–18:00", "18:00–21:00"],
  heatmap: [
    { dayIndex: 0, timeBlockIndex: 0, completedCount: 2 },
    { dayIndex: 0, timeBlockIndex: 1, completedCount: 8 },
    { dayIndex: 0, timeBlockIndex: 2, completedCount: 5 },
    { dayIndex: 0, timeBlockIndex: 3, completedCount: 6 },
    { dayIndex: 0, timeBlockIndex: 4, completedCount: 1 },
    { dayIndex: 1, timeBlockIndex: 0, completedCount: 4 },
    { dayIndex: 1, timeBlockIndex: 1, completedCount: 12 },
    { dayIndex: 1, timeBlockIndex: 2, completedCount: 7 },
    { dayIndex: 1, timeBlockIndex: 3, completedCount: 9 },
    { dayIndex: 1, timeBlockIndex: 4, completedCount: 3 },
    { dayIndex: 2, timeBlockIndex: 0, completedCount: 3 },
    { dayIndex: 2, timeBlockIndex: 1, completedCount: 14 },
    { dayIndex: 2, timeBlockIndex: 2, completedCount: 6 },
    { dayIndex: 2, timeBlockIndex: 3, completedCount: 8 },
    { dayIndex: 2, timeBlockIndex: 4, completedCount: 2 },
    { dayIndex: 3, timeBlockIndex: 0, completedCount: 1 },
    { dayIndex: 3, timeBlockIndex: 1, completedCount: 10 },
    { dayIndex: 3, timeBlockIndex: 2, completedCount: 9 },
    { dayIndex: 3, timeBlockIndex: 3, completedCount: 11 },
    { dayIndex: 3, timeBlockIndex: 4, completedCount: 4 },
    { dayIndex: 4, timeBlockIndex: 0, completedCount: 5 },
    { dayIndex: 4, timeBlockIndex: 1, completedCount: 11 },
    { dayIndex: 4, timeBlockIndex: 2, completedCount: 4 },
    { dayIndex: 4, timeBlockIndex: 3, completedCount: 7 },
    { dayIndex: 4, timeBlockIndex: 4, completedCount: 6 },
    { dayIndex: 5, timeBlockIndex: 0, completedCount: 2 },
    { dayIndex: 5, timeBlockIndex: 1, completedCount: 6 },
    { dayIndex: 5, timeBlockIndex: 2, completedCount: 3 },
    { dayIndex: 5, timeBlockIndex: 3, completedCount: 4 },
    { dayIndex: 5, timeBlockIndex: 4, completedCount: 8 },
    { dayIndex: 6, timeBlockIndex: 0, completedCount: 1 },
    { dayIndex: 6, timeBlockIndex: 1, completedCount: 4 },
    { dayIndex: 6, timeBlockIndex: 2, completedCount: 2 },
    { dayIndex: 6, timeBlockIndex: 3, completedCount: 3 },
    { dayIndex: 6, timeBlockIndex: 4, completedCount: 2 },
  ],
  tasksPerWeekday: [
    { dayIndex: 0, shortLabel: "Seg", totalCompleted: 22 },
    { dayIndex: 1, shortLabel: "Ter", totalCompleted: 35 },
    { dayIndex: 2, shortLabel: "Qua", totalCompleted: 33 },
    { dayIndex: 3, shortLabel: "Qui", totalCompleted: 35 },
    { dayIndex: 4, shortLabel: "Sex", totalCompleted: 33 },
    { dayIndex: 5, shortLabel: "Sáb", totalCompleted: 23 },
    { dayIndex: 6, shortLabel: "Dom", totalCompleted: 12 },
  ],
  distributionByTimeBlock: [
    { blockId: "06-09", label: "06–09", totalCompleted: 18 },
    { blockId: "09-12", label: "09–12", totalCompleted: 65 },
    { blockId: "12-15", label: "12–15", totalCompleted: 46 },
    { blockId: "15-18", label: "15–18", totalCompleted: 48 },
    { blockId: "18-21", label: "18–21", totalCompleted: 26 },
  ],
  summary: {
    totalTasksWeek: 193,
    dailyAverage: 27.6,
    bestDay: { label: "Terça-feira", total: 35 },
    bestTimeBlock: { label: "09:00–12:00", total: 65 },
    insights: [
      "O meio da manhã (09–12) concentra o maior volume de conclusões — proteja essa janela para trabalho focado.",
      "Terça e quinta são seus dias mais fortes; considere agendar revisões nos dias mais leves.",
      "O fim de semana é mais tranquilo; agrupe tarefas pequenas no sábado à noite se precisar zerar o backlog.",
    ],
  },
};

async function fetchWeeklyAnalytics(): Promise<WeeklyAnalyticsData> {
  await new Promise((r) => setTimeout(r, 180));
  return MOCK_WEEKLY_ANALYTICS;
}

const QUERY_KEY = ["weekly-analytics"] as const;

/**
 * Hook de API de exemplo — troque `queryFn` por uma chamada real ao `apiClient` quando o endpoint existir.
 */
export function useWeeklyAnalytics() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchWeeklyAnalytics,
    staleTime: 60_000,
  });
}
