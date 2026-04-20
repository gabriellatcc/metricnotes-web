/** Heuristic score 0–4 for UI (not cryptographic strength). */
export function getPasswordStrength(password: string): {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
} {
  if (!password) {
    return { score: 0, label: "" };
  }

  let raw = 0;
  if (password.length >= 8) raw++;
  if (password.length >= 12) raw++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) raw++;
  if (/\d/.test(password)) raw++;
  if (/[^A-Za-z0-9]/.test(password)) raw++;

  let score = Math.min(4, raw) as 0 | 1 | 2 | 3 | 4;
  if (score === 0) score = 1;

  const labels: Record<0 | 1 | 2 | 3 | 4, string> = {
    0: "",
    1: "Muito fraca",
    2: "Fraca",
    3: "Boa",
    4: "Forte",
  };

  return { score, label: labels[score] };
}
