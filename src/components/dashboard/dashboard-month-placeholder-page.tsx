function DashboardSectionHeading({ id, title, description }: { id: string; title: string; description: string }) {
  return (
    <header className="mb-6">
      <h2 id={id} className="text-lg font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      <p className="mt-1 max-w-3xl text-pretty text-sm text-muted-foreground">{description}</p>
    </header>
  );
}

export function DashboardMonthPlaceholderPage() {
  return (
    <section
      className="rounded-2xl border border-dashed border-border/70 bg-muted/10 p-8 sm:p-10"
      aria-labelledby="painel-tab-mes"
    >
      <DashboardSectionHeading
        id="painel-tab-mes"
        title="Último mês"
        description="Vista agregada mensal com os mesmos princípios do painel — ainda em construção."
      />
      <p className="text-sm font-medium text-foreground">Em construção.</p>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Em breve poderá comparar semanas completas e tendências de um mês. Por agora use <strong className="text-foreground">Últimos 7 dias</strong>{" "}
        ou o <strong className="text-foreground">Calendário</strong> de prazos.
      </p>
    </section>
  );
}
