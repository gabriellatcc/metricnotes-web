import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authFormCardClassName } from "@/components/auth/auth-page-layout";
import { Field, FieldContent, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useStoreUser } from "@/generated/api/user/user";
import { toastApiError, toastApiSuccessFromBody, toastApiWarning } from "@/lib/api-toast";
import { Link, useNavigate } from "@tanstack/react-router";

export function SignupForm() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const signup = useStoreUser({
    mutation: {
      onSuccess: (res) => {
        toastApiSuccessFromBody(res, "Conta criada. Faça login.");
        navigate({ to: "/login" });
      },
      onError: (error) => {
        toastApiError(error);
      },
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      toastApiWarning("As senhas não coincidem.");
      return;
    }
    signup.mutate({ data: { name, email, password } });
  };

  return (
    <Card className={authFormCardClassName("w-full max-w-md")}>
      <CardHeader className="space-y-2">
        <CardTitle>Criar conta</CardTitle>
        <CardDescription>Nome, e-mail e senha.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="signup-name">Nome</FieldLabel>
              <FieldContent>
                <Input
                  id="signup-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="signup-email">E-mail</FieldLabel>
              <FieldContent>
                <Input
                  id="signup-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="signup-password">Senha</FieldLabel>
              <FieldContent>
                <Input
                  id="signup-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="signup-confirm-password">Confirmação de senha</FieldLabel>
              <FieldContent>
                <Input
                  id="signup-confirm-password"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </FieldContent>
            </Field>
          </FieldGroup>

          <Button type="submit" className="w-full" disabled={signup.isPending}>
            {signup.isPending ? "Criando…" : "Criar conta"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        <p>
          Já tem uma conta?{" "}
          <Link to="/login" className="text-foreground underline underline-offset-4">
            Entrar
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
