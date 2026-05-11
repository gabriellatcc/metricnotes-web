import type { WeeklyAnalyticsData } from "./types";

/** No registo há ≥ dias → gráficos de 7 dias em estado convite ao utilizador */
export const STALE_ANALYTICS_AFTER_DAYS = 7;

export type WeeklyChartsStatus =
  /** Sem dados suficientemente recentes (≥7 dias) ou sem série para mostrar tendência */
  | { kind: "stale_empty"; staleDays: number }
  /** Há série recente (<7 dias) mas nem todos os dias têm marcação */
  | { kind: "active_sparse"; recordedWeekdayCount: number }
  /** Uma marcação ou mais por dia da semanal considerada pelo gráfico (máximo 7) */
  | { kind: "active_complete" };

export function countWeekdaysWithCompletions(data: WeeklyAnalyticsData): number {
  return data.tasksPerWeekday.filter((d) => d.totalCompleted > 0).length;
}

export function totalCompletionsAcrossWeekCharts(data: WeeklyAnalyticsData): number {
  let n = 0;
  for (const d of data.tasksPerWeekday) n += d.totalCompleted;
  return n;
}

export function deriveWeeklyChartsStatus(data: WeeklyAnalyticsData): WeeklyChartsStatus {
  const meta = data.recordingMeta.daysSinceLastCompletion;
  const sum = totalCompletionsAcrossWeekCharts(data);

  /** Sem marcação há ≥ threshold OU backend não intipo marcação quando a série já veio vazia */
  const staleByMeta = meta !== null && meta >= STALE_ANALYTICS_AFTER_DAYS;
  const staleByEmptySeriesWithoutSignal = meta === null && sum === 0;

  if (staleByMeta || staleByEmptySeriesWithoutSignal) {
    return {
      kind: "stale_empty",
      staleDays: staleByMeta && meta !== null ? meta : STALE_ANALYTICS_AFTER_DAYS,
    };
  }

  const recorded = countWeekdaysWithCompletions(data);
  /** Série há mas parcial dentro da janela */
  if (sum > 0 && recorded > 0 && recorded < 7) {
    return { kind: "active_sparse", recordedWeekdayCount: recorded };
  }
  return { kind: "active_complete" };
}
