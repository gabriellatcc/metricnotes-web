/** Normaliza para meio-dia local para comparações só por dia. */
function atNoon(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0, 0);
}

/**
 * Interpreta `current_due_date` / `original_due_date` da API (ISO ou DD-MM-YYYY).
 */
export function parseTaskDueDate(raw: string | null | undefined): Date | null {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (s === "") return null;

  const iso = new Date(s);
  if (!Number.isNaN(iso.getTime())) return atNoon(iso);

  const m = /^(\d{1,2})-(\d{1,2})-(\d{4})/.exec(s);
  if (!m) return null;
  const day = Number(m[1]);
  const month = Number(m[2]) - 1;
  const year = Number(m[3]);
  const dt = new Date(year, month, day, 12, 0, 0, 0);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

export function startOfTodayLocal(): Date {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate(), 0, 0, 0, 0);
}

export function addDaysLocal(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}
