import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { buttonHover, transition } from "@/components/ui/imported-calendar/animations";
import { useCalendar } from "@/components/ui/imported-calendar/calendar-context";

const MotionButton = motion.create(Button);

export function TodayButton() {
  const { setSelectedDate, messages } = useCalendar();
  const today = new Date();

  return (
    <MotionButton
      variant="outline"
      size="sm"
      className="shrink-0"
      onClick={() => setSelectedDate(today)}
      variants={buttonHover}
      whileHover="hover"
      whileTap="tap"
      transition={transition}
    >
      {messages.today}
    </MotionButton>
  );
}
