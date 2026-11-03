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
  eventsCount: (count) => (count === 1 ? "1 tarefa" : `${count} tarefas`),
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
  addEvent: "",
  editEvent: "Editar",
  deleteEvent: "Eliminar",
  goToBoard: "Ir ao quadro",
  commandSearchPlaceholder: "Pesquisar tarefas…",
  noResults: "Nenhum resultado.",
  eventsOnDate: "Tarefas em",
  moreEventsSuffix: "mais…",
  noEventsThisDate: "Sem tarefas neste dia.",
  startDate: "Início",
  endDate: "Fim",
  description: "Descrição",
  atTime: "às",
  eventDeleted: "Tarefa eliminada.",
  eventDeleteError: "Erro ao eliminar a tarefa.",
  modalAddTitle: "Novo tarefa",
  modalEditTitle: "Editar tarefa",
  modalAddDescription: "Cria um tarefa no calendário.",
  modalEditDescription: "Altera os dados da tarefa.",
  titleLabel: "Título",
  titlePlaceholder: "Título do tarefa",
  variantLabel: "Cor",
  variantPlaceholder: "Escolhe uma cor",
  descriptionLabel: "Descrição",
  descriptionPlaceholder: "Descrição da tarefa",
  cancel: "Cancelar",
  saveChanges: "Guardar",
  createEvent: "Criar tarefa",
  eventUpdated: "Tarefa atualizada.",
  eventCreated: "Tarefa criada.",
  eventUpdateFailed: "Não foi possível atualizar a tarefa.",
  eventCreateFailed: "Não foi possível criar a tarefa.",
  selectUserPlaceholder: "Utilizador",
  allUsers: "Todos",
  loadingCalendar: "Carregando o calendário…",
  calendarLoadError: "Não foi possível carregar as tarefas para o calendário.",
  calendarPageTitle: "Calendário de tarefas",
  calendarPageIntro:
    "Cada marca corresponde ao prazo atual ou original de uma tarefa (dia completo, sem hora).",
  calendarPageFootnote:
    "",
  rangeFormatError: "Erro ao formatar datas",
  weekViewMobileHintLine1: "A vista semanal é pouco prática em ecrãs pequenos.",
  weekViewMobileHintLine2: "Usa um computador ou a vista diária.",
  dayProgress: (current, total) => `Dia ${current} de ${total}`,
  dayViewNoCurrentEvents: "Não há tarefas neste momento",
};
