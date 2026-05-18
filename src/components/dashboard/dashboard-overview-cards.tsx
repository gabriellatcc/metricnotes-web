import { Link } from "@tanstack/react-router";
import {
  Activity,
  CalendarDays,
  Clock,
  Coffee,
  Droplets,
  Layers,
  ListTodo,
  Loader2,
  Moon,
  Sunrise,
  CheckCircle2,
  Circle,
  type LucideIcon,
} from "lucide-react";
import { useMemo, type ReactNode } from "react";

import { buttonVariants } from "@/components/ui/button";
import type { TaskResource } from "@/generated/api/models";
import { useTaskIndex } from "@/generated/api/task/task";
import { addDaysLocal, parseTaskDueDate, startOfTodayLocal } from "@/lib/parse-task-due-date";
import { cn } from "@/lib/utils";

import { DashboardCardShell } from "./dashboard-card-shell";
import { DashboardTaskStatusSummary } from "./dashboard-task-status-summary";
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
  icon: any;
  children: ReactNode;
  className?: string;
};

function InsightShell({ title, subtitle, icon: Icon, children, className }: InsightProps) {
  return (
    <DashboardCardShell
      icon={Icon}
      title={title}
      subtitle={subtitle}
      className={cn("min-h-fit", className)}
    >
      {children}
    </DashboardCardShell>
  );
}

type DashboardOverviewCardsProps = {
  weeklySummary: WeeklyPerformanceSummary;
};

export function DashboardOverviewCards({ weeklySummary }: DashboardOverviewCardsProps) {
  const query = useTaskIndex({ page: 1, per_page: TASKS_PAGE_SIZE });

  const items = query.data?.data?.items ?? [];

  const { upcoming, todayTasks } = useMemo(() => {
    const upcomingList = filterUpcomingOpenTasks(items);
    const todayStart = startOfTodayLocal().getTime();
    
    const todayList = items.filter((t) => {
      if (!isOpenTask(t)) return false;
      const due = parseTaskDueDate(t.current_due_date || t.original_due_date);
      return due && startOfDueDay(due).getTime() === todayStart;
    });

    return { upcoming: upcomingList, todayTasks: todayList };
  }, [items]);

  const taskLoading = query.isLoading && !query.data;
  const taskFailed = query.isError;

  const renderKpi = (title: string, subtitle: string, Icon: any, valueNode: ReactNode) => (
    <DashboardCardShell icon={Icon} title={title} subtitle={subtitle} className="min-h-fit py-4">
      <div className="text-foreground mt-1">{valueNode}</div>
    </DashboardCardShell>
  );

  return (
    <>
      {taskLoading ? (
        <div className="mt-6 flex min-h-[120px] flex-col justify-center rounded-xl border border-dashed border-border/70 bg-muted/10 px-4 py-8 text-center">
          <Loader2 className="mx-auto mb-3 size-6 animate-spin text-(--accent-foreground)" aria-hidden />
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          <div className="lg:col-span-2 flex flex-col gap-4 h-full">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {renderKpi(
                "Conclusões na semana",
                "Total agregado da série",
                (props: any) => <Layers {...props} className={cn(props.className, "text-(--accent-foreground)")} />,
                <p className="text-3xl font-semibold tabular-nums tracking-tight">{weeklySummary.totalTasksWeek}</p>,
              )}
              
              {renderKpi(
                "Melhor dia",
                "Maior volume registado",
                (props: any) => <CalendarDays {...props} className={cn(props.className, "text-(--accent-foreground)")} />,
                <div>
                  <p className="text-base font-semibold leading-tight">{weeklySummary.bestDay.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    <span className="tabular-nums font-medium">{weeklySummary.bestDay.total}</span> concluídas
                  </p>
                </div>,
              )}

              {renderKpi(
                "Melhor faixa horária",
                "Janela de maior foco",
                (props: any) => <Sunrise {...props} className={cn(props.className, "text-(--accent-foreground)")} />,
                <div>
                  <p className="text-base font-semibold leading-tight">{weeklySummary.bestTimeBlock.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    <span className="tabular-nums font-medium">{weeklySummary.bestTimeBlock.total}</span> concluídas
                  </p>
                </div>,
              )}
            </div>

            <DashboardCardShell
              title="Foco de Hoje"
              subtitle="Suas prioridades absolutas programadas para este dia."
              icon={(props: any) => <ListTodo {...props} className={cn(props.className, "text-(--accent-foreground)")} />}
              className="flex-1 flex flex-col justify-between"
            >
              {todayTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-12 px-4 flex-1">
                  <CheckCircle2 className="size-8 text-(--accent-foreground) mb-2 opacity-60" />
                  <p className="text-sm font-medium text-foreground">Tudo limpo por hoje!</p>
                  <p className="text-xs text-muted-foreground max-w-xs mt-0.5">
                    Nenhuma tarefa prioritária restando para hoje. Aproveite para adiantar demandas ou planejar os próximos passos.
                  </p>
                </div>
              ) : (
                <div className="mt-2 space-y-2 flex-1">
                  {todayTasks.slice(0, 5).map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/[0.02] px-3 py-2.5 transition-colors hover:bg-muted/[0.05]"
                    >
                      <Circle className="size-4 shrink-0 text-muted-foreground/60" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-foreground truncate">{t.name}</p>
                        {t.status === "in_progress" && (
                          <span className="inline-flex mt-0.5 items-center rounded px-1.5 py-0.5 text-[9px] font-medium bg-primary/10 text-primary">
                            Em progresso
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {todayTasks.length > 5 && (
                    <p className="text-[10px] text-muted-foreground pl-1">E mais {todayTasks.length - 5} listadas no seu quadro...</p>
                  )}
                </div>
              )}
            </DashboardCardShell>
          </div>

          <div className="flex flex-col gap-4 lg:col-start-3 lg:row-start-1">
            <DashboardTaskStatusSummary items={items} loading={taskLoading} />
            
        <InsightShell
              title="Prazos a vencer"
              subtitle="Vencimento hoje e amanhã."
              icon={(props: any) => <Clock {...props} className={cn(props.className, "text-(--accent-foreground)")} />}
            >
              {upcoming.filter((t) => {
                const due = parseTaskDueDate(t.current_due_date || t.original_due_date);
                if (!due) return false;
                const today0 = startOfTodayLocal();
                const tomorrow0 = new Date(today0);
                tomorrow0.setDate(tomorrow0.getDate() + 1);
                const dueTime = startOfDueDay(due).getTime();
                return dueTime === today0.getTime() || dueTime === tomorrow0.getTime();
              }).length === 0 ? (
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Nada urgente no horizonte com prazo definido.
                </p>
              ) : (
                <ul className="mt-2 space-y-1">
                  {upcoming.filter((t) => {
                    const due = parseTaskDueDate(t.current_due_date || t.original_due_date);
                    if (!due) return false;
                    const today0 = startOfTodayLocal();
                    const tomorrow0 = new Date(today0);
                    tomorrow0.setDate(tomorrow0.getDate() + 1);
                    const dueTime = startOfDueDay(due).getTime();
                    return dueTime === today0.getTime() || dueTime === tomorrow0.getTime();
                  }).slice(0, LIST_MAX).map((t) => {
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
                          <span className={cn("shrink-0 tabular-nums", late ? "font-medium text-destructive" : "text-muted-foreground")}>
                            {late ? "Atr. · " : null}
                            {formatDueLabel(due)}
                          </span>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              )}
            </InsightShell>
          </div>

          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2 duration-1000 animate-in fade-in slide-in-from-bottom-4 ease-out">
            <InsightShell 
              title="Pausas e foco" 
              subtitle="Saúde no uso diário." 
              icon={(props: any) => <Coffee {...props} className={cn(props.className, "text-(--accent-foreground)")} />} 
              className="transition-transform duration-300 hover:-translate-y-0.5"
            >
              <p className="text-xs leading-relaxed text-muted-foreground">
                A cada 90 minutos, separe de 5 a 10 minutos para alongar ou tomar água. Pequenas pausas frequentes reduzem a fadiga acumulada.
              </p>
            </InsightShell>

            <InsightShell 
              title="Sono e ritmo" 
              subtitle="Produtividade sustentável." 
              icon={(props: any) => <Moon {...props} className={cn(props.className, "text-(--accent-foreground)")} />} 
              className="transition-transform duration-300 hover:-translate-y-0.5 delay-75"
            >
              <p className="text-xs leading-relaxed text-muted-foreground">
                Evite concentrar entregas complexas no final da noite. Distribuir a carga cognitiva protege seu descanso contínuo.
              </p>
            </InsightShell>

            <InsightShell 
              title="Corpo em movimento" 
              subtitle="Leve ao longo da semana." 
              icon={(props: any) => <Activity {...props} className={cn(props.className, "text-(--accent-foreground)")} />} 
              className="transition-transform duration-300 hover:-translate-y-0.5 delay-150"
            >
              <p className="text-xs leading-relaxed text-muted-foreground">
                Combine pequenas caminhadas com revisões de rotina. Atividades físicas moderadas aumentam a disposição mental geral.
              </p>
            </InsightShell>

            <InsightShell 
              title="Hidratação" 
              subtitle="Hábito de grande impacto." 
              icon={(props: any) => <Droplets {...props} className={cn(props.className, "text-(--accent-foreground)")} />} 
              className="transition-transform duration-300 hover:-translate-y-0.5 delay-200"
            >
              <p className="text-xs leading-relaxed text-muted-foreground">
                Mantenha uma garrafa de água sempre visível em seu posto de trabalho. Ajuda diretamente a reter o foco por mais tempo.
              </p>
            </InsightShell>
          </div>

        </div>
      )}
    </>
  );
}