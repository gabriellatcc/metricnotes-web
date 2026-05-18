import { Eye, EyeOff } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordStrengthBar } from "@/components/ui/password-strength-bar";
import { useUserRecoverPassword } from "@/generated/api/user-operation/user-operation";
import {
  clearPasswordRecoveryCredentials,
  getPasswordRecoveryCredentials,
} from "@/lib/password-recovery-session";
import { toastApiError, toastApiSuccessFromBody } from "@/lib/api-toast";
import { Link, useNavigate } from "@tanstack/react-router";

export function ForgotPasswordResetForm() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const credentials = useMemo(() => getPasswordRecoveryCredentials(), []);

  const showConfirmMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const recover = useUserRecoverPassword({
    mutation: {
      onSuccess: (res) => {
        clearPasswordRecoveryCredentials();
        toastApiSuccessFromBody(res, "Senha redefinida. Faça login.");
        navigate({ to: "/login" });
      },
      onError: (error) => {
        toastApiError(error);
      },
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cred = getPasswordRecoveryCredentials();
    if (!cred) return;
    if (password.length < 6) {
      toastApiError(new Error("A senha deve ter pelo menos 6 caracteres."), "Validação");
      return;
    }
    if (password !== confirmPassword) {
      toastApiError(new Error("As senhas não coincidem."), "Validação");
      return;
    }
    recover.mutate({
      data: {
        reset_session_id: cred.reset_session_id,
        reset_secret: cred.reset_secret,
        password,
        password_confirmation: confirmPassword,
      },
    });
  };

  if (!credentials) return null;

  return (
    <div className="w-full max-w-md mx-auto space-y-6 items-center text-center">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Nova senha</h2>
        <p className="text-sm text-muted-foreground">
          Escolha uma senha diferente da anterior. Em seguida você poderá entrar com o e-mail e a
          nova senha.
        </p>
      </div>
      <div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="recovery-password">Nova senha</FieldLabel>
              <FieldContent>
                <div className="relative">
                  <Input
                    id="recovery-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </FieldContent>
            </Field>

            <div className="space-y-1">
              <PasswordStrengthBar password={password} />
            </div>

            <Field data-invalid={showConfirmMismatch}>
              <FieldLabel htmlFor="recovery-password-confirmation">Confirmar senha</FieldLabel>
              <FieldContent>
                <div className="relative">
                  <Input
                    id="recovery-password-confirmation"
                    name="password_confirmation"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    aria-label={showConfirmPassword ? "Ocultar confirmação" : "Mostrar confirmação"}
                    className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
                {showConfirmMismatch ? (
                  <p className="text-sm text-destructive">As senhas não coincidem.</p>
                ) : null}
              </FieldContent>
            </Field>
          </FieldGroup>

          <Button type="submit" className="w-full" disabled={recover.isPending}>
            {recover.isPending ? "Salvando…" : "Redefinir senha"}
          </Button>
        </form>
      </div>
      <div className="flex flex-col gap-2 text-sm text-muted-foreground">
        <p>
          <Link to="/login" className="text-foreground underline underline-offset-4">
            Cancelar e voltar ao login
          </Link>
        </p>
      </div>
    </div>
  );
}