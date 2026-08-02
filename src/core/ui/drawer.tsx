"use client";

import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";

import { cn } from "@core/common/utils";
import { overlayHeaderClasses, overlayScrimSurfaceClasses } from "@core/ui/dialog";

const Drawer = ({
  shouldScaleBackground = true,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) => (
  <DrawerPrimitive.Root shouldScaleBackground={shouldScaleBackground} {...props} />
);
Drawer.displayName = "Drawer";

const DrawerTrigger = DrawerPrimitive.Trigger;

const DrawerPortal = DrawerPrimitive.Portal;

const DrawerClose = DrawerPrimitive.Close;

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    // The family scrim surface, minus its enter/exit keyframes: vaul drives
    // this fade itself so it can track the drag, and a token duration fighting
    // a finger-following opacity is exactly the kind of motion that reads
    // broken. The wash and the named overlay step of the z ladder are the same
    // system as every other modal in the product.
    className={cn(overlayScrimSurfaceClasses, className)}
    {...props}
  />
));
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName;

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay />
    <DrawerPrimitive.Content
      ref={ref}
      // The dialog family surface. Two corrections against the old recipe:
      // the shadow step was missing entirely (a drawer genuinely floats — it
      // is the one place a shadow is earned), and the hairline ran around all
      // four edges when three of them sit off-screen; only the top edge faces
      // the page. Motion stays vaul's: it follows the finger, which no token
      // duration should fight.
      className={cn(
        "fixed inset-x-0 bottom-0 z-modal mt-24 flex h-auto flex-col rounded-t-nx-lg border-t border-nx-line bg-nx-popover text-nx-ink shadow-nx-modal",
        className
      )}
      {...props}
    >
      {/* The grab handle. Was a 100x8 slab that read as a UI element in its
          own right; a handle is a hint about where to put your thumb, so it
          shrinks to the standard 48x6 pill on the strong hairline and is
          hidden from the accessibility tree — it is decoration for pointers,
          and keyboard users close the drawer with Escape. */}
      <div aria-hidden="true" className="mx-auto mt-4 h-1.5 w-12 rounded-full bg-nx-line-hi" />
      {children}
    </DrawerPrimitive.Content>
  </DrawerPortal>
));
DrawerContent.displayName = "DrawerContent";

const DrawerHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  // The family header rhythm, with the drawer's own inset. No inline-end
  // reserve: a drawer has no corner close button, the handle is the affordance.
  <div className={cn(overlayHeaderClasses, "gap-1.5 p-4", className)} {...props} />
);
DrawerHeader.displayName = "DrawerHeader";

const DrawerFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  // Same action ORDER as every other overlay footer (cancel first in DOM,
  // primary last, so the primary lands nearest the thumb) — it just never
  // widens into a row at sm, because a bottom drawer is a thumb-reach surface
  // and full-width stacked targets are correct there at every width.
  <div className={cn("mt-auto flex flex-col-reverse gap-2 p-4", className)} {...props} />
);
DrawerFooter.displayName = "DrawerFooter";

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-tight tracking-tight text-nx-ink", className)}
    {...props}
  />
));
DrawerTitle.displayName = DrawerPrimitive.Title.displayName;

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description
    ref={ref}
    className={cn("text-sm leading-6 text-nx-ink-2", className)}
    {...props}
  />
));
DrawerDescription.displayName = DrawerPrimitive.Description.displayName;

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
