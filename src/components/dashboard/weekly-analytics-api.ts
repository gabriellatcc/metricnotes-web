import { apiClient } from "@/lib/api-client";

import type { WeeklyAnalyticsData } from "./types";

type WeeklyAnalyticsResponse = {
  success: boolean;
  data: WeeklyAnalyticsData;
  message: string;
};

export async function fetchWeeklyAnalytics(): Promise<WeeklyAnalyticsData> {
  const res = await apiClient<WeeklyAnalyticsResponse>({ url: "/api/analytics/weekly", method: "GET" });
  return res.data;
}
