import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Bell, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getNotificationIndexQueryKey,
  useNotificationClearAll,
  useNotificationIndex,
  useNotificationRead,
  useNotificationReadAll,
} from "@/generated/api/notification/notification";
import type { NotificationIndex200DataUnreadItem } from "@/generated/api/models/notificationIndex200DataUnreadItem";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

function parseReadItems(read: unknown): NotificationIndex200DataUnreadItem[] {
  if (!Array.isArray(read) || read.length === 0) {
    return [];
  }
  if (typeof read[0] === "object" && read[0] !== null) {
    return read as NotificationIndex200DataUnreadItem[];
  }
  return [];
}

function NotificationRow({
  item,
  onNavigate,
}: {
  item: NotificationIndex200DataUnreadItem;
  onNavigate: () => void;
}) {
  const title = item.title ?? "Tarefa";
  const summary = item.due_summary ?? "";
  const taskId = item.task_id;

  return (
    <Link
      to="/tasks"
      className="block rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-accent"
      onClick={() => {
        onNavigate();
      }}
    >
      <span className="block font-medium leading-tight text-foreground">{title}</span>
      <span className="mt-0.5 block text-xs text-muted-foreground">{summary}</span>
      {taskId ? (
        <span className="sr-only">ID da tarefa: {taskId}</span>
      ) : null}
    </Link>
  );
}

type HeaderTaskNotificationsProps = {
  enabled: boolean;
};

type NotificationsTab = "unread" | "read";

export function HeaderTaskNotifications({ enabled }: HeaderTaskNotificationsProps) {
  const queryClient = useQueryClient();
  const queryKey = getNotificationIndexQueryKey();
  const [tab, setTab] = useState<NotificationsTab>("unread");

  const list = useNotificationIndex({
    query: {
      enabled,
      staleTime: 30_000,
      refetchInterval: 90_000,
      refetchOnWindowFocus: true,
    },
  });

  const payload = list.data?.data;
  const unread = payload?.unread ?? [];
  const readItems = parseReadItems((payload as { read?: unknown } | undefined)?.read);
  const unreadCount = typeof payload?.unread_count === "number" ? payload.unread_count : unread.length;
  const hasAny = unread.length > 0 || readItems.length > 0;
  const showTabNav = unread.length > 0 && readItems.length > 0;

  useEffect(() => {
    if (showTabNav) {
      return;
    }
    if (readItems.length > 0 && unread.length === 0) {
      setTab("read");
      return;
    }
    if (unread.length > 0 && readItems.length === 0) {
      setTab("unread");
    }
  }, [showTabNav, unread.length, readItems.length]);

  const markRead = useNotificationRead({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey });
      },
    },
  });

  const markAllRead = useNotificationReadAll({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey });
      },
    },
  });

  const clearAll = useNotificationClearAll({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey });
      },
    },
  });

  const busy = markRead.isPending || markAllRead.isPending || clearAll.isPending;

  const unreadPanelActive = !showTabNav ? unread.length > 0 : tab === "unread";
  const readPanelActive = !showTabNav ? readItems.length > 0 : tab === "read";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="relative size-9 shrink-0 px-0"
          aria-label={
            unreadCount > 0
              ? `${unreadCount} ${unreadCount === 1 ? "notificação não lida" : "notificações não lidas"}`
              : "Notificações"
          }
        >
          <Bell className="size-[1.25rem] text-foreground" aria-hidden />
          {unreadCount > 0 ? (
            <span
              className={cn(
                "absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full",
                "bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground",
                "ring-2 ring-background",
              )}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[min(100vw-2rem,22rem)] p-0">
        <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
          <DropdownMenuLabel className="p-0 text-sm font-semibold">Lembretes de vencimento</DropdownMenuLabel>
          {list.isFetching && !list.isLoading ? (
            <Loader2 className="size-3.5 shrink-0 animate-spin text-muted-foreground" aria-hidden />
          ) : null}
        </div>

        <div className="flex gap-2 border-b border-border px-2 pb-2 pt-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              "h-6 flex-1 rounded-full px-2 text-[11px] leading-none font-medium",
              "border-border shadow-none",
            )}
            disabled={busy || unread.length === 0}
            onClick={(e) => {
              e.preventDefault();
              markAllRead.mutate();
            }}
          >
            Marcar todas lidas
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              "h-6 flex-1 rounded-full px-2 text-[11px] leading-none font-medium",
              "border-border text-destructive shadow-none hover:bg-destructive/10 hover:text-destructive",
            )}
            disabled={busy || !hasAny}
            onClick={(e) => {
              e.preventDefault();
              clearAll.mutate();
            }}
          >
            Limpar
          </Button>
        </div>

        {showTabNav ? (
          <div role="tablist" aria-label="Filtrar lembretes" className="px-2 pb-2 pt-0.5">
            <div className="flex rounded-full bg-muted/80 p-0.5">
              <button
                type="button"
                role="tab"
                aria-selected={tab === "unread"}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1 rounded-full py-1 text-[11px] font-medium transition-colors",
                  tab === "unread"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
                onClick={() => setTab("unread")}
              >
                Não lidas
                {unreadCount > 0 ? (
                  <span
                    className={cn(
                      "inline-flex min-w-[1rem] justify-center rounded-full px-1 text-[10px]",
                      tab === "unread" ? "bg-destructive text-destructive-foreground" : "bg-muted-foreground/25",
                    )}
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                ) : null}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === "read"}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1 rounded-full py-1 text-[11px] font-medium transition-colors",
                  tab === "read"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
                onClick={() => setTab("read")}
              >
                Lidas
                {readItems.length > 0 ? (
                  <span
                    className={cn(
                      "inline-flex min-w-[1rem] justify-center rounded-full px-1 text-[10px]",
                      tab === "read"
                        ? "bg-muted-foreground/20 text-foreground"
                        : "bg-muted-foreground/20 text-muted-foreground",
                    )}
                  >
                    {readItems.length > 99 ? "99+" : readItems.length}
                  </span>
                ) : null}
              </button>
            </div>
          </div>
        ) : null}

        <div className="max-h-[min(60vh,360px)] overflow-y-auto overscroll-contain pb-2 pt-0.5">
          {list.isLoading ? (
            <div className="flex items-center justify-center gap-2 px-3 py-8 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Carregando…
            </div>
          ) : list.isError ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">Não foi possível carregar.</p>
          ) : !hasAny ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              Nenhum lembrete nos próximos dias.
            </p>
          ) : (
            <>
              {unreadPanelActive ? (
                unread.length > 0 ? (
                  <>
                    {!showTabNav ? (
                      <div className="px-3 pb-1 pt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Não lidas
                      </div>
                    ) : null}
                    <div className="space-y-0.5 px-1">
                      {unread.map((item) => (
                        <div key={item.task_id ?? item.title} className="flex items-stretch gap-0.5">
                          <div className="min-w-0 flex-1">
                            <NotificationRow
                              item={item}
                              onNavigate={() => {
                                if (item.task_id) {
                                  markRead.mutate({ task: item.task_id });
                                }
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : showTabNav ? (
                  <p className="px-3 py-6 text-center text-sm text-muted-foreground">Nenhuma não lida.</p>
                ) : null
              ) : null}

              {readPanelActive ? (
                readItems.length > 0 ? (
                  <>
                    {!showTabNav ? (
                      <div className="px-3 pb-1 pt-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Lidas
                      </div>
                    ) : null}
                    <div className={cn("space-y-0.5 px-1", !showTabNav && "opacity-80")}>
                      {readItems.map((item) => (
                        <NotificationRow key={item.task_id ?? item.title} item={item} onNavigate={() => {}} />
                      ))}
                    </div>
                  </>
                ) : showTabNav ? (
                  <p className="px-3 py-6 text-center text-sm text-muted-foreground">Nenhuma lida.</p>
                ) : null
              ) : null}
            </>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
