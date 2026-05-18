import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { DashboardOverviewCards } from "./dashboard-overview-cards";
import { useWeeklyAnalytics } from "./mock-weekly-analytics";

export function DashboardTodayPage() {
  const { data, isLoading, isError, error, refetch } = useWeeklyAnalytics();

  if (isLoading && !data) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="size-8 animate-spin text-primary" aria-hidden />
        <p className="text-sm text-foreground">Carregando dados do painel…</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-md text-center">
        <p className="text-sm font-medium text-destructive">Não foi possível carregar o resumo</p>
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
    <section>
      <DashboardOverviewCards weeklySummary={data.summary} />
    </section>
  );
}
