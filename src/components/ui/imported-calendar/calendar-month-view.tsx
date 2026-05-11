import { addDays, format, startOfWeek } from "date-fns";
import { motion } from "framer-motion";
import { useMemo } from "react";
import {
	staggerContainer,
	transition,
} from "@/components/ui/imported-calendar/animations";
import { useCalendar } from "@/components/ui/imported-calendar/calendar-context";

import {
	calculateMonthEventPositions,
	getCalendarCells,
} from "@/components/ui/imported-calendar/helpers";

import type { IEvent } from "@/components/ui/imported-calendar/interfaces";
import { DayCell } from "@/components/ui/imported-calendar/day-cell";

interface IProps {
	singleDayEvents: IEvent[];
	multiDayEvents: IEvent[];
}

const WEEK_STARTS_ON = 0 as const;

export function CalendarMonthView({ singleDayEvents, multiDayEvents }: IProps) {
	const { selectedDate, dateLocale } = useCalendar();

	const allEvents = [...multiDayEvents, ...singleDayEvents];

	const cells = useMemo(() => getCalendarCells(selectedDate), [selectedDate]);

	const weekDayLabels = useMemo(() => {
		const start = startOfWeek(selectedDate, { weekStartsOn: WEEK_STARTS_ON });
		return Array.from({ length: 7 }, (_, i) =>
			format(addDays(start, i), "EEE", { locale: dateLocale }),
		);
	}, [selectedDate, dateLocale]);

	const eventPositions = useMemo(
		() =>
			calculateMonthEventPositions(
				multiDayEvents,
				singleDayEvents,
				selectedDate,
			),
		[multiDayEvents, singleDayEvents, selectedDate],
	);

	return (
		<motion.div initial="initial" animate="animate" variants={staggerContainer}>
			<div className="grid grid-cols-7">
				{weekDayLabels.map((day, index) => (
					<motion.div
						key={day}
						className="flex items-center justify-center py-2"
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: index * 0.05, ...transition }}
					>
						<span className="text-xs font-medium text-t-quaternary">{day}</span>
					</motion.div>
				))}
			</div>

			<div className="grid grid-cols-7 overflow-hidden">
				{cells.map((cell) => (
					<DayCell
						key={cell.date.toISOString()}
						cell={cell}
						events={allEvents}
						eventPositions={eventPositions}
					/>
				))}
			</div>
		</motion.div>
	);
}
