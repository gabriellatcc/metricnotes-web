export function SparseWeekInsightsBanner({ recordedWeekdays }: { recordedWeekdays: number }) {
  return (
    <div
      className="mb-5 rounded-lg border border-border/70 bg-muted/25 px-4 py-3 text-sm text-muted-foreground"
      role="status"
    >
      Você <span className="font-medium text-foreground">ainda não anotou</span> conclusões em todos os dias deste intervalo —
      só{" "}
      <span className="font-medium tabular-nums text-foreground">
        {recordedWeekdays} {recordedWeekdays === 1 ? "dia" : "dias"}
      </span>{" "}
      têm marcações na série atual. À medida que concluir tarefas, estes dias serão completados.
    </div>
  );
}

export function WeeklyChartsStalePlaceholder({
  staleDays,
}: {
  /** Dias sem conclusões (mostrados na mensagem; mínimo 7 quando “período longo”). */
  staleDays: number;
}) {
  const rounded = staleDays >= 7 ? staleDays : 7;

  return (
    <div
      className="flex min-h-[220px] w-full flex-1 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border/70 bg-muted/15 px-4 py-14 text-center"
      role="status"
      aria-live="polite"
    >
      <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
        Você <span className="font-semibold text-foreground">ainda não anotou</span> conclusões para alimentar estes painéis
        recentemente.
      </p>
      <p className="max-w-md text-xs text-muted-foreground">
        Há cerca de <span className="font-medium tabular-nums text-foreground">{rounded}</span> ou mais dias sem registo nas
        conclusões usadas pelo painel. Use o quadro de tarefas e marque-itens como concluídas para recuperar estas análises.
      </p>
    </div>
  );
}
