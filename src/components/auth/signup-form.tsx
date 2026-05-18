import { Eye, EyeOff } from "lucide-react";
import { useState, type FormEvent } from "react";

import { TermsOfServiceMetricnotesContent } from "@/components/auth/terms-of-service-metricnotes";
import { authFormCardClassName } from "@/components/auth/auth-page-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { PasswordStrengthBar } from "@/components/ui/password-strength-bar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useStoreUser } from "@/generated/api/user/user";
import { setAuthAccessToken } from "@/lib/api-client";
import { toastApiError, toastApiSuccessFromBody } from "@/lib/api-toast";
import { Link, useNavigate } from "@tanstack/react-router";

export function SignupForm() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsDialogOpen, setTermsDialogOpen] = useState(false);

  const showConfirmMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const signup = useStoreUser({
    mutation: {
      onSuccess: (res) => {
        const token = res.data.authorization?.access_token;
        if (!token) {
          toastApiError(
            new Error("Conta criada, mas a resposta não incluiu o token de acesso. Entre pelo login."),
            "Cadastro incompleto",
          );
          navigate({ to: "/login" });
          return;
        }
        setAuthAccessToken(token, true);
        toastApiSuccessFromBody(res, "Conta criada.");
        navigate({ to: "/dashboard" });
      },
      onError: (error) => {
        toastApiError(error);
      },
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!acceptedTerms) {
      toastApiError(
        new Error("É preciso ler e aceitar os Termos de Uso para criar a conta."),
        "Termos obrigatórios",
      );
      return;
    }
    if (password.length < 6) {
      toastApiError(new Error("A senha deve ter pelo menos 6 caracteres."), "Validação");
      return;
    }
    if (password !== confirmPassword) {
      toastApiError(new Error("As senhas não coincidem."), "Validação");
      return;
    }
    signup.mutate({ data: { name, email, password, password_confirmation: confirmPassword } });
  };

  return (
    <Card className={authFormCardClassName("w-full max-w-md")}>
      <CardHeader className="space-y-2">
        <CardTitle>Criar conta</CardTitle>
        <CardDescription>Nome, e-mail, senha e aceite dos termos.</CardDescription>
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
                <div className="relative">
                  <Input
                    id="signup-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0.5 top-1/2 z-10 h-9 w-9 shrink-0 -translate-y-1/2 rounded-md p-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </Button>
                </div>
                <PasswordStrengthBar password={password} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="signup-confirm-password">Confirmação de senha</FieldLabel>
              <FieldContent>
                <div className="relative">
                  <Input
                    id="signup-confirm-password"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0.5 top-1/2 z-10 h-9 w-9 shrink-0 -translate-y-1/2 rounded-md p-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
                    aria-label={showConfirmPassword ? "Ocultar confirmação de senha" : "Mostrar confirmação de senha"}
                    onClick={() => setShowConfirmPassword((v) => !v)}
                  >
                    {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </Button>
                </div>
                {showConfirmMismatch ? (
                  <p role="alert" className="text-xs text-destructive">
                    As senhas não coincidem.
                  </p>
                ) : null}
              </FieldContent>
            </Field>
          </FieldGroup>

          <div className="space-y-3 rounded-xl border border-border/60 bg-muted/30 px-3 py-3">
            <div className="flex gap-3 text-sm leading-snug">
              <input
                id="signup-accept-terms"
                name="acceptedTerms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(event) => setAcceptedTerms(event.target.checked)}
                className="peer mt-1 size-[1.0625rem] shrink-0 cursor-pointer rounded border border-input accent-primary bg-background outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <div className="min-w-0 flex-1 space-y-2">
                <label htmlFor="signup-accept-terms" className="block cursor-pointer text-muted-foreground">
                  Li e aceito os Termos de Uso e Serviço da Metricnotes.
                </label>
                <button
                  type="button"
                  className="text-xs font-medium text-foreground underline decoration-primary/70 underline-offset-2 hover:no-underline"
                  onClick={() => setTermsDialogOpen(true)}
                >
                  Ler termos completos
                </button>
              </div>
            </div>
            {!acceptedTerms ? (
              <p className="text-xs text-muted-foreground">
                Você só poderá clicar em &quot;Criar conta&quot; após marcar a aceitação acima.
              </p>
            ) : null}
          </div>

          <Button type="submit" className="w-full" disabled={signup.isPending || !acceptedTerms}>
            {signup.isPending ? "Criando…" : "Criar conta"}
          </Button>
        </form>

        <Dialog open={termsDialogOpen} onOpenChange={setTermsDialogOpen}>
          <DialogContent className="gap-0 p-0 sm:max-w-2xl" showClose>
            <DialogHeader>
              <DialogTitle>Termos de Uso e Serviço da Metricnotes</DialogTitle>
              <DialogDescription className="text-left">
                Leia com atenção antes de aceitar ao criar sua conta.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[min(65vh,32rem)] border-y border-border/60">
              <div className="px-6 py-4">
                <TermsOfServiceMetricnotesContent />
              </div>
            </ScrollArea>
            <DialogFooter className="sm:justify-between">
              <Button type="button" variant="ghost" size="sm" onClick={() => setTermsDialogOpen(false)}>
                Fechar
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setAcceptedTerms(true);
                  setTermsDialogOpen(false);
                }}
              >
                Concordo — marcar aceite
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
