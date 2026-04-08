import axios, { type AxiosRequestConfig } from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

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
