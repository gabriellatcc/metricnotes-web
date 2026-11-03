import { type WeeklyAnalyticsData } from './../components/dashboard/types';
import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

const QUERY_KEY = ["weekly-analytics"] as const;

async function fetchWeeklyAnalytics(): Promise<WeeklyAnalyticsData> {
  return apiClient<WeeklyAnalyticsData>({
    url: "/analytics/weekly",
    method: "GET",
  });
}

export function useWeeklyAnalytics() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchWeeklyAnalytics,
    staleTime: 60_000,
  });
}