/**
 * Laravel often returns `Storage::url()` using APP_URL (e.g. `http://localhost/storage/...`),
 * while the SPA talks to `VITE_API_BASE_URL` (e.g. `http://localhost:8000/api`).
 * Re-map `/storage/...` requests to the API origin so images load after refresh.
 */
export function resolveLaravelStorageUrl(url: string | null | undefined): string | undefined {
  if (url == null || typeof url !== "string" || url.trim() === "") return undefined;

  const apiBase = import.meta.env.VITE_API_BASE_URL;
  if (!apiBase || typeof apiBase !== "string") return url;

  let pathname: string;
  let search = "";
  try {
    const parsed = new URL(url);
    pathname = parsed.pathname;
    search = parsed.search;
  } catch {
    pathname = url.startsWith("/") ? url : `/${url}`;
  }

  if (!pathname.includes("/storage")) return url;

  const base = new URL(apiBase, typeof window !== "undefined" ? window.location.href : "http://localhost");
  return `${base.origin}${pathname}${search}`;
}
