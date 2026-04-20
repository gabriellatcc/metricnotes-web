import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Loader2, Moon, Sun } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Field, FieldContent, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { Theme } from "@/components/providers/theme-provider";
import { useTheme } from "@/components/providers/theme-provider";
import { getAuthMeQueryKey, useAuthMe } from "@/generated/api/auth/auth";
import { useUserUpdate } from "@/generated/api/user/user";
import { getAuthAccessToken } from "@/lib/api-client";
import { getPasswordStrength } from "@/lib/password-strength";
import { toastApiError, toastApiSuccessFromBody } from "@/lib/api-toast";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    if (!getAuthAccessToken()) {
      throw redirect({ to: "/login" });
    }
  },
  component: SettingsPage,
});

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

function PasswordStrengthBar({ password }: { password: string }) {
  const { score, label } = getPasswordStrength(password);
  if (!password) return null;

  const segmentActive = (i: number) => i <= score;

  const segmentClass = (i: number) => {
    if (!segmentActive(i)) return "bg-muted";
    if (score <= 2) return "bg-amber-500";
    if (score === 3) return "bg-lime-500";
    return "bg-emerald-600";
  };

  return (
    <div className="space-y-2 pt-1">
      <div className="flex gap-1.5" aria-hidden>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={cn("h-2 flex-1 rounded-full transition-colors", segmentClass(i))} />
        ))}
      </div>
      {label ? <p className="text-xs text-muted-foreground">{label}</p> : null}
    </div>
  );
}

function SettingsPage() {
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();
  const [pendingTheme, setPendingTheme] = useState<Theme>(theme);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();

  const me = useAuthMe({
    query: {
      enabled: true,
      onError: (error) => toastApiError(error, "Não foi possível carregar o perfil"),
    },
  });

  const user = me.data?.data?.user;

  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfileEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    setPendingTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => {
      const i = carouselApi.selectedScrollSnap();
      setPendingTheme(i === 0 ? "light" : "dark");
    };
    carouselApi.on("select", onSelect);
    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

  useEffect(() => {
    if (!carouselApi) return;
    const target = pendingTheme === "light" ? 0 : 1;
    if (carouselApi.selectedScrollSnap() !== target) {
      carouselApi.scrollTo(target);
    }
  }, [carouselApi, pendingTheme]);

  const updateMutation = useUserUpdate({
    mutation: {
      onSuccess: (res, variables) => {
        toastApiSuccessFromBody(res, "Dados salvos.");
        void queryClient.invalidateQueries({ queryKey: getAuthMeQueryKey() });
        const keys = Object.keys(variables.data);
        if (keys.includes("password")) {
          setNewPassword("");
          setConfirmPassword("");
        }
      },
      onError: (error) => toastApiError(error),
    },
  });

  const busyProfile = updateMutation.isPending;
  const busyPassword = updateMutation.isPending;

  const saveProfile = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) return;
      updateMutation.mutate({
        id: user.id,
        data: { name: profileName.trim(), email: profileEmail.trim() },
      });
    },
    [user, profileName, profileEmail, updateMutation],
  );

  const savePassword = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) return;
      if (newPassword.length < 6) {
        toastApiError(new Error("A senha deve ter pelo menos 6 caracteres."), "Validação");
        return;
      }
      if (newPassword !== confirmPassword) {
        toastApiError(new Error("As senhas não coincidem."), "Validação");
        return;
      }
      updateMutation.mutate({
        id: user.id,
        data: { password: newPassword },
      });
    },
    [user, newPassword, confirmPassword, updateMutation],
  );

  const saveTheme = useCallback(() => {
    setTheme(pendingTheme);
    toastApiSuccessFromBody({ message: "Tema atualizado." });
  }, [pendingTheme, setTheme]);

  const themeDirty = pendingTheme !== theme;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-12 px-4 py-10">
      <header className="space-y-2 border-b border-border pb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie as informações da sua conta, senha e preferências de tema.
        </p>
      </header>

      {/* Informações pessoais */}
      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Informações pessoais</h2>
          <p className="text-sm text-muted-foreground">Nome e e-mail exibidos na sua conta.</p>
        </div>
        <form onSubmit={saveProfile} className="space-y-8">
          {me.isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando…</p>
          ) : me.isError ? (
            <p className="text-sm text-muted-foreground">
              Não foi possível carregar o perfil. Veja a notificação acima.
            </p>
          ) : user ? (
            <div className="flex flex-col gap-8 md:flex-row md:items-start">
              <div
                className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40 text-xl font-semibold text-muted-foreground"
                aria-hidden
              >
                {initialsFromName(profileName || user.name)}
              </div>
              <FieldGroup className="min-w-0 flex-1">
                <Field>
                  <FieldLabel htmlFor="settings-name">Nome</FieldLabel>
                  <FieldContent>
                    <Input
                      id="settings-name"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      autoComplete="name"
                      className="max-w-lg rounded-xl"
                      required
                    />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="settings-email">E-mail</FieldLabel>
                  <FieldContent>
                    <Input
                      id="settings-email"
                      type="email"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      autoComplete="email"
                      className="max-w-lg rounded-xl"
                      required
                    />
                  </FieldContent>
                </Field>
              </FieldGroup>
            </div>
          ) : null}
          <div className="flex justify-end border-t border-border pt-6">
            <Button type="submit" disabled={busyProfile || !user} className="min-w-[120px] rounded-full">
              {busyProfile ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Salvando…
                </>
              ) : (
                "Salvar"
              )}
            </Button>
          </div>
        </form>
      </section>

      {/* Senha */}
      <section className="space-y-6 border-t border-border pt-12">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Senha</h2>
          <p className="text-sm text-muted-foreground">
            Use pelo menos 8 caracteres, letras maiúsculas e minúsculas, números e símbolos para uma senha
            segura.
          </p>
        </div>
        <form onSubmit={savePassword} className="space-y-8">
          <FieldGroup className="max-w-md space-y-4">
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
          <div className="flex justify-end border-t border-border pt-6">
            <Button
              type="submit"
              variant="secondary"
              disabled={busyPassword || !user || !newPassword}
              className="min-w-[120px] rounded-full"
            >
              {busyPassword ? (
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
      </section>

      {/* Tema — carrossel */}
      <section className="space-y-6 border-t border-border pt-12">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Tema</h2>
          <p className="text-sm text-muted-foreground">
            Deslize ou use as setas para escolher o modo claro ou escuro. Depois salve a preferência.
          </p>
        </div>

        <div className="relative px-10">
          <Carousel
            setApi={setCarouselApi}
            opts={{ loop: false, startIndex: theme === "dark" ? 1 : 0 }}
            className="w-full max-w-xl mx-auto"
          >
            <CarouselContent>
              <CarouselItem>
                <div className="flex min-h-[200px] flex-col justify-center gap-3 rounded-2xl border border-border/60 bg-gradient-to-br from-amber-50 via-background to-sky-50 p-8 text-center dark:from-amber-950/30 dark:via-card dark:to-sky-950/20">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-background/80 shadow-sm">
                    <Sun className="size-7 text-amber-500" />
                  </span>
                  <span className="text-lg font-semibold">Claro</span>
                  <span className="text-sm text-muted-foreground">Interface clara para o dia a dia.</span>
                </div>
              </CarouselItem>
              <CarouselItem>
                <div className="flex min-h-[200px] flex-col justify-center gap-3 rounded-2xl border border-border/60 bg-gradient-to-br from-slate-900 via-slate-800 to-zinc-900 p-8 text-center text-slate-100">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
                    <Moon className="size-7 text-slate-200" />
                  </span>
                  <span className="text-lg font-semibold">Escuro</span>
                  <span className="text-sm text-slate-300">Menos brilho, confortável à noite.</span>
                </div>
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious className="border-border bg-background" />
            <CarouselNext className="border-border bg-background" />
          </Carousel>
        </div>

        <div className="flex justify-end border-t border-border pt-6">
          <Button type="button" onClick={saveTheme} disabled={!themeDirty} className="min-w-[120px] rounded-full">
            Salvar tema
          </Button>
        </div>
      </section>

      <Link to="/tasks" className={cn(buttonVariants({ variant: "outline" }), "w-fit rounded-full")}>
        Voltar às tarefas
      </Link>
    </main>
  );
}
