"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@core/common/utils";

// The track is a quiet groove in the surface; the fill is the accent on fill
// duty (--nx-accent-fill). Motion is a scaleX transform growing from the
// reading start — transform-origin flips with dir (no logical origin exists,
// so the rtl: variant carries it) — never a width animation, and never the
// old translateX, which slid the fill out the wrong side under RTL.
const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn("relative h-4 w-full overflow-hidden rounded-full bg-nx-raised", className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 origin-left bg-nx-accent-fill transition-transform duration-nx-standard ease-nx-enter motion-reduce:transition-none rtl:origin-right"
      style={{ transform: `scaleX(${Math.min(100, Math.max(0, value ?? 0)) / 100})` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
