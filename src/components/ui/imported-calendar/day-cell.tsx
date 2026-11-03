"use client";

import { cva } from "class-variance-authority";
import { isToday, isSunday } from "date-fns";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { transition } from "@/components/ui/imported-calendar/animations";
import { EventListDialog } from "@/components/ui/imported-calendar/events-list-dialog";
import { DroppableArea } from "@/components/ui/imported-calendar/droppable-area";
import { getMonthCellEvents } from "@/components/ui/imported-calendar/helpers";
import { useMediaQuery } from "@/components/ui/imported-calendar/hooks";
import type { ICalendarCell, IEvent } from "@/components/ui/imported-calendar/interfaces";
import { MonthEventDot } from "@/components/ui/imported-calendar/month-event-dot";
import { Button } from "@/components/ui/button";
import { AddEditEventDialog } from "@/components/ui/imported-calendar/add-edit-event-dialog";
import { useCalendar } from "@/components/ui/imported-calendar/calendar-context";

interface IProps {
  cell: ICalendarCell;
  events: IEvent[];
  eventPositions: Record<string, number>;
}

export const dayCellVariants = cva("text-white", {
  variants: {
    color: {
      blue: "bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-400 ",
      green:
        "bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-400",
      red: "bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-400",
      yellow:
        "bg-yellow-600 dark:bg-yellow-500 hover:bg-yellow-700 dark:hover:bg-yellow-400",
      purple:
        "bg-purple-600 dark:bg-purple-500 hover:bg-purple-700 dark:hover:bg-purple-400",
      orange:
        "bg-orange-600 dark:bg-orange-500 hover:bg-orange-700 dark:hover:bg-orange-400",
      gray: "bg-gray-600 dark:bg-gray-500 hover:bg-gray-700 dark:hover:bg-gray-400",
    },
  },
  defaultVariants: {
    color: "blue",
  },
});

export function DayCell({ cell, events, eventPositions }: IProps) {
  const { day, currentMonth, date } = cell;
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { messages } = useCalendar();

  const cellEvents = useMemo(
    () => getMonthCellEvents(date, events, eventPositions),
    [date, events, eventPositions],
  );

  const cellContent = useMemo(
    () => (
      <motion.div
        className={cn(
          "flex h-full lg:min-h-20 flex-col gap-1 border-l border-t",
          isSunday(date) && "border-l-0",
        )}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition}
      >
        <DroppableArea date={date} className="w-full h-full py-2">
          <motion.span
            className={cn(
              "h-6 px-1 text-xs font-semibold lg:px-2",
              !currentMonth && "opacity-20",
              isToday(date) &&
                "flex w-6 translate-x-1 items-center justify-center rounded-full bg-primary px-0 font-bold text-primary-foreground",
            )}
          >
            {day}
          </motion.span>

          <motion.div
            className={cn("mt-1 px-2", !currentMonth && "opacity-50")}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={transition}
          >
            {cellEvents.length === 0 ? (
              !isMobile && (
                <div className="group flex min-h-[47px] w-full items-center justify-center">
                  <AddEditEventDialog startDate={date}>
                    <Button
                      variant="ghost"
                      className="border opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                    >
                      <Plus className="h-4 w-4" />
                      <span className="max-sm:hidden">{messages.addEvent}</span>
                    </Button>
                  </AddEditEventDialog>
                </div>
              )
            ) : (
              <div className="flex flex-wrap items-center gap-1.5 py-1">
                {cellEvents.map((event) => (
                  <MonthEventDot key={event.id} event={event} static={isMobile} />
                ))}
              </div>
            )}
          </motion.div>
        </DroppableArea>
      </motion.div>
    ),
    [date, day, currentMonth, cellEvents, isMobile, messages],
  );

  if (isMobile && currentMonth) {
    return (
      <EventListDialog date={date} events={cellEvents}>
        {cellContent}
      </EventListDialog>
    );
  }

  return cellContent;
}