import { motion, AnimatePresence } from "motion/react";
import { memo, useMemo } from "react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { cn } from "@/lib/utils";
import { useCalendar } from "@/components/ui/imported-calendar/calendar-context";
import {
  CalendarRange,
  List,
  Columns,
  Grid3X3,
  Grid2X2,
} from "lucide-react";
import type { TCalendarView } from "@/components/ui/imported-calendar/types";

const tabValues: { value: TCalendarView; icon: typeof CalendarRange }[] = [
  { value: "agenda", icon: CalendarRange },
  { value: "day", icon: List },
  { value: "week", icon: Columns },
  { value: "month", icon: Grid3X3 },
  { value: "year", icon: Grid2X2 },
];

function Views() {
  const { view, setView, messages } = useCalendar();

  const labelFor = useMemo(
    () =>
      ({
        agenda: messages.viewAgenda,
        day: messages.viewDay,
        week: messages.viewWeek,
        month: messages.viewMonth,
        year: messages.viewYear,
      }) satisfies Record<TCalendarView, string>,
    [messages],
  );

  return (
    <Tabs
      value={view}
      onValueChange={(value) => setView(value as TCalendarView)}
      className="gap-4 sm:w-auto w-full"
    >
      <TabsList className="h-auto gap-2 rounded-xl p-1 w-full">
        {tabValues.map(({ icon: Icon, value }) => {
          const isActive = view === value;
          const name = labelFor[value];

          return (
            <motion.div
              key={value}
              layout
              className={cn(
                "flex h-8 items-center justify-center overflow-hidden rounded-md",
                isActive ? "flex-1" : "flex-none",
              )}
              onClick={() => setView(value as TCalendarView)}
              initial={false}
              animate={{
                width: isActive ? 120 : 32,
              }}
              transition={{
                type: "tween",
                stiffness: 400,
                damping: 25,
              }}
            >
              <TabsTrigger value={value} asChild>
                <motion.div
                  className="flex h-8 w-full items-center justify-center cursor-pointer"
                  animate={{ filter: "blur(0px)" }}
                  exit={{ filter: "blur(2px)" }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <Icon className="h-4 w-4" />
                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.span
                        className="font-medium"
                        initial={{ opacity: 0, scaleX: 0.8 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        style={{ originX: 0 }}
                      >
                        {name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </TabsTrigger>
            </motion.div>
          );
        })}
      </TabsList>
    </Tabs>
  );
}

export default memo(Views);
