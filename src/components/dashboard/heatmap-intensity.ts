/** Passos da rampa para legenda Alvo ≈ menor volume → maior (relativo ao máximo da semana). */
export const HEATMAP_LEGEND_CLASSES = [
  "bg-muted",
  "bg-chart-3/30",
  "bg-chart-4/45",
  "bg-chart-2/55",
  "bg-chart-1/45",
  "bg-chart-1/70",
  "bg-chart-1/85",
  "bg-chart-5",
] as const;

/** Density using theme chart tokens for a richer ramp than primary-only */
export function heatmapIntensityClass(value: number, max: number): string {
  if (max <= 0 || value <= 0) return "bg-muted";
  const t = value / max;
  if (t < 0.14) return "bg-muted";
  if (t < 0.26) return "bg-chart-3/30";
  if (t < 0.38) return "bg-chart-4/45";
  if (t < 0.5) return "bg-chart-2/55";
  if (t < 0.62) return "bg-chart-1/45";
  if (t < 0.74) return "bg-chart-1/70";
  if (t < 0.86) return "bg-chart-1/85";
  return "bg-chart-5";
}
