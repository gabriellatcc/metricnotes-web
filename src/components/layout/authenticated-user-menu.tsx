import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthMe } from "@/generated/api/auth/auth";
import { setAuthAccessToken } from "@/lib/api-client";
import { resolveLaravelStorageUrl } from "@/lib/resolve-media-url";
import { initialsFromName } from "@/lib/utils";
import { Settings } from "lucide-react";

export function AuthenticatedUserMenu() {
  const navigate = useNavigate();
  const me = useAuthMe();
  const user = me.data?.data?.user;

  const avatarSrc = resolveLaravelStorageUrl(
    (user as { avatar_url?: string | null } | undefined)?.avatar_url ?? undefined,
  );
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [avatarSrc]);

  const showAvatar = Boolean(avatarSrc) && !avatarLoadFailed;

  const logout = useCallback(() => {
    setAuthAccessToken(null);
    navigate({ to: "/" });
  }, [navigate]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-auto w-full justify-start gap-2 rounded-lg px-3 py-2 font-normal hover:bg-sidebar-accent"
          aria-label="Menu da conta"
        >
          <span
            className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground"
            aria-hidden
          >
            {me.isLoading ? (
              "…"
            ) : showAvatar ? (
              <img
                src={avatarSrc}
                alt=""
                className="size-full object-cover"
                onError={() => setAvatarLoadFailed(true)}
              />
            ) : (
              initialsFromName(user?.name)
            )}
          </span>
          <span className="min-w-0 flex-1 truncate text-left text-sm text-sidebar-foreground">
            {user?.name ?? (me.isLoading ? "Carregando…" : "Conta")}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="top" className="w-56">
        {user?.email ? (
          <>
            <DropdownMenuLabel className="font-normal">
              <span className="block truncate text-foreground">{user.name}</span>
              <span className="block truncate text-xs font-normal text-muted-foreground">{user.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        ) : null}
        <DropdownMenuItem asChild>
          <Link to="/settings" className="flex cursor-pointer items-center gap-2">
            <Settings className="size-4 opacity-70" aria-hidden />
            Configurações
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
          onSelect={() => logout()}
        >
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
