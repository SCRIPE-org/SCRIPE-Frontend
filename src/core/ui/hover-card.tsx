"use client";

import * as React from "react";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";

import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { floatingScrollClasses, floatingSurfaceClasses } from "@core/ui/popover";

const HoverCard = HoverCardPrimitive.Root;

const HoverCardTrigger = HoverCardPrimitive.Trigger;

const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, collisionPadding = 8, dir, ...props }, ref) => {
  // dir injection for popover parity: the content portals to <body>, so
  // logical properties inside it need the reading direction stamped on the
  // panel itself. Consumers can still override `dir` explicitly.
  const { direction } = useI18n();

  return (
    // This was the ONE overlay in the family that never portaled. z-popover is
    // meaningless from inside a transformed or z-indexed ancestor — the card
    // would have rendered underneath whatever card it was describing — and the
    // `dir` stamped below only made sense on the assumption that it did
    // portal. Now it does.
    <HoverCardPrimitive.Portal>
      <HoverCardPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        dir={dir ?? direction}
        className={cn(
          // A hover card is a popover on the semantic ladder; the old hardcoded
          // z-index predated it.
          "z-popover w-64 rounded-nx-md p-4 outline-none",
          floatingSurfaceClasses,
          "max-h-[var(--radix-hover-card-content-available-height)]",
          floatingScrollClasses,
          // Micro-speed fade + 0.95 scale + tight 2px directional shift from the
          // trigger origin; reduced motion keeps the crossfade and drops scale/slide.
          // transition-none keeps Floating UI's post-mount transform-origin update instant.
          "origin-[var(--radix-hover-card-content-transform-origin)] transition-none duration-nx-micro ease-nx-enter data-[state=open]:duration-nx-micro data-[state=closed]:duration-nx-micro data-[state=closed]:ease-nx-exit data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 motion-safe:data-[state=open]:zoom-in-95 motion-safe:data-[state=closed]:zoom-out-95 motion-safe:data-[side=bottom]:slide-in-from-top-0.5 motion-safe:data-[side=top]:slide-in-from-bottom-0.5 motion-safe:data-[side=left]:slide-in-from-right-0.5 motion-safe:data-[side=right]:slide-in-from-left-0.5",
          className
        )}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  );
});
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName;

export { HoverCard, HoverCardTrigger, HoverCardContent };
