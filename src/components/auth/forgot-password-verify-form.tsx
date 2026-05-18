import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useUserVerifyResetCode } from "@/generated/api/user-operation/user-operation";
import {
  clearPasswordRecoveryCredentials,
  setPasswordRecoveryCredentials,
} from "@/lib/password-recovery-session";
import { toastApiError } from "@/lib/api-toast";
import { Link, useNavigate } from "@tanstack/react-router";

type ForgotPasswordVerifyFormProps = {
  email: string;
};

export function ForgotPasswordVerifyForm({ email }: ForgotPasswordVerifyFormProps) {
  const navigate = useNavigate();
  const [code, setCode] = useState("");

  const verify = useUserVerifyResetCode({
    mutation: {
      onSuccess: (res) => {
        const d = res.data;
        if (!d?.reset_session_id || !d.reset_secret) {
          toastApiError(new Error("Resposta incompleta do servidor."), "Código não confirmado");
          return;
        }
        clearPasswordRecoveryCredentials();
        setPasswordRecoveryCredentials({
          reset_session_id: d.reset_session_id,
          reset_secret: d.reset_secret,
        });
        navigate({ to: "/forgot-password/reset" });
      },
      onError: (error) => {
        toastApiError(error);
      },
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const digits = code.replace(/\D/g, "").slice(0, 4);
    if (digits.length !== 4) {
      toastApiError(new Error("Informe o código de 4 dígitos enviado por e-mail."), "Validação");
      return;
    }
    verify.mutate({
      data: { email: email.trim(), code: digits },
    });
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 items-center text-center">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Confirme o código</h2>
        <div className="text-sm text-muted-foreground space-y-1">
          <span className="block">
            Digite os 4 dígitos enviados para{" "}
            <span className="font-medium text-foreground">{email}</span>.
          </span>
          <span className="block text-muted-foreground">
            Se existir conta, você receberá um e-mail; confira também o spam ou lixo eletrônico.
          </span>
        </div>
      </div>
      <div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="recovery-code">Código</FieldLabel>
              <FieldContent>
                <Input
                  id="recovery-code"
                  name="code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={4}
                  placeholder="0000"
                  className="text-center font-mono text-lg tracking-[0.4em]"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  required
                />
              </FieldContent>
            </Field>
          </FieldGroup>

          <Button type="submit" className="w-full" disabled={verify.isPending}>
            {verify.isPending ? "Verificando…" : "Confirmar código"}
          </Button>
        </form>
      </div>
      <div className="flex flex-col gap-3 text-sm text-muted-foreground">
        <p>
          Não recebeu ou errou o e-mail?{" "}
          <Link
            to="/forgot-password"
            className="text-foreground underline underline-offset-4"
          >
            Solicitar novo código
          </Link>
        </p>
        <p>
          <Link to="/login" className="text-foreground underline underline-offset-4">
            Voltar ao login
          </Link>
        </p>
      </div>
    </div>
  );
}