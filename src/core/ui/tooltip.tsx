"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { floatingSurfaceClasses } from "@core/ui/popover";

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

// ONE brand tooltip. The seven-skin switch on settings.tooltipStyle is
// collapsed: "minimal" pointed the right way (inverted ink) but paired
// bg-foreground with text-primary-foreground — white on white in dark mode;
// "glass" wore a raw white-alpha border; "bubble" hardcoded its arrow to the
// top side, pointing the wrong way whenever Radix flipped the tooltip — the
// arrow is deleted with the skin. The Settings field stays in the type and its
// stored values all render this one style; the stored-value migration is
// Wave C's job.
//
// It now wears the same floating-panel surface as the popover and the menus
// rather than the legacy `bg-foreground / text-background` inversion, which
// was the last shadcn colour pair left in the overlay family and the only
// overlay whose skin did not follow the nx tokens. Scale, not colour, keeps it
// distinguishable from a menu: 12px type, a tighter inset, the small radius
// step, and a measure cap so a long hint wraps into a readable block instead
// of a viewport-wide ribbon.
const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, collisionPadding = 8, dir, ...props }, ref) => {
  const { direction } = useI18n();

  return (
    // Portalled for the same reason as the hover card: z-tooltip is the top of
    // the ladder, but a z-index cannot climb out of an ancestor's stacking
    // context — inside a transformed card or a sticky header the tooltip was
    // pinned under its own neighbours.
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        dir={dir ?? direction}
        className={cn(
          "z-tooltip max-w-xs rounded-nx-sm px-2.5 py-1.5 text-xs leading-5",
          floatingSurfaceClasses,
          // 120ms fade + a 2px slide away from the anchored side; reduced motion
          // keeps the crossfade and drops the slide.
          "duration-nx-micro ease-nx-enter animate-in fade-in-0 data-[state=closed]:ease-nx-exit data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
          "motion-safe:data-[side=bottom]:slide-in-from-top-0.5 motion-safe:data-[side=left]:slide-in-from-right-0.5 motion-safe:data-[side=right]:slide-in-from-left-0.5 motion-safe:data-[side=top]:slide-in-from-bottom-0.5",
          className
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
});
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
