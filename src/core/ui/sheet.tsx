"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";

const Sheet = SheetPrimitive.Root;

const SheetTrigger = SheetPrimitive.Trigger;

const SheetClose = SheetPrimitive.Close;

const SheetPortal = SheetPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    // Mirrors DialogOverlay exactly: ONE scrim system (the token, not a
    // hand-mixed black wash) and the named overlay step of the z ladder, not
    // a stack number picked without seeing the other layers.
    className={cn(
      "fixed inset-0 z-overlay bg-scrim duration-nx-standard ease-nx-enter data-[state=closed]:duration-nx-micro data-[state=closed]:ease-nx-exit data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

// The panel wears the dialog family's overlay surface (nx popover surface,
// modal shadow, z-modal) with a hairline only on the edge that faces the
// page — the other three sit on the viewport. The old 500ms open is clamped
// to the 200ms standard step and exits at the ~2/3 micro step; the slides are
// motion-safe so reduced motion keeps only the crossfade.
const sheetVariants = cva(
  "fixed z-modal gap-4 border-nx-line bg-nx-popover p-6 text-nx-ink shadow-nx-modal duration-nx-standard ease-nx-enter data-[state=closed]:duration-nx-micro data-[state=closed]:ease-nx-exit data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b motion-safe:data-[state=closed]:slide-out-to-top motion-safe:data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t motion-safe:data-[state=closed]:slide-out-to-bottom motion-safe:data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r motion-safe:data-[state=closed]:slide-out-to-left motion-safe:data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4 border-l motion-safe:data-[state=closed]:slide-out-to-right motion-safe:data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
);

// "start"/"end" resolve against the live direction — tailwindcss-animate
// slides (and the physical cva keys they hang on) know nothing about writing
// modes. "left"/"right" keep working for callers that mean it physically.
type SheetSide = NonNullable<VariantProps<typeof sheetVariants>["side"]> | "start" | "end";

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content> {
  side?: SheetSide;
}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = "right", className, children, dir, ...props }, ref) => {
  const { direction } = useI18n();
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

  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        ref={ref}
        dir={dir ?? direction}
        className={cn(sheetVariants({ side: resolvedSide }), className)}
        {...props}
      >
        {children}
        {/* end-4 replaces the old isRtl left/right ternary; focus is the nx
            lit-edge treatment on :focus-visible, not an offset ring halo. */}
        <SheetPrimitive.Close className="absolute end-4 top-4 rounded-nx-sm opacity-70 transition-opacity duration-nx-micro hover:opacity-100 focus-visible:outline-none focus-visible:shadow-nx-focus disabled:pointer-events-none data-[state=open]:bg-nx-hover data-[state=open]:text-nx-ink-2">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  );
});
SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  // text-start is direction-aware by itself — the old isRtl ternary re-derived
  // what the logical property already knows.
  <div className={cn("flex flex-col space-y-2 text-center sm:text-start", className)} {...props} />
);
SheetHeader.displayName = "SheetHeader";

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  // gap works in both axes and both directions — no space-x-reverse bookkeeping.
  <div
    className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
    {...props}
  />
);
SheetFooter.displayName = "SheetFooter";

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold text-nx-ink", className)}
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
    className={cn("text-sm text-nx-ink-2", className)}
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
