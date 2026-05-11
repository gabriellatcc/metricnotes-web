import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useState, type CSSProperties, type FormEvent } from "react";

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
import type { TipResource } from "@/generated/api/models";
import { useTipDelete, useTipIndex, useTipStore, useTipUpdate } from "@/generated/api/tip/tip";
import { toastApiError, toastApiSuccessFromBody } from "@/lib/api-toast";
import { tipListFromIndexPayload } from "@/lib/tip-index-normalize";
import { cn } from "@/lib/utils";

export function TaskTipTypesPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
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
      <main className="flex min-h-0 flex-1 flex-col gap-6 pb-0">
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
              <p className="text-sm text-muted-foreground">A carregar tipos…</p>
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
                  className="flex flex-col gap-3 rounded-2xl border-2 bg-card/30 p-4 shadow-sm transition-shadow hover:shadow-md"
                  style={{ borderColor: tip.color }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="size-3 shrink-0 rounded-full ring-2 ring-background"
                        style={{ backgroundColor: tip.color }}
                      />
                      <p className="truncate font-semibold text-foreground">{tip.name}</p>
                    </div>
                    <code className="shrink-0 rounded bg-muted/80 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      {tip.color}
                    </code>
                  </div>
                  <div className="mt-auto flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="rounded-full gap-1"
                      onClick={() => openEdit(tip)}
                      disabled={busy}
                    >
                      <Pencil className="size-3.5" />
                      Editar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="rounded-full gap-1 border-destructive text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        if (window.confirm(`Remover o tipo "${tip.name}"?`)) {
                          deleteMutation.mutate({ id: tip.id });
                        }
                      }}
                      disabled={busy}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      {tips.length > 0 ? (
        <footer className="relative mt-10 h-[5.5rem] w-full overflow-hidden rounded-b-xl border-x border-t border-border/30 bg-muted/15">
          {tips.map((tip, idx) => {
            const stagger = `${idx * 10}px`;
            const layerStyle: CSSProperties = {
              bottom: stagger,
              height: "56px",
              width: "200%",
              left: "-50%",
              opacity: Math.max(0.22, 0.55 - idx * 0.09),
              background: `repeating-linear-gradient(108deg, ${tip.color ?? "#94a3b8"} 0px, ${tip.color ?? "#94a3b8"} 5px, transparent 5px, transparent 32px)`,
              animationDuration: `${11 + idx * 2}s`,
            };
            return (
              <div
                key={tip.id}
                className={cn(
                  "pointer-events-none absolute",
                  idx % 2 === 0 ? "tip-type-wave-layer tip-type-wave-layer--ltr" : "tip-type-wave-layer tip-type-wave-layer--rtl",
                )}
                style={layerStyle}
              />
            );
          })}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-2">
            <p className="text-[11px] text-muted-foreground/80">Uma camada por tipo • ondas em sentidos alternados</p>
          </div>
        </footer>
      ) : null}

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="gap-0 p-0 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTip ? "Editar tipo" : "Novo tipo de tarefa"}</DialogTitle>
            <DialogDescription>Nome e cor do tipo aparecem nas tarefas; com tipos criados o rodapé desta página mostra ondas nas cores definidas.</DialogDescription>
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
    </div>
  );
}
