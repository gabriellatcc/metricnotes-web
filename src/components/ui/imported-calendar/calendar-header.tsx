"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  slideFromLeft,
  slideFromRight,
  transition,
} from "@/components/ui/imported-calendar/animations";
import { useCalendar } from "@/components/ui/imported-calendar/calendar-context";
import { AddEditEventDialog } from "@/components/ui/imported-calendar/add-edit-event-dialog";
import { DateNavigator } from "@/components/ui/imported-calendar/date-navigator";
import { TodayButton } from "@/components/ui/imported-calendar/today-button";
import { UserSelect } from "@/components/ui/imported-calendar/user-select";
import Views from "./view-tabs";

export function CalendarHeader() {
  const { view, events, integrationsMode, messages } = useCalendar();

  return (
    <div className="bg-card flex shrink-0 flex-col gap-3 border-b p-3 lg:flex-row lg:items-center lg:justify-between">
      <motion.div
        className="flex items-center gap-3"
        variants={slideFromLeft}
        initial="initial"
        animate="animate"
        transition={transition}
      >
        <DateNavigator view={view} events={events} />
      </motion.div>

      <motion.div
        className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-1.5"
        variants={slideFromRight}
        initial="initial"
        animate="animate"
        transition={transition}
      >
        <div className="options flex-wrap flex items-center gap-4 md:gap-2">
          <Views />
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-1.5">
          {integrationsMode !== "tasks" ? (
            <>
              <UserSelect />

              <AddEditEventDialog>
                <Button>
                  <Plus className="h-4 w-4" />
                  {messages.addEvent}
                </Button>
              </AddEditEventDialog>
            </>
          ) : (
            <p className="text-muted-foreground max-w-[16rem] text-xs leading-snug lg:text-right">
              {messages.tasksModeHint}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
