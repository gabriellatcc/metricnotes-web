import type { TEventColor } from "@/components/ui/imported-calendar/types";

/** Textos do calendário importado (português). */
export type CalendarMessages = {
  today: string;
  viewAgenda: string;
  viewDay: string;
  viewWeek: string;
  viewMonth: string;
  viewYear: string;
  eventsCount: (count: number) => string;
  clearFilter: string;
  eventColors: Record<TEventColor, string>;
  tasksModeHint: string;
  addEvent: string;
  editEvent: string;
  deleteEvent: string;
  goToBoard: string;
  commandSearchPlaceholder: string;
  noResults: string;
  eventsOnDate: string;
  moreEventsSuffix: string;
  noEventsThisDate: string;
  responsible: string;
  startDate: string;
  endDate: string;
  description: string;
  atTime: string;
  eventDeleted: string;
  eventDeleteError: string;
  modalAddTitle: string;
  modalEditTitle: string;
  modalAddDescription: string;
  modalEditDescription: string;
  titleLabel: string;
  titlePlaceholder: string;
  variantLabel: string;
  variantPlaceholder: string;
  descriptionLabel: string;
  descriptionPlaceholder: string;
  cancel: string;
  saveChanges: string;
  createEvent: string;
  eventUpdated: string;
  eventCreated: string;
  eventUpdateFailed: string;
  eventCreateFailed: string;
  selectUserPlaceholder: string;
  allUsers: string;
  loadingCalendar: string;
  calendarLoadError: string;
  calendarPageTitle: string;
  calendarPageIntro: string;
  calendarPageFootnote: string;
  rangeFormatError: string;
  weekViewMobileHintLine1: string;
  weekViewMobileHintLine2: string;
  dayProgress: (current: number, total: number) => string;
  dayViewNoCurrentEvents: string;
};

export const calendarMessagesPt: CalendarMessages = {
  today: "Hoje",
  viewAgenda: "Agenda",
  viewDay: "Dia",
  viewWeek: "Semana",
  viewMonth: "Mês",
  viewYear: "Ano",
  eventsCount: (count) => (count === 1 ? "1 evento" : `${count} eventos`),
  clearFilter: "Limpar filtro",
  eventColors: {
    blue: "Azul",
    green: "Verde",
    red: "Vermelho",
    yellow: "Amarelo",
    purple: "Roxo",
    orange: "Laranja",
  },
  tasksModeHint:
    "Os prazos vêm das tuas tarefas. Para alterar datas, usa o quadro (arrastar ou editar).",
  addEvent: "Adicionar evento",
  editEvent: "Editar",
  deleteEvent: "Eliminar",
  goToBoard: "Ir ao quadro",
  commandSearchPlaceholder: "Pesquisar eventos…",
  noResults: "Nenhum resultado.",
  eventsOnDate: "Eventos em",
  moreEventsSuffix: "mais…",
  noEventsThisDate: "Sem eventos neste dia.",
  responsible: "Responsável",
  startDate: "Início",
  endDate: "Fim",
  description: "Descrição",
  atTime: "às",
  eventDeleted: "Evento eliminado.",
  eventDeleteError: "Erro ao eliminar o evento.",
  modalAddTitle: "Novo evento",
  modalEditTitle: "Editar evento",
  modalAddDescription: "Cria um evento no calendário.",
  modalEditDescription: "Altera os dados do evento.",
  titleLabel: "Título",
  titlePlaceholder: "Título do evento",
  variantLabel: "Cor",
  variantPlaceholder: "Escolhe uma cor",
  descriptionLabel: "Descrição",
  descriptionPlaceholder: "Descrição do evento",
  cancel: "Cancelar",
  saveChanges: "Guardar",
  createEvent: "Criar evento",
  eventUpdated: "Evento atualizado.",
  eventCreated: "Evento criado.",
  eventUpdateFailed: "Não foi possível atualizar o evento.",
  eventCreateFailed: "Não foi possível criar o evento.",
  selectUserPlaceholder: "Utilizador",
  allUsers: "Todos",
  loadingCalendar: "A carregar calendário…",
  calendarLoadError: "Não foi possível carregar as tarefas para o calendário.",
  calendarPageTitle: "Calendário de tarefas",
  calendarPageIntro:
    "Cada marca corresponde ao prazo atual ou original de uma tarefa (dia completo, sem hora).",
  calendarPageFootnote:
    "Interface baseada no projeto full-calendar para ShadCN. Arrastar no calendário só altera a vista local; para gravar, usa o quadro ou editar a tarefa.",
  rangeFormatError: "Erro ao formatar datas",
  weekViewMobileHintLine1: "A vista semanal é pouco prática em ecrãs pequenos.",
  weekViewMobileHintLine2: "Usa um computador ou a vista diária.",
  dayProgress: (current, total) => `Dia ${current} de ${total}`,
  dayViewNoCurrentEvents: "Não há eventos neste momento",
};
