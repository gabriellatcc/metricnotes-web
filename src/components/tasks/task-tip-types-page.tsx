import { useQueryClient } from "@tanstack/react-query";
import { Loader2, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field, FieldContent, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { TipResource } from "@/generated/api/models";
import { useTipDelete, useTipIndex, useTipStore, useTipUpdate } from "@/generated/api/tip/tip";
import { toastApiError, toastApiSuccessFromBody } from "@/lib/api-toast";
import { tipListFromIndexPayload } from "@/lib/tip-index-normalize";
import { cn } from "@/lib/utils";

export function TaskTipTypesPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tipPendingDelete, setTipPendingDelete] = useState<TipResource | null>(null);
  const [editingTip, setEditingTip] = useState<TipResource | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#6366f1");

  const tipsQuery = useTipIndex({ per_page: 100, page: 1 });

  const invalidateTips = () => {
    void queryClient.invalidateQueries({ queryKey: ["/api/tip"] });
  };

  const storeMutation = useTipStore({
    mutation: {
      onSuccess: (res) => {
        toastApiSuccessFromBody(res, "Tipo criado.");
        invalidateTips();
        closeDialog();
      },
      onError: (error) => toastApiError(error),
    },
  });

  const updateMutation = useTipUpdate({
    mutation: {
      onSuccess: (res) => {
        toastApiSuccessFromBody(res, "Tipo atualizado.");
        invalidateTips();
        closeDialog();
      },
      onError: (error) => toastApiError(error),
    },
  });

  const deleteMutation = useTipDelete({
    mutation: {
      onSuccess: (res) => {
        toastApiSuccessFromBody(res, "Tipo removido.");
        invalidateTips();
      },
      onError: (error) => toastApiError(error),
    },
  });

  const busy = storeMutation.isPending || updateMutation.isPending || deleteMutation.isPending;
  const tips = tipListFromIndexPayload(tipsQuery.data?.data);

  const openCreate = () => {
    setEditingTip(null);
    setName("");
    setColor("#6366f1");
    setDialogOpen(true);
  };

  const openEdit = (tip: TipResource) => {
    setEditingTip(tip);
    setName(tip.name);
    setColor(tip.color || "#6366f1");
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingTip(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const payload = { name: name.trim(), color };
    if (!payload.name) return;
    if (editingTip) {
      updateMutation.mutate({ id: editingTip.id, data: payload });
    } else {
      storeMutation.mutate({ data: payload });
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <main className="flex min-h-0 flex-1 flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Defina tipos de tarefa com cor para identificação rápida no quadro e nas listas.
          </p>
          <Button type="button" className="gap-2 rounded-full" onClick={openCreate}>
            <Plus className="size-4" />
            Novo tipo
          </Button>
        </div>

        <section className="min-h-0 flex-1">
          {tipsQuery.isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border/40 py-20">
              <Loader2 className="h-9 w-9 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Carregando os tipos…</p>
            </div>
          ) : tipsQuery.isError ? (
            <p className="text-sm text-muted-foreground">Não foi possível carregar. Veja a notificação.</p>
          ) : tips.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-muted/20 px-6 py-10 text-center">
              <p className="text-sm font-medium">Nenhum tipo ainda.</p>
            </div>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tips.map((tip) => (
                <li
                  key={tip.id}
                  className={cn(
                    "relative flex flex-col rounded-2xl border-2 bg-card shadow-sm ring-1 ring-border/60 transition-shadow",
                    !busy && "hover:shadow-md",
                  )}
                  style={{ borderColor: tip.color }}
                >
                  <button
                    type="button"
                    disabled={busy}
                    className={cn(
                      "absolute inset-0 z-0 rounded-[15px] hover:bg-accent/15 focus-visible:bg-accent/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    )}
                    aria-label={`Editar tipo ${tip.name}`}
                    onClick={() => openEdit(tip)}
                  />
                  <div className="relative z-10 flex flex-col gap-3 p-4 pointer-events-none">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className="size-3 shrink-0 rounded-full ring-2 ring-background"
                          style={{ backgroundColor: tip.color }}
                        />
                        <p className="truncate font-semibold text-foreground">{tip.name}</p>
                      </div>
                      <div className="pointer-events-auto flex shrink-0 items-center gap-1">
                        <code className="rounded bg-muted/80 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                          {tip.color}
                        </code>
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-lg text-muted-foreground"
                            disabled={busy}
                            aria-label={`Ações para o tipo ${tip.name}`}
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem
                            className="gap-2"
                            onSelect={() => openEdit(tip)}
                            disabled={busy}
                          >
                            <Pencil className="size-3.5 opacity-70" aria-hidden />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
                            disabled={busy}
                            onSelect={() => {
                              setTipPendingDelete(tip);
                            }}
                          >
                            <Trash2 className="size-3.5 opacity-70" aria-hidden />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="gap-0 p-0 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTip ? "Editar tipo" : "Novo tipo de tarefa"}</DialogTitle>
            <DialogDescription>
              Nome e cor do tipo aparecem nas tarefas e no quadro para identificação rápida.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 px-6 py-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="tip-name">Nome</FieldLabel>
                  <FieldContent>
                    <Input
                      id="tip-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="rounded-xl"
                      placeholder="Ex.: Bug, Pesquisa, Reunião"
                    />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="tip-color">Cor</FieldLabel>
                  <FieldContent>
                    <div className="flex items-center gap-3">
                      <input
                        id="tip-color"
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className={cn(
                          "h-12 w-16 cursor-pointer overflow-hidden rounded-lg border border-input bg-transparent p-0",
                        )}
                      />
                      <Input
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="flex-1 rounded-xl font-mono text-sm uppercase"
                      />
                    </div>
                  </FieldContent>
                </Field>
              </FieldGroup>
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" className="rounded-full" onClick={closeDialog} disabled={busy}>
                Cancelar
              </Button>
              <Button type="submit" className="rounded-full" disabled={busy}>
                {editingTip ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={tipPendingDelete != null}
        onOpenChange={(open) => {
          if (!open) setTipPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir tipo de tarefa?</AlertDialogTitle>
            <AlertDialogDescription>
              Isto remove permanentemente o tipo “{tipPendingDelete?.name ?? ""}”. As tarefas que o usam podem deixar de mostrar
              esta etiqueta; esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              type="button"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (tipPendingDelete) deleteMutation.mutate({ id: tipPendingDelete.id });
                setTipPendingDelete(null);
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
