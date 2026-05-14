import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { SparseWeekInsightsBanner } from "./dashboard-weekly-charts-feedback";
import { HeatmapChart } from "./HeatmapChart";
import { useWeeklyAnalytics } from "./mock-weekly-analytics";
import { WeeklyBarChart } from "./WeeklyBarChart";
import { STALE_ANALYTICS_AFTER_DAYS, deriveWeeklyChartsStatus } from "./weekly-charts-meta";

const WEEK_INTRO =
  "Mapa por dia × faixa horária e barras por dia da semanal. Se não há conclusões registadas há pelo menos 7 dias, estes espaços ficam por preencher com um convite a voltar ao quadro de tarefas.";

export function DashboardWeekPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useWeeklyAnalytics();

  if (isLoading && !data) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="size-8 animate-spin text-primary" aria-hidden />
        <p className="text-sm text-foreground">Carregando gráficos…</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
        <p className="text-sm font-medium text-destructive">Não foi possível carregar os gráficos</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "Erro desconhecido"}
        </p>
        <Button type="button" variant="outline" className="mt-4" onClick={() => void refetch()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  const chartsStatus = deriveWeeklyChartsStatus(data);
  const chartsStale = chartsStatus.kind === "stale_empty";
  const staleDays =
    chartsStatus.kind === "stale_empty" ? chartsStatus.staleDays : STALE_ANALYTICS_AFTER_DAYS;

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <div className="mb-1 flex flex-wrap items-center justify-end gap-2">
        {isFetching ? (
          <span className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin text-primary" aria-hidden />
            Atualizando…
          </span>
        ) : null}
      </div>
      <p className="mb-6 max-w-3xl text-pretty text-sm text-muted-foreground">{WEEK_INTRO}</p>

      {chartsStatus.kind === "active_sparse" ? (
        <SparseWeekInsightsBanner recordedWeekdays={chartsStatus.recordedWeekdayCount} />
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-stretch lg:gap-5">
        <div className="min-h-0 lg:min-h-[320px]">
          <HeatmapChart data={data} chartsStale={chartsStale} staleDays={staleDays} />
        </div>
        <div className="min-h-0 lg:min-h-[320px]">
          <WeeklyBarChart data={data} chartsStale={chartsStale} staleDays={staleDays} />
        </div>
      </div>
    </section>
  );
}
