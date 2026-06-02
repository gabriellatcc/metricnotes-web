import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { TaskResource } from "@/generated/api/models";
import { getPostponementDateOptionsForTask, type PostponementLevel } from "@/lib/task-postpone-dates";
import { cn } from "@/lib/utils";

type TaskPostponeDateDialogProps = {
  open: boolean;
  task: TaskResource | null;
  postponementLevel: PostponementLevel;
  busy?: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectDate: (isoDate: string) => void;
};

export function TaskPostponeDateDialog({
  open,
  task,
  postponementLevel,
  busy = false,
  onOpenChange,
  onSelectDate,
}: TaskPostponeDateDialogProps) {
  const options = useMemo(
    () => (task ? getPostponementDateOptionsForTask(task, postponementLevel) : []),
    [task, open, postponementLevel],
  );
  const [pendingIso, setPendingIso] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setPendingIso(null);
    }
  }, [open, task?.id]);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !busy) onOpenChange(false);
      }}
    >
      <DialogContent className="gap-0 sm:max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle>Para quando quer adiar?</DialogTitle>
          <DialogDescription>Selecione uma das datas disponíveis</DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4 text-center">
          {task ? (
            <p className="text-sm text-muted-foreground">
              Tarefa: <span className="font-medium text-foreground">&quot;{task.name}&quot;</span>
            </p>
          ) : null}

          {options.length === 0 ? (
            <p className="mt-5 text-sm text-muted-foreground">
              Não há datas disponíveis para adiar esta tarefa com as regras atuais de prazo.
            </p>
          ) : (
            <>
              <div
                className="mt-5 flex flex-wrap justify-center gap-3"
                role="radiogroup"
                aria-label="Datas disponíveis para adiamento"
              >
                {options.map((option) => {
                  const loading = busy && pendingIso === option.iso;
                  return (
                    <button
                      key={option.iso}
                      type="button"
                      role="radio"
                      aria-checked={pendingIso === option.iso}
                      aria-label={option.label}
                      disabled={busy}
                      onClick={() => {
                        if (busy) return;
                        setPendingIso(option.iso);
                        onSelectDate(option.iso);
                      }}
                      className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-semibold transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        loading
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-muted/80 text-foreground hover:bg-muted",
                        busy && pendingIso !== option.iso && "opacity-60",
                      )}
                    >
                      {loading ? <Loader2 className="size-5 animate-spin" aria-hidden /> : option.dayOfMonth}
                    </button>
                  );
                })}
              </div>

              <p className="mt-4 text-xs text-muted-foreground">{options.map((o) => o.label).join(" · ")}</p>
            </>
          )}
        </div>

        <DialogFooter className="gap-2 sm:justify-center sm:gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            disabled={busy}
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
