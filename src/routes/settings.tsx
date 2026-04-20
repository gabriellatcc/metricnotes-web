import { createFileRoute, redirect } from "@tanstack/react-router";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { useAuthMe } from "@/generated/api/auth/auth";
import { getAuthAccessToken } from "@/lib/api-client";
import { toastApiError } from "@/lib/api-toast";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

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
  const me = useAuthMe({
    query: {
      enabled: true,
      onError: (error) => toastApiError(error, "Não foi possível carregar o perfil"),
    },
  });

  const user = me.data?.data?.user;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
        <p className="text-sm text-muted-foreground">Perfil e preferências da conta.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>Dados da sua conta (somente leitura por enquanto).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {me.isLoading ? (
            <p className="text-muted-foreground">Carregando…</p>
          ) : me.isError ? (
            <p className="text-muted-foreground">Não foi possível carregar o perfil. Veja a notificação acima.</p>
          ) : user ? (
            <dl className="grid gap-2 sm:grid-cols-[120px_1fr] sm:gap-x-4">
              <dt className="text-muted-foreground">Nome</dt>
              <dd>{user.name}</dd>
              <dt className="text-muted-foreground">E-mail</dt>
              <dd>{user.email}</dd>
              <dt className="text-muted-foreground">ID</dt>
              <dd className="font-mono text-xs">{user.id}</dd>
            </dl>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferências</CardTitle>
          <CardDescription>Notificações e tema virão aqui.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Nada para configurar ainda.</p>
        </CardContent>
      </Card>

      <Link to="/tasks" className={cn(buttonVariants({ variant: "outline" }), "w-fit")}>
        Voltar às tarefas
      </Link>
    </main>
  );
}
