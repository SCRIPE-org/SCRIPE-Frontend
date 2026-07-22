"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    // The scrim pushes the page back by taking light away, not by blurring it.
    // This previously applied backdrop-blur twice — once through Tailwind and
    // once through an inline style added to survive purging — which is the
    // single most expensive thing to put under a modal on a low-end device,
    // and an explicit ban in DESIGN.md ("no glassmorphism as default").
    //
    // The z-index is the named `overlay` step, not a template literal: Tailwind
    // scans source text, so `z-[${OVERLAY_Z_INDEX}]` was never a real class and
    // the `!z-[999]` below was a patch for a class that never existed.
    className={cn(
      "fixed inset-0 z-overlay bg-scrim data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, dir, ...props }, ref) => {
  const { direction } = useI18n();
  const isRtl = (dir || direction) === "rtl";

  // Check if this is a drawer style modal
  const isDrawer = className?.includes("right-0") && className?.includes("!translate-x-0");

  const getPositionClasses = () => {
    if (isDrawer) {
      return `fixed inset-inline-end-0 top-[50%] translate-y-[-50%] z-modal grid gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right`;
    }
    return `fixed left-[50%] top-[50%] z-modal grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg`;
  };

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        dir={dir ?? direction}
        className={cn(getPositionClasses(), className)}
        onOpenAutoFocus={(e) => {
          // Prevent auto focus to allow dropdown inputs to work
          e.preventDefault();
        }}
        onCloseAutoFocus={(e) => {
          // Prevent auto focus restoration
          e.preventDefault();
        }}
        onInteractOutside={(e) => {
          // Allow interaction with dropdown portals (Select, DatePicker, etc.)
          const target = e.target as Element;
          if (
            target.closest("[data-dropdown-portal]") ||
            target.closest("[data-searchable-select]") ||
            target.closest("[data-date-picker]") ||
            target.closest("[data-radix-popper-content-wrapper]") ||
            target.closest("[role='listbox']") ||
            target.closest("[role='option']")
          ) {
            e.preventDefault();
          }
        }}
        onPointerDownOutside={(e) => {
          // Block closing for non-left clicks (e.g., right-click)
          const orig = (e as any).detail?.originalEvent as PointerEvent | MouseEvent | undefined;
          const button = (orig && "button" in orig ? (orig as any).button : 0) as number;
          if (button !== 0) {
            e.preventDefault();
          }
          // Allow interaction with dropdown portals (Select, DatePicker, etc.)
          const target = e.target as Element;
          if (
            target.closest("[data-dropdown-portal]") ||
            target.closest("[data-searchable-select]") ||
            target.closest("[data-date-picker]") ||
            target.closest("[data-radix-popper-content-wrapper]") ||
            target.closest("[role='listbox']") ||
            target.closest("[role='option']")
          ) {
            e.preventDefault();
          }
        }}
        onFocusOutside={(e) => {
          // Allow focus to move into dropdown portals so search input can receive focus
          const target = e.target as Element;
          if (
            target.closest("[data-dropdown-portal]") ||
            target.closest("[data-searchable-select]") ||
            target.closest("[data-date-picker]") ||
            target.closest("[data-radix-popper-content-wrapper]") ||
            target.closest("[role='listbox']") ||
            target.closest("[role='option']")
          ) {
            e.preventDefault();
          }
        }}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className={cn(
            "absolute top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
            isRtl ? "left-4" : "right-4"
          )}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  const { direction } = useI18n();
  const isRtl = direction === "rtl";

  return (
    <div
      className={cn(
        "flex flex-col space-y-1.5 text-center",
        isRtl ? "sm:text-right" : "sm:text-left",
        className
      )}
      {...props}
    />
  );
};
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  const { direction } = useI18n();
  const isRtl = direction === "rtl";

  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end",
        isRtl ? "sm:space-x-2 sm:space-x-reverse" : "sm:space-x-2",
        className
      )}
      {...props}
    />
  );
};
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
