import { createFileRoute, Link } from "@tanstack/react-router";

import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: MarketingHomePage,
});

function MarketingHomePage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-muted/50 to-background px-4 py-16 sm:py-24">
        <div
          className="home-hero-glow pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-30%,var(--primary),transparent)] opacity-40"
          aria-hidden
        />
        <div
          className="home-hero-orb home-hero-orb-delay pointer-events-none absolute -right-20 top-10 size-72 rounded-full bg-primary/20 blur-3xl"
          aria-hidden
        />
        <div
          className="home-hero-orb pointer-events-none absolute -left-16 bottom-0 size-64 rounded-full bg-accent/25 blur-3xl"
          aria-hidden
        />

        <div className="relative mx-auto max-w-3xl text-center">
          <ScrollReveal variant="fade-up">
            <p className="mb-3 text-sm font-medium text-primary">Notas & tarefas, sem o barulho</p>
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delayMs={90}>
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Fique claro sobre o que importa a seguir
            </h1>
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delayMs={180}>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground sm:text-lg">
              MetricNotes ajuda você a capturar ideias, organizar o trabalho e avançar com um ambiente tranquilo e focado, seja você planejando sua semana ou entregando a próxima versão.
            </p>
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delayMs={260}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/signup" className={cn(buttonVariants({ size: "lg" }))}>
                Comece gratuitamente
              </Link>
              <Link to="/login" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
                Já tenho uma conta
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section id="features" className="scroll-mt-20 px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <ScrollReveal variant="fade-up" className="mb-10 text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Tudo em um só lugar</h2>
            <p className="mt-2 text-muted-foreground">
              Construído para pessoas que querem estrutura sem complexidade.
            </p>
          </ScrollReveal>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                title: "Capture rapidamente",
                desc: "Solte tarefas e notas rapidamente para nada escapar quando a inspiração chegar.",
                body: "Menos fricção entre pensamento e ação—seu backlog fica honesto e atualizado.",
              },
              {
                title: "Veja o big picture",
                desc: "Prioridades, prazos e status em um olhar—sem muitas planilhas.",
                body: "Faça decisões com contexto: o que está vencendo, o que está bloqueado, o que pode esperar.",
              },
              {
                title: "Trabalhe no seu ritmo",
                desc: "Uma interface tranquila que fica fora do seu caminho—foca no trabalho, não na ferramenta.",
                body: "Construído para ser usado todos os dias: tipografia clara, padrões sensíveis, espaço para respirar.",
              },
            ].map((item, i) => (
              <ScrollReveal key={item.title} variant="zoom" delayMs={i * 100}>
                <Card className="h-full transition-shadow duration-300 hover:shadow-md">
                  <CardHeader>
                    <CardTitle>{item.title}</CardTitle>
                    <CardDescription>{item.desc}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">{item.body}</CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section id="why" className="border-t border-border/60 bg-muted/30 px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <ScrollReveal variant="slide-left">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Por que MetricNotes?</h2>
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delayMs={120}>
            <p className="mt-4 text-pretty text-muted-foreground sm:text-lg">
              A maioria das ferramentas são ou muito pesadas ou muito simples. MetricNotes está no meio: suficiente
              estrutura para se manter responsável, suficiente simplicidade para realmente gostar de abrir o site todos os
              dias.
            </p>
          </ScrollReveal>
          <ScrollReveal variant="zoom" delayMs={220}>
            <div className="mt-8">
              <Link to="/signup" className={cn(buttonVariants({ size: "lg" }))}>
                Crie sua conta
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}
