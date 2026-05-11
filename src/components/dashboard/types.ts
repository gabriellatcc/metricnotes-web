/** Day index: 0 = Monday … 6 = Sunday */
export type WeekdayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface HeatmapCell {
  dayIndex: WeekdayIndex;
  /** Matches an entry in `timeBlocks` order (0-based row index). */
  timeBlockIndex: number;
  completedCount: number;
}

export interface WeekdayTaskTotal {
  dayIndex: WeekdayIndex;
  /** Short label for charts, e.g. "Mon" */
  shortLabel: string;
  totalCompleted: number;
}

export interface TimeBlockDistribution {
  /** Stable id, e.g. "06-09" */
  blockId: string;
  /** Display label for axis */
  label: string;
  totalCompleted: number;
}

export interface WeeklyPerformanceSummary {
  totalTasksWeek: number;
  dailyAverage: number;
  bestDay: { label: string; total: number };
  bestTimeBlock: { label: string; total: number };
  /** Short bullet insights derived from the same dataset */
  insights: string[];
}

/** Metadados para estados dos gráficos de “últimos 7 dias” (painel). */
export interface WeeklyRecordingMeta {
  /**
   * Dias completos desde a última data em que existiu pelo menos uma conclusão
   * registada nos agregados usados pelo painel (para heatmap/barra).
   * `null`: sem registos válidos segundo o servidor.
   */
  daysSinceLastCompletion: number | null;
}

/**
 * Shape expected from a future `GET /analytics/weekly` (or similar) endpoint.
 */
export interface WeeklyAnalyticsData {
  /** Y-axis labels, top-to-bottom = morning → evening */
  timeBlocks: string[];
  heatmap: HeatmapCell[];
  tasksPerWeekday: WeekdayTaskTotal[];
  distributionByTimeBlock: TimeBlockDistribution[];
  summary: WeeklyPerformanceSummary;
  recordingMeta: WeeklyRecordingMeta;
}
