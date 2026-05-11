import type { TipResource } from "@/generated/api/models";

/**
 * `GET /api/tip`: o Laravel pode responder com
 * `{ success, data: TipResource[] }` (coleção simples), ou `{ data: { items, pagination } }`
 * quando paginado. O Orval tipa `items`; em runtime aceitamos também o array direto.
 */
export function tipListFromIndexPayload(data: unknown): TipResource[] {
  if (data == null) return [];
  if (Array.isArray(data)) return data as TipResource[];
  if (typeof data !== "object") return [];
  const o = data as Record<string, unknown>;
  if (Array.isArray(o.items)) return o.items as TipResource[];
  const inner = o.data;
  if (Array.isArray(inner)) return inner as TipResource[];
  return [];
}
