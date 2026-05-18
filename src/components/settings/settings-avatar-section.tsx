import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { getAuthMeQueryKey } from "@/generated/api/auth/auth";
import type { AuthMe200 } from "@/generated/api/models/authMe200";
import type { UserResource } from "@/generated/api/models/userResource";
import { useUserChangeAvatar } from "@/generated/api/user-operation/user-operation";
import { toastApiError, toastApiSuccessFromBody, toastApiWarning } from "@/lib/api-toast";
import { cn, initialsFromName } from "@/lib/utils";

const ACCEPT_AVATAR = "image/jpeg,image/png";

export type SettingsAvatarSectionProps = {
  userId: string;
  displayName: string;
  avatarUrl?: string | null;
  disabled?: boolean;
};

export function SettingsAvatarSection({
  userId,
  displayName,
  avatarUrl,
  disabled,
}: SettingsAvatarSectionProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const changeAvatar = useUserChangeAvatar({
    mutation: {
      onSuccess: (res) => {
        const resource = res.data as UserResource;
        queryClient.setQueryData<AuthMe200>(getAuthMeQueryKey(), (prev) => {
          if (!prev?.data?.user) return prev;
          return {
            ...prev,
            data: {
              user: {
                ...prev.data.user,
                name: resource.name,
                email: resource.email,
                created_at: resource.created_at,
                updated_at: resource.updated_at,
                ...("is_admin" in resource && resource.is_admin !== undefined
                  ? { is_admin: resource.is_admin }
                  : {}),
                ...("avatar_url" in resource ? { avatar_url: resource.avatar_url } : {}),
              },
            },
          };
        });
        toastApiSuccessFromBody(res, "Foto atualizada.");
        void queryClient.invalidateQueries({ queryKey: getAuthMeQueryKey() });
      },
      onError: (error) => toastApiError(error),
    },
  });

  const pickFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;

      if (!file.type || !ACCEPT_AVATAR.split(",").includes(file.type)) {
        toastApiError(new Error("Use apenas JPG ou PNG."), "Falha");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toastApiError(new Error("Arquivo acima de 5 MB."), "Falha");
        return;
      }

      changeAvatar.mutate({ id: userId, data: { avatar: file } });
    },
    [userId, changeAvatar],
  );

  const busy = changeAvatar.isPending;
  const initials = initialsFromName(displayName);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [avatarUrl]);

  const showImage = Boolean(avatarUrl) && !imgFailed;

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT_AVATAR}
        className="sr-only"
        aria-hidden
        tabIndex={-1}
        onChange={onFileChange}
      />
      <div
        className={cn(
          "relative flex size-28 shrink-0 overflow-hidden rounded-2xl border border-border bg-muted/40 shadow-sm",
          !showImage && "border-dashed",
        )}
      >
        {showImage ? (
          <img
            src={avatarUrl}
            alt={`Foto de perfil de ${displayName}`}
            className="size-full object-cover"
            onError={() => {
              setImgFailed(true);
              toastApiWarning(
                "Não foi possível exibir a foto. Na API, execute: php artisan storage:link e confira se APP_URL bate com a URL do servidor (ex.: http://127.0.0.1:8000).",
              );
            }}
          />
        ) : (
          <span className="flex size-full items-center justify-center text-2xl font-semibold text-muted-foreground">
            {initials}
          </span>
        )}
        {busy ? (
          <span className="absolute inset-0 flex items-center justify-center bg-background/70">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </span>
        ) : null}
        <Button
          type="button"
          variant="secondary"
          aria-label="Alterar foto de perfil. JPG ou PNG, até 500×500 pixels e 5 MB."
          title="Alterar foto"
          className="absolute bottom-1 right-1 z-10 size-8 rounded-full border border-border bg-background/95 p-0 shadow-md backdrop-blur-sm hover:bg-background"
          disabled={disabled || busy}
          onClick={pickFile}
        >
          {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Pencil className="size-3.5" />}
        </Button>
      </div>
    </>
  );
}
