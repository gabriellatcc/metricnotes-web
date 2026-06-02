import type { TaskResource } from "@/generated/api/models";
import { addDaysLocal, parseTaskDueDate, startOfTodayLocal } from "@/lib/parse-task-due-date";

export type PostponeDateOption = {
  iso: string;
  dayOfMonth: number;
  label: string;
};

export type PostponementLevel = 1 | 2 | 3;

const DAY_OFFSETS_BY_LEVEL: Record<PostponementLevel, number[]> = {
  1: [1, 2, 3],
  2: [1, 2],
  3: [1],
};

function formatIsoDateLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dayStartMs(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function isOnOrBefore(a: Date, b: Date): boolean {
  return dayStartMs(a) <= dayStartMs(b);
}

export function taskStrictPostponeRulesApply(task: TaskResource): boolean {
  const flag = (task as TaskResource & { postpone_strict_rules_apply?: boolean }).postpone_strict_rules_apply;
  return flag !== false;
}

function toPostponeDateOptions(dates: Date[]): PostponeDateOption[] {
  return dates.map((date) => ({
    iso: formatIsoDateLocal(date),
    dayOfMonth: date.getDate(),
    label: date.toLocaleDateString("pt-PT", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }),
  }));
}

/**
 * Datas disponíveis para escolher o novo prazo ao adiar.
 * 1.º adiamento: 3 dias; 2.º: 2 dias; 3.º: amanhã.
 */
export function getPostponementDateOptionsForTask(
  task: TaskResource,
  level: PostponementLevel,
): PostponeDateOption[] {
  const today = startOfTodayLocal();
  const candidates = DAY_OFFSETS_BY_LEVEL[level].map((offset) => addDaysLocal(today, offset));

  if (level === 1) {
    const strict = taskStrictPostponeRulesApply(task);
    const planned = parseTaskDueDate(task.current_due_date || task.original_due_date);

    const valid = candidates.filter((candidate) => {
      if (!strict) return true;
      if (!planned) return false;
      const maxAllowed = addDaysLocal(planned, 4);
      return isOnOrBefore(candidate, maxAllowed);
    });

    return toPostponeDateOptions(valid);
  }

  return toPostponeDateOptions(candidates);
}
