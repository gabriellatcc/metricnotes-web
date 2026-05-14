import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  ClipboardList,
  ExternalLink,
  Layers,
  LayoutGrid,
  Mail,
  Sparkles,
  Wind,
  Zap,
} from "lucide-react";
import { useSyncExternalStore } from "react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getAuthAccessToken } from "@/lib/api-client";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    if (getAuthAccessToken()) {
      throw redirect({ to: "/dashboard", replace: true });
    }
  },
  component: MarketingHomePage,
});

function subscribeToken(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener("metricnotes-auth", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("metricnotes-auth", callback);
  };
}

function tokenSnapshot() {
  return getAuthAccessToken() ?? "";
}

function tokenServerSnapshot() {
  return "";
}

const GITHUB_HREF = "https://github.com/gabriellatcc";
const GITHUB_WEB_REPO_HREF = "https://github.com/gabriellatcc/metricnotes-web";
const GITHUB_API_REPO_HREF = "https://github.com/gabriellatcc/metricnotes-api";
const LINKEDIN_HREF = "https://www.linkedin.com/in/gabriellacorrea";
const EMAIL = "gabriellatccorrea@gmail.com";

function MarketingHomePage() {
  const token = useSyncExternalStore(subscribeToken, tokenSnapshot, tokenServerSnapshot);
  const loggedIn = Boolean(token);

  return (
    <>
      <style>{`
        @keyframes landing-fade-in-up {
          from {
            opacity: 0;
            transform: translate3d(0, 1.25rem, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        @keyframes landing-float {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(0, -10px, 0);
          }
        }
        @keyframes landing-shimmer-sweep {
          from {
            transform: translateX(-120%);
          }
          to {
            transform: translateX(120%);
          }
        }
        @keyframes landing-bar-rise {
          from {
            height: 0%;
            opacity: 0.35;
          }
          to {
            height: var(--landing-bar-h, 50%);
            opacity: 1;
          }
        }
        @keyframes landing-gradient-flow {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 200% 50%;
          }
        }
        @keyframes landing-pulse-glow {
          0%,
          100% {
            opacity: 0.45;
            transform: scale(1);
          }
          50% {
            opacity: 0.75;
            transform: scale(1.05);
          }
        }
        .landing-fade-in-up {
          animation: landing-fade-in-up 0.85s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .landing-float-slow {
          animation: landing-float 6s ease-in-out infinite;
        }
        .landing-float-delayed {
          animation: landing-float 7s ease-in-out infinite 1.2s;
        }
        .landing-gradient-text {
          background: linear-gradient(
            90deg,
            #1d4ed8,
            #4f46e5,
            #6366f1,
            #818cf8,
            #4f46e5,
            #1d4ed8
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: landing-gradient-flow 10s linear infinite;
        }
        .landing-cta-shimmer {
          position: relative;
          overflow: hidden;
        }
        .landing-cta-shimmer::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            105deg,
            transparent 0%,
            rgba(255, 255, 255, 0.45) 45%,
            rgba(255, 255, 255, 0.1) 55%,
            transparent 100%
          );
          transform: translateX(-120%);
          pointer-events: none;
        }
        .landing-cta-shimmer:hover::after {
          animation: landing-shimmer-sweep 0.9s ease-out;
        }
        .landing-bar-rise {
          animation: landing-bar-rise 1.15s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        .landing-dot-grid {
          background-color: #fafafa;
          background-image: radial-gradient(circle at center, rgb(148 163 184 / 0.18) 1px, transparent 1px);
          background-size: 28px 28px;
        }
        .landing-orb-glow {
          animation: landing-pulse-glow 14s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .landing-fade-in-up,
          .landing-float-slow,
          .landing-float-delayed,
          .landing-gradient-text,
          .landing-bar-rise,
          .landing-orb-glow {
            animation: none !important;
          }
          .landing-fade-in-up {
            opacity: 1;
            transform: none;
          }
          .landing-bar-rise {
            height: var(--landing-bar-h, 50%) !important;
            opacity: 1;
          }
          .landing-gradient-text {
            background-position: 50% 50%;
          }
        }
      `}</style>

      <div className="landing-dot-grid relative min-h-screen overflow-x-hidden text-slate-900">
        {/* Background orbs */}
        <div
          className="pointer-events-none absolute -left-[20%] top-[8%] size-[520px] rounded-full bg-blue-400/25 blur-3xl landing-orb-glow landing-float-slow"
          aria-hidden
        />
        <div
          className="landing-float-delayed pointer-events-none absolute -right-[15%] top-[35%] size-[460px] rounded-full bg-indigo-500/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-[5%] left-[25%] size-[380px] rounded-full bg-violet-400/18 blur-3xl landing-float-slow"
          aria-hidden
        />

        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-[#fafafa]/70 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-[#fafafa]/55">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
            <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
              <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-indigo-500 to-violet-500 p-2 text-white shadow-lg shadow-blue-500/25 ring-1 ring-white/40">
                <ClipboardList className="size-[18px]" strokeWidth={2.2} aria-hidden />
              </span>
              <span className="text-[15px] font-semibold tracking-tight text-slate-900">MetricNotes</span>
            </Link>
            <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
              <a href="#features" className="transition-colors hover:text-slate-900">
                Funcionalidades
              </a>
              <a href="#benefits" className="transition-colors hover:text-slate-900">
                Benefícios
              </a>
              <a href="#documentacao" className="transition-colors hover:text-slate-900">
                Documentação
              </a>
              <a href="#manifesto" className="transition-colors hover:text-slate-900">
                Começar
              </a>
            </nav>
            <div className="flex shrink-0 items-center gap-2">
              {loggedIn ? (
                <Link
                  to="/dashboard"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "hidden text-slate-600 hover:bg-slate-900/5 hover:text-slate-900 sm:inline-flex",
                  )}
                >
                  Painel
                </Link>
              ) : (
                <Link
                  to="/login"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "hidden text-slate-600 hover:bg-slate-900/5 hover:text-slate-900 sm:inline-flex",
                  )}
                >
                  Entrar
                </Link>
              )}
              <Link
                to={loggedIn ? "/dashboard" : "/signup"}
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "rounded-lg bg-slate-900 text-white shadow-md shadow-slate-900/10 hover:bg-slate-800",
                )}
              >
                {loggedIn ? "Ir ao app" : "Criar conta"}
              </Link>
            </div>
          </div>
        </header>

        <main className="relative flex flex-1 flex-col">
          {/* Hero */}
          <section className="relative px-4 pb-20 pt-12 sm:pb-28 sm:pt-16 md:pt-20">
            <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-10">
              <div className="relative z-10 text-center lg:text-left">
                <div
                  className="landing-fade-in-up landing-float-slow mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/60 px-3.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm backdrop-blur-md lg:mx-0"
                  style={{ animationDelay: "0.05s" }}
                >
                  <Sparkles className="size-3.5 text-indigo-500" aria-hidden />
                  <span>Notas &amp; tarefas, sem o barulho visual</span>
                </div>

                <h1
                  className="landing-fade-in-up text-balance text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl md:text-[3.35rem] md:leading-[1.08]"
                  style={{ animationDelay: "0.12s" }}
                >
                  Fique{" "}
                  <span className="landing-gradient-text font-semibold">claro</span> sobre o que
                  importa a seguir
                </h1>

                <p
                  className="landing-fade-in-up mx-auto mt-5 max-w-xl text-pretty text-base text-slate-600 sm:text-lg lg:mx-0"
                  style={{ animationDelay: "0.2s" }}
                >
                  MetricNotes ajuda você a capturar ideias, organizar o trabalho e avançar com um
                  ambiente tranquilo e focado — do planejamento da semana à próxima entrega.
                </p>

                <div
                  className="landing-fade-in-up mt-9 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
                  style={{ animationDelay: "0.28s" }}
                >
                  <Link
                    to={loggedIn ? "/dashboard" : "/signup"}
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "landing-cta-shimmer rounded-xl border-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-7 text-white shadow-xl shadow-blue-600/25 transition-transform hover:scale-[1.02] hover:from-blue-600 hover:to-indigo-600",
                    )}
                  >
                    {loggedIn ? "Abrir painel" : "Comece gratuitamente"}
                    <ArrowRight className="ml-1.5 size-4" aria-hidden />
                  </Link>
                  <Link
                    to="/login"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "rounded-xl border-slate-200/90 bg-white/50 backdrop-blur-sm hover:bg-white/80",
                    )}
                  >
                    Já tenho conta
                  </Link>
                </div>
              </div>

              {/* Mock browser / preview */}
              <div
                className="landing-fade-in-up relative z-10 mx-auto w-full max-w-lg lg:mx-0 lg:max-w-none"
                style={{ animationDelay: "0.22s" }}
              >
                <div className="relative rounded-2xl border border-slate-200/70 bg-white/40 p-2 shadow-[0_32px_64px_-12px_rgba(15,23,42,0.18)] shadow-slate-300/40 ring-1 ring-white/70 backdrop-blur-xl">
                  <div className="overflow-hidden rounded-xl border border-slate-200/50 bg-[#fafbfc]/90 shadow-inner">
                    <div className="flex items-center gap-2 border-b border-slate-200/60 bg-white/70 px-3 py-2.5 backdrop-blur-sm">
                      <div className="flex gap-1.5">
                        <span className="size-2.5 rounded-full bg-[#fb7185]" />
                        <span className="size-2.5 rounded-full bg-[#fcd34d]" />
                        <span className="size-2.5 rounded-full bg-[#86efac]" />
                      </div>
                      <div className="ml-2 flex flex-1 items-center justify-center">
                        <div className="h-7 w-[72%] max-w-[280px] rounded-md bg-slate-100/90 text-[10px] font-medium tracking-wide text-slate-400 shadow-inner backdrop-blur-sm flex items-center justify-center gap-1.5">
                          <LayoutGrid className="size-3 opacity-50" aria-hidden />
                          app.metricnotes · overview
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 p-4 sm:p-5">
                      <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        {[
                          { label: "Em foco", value: "12", sub: "tarefas" },
                          { label: "Semana", value: "86%", sub: "concluído" },
                          { label: "Notas", value: "28", sub: "ativas" },
                        ].map((kpi) => (
                          <div
                            key={kpi.label}
                            className="rounded-xl border border-slate-200/60 bg-white/70 p-3 shadow-sm backdrop-blur-md transition-shadow hover:shadow-md"
                          >
                            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                              {kpi.label}
                            </p>
                            <p className="mt-1.5 text-2xl font-semibold tabular-nums text-slate-900">
                              {kpi.value}
                              <span className="text-sm font-normal text-slate-500"> {kpi.sub}</span>
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="rounded-xl border border-slate-200/60 bg-gradient-to-br from-white/95 to-slate-50/80 p-4 shadow-sm backdrop-blur-md">
                        <div className="mb-3 flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-slate-700">Fluxo · 7 dias</span>
                          <BarChart3 className="size-4 text-blue-600/70" aria-hidden />
                        </div>
                        <div className="flex h-36 items-end justify-between gap-1.5 px-1 sm:gap-2">
                          {[38, 62, 45, 78, 52, 88, 64].map((h, i) => (
                            <div
                              key={`bar-${String(i)}`}
                              className="flex h-full min-h-[6rem] flex-1 flex-col justify-end rounded-t-lg bg-transparent"
                            >
                              <div
                                className="landing-bar-rise w-full min-h-0 rounded-t-lg bg-gradient-to-t from-blue-600/92 via-indigo-500/82 to-blue-400/65 shadow-inner"
                                style={{
                                  ["--landing-bar-h" as string]: `${h}%`,
                                  animationDelay: `${0.12 + i * 0.08}s`,
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating notification */}
                <div
                  className="landing-float-delayed absolute -right-2 top-[18%] z-20 max-w-[220px] rounded-xl border border-slate-200/70 bg-white/85 p-3 shadow-lg shadow-slate-400/20 ring-1 ring-white/80 backdrop-blur-xl sm:-right-6 sm:max-w-[240px]"
                  style={{ animationDuration: "5.5s" }}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md">
                      <Bell className="size-4" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-slate-900">Lembrete</p>
                      <p className="mt-0.5 text-[10px] leading-snug text-slate-500">
                        Revisão “Planejamento” em 30 min.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Bento features */}
          <section id="features" className="scroll-mt-24 px-4 pb-20 sm:pb-24">
            <div className="mx-auto max-w-6xl">
              <div className="landing-fade-in-up mb-12 text-center" style={{ animationDelay: "0s" }}>
                <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                  Tudo em um só lugar
                </h2>
                <p className="mx-auto mt-3 max-w-lg text-slate-600">
                  Estrutura sem excesso — o essencial para manter o foco.
                </p>
              </div>

              <div id="benefits" className="grid gap-4 sm:grid-cols-3 sm:gap-5">
                {[
                  {
                    icon: Zap,
                    title: "Capture rápido",
                    desc: "Menos fricção entre ideia e ação. O backlog fica honesto e atualizado.",
                  },
                  {
                    icon: Layers,
                    title: "Veja o panorama",
                    desc: "Prioridades e prazos num só olhar — sem planilhas infinitas.",
                  },
                  {
                    icon: Wind,
                    title: "No seu ritmo",
                    desc: "Interface calma que some do caminho: tipografia clara e espaço para respirar.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/50 p-6 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-slate-300/80 hover:shadow-xl hover:shadow-indigo-500/5"
                  >
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/[0.04] via-transparent to-indigo-500/[0.06] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="relative">
                      <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl border border-slate-200/80 bg-white/80 text-blue-600 shadow-sm transition-transform duration-300 group-hover:rotate-[-4deg] group-hover:scale-110">
                        <item.icon className="size-5" strokeWidth={2} aria-hidden />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Documentação (GitHub) */}
          <section id="documentacao" className="scroll-mt-24 border-y border-slate-200/80 bg-slate-50/90 px-4 py-20 sm:py-24">
            <div className="mx-auto max-w-6xl">
              <div className="landing-fade-in-up mb-10 text-center" style={{ animationDelay: "0s" }}>
                <div className="mx-auto mb-4 inline-flex size-12 items-center justify-center rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                  <BookOpen className="size-6 text-blue-600" aria-hidden />
                </div>
                <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                  Documentação no GitHub
                </h2>
                <p className="mx-auto mt-3 max-w-2xl text-pretty text-slate-600">
                  Requisitos, passo a passo para desenvolvimento local e organização dos repositórios estão nos README do
                  front-end e da API — código aberto para consulta acadêmica e evolução do projeto.
                </p>
              </div>

              <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2 sm:gap-5">
                <a
                  href={GITHUB_WEB_REPO_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/10"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Front-end</p>
                      <p className="mt-2 text-lg font-semibold text-slate-900">metricnotes-web</p>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        App React/Vite: instalação, scripts e contribuições.
                      </p>
                    </div>
                    <ExternalLink className="size-5 shrink-0 text-slate-400 transition-colors group-hover:text-indigo-600" aria-hidden />
                  </div>
                </a>
                <a
                  href={GITHUB_API_REPO_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/10"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">API</p>
                      <p className="mt-2 text-lg font-semibold text-slate-900">metricnotes-api</p>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        Backend Laravel: ambiente, migrate e JWT.
                      </p>
                    </div>
                    <ExternalLink className="size-5 shrink-0 text-slate-400 transition-colors group-hover:text-indigo-600" aria-hidden />
                  </div>
                </a>
              </div>

              <p className="mt-8 text-center text-sm text-slate-500">
                Perfil da autora ·{" "}
                <a
                  href={GITHUB_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-indigo-600 underline decoration-indigo-200 underline-offset-4 hover:text-indigo-700"
                >
                  gabriellatcc no GitHub
                  <ExternalLink className="size-3.5 opacity-70" aria-hidden />
                </a>
              </p>
            </div>
          </section>

          {/* Manifesto CTA */}
          <section
            id="manifesto"
            className="scroll-mt-20 relative overflow-hidden bg-slate-950 px-4 py-20 sm:py-28"
          >
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 size-[120%] max-w-none -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,_rgb(79_70_229_/_0.35)_0%,_transparent_62%)]"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgb(59_130_246_/_0.15),transparent_50%)]"
              aria-hidden
            />
            <div className="relative mx-auto max-w-3xl text-center">
              <p className="landing-fade-in-up text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300/90">
                Manifesto
              </p>
              <h2 className="landing-fade-in-up mt-4 text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-[2.65rem] md:leading-tight">
                Ferramentas demais só adicionam ruído.{" "}
                <span className="text-transparent bg-gradient-to-r from-blue-200 via-white to-indigo-200 bg-clip-text">
                  Você merece clareza.
                </span>
              </h2>
              <p className="landing-fade-in-up mx-auto mt-5 max-w-xl text-base text-slate-400">
                MetricNotes existe no equilíbrio: bastante estrutura para responsabilidade, bastante
                simplicidade para querer voltar todos os dias.
              </p>
              <div className="landing-fade-in-up mt-10 flex flex-wrap items-center justify-center gap-3">
                <Link
                  to={loggedIn ? "/dashboard" : "/signup"}
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "landing-cta-shimmer rounded-xl border-0 bg-white px-8 text-slate-900 shadow-xl shadow-black/40 hover:bg-slate-100",
                  )}
                >
                  {loggedIn ? "Ir ao painel" : "Criar minha conta"}
                  <ArrowRight className="ml-1 size-4" aria-hidden />
                </Link>
                <Link
                  to="/login"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "rounded-xl border-slate-600 bg-transparent text-slate-100 hover:bg-white/10 hover:text-white",
                  )}
                >
                  Já sou usuário
                </Link>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="border-t border-slate-200/80 bg-white/70 px-4 py-14 backdrop-blur-md">
            <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Link to="/" className="flex items-center gap-2 font-semibold text-slate-900">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                    <ClipboardList className="size-[15px]" aria-hidden />
                  </span>
                  MetricNotes
                </Link>
                <p className="mt-3 text-sm leading-relaxed text-slate-500">
                  TG · Fatec Cruzeiro — foco na experiência entre notas e tarefas.
                </p>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Trabalho de conclusão
                </h3>
                <p className="mt-3 text-sm font-medium text-slate-800">
                  Centro Paula Souza · FATEC Cruzeiro
                  <span className="mt-1 block font-normal text-slate-500">
                    Prof. Waldomiro Way
                  </span>
                </p>
                <p className="mt-2 text-sm text-slate-600">Gabriella Tavares Costa Correa</p>
                <p className="mt-1 text-xs text-slate-500">Versão 1.0</p>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Orientadora
                </h3>
                <p className="mt-3 text-sm text-slate-700">Ana Carolina Satim Rodrigues</p>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Contato
                </h3>
                <ul className="mt-3 flex flex-col gap-2 text-sm">
                  <li>
                    <a
                      href={GITHUB_HREF}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-slate-600 underline decoration-slate-200 underline-offset-4 hover:text-slate-900"
                    >
                      GitHub · gabriellatcc
                      <ExternalLink className="size-3.5 shrink-0 opacity-60" aria-hidden />
                    </a>
                  </li>
                  <li>
                    <a
                      href={LINKEDIN_HREF}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-slate-600 underline decoration-slate-200 underline-offset-4 hover:text-slate-900"
                    >
                      LinkedIn · gabriellacorrea
                      <ExternalLink className="size-3.5 shrink-0 opacity-60" aria-hidden />
                    </a>
                  </li>
                  <li>
                    <a
                      href={`mailto:${EMAIL}`}
                      className="inline-flex items-center gap-1 text-slate-600 underline decoration-slate-200 underline-offset-4 hover:text-slate-900"
                    >
                      <Mail className="size-3.5 shrink-0 opacity-60" aria-hidden />
                      {EMAIL}
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <p className="mx-auto mt-12 max-w-6xl border-t border-slate-100 pt-8 text-center text-xs text-slate-400">
              © {new Date().getFullYear()} MetricNotes.
            </p>
          </footer>
        </main>
      </div>
    </>
  );
}
