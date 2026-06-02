import { cva } from "class-variance-authority";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { transition } from "@/components/ui/imported-calendar/animations";
import type { TEventColor } from "@/components/ui/imported-calendar/types";

const eventBulletVariants = cva("size-2 rounded-full", {
  variants: {
    color: {
      blue: "bg-(--primary) dark:bg-(--primary)00",
      green: "bg-green-600 dark:bg-green-500",
      red: "bg-red-600 dark:bg-red-500",
      yellow: "bg-yellow-600 dark:bg-yellow-500",
      purple: "bg-purple-600 dark:bg-purple-500",
      orange: "bg-orange-600 dark:bg-orange-500",
      gray: "bg-gray-600 dark:bg-gray-500",
    },
  },
  defaultVariants: {
    color: "blue",
  },
});

function isCustomColor(color: string): boolean {
  return color.startsWith("#") || color.startsWith("rgb");
}

export function EventBullet({
  color,
  className,
}: {
  color: TEventColor | string;
  className?: string;
}) {
  const custom = typeof color === "string" && isCustomColor(color);

  return (
    <motion.div
      className={cn(
        custom ? "size-2 rounded-full shrink-0" : eventBulletVariants({ color: color as TEventColor, className }),
        custom && className,
      )}
      style={custom ? { backgroundColor: color } : undefined}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.2 }}
      transition={transition}
    />
  );
}
