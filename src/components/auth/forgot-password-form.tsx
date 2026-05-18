import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useUserForgotPassword } from "@/generated/api/user-operation/user-operation";
import { clearPasswordRecoveryCredentials } from "@/lib/password-recovery-session";
import { toastApiError, toastApiSuccessFromBody } from "@/lib/api-toast";
import { Link, useNavigate } from "@tanstack/react-router";

export function ForgotPasswordForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const forgot = useUserForgotPassword({
    mutation: {
      onMutate: () => {
        clearPasswordRecoveryCredentials();
      },
      onSuccess: (res) => {
        clearPasswordRecoveryCredentials();
        toastApiSuccessFromBody(res);
        navigate({
          to: "/forgot-password/verify",
          search: { email: email.trim() },
        });
      },
      onError: (error) => {
        toastApiError(error);
      },
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    forgot.mutate({ data: { email: email.trim() } });
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 items-center text-center">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Esqueci minha senha</h2>
        <p className="text-sm text-muted-foreground">
          Enviamos um código de 4 dígitos para o e-mail informado, caso exista conta cadastrada.
        </p>
      </div>
      <div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="recovery-email">E-mail</FieldLabel>
              <FieldContent>
                <Input
                  id="recovery-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </FieldContent>
            </Field>
          </FieldGroup>

          <Button type="submit" className="w-full" disabled={forgot.isPending}>
            {forgot.isPending ? "Enviando…" : "Enviar código"}
          </Button>
        </form>
      </div>
      <div className="flex flex-col gap-2 text-sm text-muted-foreground">
        <p>
          <Link to="/login" className="text-foreground underline underline-offset-4">
            Voltar ao login
          </Link>
        </p>
      </div>
    </div>
  );
}