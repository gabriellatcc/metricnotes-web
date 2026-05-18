import type { TEventColor } from "@/components/ui/imported-calendar/types";

export interface IUser {
	id: string;
	name: string;
	picturePath: string | null;
}

export interface IEvent {
	id: string;
	startDate: string;
	endDate: string;
	title: string;
	color: TEventColor;
	description: string;
	user: IUser;
	/** IDs de recurso externos (ex.: tarefa Metricnotes). */
	sourceTaskId?: string;
}

export interface ICalendarCell {
	day: number;
	currentMonth: boolean;
	date: Date;
}
