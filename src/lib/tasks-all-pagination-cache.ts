const STORAGE_KEY = "metricnotes.tasks-all.per_page";

const DEFAULT_PER_PAGE = 10;

export function readTasksAllPerPage(
  allowed: readonly number[],
  fallback = DEFAULT_PER_PAGE,
): number {
  if (typeof localStorage === "undefined") {
    return fallback;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw == null) {
      return fallback;
    }
    const n = Number(raw);
    if (!Number.isFinite(n) || !allowed.includes(n)) {
      return fallback;
    }
    return n;
  } catch {
    return fallback;
  }
}

export function writeTasksAllPerPage(perPage: number): void {
  if (typeof localStorage === "undefined") {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, String(perPage));
  } catch {
    // quota / private mode — ignorar
  }
}
