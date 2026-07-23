"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@core/common/utils";

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

// ONE brand tooltip. The seven-skin switch on settings.tooltipStyle is
// collapsed: "minimal" pointed the right way (inverted ink) but paired
// bg-foreground with text-primary-foreground — white on white in dark mode —
// so the fix is text-background; "glass" wore a raw white-alpha border;
// "bubble" hardcoded its arrow to the top side, pointing the wrong way whenever
// Radix flipped the tooltip — the arrow is deleted with the skin. The Settings
// field stays in the type and its stored values all render this one style;
// the stored-value migration is Wave C's job.
const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-tooltip overflow-hidden rounded-nx-sm bg-foreground px-3 py-1.5 text-sm text-background shadow-nx-sm",
      // 120ms fade + a 2px slide away from the anchored side; reduced motion
      // keeps the crossfade and drops the slide.
      "animate-in fade-in-0 duration-[120ms] ease-nx-enter data-[state=closed]:animate-out data-[state=closed]:ease-nx-exit data-[state=closed]:fade-out-0",
      "motion-safe:data-[side=bottom]:slide-in-from-top-0.5 motion-safe:data-[side=left]:slide-in-from-right-0.5 motion-safe:data-[side=right]:slide-in-from-left-0.5 motion-safe:data-[side=top]:slide-in-from-bottom-0.5",
      className
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
