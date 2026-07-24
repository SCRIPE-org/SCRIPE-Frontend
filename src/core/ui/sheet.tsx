"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import {
  modalMotionClasses,
  modalSurfaceClasses,
  overlayCloseButtonClasses,
  overlayFooterClasses,
  overlayHeaderClasses,
  overlayScrimClasses,
} from "@core/ui/dialog";

const Sheet = SheetPrimitive.Root;

const SheetTrigger = SheetPrimitive.Trigger;

const SheetClose = SheetPrimitive.Close;

const SheetPortal = SheetPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    // Imported from the dialog family, not re-typed: ONE scrim system.
    className={cn(overlayScrimClasses, className)}
    {...props}
    ref={ref}
  />
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

// The panel wears the dialog family's overlay surface and motion pair verbatim
// (that is the whole point of importing them) and adds only what an edge-
// attached panel needs: a hairline on the single edge that faces the page —
// the other three sit on the viewport, where a border is invisible cost.
const sheetVariants = cva(cn("fixed z-modal", modalSurfaceClasses, modalMotionClasses), {
  variants: {
    side: {
      // Block-axis corners: the edge that faces the page rounds, the one on
      // the viewport stays square. Top/bottom are unaffected by writing
      // direction, so the physical corner utilities are exact here.
      top: "inset-x-0 top-0 rounded-b-nx-lg border-b motion-safe:data-[state=closed]:slide-out-to-top motion-safe:data-[state=open]:slide-in-from-top",
      bottom:
        "inset-x-0 bottom-0 rounded-t-nx-lg border-t motion-safe:data-[state=closed]:slide-out-to-bottom motion-safe:data-[state=open]:slide-in-from-bottom",
      left: "inset-y-0 left-0 h-full w-3/4 border-r motion-safe:data-[state=closed]:slide-out-to-left motion-safe:data-[state=open]:slide-in-from-left sm:max-w-sm",
      right:
        "inset-y-0 right-0 h-full w-3/4 border-l motion-safe:data-[state=closed]:slide-out-to-right motion-safe:data-[state=open]:slide-in-from-right sm:max-w-sm",
    },
  },
  defaultVariants: {
    side: "right",
  },
});

// "start"/"end" resolve against the live direction — tailwindcss-animate
// slides (and the physical cva keys they hang on) know nothing about writing
// modes. "left"/"right" keep working for callers that mean it physically.
type SheetSide = NonNullable<VariantProps<typeof sheetVariants>["side"]> | "start" | "end";

// The inline-axis corner radius, expressed logically. A side panel used to be
// a hard-edged slab while the Dialog's own `variant="drawer"` — the same
// object, reached through a different import — already rounded its inner edge.
// A panel on the inline-START edge rounds its END corners, and vice versa.
const INLINE_RADIUS = {
  start: "rounded-e-nx-lg",
  end: "rounded-s-nx-lg",
} as const;

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content> {
  side?: SheetSide;
}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = "right", className, children, dir, ...props }, ref) => {
  const { t, direction } = useI18n();
  const isRtl = (dir || direction) === "rtl";

  const resolvedSide: NonNullable<VariantProps<typeof sheetVariants>["side"]> =
    side === "start"
      ? isRtl
        ? "right"
        : "left"
      : side === "end"
        ? isRtl
          ? "left"
          : "right"
        : side;

  // Which logical edge the resolved physical side actually lands on.
  const inlineRadius =
    resolvedSide === "left"
      ? isRtl
        ? INLINE_RADIUS.end
        : INLINE_RADIUS.start
      : resolvedSide === "right"
        ? isRtl
          ? INLINE_RADIUS.start
          : INLINE_RADIUS.end
        : undefined;

  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        ref={ref}
        dir={dir ?? direction}
        className={cn(sheetVariants({ side: resolvedSide }), inlineRadius, className)}
        {...props}
      >
        {children}
        {/* The family's close control: a real 32px target with a hover tint and
            the lit-edge focus ring, labelled from the existing common.close
            key instead of a hardcoded English string. */}
        <SheetPrimitive.Close type="button" className={overlayCloseButtonClasses}>
          <X className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">{t("common.close")}</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  );
});
SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  // Same header rhythm as Dialog, including the inline-end inset that keeps a
  // long title clear of the close button.
  <div className={cn(overlayHeaderClasses, "gap-2", className)} {...props} />
);
SheetHeader.displayName = "SheetHeader";

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn(overlayFooterClasses, className)} {...props} />
);
SheetFooter.displayName = "SheetFooter";

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-tight tracking-tight text-nx-ink", className)}
    {...props}
  />
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn("text-sm leading-6 text-nx-ink-2", className)}
    {...props}
  />
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
