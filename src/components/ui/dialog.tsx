import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const Rx = DialogPrimitive;

function Dialog({ ...props }: React.ComponentProps<typeof Rx.Root>) {
  return <Rx.Root {...props} />;
}

function DialogTrigger({ ...props }: React.ComponentProps<typeof Rx.Trigger>) {
  return <Rx.Trigger {...props} />;
}

const DialogPortal = Rx.Portal;
const DialogClose = Rx.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof Rx.Overlay>,
  React.ComponentPropsWithoutRef<typeof Rx.Overlay>
>(({ className, ...props }, ref) => (
  <Rx.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/55 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = Rx.Overlay.displayName ?? "DialogOverlay";

const DialogContent = React.forwardRef<
  React.ElementRef<typeof Rx.Content>,
  React.ComponentPropsWithoutRef<typeof Rx.Content> & {
    showClose?: boolean;
  }
>(({ className, children, showClose = true, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <Rx.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-[calc(100%-2rem)] max-w-lg max-h-[min(90vh,calc(100%-2rem))] translate-x-[-50%] translate-y-[-50%] gap-0 overflow-hidden rounded-2xl border border-border bg-card p-0 text-card-foreground shadow-xl outline-none duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        className,
      )}
      {...props}
    >
      {children}
      {showClose ? (
        <Rx.Close
          className="absolute right-3 top-3 z-10 rounded-lg p-2 text-muted-foreground opacity-80 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </Rx.Close>
      ) : null}
    </Rx.Content>
  </DialogPortal>
));
DialogContent.displayName = Rx.Content.displayName ?? "DialogContent";

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-1.5 border-b border-border/60 bg-muted/30 px-6 py-5 pr-14 text-left", className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn("flex flex-col-reverse gap-2 border-t border-border/60 bg-muted/20 px-6 py-4 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  );
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof Rx.Title>) {
  return (
    <Rx.Title
      data-slot="dialog-title"
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  );
}

function DialogDescription({ className, ...props }: React.ComponentProps<typeof Rx.Description>) {
  return (
    <Rx.Description
      data-slot="dialog-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
