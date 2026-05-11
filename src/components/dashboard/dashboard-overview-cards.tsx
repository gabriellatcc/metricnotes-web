import { Link } from "@tanstack/react-router";
import {
  Activity,
  CalendarDays,
  Clock,
  Coffee,
  Droplets,
  Divide,
  Layers,
  ListTodo,
  Loader2,
  Moon,
  Sparkles,
  Sunrise,
  type LucideIcon,
} from "lucide-react";
import { useMemo, type ReactNode } from "react";

import { buttonVariants } from "@/components/ui/button";
import type { TaskResource } from "@/generated/api/models";
import { useTaskIndex } from "@/generated/api/task/task";
import { addDaysLocal, parseTaskDueDate, startOfTodayLocal } from "@/lib/parse-task-due-date";
import { cn } from "@/lib/utils";

import { DashboardCardShell } from "./dashboard-card-shell";
import type { WeeklyPerformanceSummary } from "./types";

const TASKS_PAGE_SIZE = 100;
const UPCOMING_DAYS = 7;
const LIST_MAX = 4;

function startOfDueDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

function formatDueLabel(d: Date): string {
  return d.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" });
}

function isOpenTask(t: TaskResource): boolean {
  return t.status !== "completed" && (t.completed_at == null || t.completed_at === "");
}

/** Tarefas com prazo hoje até N dias ou já atrasadas (não concluídas). */
export function filterUpcomingOpenTasks(items: TaskResource[], withinDays = UPCOMING_DAYS): TaskResource[] {
  const today0 = startOfTodayLocal();
  const horizonEnd = addDaysLocal(today0, withinDays + 1);

  const withMeta = items.filter(isOpenTask).map((t) => ({
    task: t,
    due: parseTaskDueDate(t.current_due_date || t.original_due_date),
  }));

  const inWindow = withMeta.filter(({ due }) => {
    if (!due) return false;
    const d0 = startOfDueDay(due);
    return d0 < horizonEnd;
  });

  inWindow.sort((a, b) => {
    if (!a.due || !b.due) return 0;
    const ad = startOfDueDay(a.due).getTime();
    const bd = startOfDueDay(b.due).getTime();
    const now = today0.getTime();
    const aLate = ad < now;
    const bLate = bd < now;
    if (aLate !== bLate) return aLate ? -1 : 1;
    return ad - bd;
  });

  return inWindow.map((x) => x.task);
}

type InsightProps = {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  children: ReactNode;
};

function InsightShell({ title, subtitle, icon: Icon, children }: InsightProps) {
  return (
    <DashboardCardShell
      icon={Icon}
      title={title}
      subtitle={subtitle}
      className="min-h-[176px] sm:min-h-[196px]"
    >
      {children}
    </DashboardCardShell>
  );
}

/** Cartões KPI derivados dos agregados de “desempenho na semanal” (mock até API própria). */
function WeeklyPerformanceMiniCards({ summary }: { summary: WeeklyPerformanceSummary }) {
  const kpi = (
    title: string,
    subtitle: string,
    Icon: LucideIcon,
    valueNode: ReactNode,
  ) => (
    <DashboardCardShell icon={Icon} title={title} subtitle={subtitle} className="min-h-[138px] sm:min-h-[148px]">
      <div className="text-foreground">{valueNode}</div>
    </DashboardCardShell>
  );

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpi(
        "Conclusões na semana",
        "Total agregado usado pela série do painel",
        Layers,
        <p className="text-3xl font-semibold tabular-nums tracking-tight">{summary.totalTasksWeek}</p>,
      )}
      {kpi(
        "Ritmo diário médio",
        "Média por dia dentro da série",
        Divide,
        <p className="text-3xl font-semibold tabular-nums tracking-tight">{summary.dailyAverage.toFixed(1)}</p>,
      )}
      {kpi(
        "Melhor dia",
        "Um dia da série com maior volume registado",
        CalendarDays,
        <div>
          <p className="text-lg font-semibold leading-tight">{summary.bestDay.label}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            <span className="tabular-nums">{summary.bestDay.total}</span> concluídas
          </p>
        </div>,
      )}
      {kpi(
        "Melhor faixa horária",
        "Janela com mais marcações nos dados atuais",
        Sunrise,
        <div>
          <p className="text-lg font-semibold leading-tight">{summary.bestTimeBlock.label}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            <span className="tabular-nums">{summary.bestTimeBlock.total}</span> concluídas
          </p>
        </div>,
      )}
    </div>
  );
}

function WeeklyInsightsBulletsCard({ insights }: Pick<WeeklyPerformanceSummary, "insights">) {
  return (
    <DashboardCardShell
      icon={Sparkles}
      title="Leituras rápidas"
      subtitle="Sugestões derivadas apenas dos números de exemplo até existir modelo real no backend."
      className="min-h-fit"
    >
      <ul className="list-disc space-y-2 pl-4 text-xs leading-relaxed text-muted-foreground marker:text-muted-foreground/80">
        {insights.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </DashboardCardShell>
  );
}

type DashboardOverviewCardsProps = {
  weeklySummary: WeeklyPerformanceSummary;
};

export function DashboardOverviewCards({ weeklySummary }: DashboardOverviewCardsProps) {
  const query = useTaskIndex({ page: 1, per_page: TASKS_PAGE_SIZE });

  const items = query.data?.data?.items ?? [];

  const { upcoming, inProgressCount } = useMemo(() => {
    const upcomingList = filterUpcomingOpenTasks(items);
    const inProgress = items.filter((t) => t.status === "in_progress" && isOpenTask(t)).length;
    return { upcoming: upcomingList, inProgressCount: inProgress };
  }, [items]);

  const taskLoading = query.isLoading && !query.data;
  const taskFailed = query.isError;

  return (
    <>
      <div className="space-y-4">
        <WeeklyPerformanceMiniCards summary={weeklySummary} />
        <WeeklyInsightsBulletsCard insights={weeklySummary.insights} />
      </div>

      {taskLoading ? (
        <div className="mt-6 flex min-h-[120px] flex-col justify-center rounded-xl border border-dashed border-border/70 bg-muted/10 px-4 py-8 text-center">
          <Loader2 className="mx-auto mb-3 size-6 animate-spin text-primary" aria-hidden />
          <p className="text-sm text-muted-foreground">Carregando prazos e progresso das tarefas…</p>
        </div>
      ) : taskFailed ? (
        <div className="mt-6 rounded-xl border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
          Não foi possível combinar dados em tempo real das suas tarefas.{" "}
          <Link to="/tasks" className="font-medium text-primary underline-offset-2 hover:underline">
            Abrir tarefas
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          <InsightShell
            title="Prazos em vista"
            subtitle={`Tarefas em aberto com vencimento até ${UPCOMING_DAYS} dias ou atrasadas.`}
            icon={Clock}
          >
            {upcoming.length === 0 ? (
              <p className="text-xs leading-relaxed text-muted-foreground">
                Nada urgente no horizonte com prazo definido. Ótimo momento para planejar com calma.
              </p>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold tabular-nums text-foreground">{upcoming.length}</span>{" "}
                  {upcoming.length === 1 ? "tarefa" : "tarefas"}
                </p>
                <ul className="mt-2 space-y-1">
                  {upcoming.slice(0, LIST_MAX).map((t) => {
                    const due = parseTaskDueDate(t.current_due_date || t.original_due_date);
                    const today0 = startOfTodayLocal();
                    const late = due && startOfDueDay(due).getTime() < today0.getTime();
                    return (
                      <li
                        key={t.id}
                        className="flex items-baseline justify-between gap-2 rounded-lg border border-border/50 px-2.5 py-1.5 text-xs"
                      >
                        <span className="min-w-0 truncate font-medium text-foreground">{t.name}</span>
                        {due ? (
                          <span
                            className={cn(
                              "shrink-0 tabular-nums",
                              late ? "font-medium text-destructive" : "text-muted-foreground",
                            )}
                          >
                            {late ? "Atrasada · " : null}
                            {formatDueLabel(due)}
                          </span>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
                {upcoming.length > LIST_MAX ? (
                  <p className="mt-2 text-[10px] text-muted-foreground">E mais {upcoming.length - LIST_MAX}…</p>
                ) : null}
              </>
            )}
            <div className="mt-3 border-t border-border/50 pt-3">
              <Link
                to="/tasks"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-8 rounded-md px-3 text-xs")}
              >
                Ir para tarefas
              </Link>
            </div>
          </InsightShell>

          <InsightShell
            title="Em progresso"
            subtitle='Tarefas com estado “em progresso”, com base nos últimos registros carregados.'
            icon={ListTodo}
          >
            <p className="text-3xl font-semibold tracking-tight tabular-nums text-foreground">{inProgressCount}</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Divida blocos grandes em passos menores para manter ritmo estável sem sobrecarga.
            </p>
            <Link
              to="/tasks"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "mt-4 inline-flex h-8 rounded-md px-3 text-xs",
              )}
            >
              Abrir quadro
            </Link>
          </InsightShell>

          <InsightShell title="Pausas e foco" subtitle="Saúde no uso diário da ferramenta." icon={Coffee}>
            <p className="text-xs leading-relaxed text-muted-foreground">
              A cada cerca de 90 minutos de foco, reserve 5–10 minutos para se alongar, olhar ao longe ou tomar água. Pequenas
              pausas reduzem tensão e ajudam a manter clareza nas decisões.
            </p>
          </InsightShell>

          <InsightShell title="Sono e ritmo" subtitle="Produtividade sustentável." icon={Moon}>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Evite concentrar todas as entregas no fim do dia ou à noite. Distribuir tarefas pela manhã e tarde costuma
              proteger o descanso e a concentração no dia seguinte.
            </p>
          </InsightShell>

          <InsightShell title="Corpo em movimento" subtitle="Leve ao longo da semana." icon={Activity}>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Combine uma caminhada curta com a revisão de tarefas leves no celular. Movimento moderado está associado a melhor
              humor e energia ao longo da semana.
            </p>
          </InsightShell>

          <InsightShell title="Hidratação" subtitle="Hábito simples com grande impacto." icon={Droplets}>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Manter uma garrafa visível perto do local de trabalho lembra a beber água com frequência — bom para fadiga
              mental e para longas sessões em frente à tela.
            </p>
          </InsightShell>
        </div>
      )}
    </>
  );
}
