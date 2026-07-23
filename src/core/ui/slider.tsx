"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@core/common/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn("relative flex w-full touch-none select-none items-center", className)}
    {...props}
  >
    {/* the channel sits sunken on --nx-ground behind an inset hairline */}
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-nx-ground shadow-[inset_0_0_0_1px_var(--nx-line)]">
      {/* accent fill with a faint on-fill light along the top inner edge */}
      <SliderPrimitive.Range className="absolute h-full bg-nx-accent-fill shadow-[inset_0_1px_0_0_color-mix(in_srgb,var(--nx-on-fill)_25%,transparent)]" />
    </SliderPrimitive.Track>
    {/* raised thumb behind a strong hairline; the drag press stays at 1.05 */}
    <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border border-nx-line-hi bg-nx-raised-2 shadow-nx-sm transition-[transform,border-color,box-shadow] duration-nx-micro ease-nx-enter motion-reduce:transition-none active:scale-105 motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:border-nx-accent focus-visible:shadow-nx-focus disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
