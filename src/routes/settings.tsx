import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { KeyRound, Loader2, Moon, Palette, Sun, UserRound, X, type LucideIcon } from "lucide-react";
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
import { TgCreditsFooter } from "@/components/layout/tg-credits-footer";
import { SettingsAvatarSection } from "@/components/settings/settings-avatar-section";
import { SettingsPasswordSection } from "@/components/settings/settings-password-section";
import type { Theme } from "@/components/providers/theme-provider";
import { useTheme } from "@/components/providers/theme-provider";
import { getAuthMeQueryKey, useAuthMe } from "@/generated/api/auth/auth";
import { useUserUpdate } from "@/generated/api/user/user";
import { getAuthAccessToken } from "@/lib/api-client";
import { toastApiError, toastApiSuccessFromBody } from "@/lib/api-toast";
import { resolveLaravelStorageUrl } from "@/lib/resolve-media-url";
import { cn } from "@/lib/utils";

type SettingsPanel = "profile" | "password" | "theme";

const SETTINGS_TABS: { panel: SettingsPanel; label: string; icon: LucideIcon }[] = [
  { panel: "profile", label: "Perfil", icon: UserRound },
  { panel: "password", label: "Senha", icon: KeyRound },
  { panel: "theme", label: "Tema", icon: Palette },
];

export const Route = createFileRoute("/settings")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    if (!getAuthAccessToken()) {
      throw redirect({ to: "/login" });
    }
  },
  component: SettingsPage,
});

function SettingsPage() {
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();
  const [pendingTheme, setPendingTheme] = useState<Theme>(theme);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [activePanel, setActivePanel] = useState<SettingsPanel>("profile");

  const me = useAuthMe({
    query: {
      enabled: true,
      onError: (error) => toastApiError(error, "Não foi possível carregar o perfil"),
    },
  });

  const user = me.data?.data?.user;

  const [profileName, setProfileName] = useState("");

  useEffect(() => {
    if (user) {
      setProfileName(user.name);
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
      onSuccess: (res) => {
        toastApiSuccessFromBody(res, "Dados salvos.");
        void queryClient.invalidateQueries({ queryKey: getAuthMeQueryKey() });
      },
      onError: (error) => toastApiError(error),
    },
  });

  const busyProfile = updateMutation.isPending;

  const profileNameDirty =
    Boolean(user) && profileName.trim() !== (user?.name ?? "").trim();

  const saveProfile = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) return;
      if (profileName.trim() === user.name.trim()) return;
      updateMutation.mutate({
        id: user.id,
        data: { name: profileName.trim() },
      });
    },
    [user, profileName, updateMutation],
  );

  const saveTheme = useCallback(() => {
    setTheme(pendingTheme);
    toastApiSuccessFromBody({ message: "Tema atualizado." });
  }, [pendingTheme, setTheme]);

  const themeDirty = pendingTheme !== theme;

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 border-b border-border pb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1 pr-2">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">Configurações</h1>
              <p className="mt-1 max-w-2xl text-pretty text-sm text-muted-foreground">
                Gerencie as informações da sua conta, senha e preferências de tema.
              </p>
            </div>
            <Link
              to="/dashboard"
              aria-label="Fechar configurações e voltar ao painel"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "inline-flex size-9 shrink-0 items-center justify-center rounded-full p-0",
              )}
            >
              <X className="size-4" aria-hidden />
            </Link>
          </div>
          <nav
            role="tablist"
            aria-label="Secções das configurações"
            className="mt-6 flex flex-wrap justify-start gap-1 sm:gap-2"
          >
            {SETTINGS_TABS.map(({ panel, label, icon: Icon }) => {
              const selected = activePanel === panel;
              return (
                <Button
                  key={panel}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  id={`settings-tab-${panel}`}
                  variant={selected ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "h-8 shrink-0 gap-1.5 rounded-full",
                    selected ? "text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                  )}
                  onClick={() => setActivePanel(panel)}
                >
                  <Icon className="size-4 opacity-80" aria-hidden />
                  {label}
                </Button>
              );
            })}
          </nav>
        </header>

        <div className="flex w-full flex-col items-center">
          {activePanel === "profile" ? (
            <div
              role="tabpanel"
              aria-labelledby="settings-tab-profile"
              className="outline-none"
            >
              <h2 className="sr-only">Perfil</h2>
              <form
                onSubmit={saveProfile}
                className="mx-auto w-full max-w-4xl space-y-4 px-1 sm:px-0"
              >
                {me.isLoading ? (
                  <p className="text-sm text-muted-foreground">Carregando…</p>
                ) : me.isError ? (
                  <p className="text-sm text-muted-foreground">
                    Não foi possível carregar o perfil. Veja a notificação acima.
                  </p>
                ) : user ? (
                  <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                    <SettingsAvatarSection
                      userId={user.id}
                      displayName={profileName || user.name}
                      avatarUrl={resolveLaravelStorageUrl(
                        (user as { avatar_url?: string | null }).avatar_url ?? undefined,
                      )}
                      disabled={busyProfile}
                    />
                    <FieldGroup className="w-full min-w-0 flex-1 space-y-4 sm:min-w-[18rem]">
                      <Field>
                        <FieldLabel htmlFor="settings-name">Nome</FieldLabel>
                        <FieldContent>
                          <Input
                            id="settings-name"
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            autoComplete="name"
                            className="w-full rounded-xl"
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
                            value={user.email}
                            disabled
                            autoComplete="email"
                            className="w-full cursor-not-allowed rounded-xl bg-muted/50 text-muted-foreground"
                            title="O e-mail não pode ser alterado nesta tela."
                          />
                        </FieldContent>
                      </Field>
                    </FieldGroup>
                  </div>
                ) : null}
                <div className="flex justify-end border-t border-border/80 pt-4">
                  <Button
                    type="submit"
                    disabled={busyProfile || !user || !profileNameDirty}
                    className="min-w-[120px] gap-2 rounded-full"
                  >
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
            </div>
          ) : null}

          {activePanel === "password" ? (
            <div
              role="tabpanel"
              aria-labelledby="settings-tab-password"
              className="mx-auto w-full max-w-[80%] outline-none sm:max-w-[min(40rem,80%)]"
            >
              <h2 className="sr-only">Senha</h2>
              {user ? (
                <SettingsPasswordSection userId={user.id} disabled={me.isLoading || !!me.isError} />
              ) : me.isLoading ? (
                <p className="text-sm text-muted-foreground">Carregando…</p>
              ) : null}
            </div>
          ) : null}

          {activePanel === "theme" ? (
            <div
              role="tabpanel"
              aria-labelledby="settings-tab-theme"
              className="mx-auto w-full max-w-3xl outline-none"
            >
              <h2 className="sr-only">Tema</h2>
              <div className="relative w-full px-2 sm:px-10">
                <Carousel
                  setApi={setCarouselApi}
                  opts={{ loop: false, startIndex: theme === "dark" ? 1 : 0 }}
                  className="w-full"
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

              <div className="mt-4 flex justify-end border-t border-border/80 pt-4">
                <Button type="button" onClick={saveTheme} disabled={!themeDirty} className="min-w-[120px] rounded-full">
                  Salvar tema
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <TgCreditsFooter className="mt-auto shrink-0" />
    </main>
  );
}
