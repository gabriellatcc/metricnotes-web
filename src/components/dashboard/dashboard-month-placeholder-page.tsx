export function DashboardMonthPlaceholderPage() {
  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <p className="text-sm font-medium text-foreground">Em construção.</p>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Em breve poderá comparar semanas completas e tendências de um mês. Por agora use <strong className="text-foreground">Últimos 7 dias</strong>{" "}
        ou o <strong className="text-foreground">Calendário</strong> de prazos.
      </p>
    </section>
  );
}
