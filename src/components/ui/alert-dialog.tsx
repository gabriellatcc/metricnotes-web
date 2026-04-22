import * as React from "react";
import { AlertDialog as ADPrimitive } from "radix-ui";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const AD = ADPrimitive;

const AlertDialog = AD.Root;
const AlertDialogTrigger = AD.Trigger;
const AlertDialogPortal = AD.Portal;
const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AD.Overlay>,
  React.ComponentPropsWithoutRef<typeof AD.Overlay>
>(({ className, ...props }, ref) => (
  <AD.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/55 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
));
AlertDialogOverlay.displayName = AD.Overlay.displayName ?? "AlertDialogOverlay";

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AD.Content>,
  React.ComponentPropsWithoutRef<typeof AD.Content>
>(({ className, ...props }, ref) => (
  <AD.Portal>
    <AlertDialogOverlay />
    <AD.Content
      ref={ref}
      className={cn(
        "fixed left-1/2 top-1/2 z-50 grid w-[calc(100%-2rem)] max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-xl outline-none duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        className,
      )}
      {...props}
    />
  </AD.Portal>
));
AlertDialogContent.displayName = AD.Content.displayName ?? "AlertDialogContent";

function AlertDialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-1.5 text-left", className)} {...props} />;
}

function AlertDialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  );
}

function AlertDialogTitle({ className, ...props }: React.ComponentProps<typeof AD.Title>) {
  return <AD.Title className={cn("text-lg font-semibold leading-tight", className)} {...props} />;
}

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AD.Description>) {
  return <AD.Description className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AD.Action>,
  React.ComponentPropsWithoutRef<typeof AD.Action>
>(({ className, ...props }, ref) => (
  <AD.Action
    ref={ref}
    className={cn(buttonVariants(), className)}
    {...props}
  />
));
AlertDialogAction.displayName = AD.Action.displayName ?? "AlertDialogAction";

const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AD.Cancel>,
  React.ComponentPropsWithoutRef<typeof AD.Cancel>
>(({ className, ...props }, ref) => (
  <AD.Cancel
    ref={ref}
    className={cn(buttonVariants({ variant: "outline" }), className)}
    {...props}
  />
));
AlertDialogCancel.displayName = AD.Cancel.displayName ?? "AlertDialogCancel";

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
};
