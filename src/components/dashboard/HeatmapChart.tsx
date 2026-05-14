import { LayoutGrid } from "lucide-react";
import { useMemo } from "react";

import { cn } from "@/lib/utils";

import { DashboardCardShell } from "./dashboard-card-shell";
import { HEATMAP_LEGEND_CLASSES, heatmapIntensityClass } from "./heatmap-intensity";
import type { WeekdayIndex, WeeklyAnalyticsData } from "./types";
import { WeeklyChartsStalePlaceholder } from "./dashboard-weekly-charts-feedback";

const WEEKDAY_LABELS: readonly string[] = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function cellKey(day: WeekdayIndex, row: number) {
  return `${day}-${row}`;
}

type HeatmapChartProps = {
  data: WeeklyAnalyticsData;
  /** Quando verdadeiro, esconde a grelha e mostra o convite ao utilizador. */
  chartsStale?: boolean;
  staleDays?: number;
};

function DensityLegendHeatmapFooter() {
  return (
    <div className="mt-4 flex flex-col gap-2">
      <p className="text-[10px] leading-snug text-muted-foreground">
        <span className="font-medium text-foreground">Legendas das cores:</span> cada quadradinho mostra quantas tarefas foram
        concluídas naquele dia e faixa horária na semana atual. A intensidade da cor é sempre relativa ao{" "}
        <strong className="font-medium text-foreground">máximo da própria semana</strong> (não compara com outros
        utilizadores): cores mais claras = menos volume nessa célula; mais fortes = mais próximo do pico da série.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Menos volume</span>
        <div
          className="flex h-4 min-w-[140px] max-w-[min(260px,calc(100%-6rem))] flex-1 overflow-hidden rounded-[3px] ring-1 ring-border/55"
          role="presentation"
          aria-hidden
        >
          {HEATMAP_LEGEND_CLASSES.map((cls, i) => (
            // eslint-disable-next-line react/no-array-index-key -- legenda ordenada estável
            <span key={i} className={cn(cls, i === HEATMAP_LEGEND_CLASSES.length - 1 ? "min-w-[8%]" : "min-w-[10%]", "flex-1")} />
          ))}
        </div>
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Mais volume</span>
      </div>
    </div>
  );
}

export function HeatmapChart({ data, chartsStale = false, staleDays = 7 }: HeatmapChartProps) {
  const { matrix, max } = useMemo(() => {
    const map = new Map<string, number>();
    let maxVal = 0;
    for (const c of data.heatmap) {
      const k = cellKey(c.dayIndex, c.timeBlockIndex);
      map.set(k, c.completedCount);
      if (c.completedCount > maxVal) maxVal = c.completedCount;
    }
    return { matrix: map, max: maxVal };
  }, [data.heatmap]);

  const rows = data.timeBlocks.length;
  /** Células visualmente próximas de quadrados (tamanho fixo em rem + gap controlado). */
  const CELL = "2.125rem"; // ~34px mais “quadrado” que antes

  return (
    <DashboardCardShell
      variant="plain"
      icon={LayoutGrid}
      title="Densidade de conclusões"
      subtitle="Dia da semana × faixa horária · série dos últimos 7 dias (Seg–Dom)"
    >
      {chartsStale ? (
        <WeeklyChartsStalePlaceholder staleDays={staleDays} />
      ) : (
        <>
          <div className="flex min-h-[256px] min-w-0 flex-1 flex-col overflow-x-auto pb-px">
            <div
              className="mx-auto grid w-max max-w-full gap-2"
              style={{
                gridTemplateColumns: `minmax(4rem, 4.5rem) repeat(7, minmax(${CELL}, ${CELL}))`,
                gridTemplateRows: `auto repeat(${rows}, minmax(${CELL}, ${CELL}))`,
              }}
            >
              <div />
              {WEEKDAY_LABELS.map((d) => (
                <div
                  key={d}
                  className="flex items-end justify-center pb-0.5 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {d}
                </div>
              ))}
              {data.timeBlocks.map((block, row) => (
                <div key={block} className="contents">
                  <div className="flex items-center justify-end pr-1 text-[10px] font-medium leading-tight tabular-nums text-muted-foreground">
                    {block}
                  </div>
                  {([0, 1, 2, 3, 4, 5, 6] as const).map((day) => {
                    const v = matrix.get(cellKey(day, row)) ?? 0;
                    return (
                      <div
                        key={cellKey(day, row)}
                        title={`${WEEKDAY_LABELS[day]} ${block}: ${v} tarefas`}
                        className={cn(
                          "aspect-square rounded-[3px] ring-1 ring-border/35 transition-colors duration-150 hover:z-[1] hover:ring-2 hover:ring-primary/35",
                          heatmapIntensityClass(v, max),
                        )}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <DensityLegendHeatmapFooter />
        </>
      )}
    </DashboardCardShell>
  );
}
