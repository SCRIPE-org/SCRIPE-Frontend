"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@core/common/utils";

// The track is a quiet groove in the surface; the fill is the accent on fill
// duty (--nx-accent-fill). Motion is a scaleX transform growing from the
// reading start — transform-origin flips with dir (no logical origin exists,
// so the rtl: variant carries it) — never a width animation, and never the
// old translateX, which slid the fill out the wrong side under RTL.
//
// Two corrections this pass:
//   `max`   Radix accepts it and reports it through aria-valuemax, but the
//           indicator hardcoded /100, so <Progress value={3} max={5} /> drew
//           3% while announcing "3 of 5". The ratio now reads the same max.
//   height  h-4 was a 16px slab. Every call site in the app already overrides
//           it to h-1; a meter is a hairline reading, not a container, so the
//           default drops to h-2 and the overrides stop fighting it.
const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, max, ...props }, ref) => {
  const ceiling = typeof max === "number" && max > 0 ? max : 100;
  const ratio = Math.min(1, Math.max(0, (value ?? 0) / ceiling));

  return (
    <ProgressPrimitive.Root
      ref={ref}
      max={max}
      value={value}
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-nx-raised", className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        // No radius of its own: the track already clips to a pill, and a
        // scaleX on a rounded box stretches the corner arcs into ellipses.
        className="h-full w-full flex-1 origin-left bg-nx-accent-fill transition-transform duration-nx-standard ease-nx-enter motion-reduce:transition-none rtl:origin-right"
        style={{ transform: `scaleX(${ratio})` }}
      />
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
