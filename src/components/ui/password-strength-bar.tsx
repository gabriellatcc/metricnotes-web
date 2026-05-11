import { getPasswordStrength } from "@/lib/password-strength";
import { cn } from "@/lib/utils";

export function PasswordStrengthBar({ password }: { password: string }) {
  const { score, label } = getPasswordStrength(password);
  if (!password) return null;

  const segmentActive = (i: number) => i <= score;

  const segmentClass = (i: number) => {
    if (!segmentActive(i)) return "bg-muted";
    if (score <= 2) return "bg-amber-500";
    if (score === 3) return "bg-lime-500";
    return "bg-emerald-600";
  };

  return (
    <div className="space-y-2 pt-1">
      <div className="flex gap-1.5" aria-hidden>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={cn("h-2 flex-1 rounded-full transition-colors", segmentClass(i))} />
        ))}
      </div>
      {label ? <p className="text-xs text-muted-foreground">{label}</p> : null}
    </div>
  );
}
