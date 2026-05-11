"use client";

import { format, parseISO } from "date-fns";
import { Calendar, Clock, Text, User } from "lucide-react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCalendar } from "@/components/ui/imported-calendar/calendar-context";
import { AddEditEventDialog } from "@/components/ui/imported-calendar/add-edit-event-dialog";
import { formatTime } from "@/components/ui/imported-calendar/helpers";
import type { IEvent } from "@/components/ui/imported-calendar/interfaces";
import { cn } from "@/lib/utils";

interface IProps {
  event: IEvent;
  children: ReactNode;
}

export function EventDetailsDialog({ event, children }: IProps) {
  const startDate = parseISO(event.startDate);
  const endDate = parseISO(event.endDate);
  const { use24HourFormat, removeEvent, integrationsMode, dateLocale, messages } = useCalendar();

  const deleteEvent = (eventId: string) => {
    try {
      removeEvent(eventId);
      toast.success(messages.eventDeleted);
    } catch {
      toast.error(messages.eventDeleteError);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{event.title}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[80vh]">
          <div className="space-y-4 p-4">
            <div className="flex items-start gap-2">
              <User className="mt-1 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{messages.responsible}</p>
                <p className="text-sm text-muted-foreground">
                  {event.user.name}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Calendar className="mt-1 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{messages.startDate}</p>
                <p className="text-sm text-muted-foreground">
                  {format(startDate, "EEEE, d 'de' MMMM", { locale: dateLocale })}
                  <span className="mx-1">{messages.atTime}</span>
                  {formatTime(parseISO(event.startDate), use24HourFormat, dateLocale)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Clock className="mt-1 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{messages.endDate}</p>
                <p className="text-sm text-muted-foreground">
                  {format(endDate, "EEEE, d 'de' MMMM", { locale: dateLocale })}
                  <span className="mx-1">{messages.atTime}</span>
                  {formatTime(parseISO(event.endDate), use24HourFormat, dateLocale)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Text className="mt-1 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{messages.description}</p>
                <p className="text-sm text-muted-foreground">
                  {event.description}
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>
        <div className="flex flex-wrap justify-end gap-2">
          {integrationsMode === "tasks" ? (
            <Link
              to="/tasks"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              {messages.goToBoard}
            </Link>
          ) : (
            <>
              <AddEditEventDialog event={event}>
                <Button variant="outline">{messages.editEvent}</Button>
              </AddEditEventDialog>
              <Button
                variant="outline"
                className="border-destructive/50 text-destructive hover:bg-destructive/10"
                onClick={() => {
                  deleteEvent(event.id);
                }}
              >
                {messages.deleteEvent}
              </Button>
            </>
          )}
        </div>
        <DialogClose />
      </DialogContent>
    </Dialog>
  );
}
