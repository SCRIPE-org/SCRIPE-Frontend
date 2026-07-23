"use client";

import * as React from "react";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";

import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";

const HoverCard = HoverCardPrimitive.Root;

const HoverCardTrigger = HoverCardPrimitive.Trigger;

const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, dir, ...props }, ref) => {
  // dir injection for popover parity: the content portals to <body>, so
  // logical properties inside it need the reading direction stamped on the
  // panel itself. Consumers can still override `dir` explicitly.
  const { direction } = useI18n();

  return (
    <HoverCardPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      dir={dir ?? direction}
      className={cn(
        // A hover card is a popover on the semantic ladder; the old hardcoded
        // z-index predated it.
        "z-popover w-64 rounded-nx-md border border-nx-line bg-nx-popover p-4 text-nx-ink shadow-nx-popover outline-none",
        // 140ms fade + 0.98 scale from the trigger origin; reduced motion keeps
        // the crossfade and drops the scale.
        "origin-[--radix-hover-card-content-transform-origin] duration-nx-micro ease-nx-enter data-[state=open]:animate-in data-[state=open]:fade-in-0 motion-safe:data-[state=open]:zoom-in-[0.98] data-[state=closed]:animate-out data-[state=closed]:ease-nx-exit data-[state=closed]:fade-out-0 motion-safe:data-[state=closed]:zoom-out-[0.98]",
        className
      )}
      {...props}
    />
  );
});
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName;

export { HoverCard, HoverCardTrigger, HoverCardContent };
