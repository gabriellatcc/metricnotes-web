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
        <p className="text-sm text-foreground">Loading analytics…</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
        <p className="text-sm font-medium text-destructive">Could not load dashboard</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
        <Button type="button" variant="outline" className="mt-4" onClick={() => void refetch()}>
          Retry
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
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Weekly task analytics — heatmap, trends, and summary (mock data).
              </p>
            </div>
            {isFetching ? (
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin text-primary" aria-hidden />
                Refreshing…
              </span>
            ) : null}
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:grid-rows-2 lg:items-stretch">
          <div className="min-h-0 lg:min-h-[300px]">
            <HeatmapChart data={data} />
          </div>
          <div className="min-h-0 lg:min-h-[300px]">
            <WeeklyBarChart data={data} />
          </div>
          <div className="min-h-0 lg:min-h-[300px]">
            <TaskDistributionAreaChart data={data} />
          </div>
          <div className="min-h-0 lg:min-h-[300px]">
            <WeeklySummaryCard summary={data.summary} />
          </div>
        </div>
      </div>
    </div>
  );
}
