import { useQuery } from "@tanstack/react-query";

import { fetchWeeklyAnalytics } from "./weekly-analytics-api";

const QUERY_KEY = ["weekly-analytics"] as const;

export function useWeeklyAnalytics() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchWeeklyAnalytics,
    staleTime: 60_000,
  });
}
