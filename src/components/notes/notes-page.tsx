import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Pencil, Plus, StickyNote, Trash2, LayoutGrid, List } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
import type { NoteResource } from "@/generated/api/models";
import type { NoteUpdateBody } from "@/generated/api/models/noteUpdateBody";
import type { IndexShow200 } from "@/generated/api/models/indexShow200";
import type { IndexShowParams } from "@/generated/api/models/indexShowParams";
import type { StoreNoteBody } from "@/generated/api/models/storeNoteBody";
import { useNoteDelete, useNoteUpdate, useStoreNote } from "@/generated/api/note/note";
import { apiClient } from "@/lib/api-client";
import { toastApiError, toastApiSuccessFromBody } from "@/lib/api-toast";
import { cn } from "@/lib/utils";

const inputClass =
  "flex min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50";

type NoteForm = { title: string; body: string };

function emptyForm(): NoteForm {
  return { title: "", body: "" };
}

function toStoreBody(form: NoteForm): StoreNoteBody {
  return { title: form.title.trim(), body: form.body };
}

function toUpdateBody(form: NoteForm): NoteUpdateBody {
  return { title: form.title.trim(), body: form.body };
}

function formatNoteDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 19).replace("T", " ");
  return d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

type NoteCardProps = {
  note: NoteResource;
  layout: "strip" | "grid";
  onView: (note: NoteResource) => void;
  onEdit: (note: NoteResource) => void;
  onDelete: (note: NoteResource) => void;
};

function NoteCard({ note, layout, onView, onEdit, onDelete }: NoteCardProps) {
  const menuRef = useRef<HTMLDetailsElement>(null);
  const closeMenu = () => {
    if (menuRef.current) menuRef.current.open = false;
  };

  return (
    <li
      className={cn(
        "flex min-h-0 cursor-pointer flex-col rounded-2xl border border-border/80 bg-card p-4 shadow-sm transition-all duration-200",
        "hover:-translate-y-px hover:border-primary/45 hover:shadow-md hover:ring-2 hover:ring-primary/15",
        "active:scale-[0.998]",
        layout === "strip" && "w-full",
        layout === "grid" && "h-full",
      )}
      title="Abrir para ler a nota completa"
      onClick={() => onView(note)}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 min-w-0 flex-1 text-base font-semibold leading-snug tracking-tight text-foreground">
            {note.title}
          </h3>
          <div
            className="flex shrink-0 items-center gap-0.5"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-muted/80 text-muted-foreground">
              <StickyNote className="h-3.5 w-3.5" aria-hidden />
            </span>
            <details ref={menuRef} className="relative text-right">
              <summary
                className="list-none cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground [&::-webkit-details-marker]:hidden"
                aria-label="Mais opções"
              >
                <MoreHorizontal className="h-4 w-4" />
              </summary>
              <div className="absolute right-0 z-20 mt-1 min-w-[140px] rounded-xl border border-border bg-popover p-1 text-left shadow-lg">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent"
                  onClick={() => {
                    closeMenu();
                    onEdit(note);
                  }}
                >
                  <Pencil className="h-4 w-4 opacity-70" />
                  Editar
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    closeMenu();
                    if (window.confirm("Excluir esta nota?")) onDelete(note);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </button>
              </div>
            </details>
          </div>
        </div>
        <div className="mt-auto border-t border-border/60 pt-2 text-[0.65rem] text-muted-foreground">
          <p className="font-mono">
            {formatNoteDateTime(note.created_at)} · {formatNoteDateTime(note.updated_at)}
          </p>
        </div>
      </div>
    </li>
  );
}

export function NotesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const perPage = 12;
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [viewNote, setViewNote] = useState<NoteResource | null>(null);
  const [layout, setLayout] = useState<"strip" | "grid">("strip");

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => window.clearTimeout(id);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const invalidateNotes = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["/api/note"] });
  }, [queryClient]);

  const listParams: IndexShowParams = useMemo(
    () => ({
      page,
      per_page: perPage,
      ...(debouncedSearch.length > 0 ? { search: debouncedSearch } : {}),
    }),
    [page, perPage, debouncedSearch],
  );

  const indexQuery = useQuery({
    queryKey: ["/api/note", "list", listParams] as const,
    queryFn: ({ signal }) =>
      apiClient<IndexShow200>({
        url: "/api/note",
        method: "GET",
        params: listParams,
        signal,
      }),
  });

  const storeMutation = useStoreNote({
    mutation: {
      onSuccess: (res) => {
        toastApiSuccessFromBody(res, "Nota criada.");
        invalidateNotes();
        setForm(emptyForm());
        setEditingId(null);
        setCreateOpen(false);
      },
      onError: (error) => toastApiError(error),
    },
  });

  const updateMutation = useNoteUpdate({
    mutation: {
      onSuccess: (res) => {
        toastApiSuccessFromBody(res, "Nota atualizada.");
        invalidateNotes();
        setEditingId(null);
        setForm(emptyForm());
        setCreateOpen(false);
      },
      onError: (error) => toastApiError(error),
    },
  });

  const deleteMutation = useNoteDelete({
    mutation: {
      onSuccess: (res) => {
        toastApiSuccessFromBody(res, "Nota excluída.");
        invalidateNotes();
      },
      onError: (error) => toastApiError(error),
    },
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<NoteForm>(() => emptyForm());

  const items = indexQuery.data?.data?.items ?? [];
  const pagination = indexQuery.data?.data?.pagination;

  const busy = storeMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const openViewNote = useCallback((note: NoteResource) => {
    setViewNote(note);
    setCreateOpen(false);
  }, []);

  const startEdit = useCallback((note: NoteResource) => {
    setViewNote(null);
    setEditingId(note.id);
    setCreateOpen(true);
    setForm({ title: note.title, body: note.body });
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setForm(emptyForm());
    setCreateOpen(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) return;
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: toUpdateBody(form) });
    } else {
      storeMutation.mutate({ data: toStoreBody(form) });
    }
  };

  const handleDelete = useCallback(
    (note: NoteResource) => {
      deleteMutation.mutate({ id: note.id });
    },
    [deleteMutation],
  );

  const formTitle = editingId ? "Editar nota" : "Nova nota";
  const formDesc = editingId ? "Atualize título e conteúdo." : "Crie um cartão de nota.";

  const listKey = `${layout}-${page}-${debouncedSearch}`;

  return (
    <main className="min-h-full flex-1 bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 border-b border-border pb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Notas</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Lista em rolagem vertical — ou mude para grade quando preferir.
          </p>
        </header>

        <div className="flex w-full flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="sr-only" htmlFor="note-search">
              Buscar notas
            </label>
            <Input
              id="note-search"
              placeholder="Buscar por título ou conteúdo…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 max-w-lg rounded-xl border-0 bg-muted/60 shadow-inner"
            />
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded-full border border-border/80 bg-muted/40 p-0.5">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setLayout("strip")}
                  className={cn("gap-1.5 rounded-full", layout === "strip" && "bg-background shadow-sm")}
                  aria-pressed={layout === "strip"}
                >
                  <List className="h-4 w-4" />
                  <span className="hidden sm:inline">Lista</span>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setLayout("grid")}
                  className={cn("gap-1.5 rounded-full", layout === "grid" && "bg-background shadow-sm")}
                  aria-pressed={layout === "grid"}
                >
                  <LayoutGrid className="h-4 w-4" />
                  <span className="hidden sm:inline">Grade</span>
                </Button>
              </div>
              <Button
                type="button"
                className="rounded-full gap-2"
                onClick={() => {
                  setViewNote(null);
                  setEditingId(null);
                  setForm(emptyForm());
                  setCreateOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Nova nota
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            {pagination
              ? `${pagination.total} nota(s) — página ${pagination.current_page} de ${pagination.last_page}`
              : indexQuery.isLoading
                ? "Carregando…"
                : null}
          </p>

          <section aria-label="Notas" className="min-w-0">
            {indexQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Carregando…</p>
            ) : indexQuery.isError ? (
              <p className="text-sm text-muted-foreground">Não foi possível carregar. Veja a notificação acima.</p>
            ) : items.length === 0 ? (
              <div className="rounded-2xl border border-dashed bg-muted/20 px-6 py-12 text-center">
                <p className="text-sm font-medium text-foreground/80">Nenhuma nota ainda.</p>
                <p className="mt-1 text-xs text-muted-foreground">Crie a primeira ou ajuste a busca.</p>
              </div>
            ) : layout === "strip" ? (
              <ul
                key={listKey}
                className="mx-auto flex w-full max-w-2xl flex-col gap-3"
              >
                {items.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    layout="strip"
                    onView={openViewNote}
                    onEdit={startEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </ul>
            ) : (
              <ul
                key={listKey + "-g"}
                className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
              >
                {items.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    layout="grid"
                    onView={openViewNote}
                    onEdit={startEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </ul>
            )}
          </section>

          {pagination && pagination.last_page > 1 ? (
            <div className="flex items-center justify-between gap-2 border-t border-border pt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                disabled={page <= 1 || indexQuery.isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Anterior
              </Button>
              <span className="text-xs text-muted-foreground">
                Página {pagination.current_page} / {pagination.last_page}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                disabled={page >= pagination.last_page || indexQuery.isFetching}
                onClick={() => setPage((p) => p + 1)}
              >
                Próxima
              </Button>
            </div>
          ) : null}
        </div>

        <Dialog
          open={viewNote != null}
          onOpenChange={(open) => {
            if (!open) setViewNote(null);
          }}
        >
          <DialogContent className="gap-0 p-0 sm:max-w-lg" showClose>
            {viewNote ? (
              <>
                <DialogHeader>
                  <DialogTitle className="pr-2">{viewNote.title}</DialogTitle>
                  <DialogDescription>Somente leitura</DialogDescription>
                </DialogHeader>
                <div className="max-h-[min(65vh,480px)] space-y-4 overflow-y-auto px-6 py-4">
                  <div>
                    <p className="text-xs font-medium uppercase text-muted-foreground">Conteúdo</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground">{viewNote.body}</p>
                  </div>
                  <dl className="grid gap-2 border-t border-border/60 pt-3 text-xs text-muted-foreground">
                    <div className="flex flex-wrap justify-between gap-2">
                      <dt>Criada</dt>
                      <dd className="font-mono text-foreground/90">{formatNoteDateTime(viewNote.created_at)}</dd>
                    </div>
                    <div className="flex flex-wrap justify-between gap-2">
                      <dt>Atualizada</dt>
                      <dd className="font-mono text-foreground/90">{formatNoteDateTime(viewNote.updated_at)}</dd>
                    </div>
                  </dl>
                </div>
              </>
            ) : null}
          </DialogContent>
        </Dialog>

        <Dialog
          open={createOpen}
          onOpenChange={(open) => {
            if (!open) cancelEdit();
          }}
        >
          <DialogContent className="gap-0 p-0 sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{formTitle}</DialogTitle>
              <DialogDescription>{formDesc}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="flex max-h-[min(80vh,640px)] flex-col">
              <div className="space-y-4 overflow-y-auto px-6 py-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="note-title">Título</FieldLabel>
                    <FieldContent>
                      <Input
                        id="note-title"
                        value={form.title}
                        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                        required
                        className="rounded-xl"
                        placeholder="Título da nota"
                      />
                    </FieldContent>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="note-body">Conteúdo</FieldLabel>
                    <FieldContent>
                      <textarea
                        id="note-body"
                        className={cn(inputClass, "min-h-40 rounded-xl resize-y")}
                        value={form.body}
                        onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                        required
                        placeholder="Escreva aqui…"
                      />
                    </FieldContent>
                  </Field>
                </FieldGroup>
              </div>
              <DialogFooter className="gap-2 sm:gap-2">
                <Button type="button" variant="outline" className="rounded-full" onClick={cancelEdit} disabled={busy}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={busy} className="rounded-full">
                  {editingId ? "Salvar" : "Criar nota"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
