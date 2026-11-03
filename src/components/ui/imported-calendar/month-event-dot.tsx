import { EventDetailsDialog } from "@/components/ui/imported-calendar/event-details-dialog";
import type { IEvent } from "@/components/ui/imported-calendar/interfaces";
import { cn } from "@/lib/utils";

const dotColors: Record<string, string> = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    red: "bg-red-500",
    yellow: "bg-yellow-500",
    purple: "bg-purple-500",
    orange: "bg-orange-500",
    gray: "bg-gray-500",
};

interface IProps {
    event: IEvent;
    static?: boolean;
}

export function MonthEventDot({ event, static: isStatic = false }: IProps) {
    const dotClass = cn("block size-2.5 shrink-0 rounded-full", dotColors[event.color] ?? "bg-primary");

    if (isStatic) return <span className={dotClass} aria-hidden />;

    return (
        <EventDetailsDialog event={event}>
        <button
            type="button"
            title={event.title}
            aria-label={event.title}
            className={cn(
            dotClass,
            "cursor-pointer transition-transform hover:scale-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ring-offset-background",
            )}
        />
        </EventDetailsDialog>
    );
}