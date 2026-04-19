import axios, { type AxiosRequestConfig } from "axios";

/** Same logical key in both storages; only one is populated at a time. */
export const AUTH_TOKEN_STORAGE_KEY = "metricnotes_access_token";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export function getAuthAccessToken(): string | null {
  if (typeof sessionStorage === "undefined" || typeof localStorage === "undefined") {
    return null;
  }
  return (
    sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY) ?? localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
  );
}

axiosInstance.interceptors.request.use((config) => {
  const token = getAuthAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * @param rememberMe — if true, persist in `localStorage`; otherwise session-only (`sessionStorage`).
 */
export function setAuthAccessToken(token: string | null, rememberMe = true) {
  if (typeof sessionStorage === "undefined" || typeof localStorage === "undefined") return;

  sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);

  if (!token) return;

  if (rememberMe) {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  } else {
    sessionStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  }
}

export const apiClient = async <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> => {
  const response = await axiosInstance({
    ...config,
    ...options,
    headers: {
      ...(config.headers ?? {}),
      ...(options?.headers ?? {}),
    },
  });

  return response.data as T;
};
