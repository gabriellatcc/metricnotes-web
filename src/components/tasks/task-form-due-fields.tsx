import type { ReactNode } from "react";

import { TASK_DUE_DATE_LOCKED_HINT } from "@/components/tasks/task-ui-constants";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type TaskFormDueFieldsProps = {
  idPrefix: string;
  dueDate: string;
  dueTime: string;
  editable: boolean;
  busy?: boolean;
  onDueDateChange: (value: string) => void;
  onDueTimeChange: (value: string) => void;
};

function DueFieldTooltip({ show, children }: { show: boolean; children: ReactNode }) {
  if (!show) return children;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="w-full cursor-not-allowed">{children}</div>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={6} className="max-w-xs text-left">
        {TASK_DUE_DATE_LOCKED_HINT}
      </TooltipContent>
    </Tooltip>
  );
}

export function TaskFormDueFields({
  idPrefix,
  dueDate,
  dueTime,
  editable,
  busy = false,
  onDueDateChange,
  onDueTimeChange,
}: TaskFormDueFieldsProps) {
  const inputDisabled = !editable || busy;

  return (
    <TooltipProvider delayDuration={200}>
      <Field>
        <FieldLabel htmlFor={`${idPrefix}-due`}>Prazo (data)</FieldLabel>
        <FieldContent>
          <DueFieldTooltip show={!editable}>
            <Input
              id={`${idPrefix}-due`}
              value={dueDate}
              onChange={(e) => onDueDateChange(e.target.value)}
              placeholder="DD-MM-AAAA"
              required={editable}
              disabled={inputDisabled}
              className="rounded-xl"
            />
          </DueFieldTooltip>
        </FieldContent>
      </Field>
      <Field>
        <FieldLabel htmlFor={`${idPrefix}-due-time`}>Hora</FieldLabel>
        <FieldContent>
          <DueFieldTooltip show={!editable}>
            <Input
              id={`${idPrefix}-due-time`}
              type="time"
              value={dueTime}
              onChange={(e) => onDueTimeChange(e.target.value)}
              required={editable}
              disabled={inputDisabled}
              className="rounded-xl"
            />
          </DueFieldTooltip>
        </FieldContent>
      </Field>
    </TooltipProvider>
  );
}
