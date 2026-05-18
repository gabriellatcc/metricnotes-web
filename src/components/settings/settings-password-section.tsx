import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordStrengthBar } from "@/components/ui/password-strength-bar";
import { getAuthMeQueryKey } from "@/generated/api/auth/auth";
import { useUserChangePassword } from "@/generated/api/user-operation/user-operation";
import { toastApiError, toastApiSuccessFromBody } from "@/lib/api-toast";

export type SettingsPasswordSectionProps = {
  userId: string;
  disabled?: boolean;
};

export function SettingsPasswordSection({ userId, disabled }: SettingsPasswordSectionProps) {
  const queryClient = useQueryClient();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const changePassword = useUserChangePassword({
    mutation: {
      onSuccess: (res) => {
        toastApiSuccessFromBody(res, "Senha alterada.");
        void queryClient.invalidateQueries({ queryKey: getAuthMeQueryKey() });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      },
      onError: (error) => toastApiError(error),
    },
  });

  const busy = changePassword.isPending;

  const savePassword = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (newPassword.length < 6) {
        toastApiError(new Error("A senha deve ter pelo menos 6 caracteres."), "Falha");
        return;
      }
      if (newPassword !== confirmPassword) {
        toastApiError(new Error("As senhas não coincidem."), "Falha");
        return;
      }
      if (!currentPassword.trim()) {
        toastApiError(new Error("Informe a senha atual."), "Falha");
        return;
      }

      changePassword.mutate({
        id: userId,
        data: {
          current_password: currentPassword,
          password: newPassword,
          password_confirmation: confirmPassword,
        },
      });
    },
    [userId, currentPassword, newPassword, confirmPassword, changePassword],
  );

  return (
    <form onSubmit={savePassword} className="space-y-4">
      <FieldGroup className="w-full space-y-4">
        <Field>
          <FieldLabel htmlFor="settings-current-password">Senha atual</FieldLabel>
          <FieldContent>
            <Input
              id="settings-current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              className="rounded-xl"
              placeholder="••••••••"
            />
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel htmlFor="settings-password">Nova senha</FieldLabel>
          <FieldContent>
            <Input
              id="settings-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              className="rounded-xl"
              placeholder="••••••••"
            />
            <PasswordStrengthBar password={newPassword} />
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel htmlFor="settings-password-confirm">Confirmar senha</FieldLabel>
          <FieldContent>
            <Input
              id="settings-password-confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              className="rounded-xl"
              placeholder="••••••••"
            />
          </FieldContent>
        </Field>
      </FieldGroup>
      <div className="flex justify-end border-t border-border/80 pt-4">
        <Button
          type="submit"
          variant="secondary"
          disabled={disabled || busy || !newPassword || !currentPassword}
          className="min-w-[120px] gap-2 rounded-full"
        >
          {busy ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Salvando…
            </>
          ) : (
            "Salvar senha"
          )}
        </Button>
      </div>
    </form>
  );
}
