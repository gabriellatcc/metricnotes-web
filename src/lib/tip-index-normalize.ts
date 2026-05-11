import type { TipResource } from "@/generated/api/models";

/**
 * `GET /api/tip`: o backend (Laravel `ResourceCollection` + paginação) expõe
 * `{ success, data: { data: TipResource[], links?, meta? } }`. O modelo Orval
 * segue o padrão de tarefas com `items`. Aceitamos os dois formatos.
 */
export function tipListFromIndexPayload(data: unknown): TipResource[] {
  if (!data || typeof data !== "object") return [];
  const o = data as Record<string, unknown>;
  if (Array.isArray(o.items)) return o.items as TipResource[];
  const inner = o.data;
  if (Array.isArray(inner)) return inner as TipResource[];
  return [];
}
