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
import { Field, FieldContent, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authFormCardClassName } from "@/components/auth/auth-page-layout";
import { useAuthLogin } from "@/generated/api/auth/auth";
import { setAuthAccessToken } from "@/lib/api-client";
import { toastApiError, toastApiSuccessFromBody } from "@/lib/api-toast";
import { Link, useNavigate } from "@tanstack/react-router";

export function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  const login = useAuthLogin({
    mutation: {
      onSuccess: (res) => {
        const token =
          res.data.authorization?.access_token ?? res.data.access_token;
        if (!token) {
          toastApiError(
            new Error("Resposta sem token de acesso."),
            "Login incompleto",
          );
          return;
        }
        setAuthAccessToken(token, rememberMe);
        toastApiSuccessFromBody(res, "Sessão iniciada.");
        navigate({ to: "/tasks" });
      },
      onError: (error) => {
        toastApiError(error);
      },
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    login.mutate({ data: { email, password } });
  };

  return (
    <Card className={authFormCardClassName("w-full max-w-md")}>
      <CardHeader className="space-y-2">
        <CardTitle>Entrar</CardTitle>
        <CardDescription>E-mail e senha da sua conta.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">E-mail</FieldLabel>
              <FieldContent>
                <Input
                  id="email"
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
              <FieldLabel htmlFor="password">Senha</FieldLabel>
              <FieldContent>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </FieldContent>
            </Field>

            <div className="flex items-center gap-2 pt-1">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="size-4 shrink-0 rounded border border-input bg-background text-primary shadow-xs ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
              <label htmlFor="remember-me" className="cursor-pointer text-sm leading-none text-muted-foreground">
                Lembrar-me
              </label>
            </div>
          </FieldGroup>

          <Button type="submit" className="w-full" disabled={login.isPending}>
            {login.isPending ? "Entrando…" : "Entrar"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 text-sm text-muted-foreground">
        <p>
          Não tem uma conta?{" "}
          <Link to="/signup" className="text-foreground underline underline-offset-4">
            Criar conta
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
