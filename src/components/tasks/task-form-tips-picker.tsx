import { useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, Plus, X } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";

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
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTipIndex, useTipStore } from "@/generated/api/tip/tip";
import { toastApiError, toastApiSuccessFromBody } from "@/lib/api-toast";
import { tipListFromIndexPayload } from "@/lib/tip-index-normalize";
import { cn } from "@/lib/utils";

type TaskFormTipsPickerProps = {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
};

export function TaskFormTipsPicker({ selectedIds, onChange, disabled }: TaskFormTipsPickerProps) {
  const queryClient = useQueryClient();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [tipName, setTipName] = useState("");
  const [tipColor, setTipColor] = useState("#6366f1");

  const tipsQuery = useTipIndex({ per_page: 100, page: 1 });
  const tips = tipListFromIndexPayload(tipsQuery.data?.data);
  const byId = useMemo(() => new Map(tips.map((t) => [t.id, t])), [tips]);

  const storeMutation = useTipStore({
    mutation: {
      onSuccess: (res) => {
        toastApiSuccessFromBody(res, "Tipo criado.");
        void queryClient.invalidateQueries({ queryKey: ["/api/tip"] });
        const newId = res.success && res.data?.id ? res.data.id : null;
        if (newId) {
          const next = selectedIds.includes(newId) ? selectedIds : [...selectedIds, newId];
          onChange(next);
        }
        setCreateOpen(false);
        setTipName("");
        setPopoverOpen(false);
      },
      onError: (error) => toastApiError(error),
    },
  });

  const toggleId = (id: string) => {
    const set = new Set(selectedIds);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    onChange([...set]);
  };

  const removeId = (id: string) => {
    onChange(selectedIds.filter((x) => x !== id));
  };

  const openCreateNested = () => {
    setTipName("");
    setTipColor("#6366f1");
    setPopoverOpen(false);
    setCreateOpen(true);
  };

  const handleCreateTipSubmit = (e: FormEvent) => {
    e.preventDefault();
    const name = tipName.trim();
    if (!name) return;
    storeMutation.mutate({ data: { name, color: tipColor } });
  };

  return (
    <Field>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium">Tipos</span>
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-9 w-9 rounded-full p-0"
              disabled={disabled}
              aria-label="Adicionar ou gerir tipos"
              title="Adicionar tipos"
            >
              <Plus className="size-4" aria-hidden />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 gap-3 p-3" align="start">
            <PopoverHeader className="-mb-1">
              <PopoverTitle className="text-sm">Associar tipos</PopoverTitle>
            </PopoverHeader>
            {tipsQuery.isLoading ? (
              <div className="flex items-center gap-2 py-4 text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                <span className="text-xs">A carregar…</span>
              </div>
            ) : tips.length === 0 ? (
              <div className="flex flex-col gap-2 rounded-lg border border-dashed bg-muted/20 p-3">
                <p className="text-xs text-muted-foreground">Sem tipos ainda.</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1 rounded-full"
                  onClick={openCreateNested}
                  disabled={storeMutation.isPending}
                >
                  <Plus className="size-3.5" />
                  Criar tipo
                </Button>
              </div>
            ) : (
              <div className="flex max-h-56 flex-col gap-2 overflow-y-auto pr-1">
                {tips.map((t) => {
                  const sel = selectedIds.includes(t.id);
                  const chroma = t.color ?? "#64748b";
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggleId(t.id)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-lg border px-2 py-1.5 text-left text-xs transition-colors",
                        sel ? "border-foreground/30 bg-accent/40" : "border-border hover:bg-muted/50",
                      )}
                    >
                      <span className="size-2 shrink-0 rounded-full ring-2 ring-background" style={{ backgroundColor: chroma }} />
                      <span className="min-w-0 flex-1 truncate font-medium">{t.name}</span>
                      {sel ? <Check className="size-3.5 shrink-0 text-primary" aria-hidden /> : null}
                    </button>
                  );
                })}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-1 gap-1 rounded-full border border-dashed"
                  onClick={openCreateNested}
                  disabled={storeMutation.isPending}
                >
                  <Plus className="size-3.5" />
                  Novo tipo
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>

      {selectedIds.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {selectedIds.map((id) => {
            const t = byId.get(id);
            const label = t?.name ?? id.slice(0, 8);
            const chroma = t?.color ?? "#64748b";
            return (
              <span
                key={id}
                className="inline-flex max-w-full items-center gap-1 rounded-full border py-1 pl-2 pr-1 text-xs"
                style={{ borderColor: chroma }}
              >
                <span className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: chroma }} />
                <span className="min-w-0 truncate">{label}</span>
                <button
                  type="button"
                  className="rounded-full p-0.5 hover:bg-muted"
                  onClick={() => removeId(id)}
                  disabled={disabled}
                  aria-label={`Remover ${label}`}
                >
                  <X className="size-3" />
                </button>
              </span>
            );
          })}
        </div>
      ) : (
        <p className="mt-1 text-xs text-muted-foreground">Opcional — etiquete a tarefa com um ou mais tipos.</p>
      )}

      <Dialog open={createOpen} onOpenChange={(o) => !o && setCreateOpen(false)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Novo tipo</DialogTitle>
            <DialogDescription>Cria aqui quando ainda não existir na lista.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTipSubmit} className="space-y-3">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="nested-tip-name">Nome</FieldLabel>
                <FieldContent>
                  <Input
                    id="nested-tip-name"
                    value={tipName}
                    onChange={(e) => setTipName(e.target.value)}
                    placeholder="Ex.: Bug, Pesquisa"
                    required
                    className="rounded-xl"
                  />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor="nested-tip-color">Cor</FieldLabel>
                <FieldContent>
                  <div className="flex items-center gap-2">
                    <input
                      id="nested-tip-color"
                      type="color"
                      value={tipColor}
                      onChange={(e) => setTipColor(e.target.value)}
                      className="h-10 w-14 cursor-pointer overflow-hidden rounded border border-input bg-transparent p-0"
                    />
                    <Input
                      value={tipColor}
                      onChange={(e) => setTipColor(e.target.value)}
                      className="rounded-xl font-mono text-xs uppercase"
                    />
                  </div>
                </FieldContent>
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button type="button" variant="outline" className="rounded-full" onClick={() => setCreateOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={storeMutation.isPending} className="rounded-full gap-2">
                {storeMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                Guardar tipo
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Field>
  );
}
