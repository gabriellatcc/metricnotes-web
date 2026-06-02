import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldContent, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { StoreNoteBody } from "@/generated/api/models/storeNoteBody";
import { useStoreNote } from "@/generated/api/note/note";
import { toastApiError, toastApiSuccessFromBody } from "@/lib/api-toast";
import { cn } from "@/lib/utils";

const noteInputClass =
  "flex min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50";

type NoteForm = { title: string; body: string };

function emptyNoteForm(): NoteForm {
  return { title: "", body: "" };
}

function toStoreBody(form: NoteForm): StoreNoteBody {
  return { title: form.title.trim(), body: form.body };
}

type TaskNewTaskBrainstormFlowProps = {
  brainstormOpen: boolean;
  onBrainstormOpenChange: (open: boolean) => void;
  onOpenTaskCreate: () => void;
};

export function TaskNewTaskBrainstormFlow({
  brainstormOpen,
  onBrainstormOpenChange,
  onOpenTaskCreate,
}: TaskNewTaskBrainstormFlowProps) {
  const queryClient = useQueryClient();
  const [noteOpen, setNoteOpen] = useState(false);
  const [goalsOpen, setGoalsOpen] = useState(false);
  const [noteForm, setNoteForm] = useState<NoteForm>(() => emptyNoteForm());

  const invalidateNotes = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["/api/note"] });
  }, [queryClient]);

  const storeMutation = useStoreNote({
    mutation: {
      onSuccess: (res) => {
        toastApiSuccessFromBody(res, "Nota criada.");
        invalidateNotes();
        setNoteForm(emptyNoteForm());
        setNoteOpen(false);
        setGoalsOpen(true);
      },
      onError: (error) => toastApiError(error),
    },
  });

  const noteBusy = storeMutation.isPending;

  const handleBrainstormYes = useCallback(() => {
    onBrainstormOpenChange(false);
    setNoteForm(emptyNoteForm());
    setNoteOpen(true);
  }, [onBrainstormOpenChange]);

  const handleBrainstormNo = useCallback(() => {
    onBrainstormOpenChange(false);
    onOpenTaskCreate();
  }, [onBrainstormOpenChange, onOpenTaskCreate]);

  const handleGoalsYes = useCallback(() => {
    setGoalsOpen(false);
    onOpenTaskCreate();
  }, [onOpenTaskCreate]);

  const handleNoteSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!noteForm.title.trim() || !noteForm.body.trim()) return;
    storeMutation.mutate({ data: toStoreBody(noteForm) });
  };

  const cancelNote = useCallback(() => {
    setNoteForm(emptyNoteForm());
    setNoteOpen(false);
  }, []);

  return (
    <>
      <Dialog open={brainstormOpen} onOpenChange={onBrainstormOpenChange}>
        <DialogContent className="gap-0 p-0 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pronto para o brainstorming?</DialogTitle>
            <DialogDescription>
              Anote ideias numa nota antes de criar a tarefa, ou siga direto para a tarefa.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="outline" className="rounded-full" onClick={handleBrainstormNo}>
              Não
            </Button>
            <Button type="button" className="rounded-full" onClick={handleBrainstormYes}>
              Sim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={noteOpen}
        onOpenChange={(open) => {
          if (!open) cancelNote();
        }}
      >
        <DialogContent className="gap-0 p-0 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nova nota</DialogTitle>
            <DialogDescription>Brainstorming: capture ideias antes de definir a tarefa.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleNoteSubmit} className="flex max-h-[min(80vh,640px)] flex-col">
            <div className="space-y-4 overflow-y-auto px-6 py-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="brainstorm-note-title">Título</FieldLabel>
                  <FieldContent>
                    <Input
                      id="brainstorm-note-title"
                      value={noteForm.title}
                      onChange={(e) => setNoteForm((f) => ({ ...f, title: e.target.value }))}
                      required
                      className="rounded-xl"
                      placeholder="Título da nota"
                    />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="brainstorm-note-body">Conteúdo</FieldLabel>
                  <FieldContent>
                    <textarea
                      id="brainstorm-note-body"
                      className={cn(noteInputClass, "min-h-40 resize-y rounded-xl")}
                      value={noteForm.body}
                      onChange={(e) => setNoteForm((f) => ({ ...f, body: e.target.value }))}
                      required
                      placeholder="Escreva aqui…"
                    />
                  </FieldContent>
                </Field>
              </FieldGroup>
            </div>
            <DialogFooter className="gap-2 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={cancelNote}
                disabled={noteBusy}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={noteBusy} className="rounded-full">
                Criar nota
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={goalsOpen} onOpenChange={setGoalsOpen}>
        <DialogContent className="gap-0 p-0 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pronto para tornar essas ideias em tarefas?</DialogTitle>
            <DialogDescription>
              Basta definir nome, prazo e detalhes. A tarefa será criada automaticamente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="outline" className="rounded-full" onClick={() => setGoalsOpen(false)}>
              Não
            </Button>
            <Button type="button" className="rounded-full" onClick={handleGoalsYes}>
              Sim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
