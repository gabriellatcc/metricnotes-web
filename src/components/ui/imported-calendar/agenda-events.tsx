import { format, parseISO } from "date-fns";
import type { FC } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useCalendar } from "@/components/ui/imported-calendar/calendar-context";
import { EventDetailsDialog } from "@/components/ui/imported-calendar/event-details-dialog";
import {
  formatTime,
  getBgColor,
  getColorClass,
  getEventsForMonth,
  getFirstLetters,
} from "@/components/ui/imported-calendar/helpers";
import type { IEvent } from "@/components/ui/imported-calendar/interfaces";
import { EventBullet } from "@/components/ui/imported-calendar/event-bullet";
import type { TEventColor } from "@/components/ui/imported-calendar/types";

export const AgendaEvents: FC = () => {
  const {
    events,
    use24HourFormat,
    badgeVariant,
    agendaModeGroupBy,
    selectedDate,
    dateLocale,
    messages,
  } = useCalendar();

  const monthEvents = getEventsForMonth(events, selectedDate);

  const agendaEvents = monthEvents.reduce<Record<string, IEvent[]>>((acc, event) => {
    const key =
      agendaModeGroupBy === "date"
        ? format(parseISO(event.startDate), "yyyy-MM-dd")
        : event.color;
    if (!acc[key]) acc[key] = [];
    acc[key].push(event);
    return acc;
  }, {});

  const groupedAndSortedEvents = Object.entries(agendaEvents).sort((a, b) => {
    if (agendaModeGroupBy === "date") {
      return new Date(a[0]).getTime() - new Date(b[0]).getTime();
    }
    return a[0].localeCompare(b[0]);
  });

  return (
    <Command className="h-[calc(100dvh-12rem)] min-h-[240px] bg-transparent py-4">
      <div className="mx-4 mb-4">
        <CommandInput placeholder={messages.commandSearchPlaceholder} />
      </div>
      <CommandList className="max-h-max border-t px-3">
        {groupedAndSortedEvents.map(([date, groupedEvents]) => (
          <CommandGroup
            key={date}
            heading={
              agendaModeGroupBy === "date"
                ? format(parseISO(date), "EEEE, d 'de' MMMM yyyy", { locale: dateLocale })
                : messages.eventColors[groupedEvents[0].color as TEventColor]
            }
          >
            {groupedEvents.map((event) => (
              <CommandItem
                key={event.id}
                className={cn(
                  "mb-2 cursor-pointer rounded-md border p-4 transition-all data-[selected=true]:bg-bg data-[selected=true]:text-none",
                  {
                    [getColorClass(event.color)]: badgeVariant === "colored",
                    "hover:bg-zinc-200 dark:hover:bg-gray-900": badgeVariant === "dot",
                    "hover:opacity-60": badgeVariant === "colored",
                  },
                )}
              >
                <EventDetailsDialog event={event}>
                  <div className="flex w-full items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      {badgeVariant === "dot" ? (
                        <EventBullet color={event.color} />
                      ) : (
                        <Avatar>
                          <AvatarImage src="" alt="" />
                          <AvatarFallback className={getBgColor(event.color)}>
                            {getFirstLetters(event.title)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className="flex flex-col">
                        <p
                          className={cn({
                            "font-medium": badgeVariant === "dot",
                            "text-foreground": badgeVariant === "dot",
                          })}
                        >
                          {event.title}
                        </p>
                        <p className="text-muted-foreground line-clamp-1 w-1/3 text-ellipsis text-sm md:text-clip">
                          {event.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex w-40 items-center justify-center gap-1">
                      {agendaModeGroupBy === "date" ? (
                        <>
                          <p className="text-sm">
                            {formatTime(event.startDate, use24HourFormat, dateLocale)}
                          </p>
                          <span className="text-muted-foreground">-</span>
                          <p className="text-sm">
                            {formatTime(event.endDate, use24HourFormat, dateLocale)}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm">
                            {format(parseISO(event.startDate), "d/MM/yyyy", { locale: dateLocale })}
                          </p>
                          <span className="text-sm">{messages.atTime}</span>
                          <p className="text-sm">
                            {formatTime(event.startDate, use24HourFormat, dateLocale)}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </EventDetailsDialog>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
        <CommandEmpty>{messages.noResults}</CommandEmpty>
      </CommandList>
    </Command>
  );
};
