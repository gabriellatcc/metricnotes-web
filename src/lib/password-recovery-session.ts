/** Ephemeral credentials for `/forgot-password/reset`; cleared after success or logout path. */

export const PASSWORD_RECOVERY_STORAGE_KEY =
  "metricnotes_password_recovery_credentials";

export type PasswordRecoveryCredentials = {
  reset_session_id: string;
  reset_secret: string;
};

export function setPasswordRecoveryCredentials(
  creds: PasswordRecoveryCredentials,
): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(PASSWORD_RECOVERY_STORAGE_KEY, JSON.stringify(creds));
}

export function getPasswordRecoveryCredentials(): PasswordRecoveryCredentials | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PASSWORD_RECOVERY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const obj = parsed as Record<string, unknown>;
    const id = obj.reset_session_id;
    const secret = obj.reset_secret;
    if (typeof id === "string" && typeof secret === "string") {
      return { reset_session_id: id, reset_secret: secret };
    }
    return null;
  } catch {
    return null;
  }
}

export function clearPasswordRecoveryCredentials(): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(PASSWORD_RECOVERY_STORAGE_KEY);
}
