import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { HeatmapChart } from "./HeatmapChart";
import { useWeeklyAnalytics } from "./mock-weekly-analytics";
import { TaskDistributionAreaChart } from "./TaskDistributionAreaChart";
import { WeeklyBarChart } from "./WeeklyBarChart";
import { WeeklySummaryCard } from "./WeeklySummaryCard";

export function Dashboard() {
  const { data, isLoading, isError, error, refetch, isFetching } = useWeeklyAnalytics();

  if (isLoading && !data) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 bg-background text-muted-foreground">
        <Loader2 className="size-8 animate-spin text-primary" aria-hidden />
        <p className="text-sm text-foreground">Carregando análises…</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
        <p className="text-sm font-medium text-destructive">Não foi possível carregar o painel</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "Erro desconhecido"}
        </p>
        <Button type="button" variant="outline" className="mt-4" onClick={() => void refetch()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 border-b border-border pb-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">Painel</h1>
              <p className="mt-1 max-w-2xl text-pretty text-sm text-muted-foreground">
                Todos os gráficos e números abaixo referem-se à <strong className="font-medium text-foreground">última
                semana</strong> (sete dias, de segunda a domingo). Conteúdo de exemplo até existir integração com a
                API.
              </p>
            </div>
            {isFetching ? (
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin text-primary" aria-hidden />
                Atualizando…
              </span>
            ) : null}
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:grid-rows-2 lg:items-stretch">
          <div className="min-h-0 lg:min-h-[220px]">
            <HeatmapChart data={data} />
          </div>
          <div className="min-h-0 lg:min-h-[220px]">
            <WeeklyBarChart data={data} />
          </div>
          <div className="min-h-0 lg:min-h-[220px]">
            <TaskDistributionAreaChart data={data} />
          </div>
          <div className="min-h-0 lg:min-h-[220px]">
            <WeeklySummaryCard summary={data.summary} />
          </div>
        </div>
      </div>
    </div>
  );
}
