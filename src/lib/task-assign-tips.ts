import { apiClient } from "@/lib/api-client";

/** PATCH `/api/task/:id/type` — usa `tip_ids` como no backend (/swagger diverge como `tips_ids`). */
export async function assignTaskTipIds(taskId: string, tipIds: string[]): Promise<void> {
  const unique = [...new Set(tipIds)].filter(Boolean);
  await apiClient<{ success?: boolean }>({
    url: `/api/task/${taskId}/type`,
    method: "PATCH",
    data: { tip_ids: unique },
  });
}
