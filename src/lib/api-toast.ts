import axios from "axios";
import { toast } from "sonner";

import { ApiEmptyResponseError } from "@/lib/api-client";

export { toast } from "sonner";

/** Laravel-style JSON: `{ message?: string, errors?: Record<string, string[]> }` */
export function getApiErrorMessage(error: unknown): string {
  if (error instanceof ApiEmptyResponseError) {
    return error.message;
  }
  if (axios.isAxiosError(error)) {
    if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
      return "Sem conexão com o servidor. Verifique a rede e o endereço da API.";
    }
    const status = error.response?.status;
    const data = error.response?.data;

    if (data && typeof data === "object") {
      const msg = (data as { message?: unknown }).message;
      if (typeof msg === "string" && msg.length > 0) return msg;

      const errors = (data as { errors?: Record<string, string[] | string> }).errors;
      if (errors && typeof errors === "object") {
        const firstKey = Object.keys(errors)[0];
        if (firstKey) {
          const val = errors[firstKey];
          if (Array.isArray(val) && val[0]) return String(val[0]);
          if (typeof val === "string") return val;
        }
        return "Erro de validação. Confira os campos.";
      }
    }

    if (status === 401) return "Sessão inválida ou expirada. Faça login novamente.";
    if (status === 403) return "Sem permissão para esta ação.";
    if (status === 404) return "Recurso não encontrado.";
    if (status === 422) return "Dados inválidos.";
    if (status === 500) return "Erro no servidor. Tente mais tarde.";
    if (status) return error.message || `Erro HTTP ${status}.`;
    return error.message || "Falha na requisição.";
  }
  if (error instanceof Error) return error.message;
  return "Algo deu errado.";
}

/** Typical API envelope: `{ success?, message?, data? }` */
export function getApiSuccessMessage(data: unknown): string | undefined {
  if (data === null || data === undefined) return undefined;
  if (typeof data !== "object") return undefined;
  const o = data as Record<string, unknown>;
  if (typeof o.message === "string" && o.message.trim().length > 0) {
    return o.message.trim();
  }
  return undefined;
}

export function toastApiError(error: unknown, title = "Erro") {
  toast.error(title, { description: getApiErrorMessage(error) });
}

export function toastApiSuccessFromBody(data: unknown, fallback?: string) {
  const msg = getApiSuccessMessage(data);
  if (msg) {
    toast.success(msg);
    return;
  }
  if (fallback) toast.success(fallback);
}

export function toastApiWarning(message: string) {
  toast.warning(message);
}

export function toastApiInfo(message: string) {
  toast.info(message);
}
