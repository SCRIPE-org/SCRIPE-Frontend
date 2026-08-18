"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@core/common/utils";

// A groove, a fill and a knob — nothing else. The py-2 padding is the hit
// target: the drawn track is 8px, the grabbable band is 32px, so a drag never
// depends on hitting a hairline. Disabled reads through the group-data hook
// (Radix stamps data-disabled on the root) with dedicated tokens on every
// part, never a 50% wash over the whole control.
//
// ACCESSIBLE NAME (Wave 3.2 Batch 3 fix): Radix's own `SliderThumb` computes
// its accessible name from ITS OWN `aria-label` prop (falling back to a
// generic, unhelpful "Value" label if none is given) -- NOT from an `id`
// passed to `Slider`/`SliderPrimitive.Root`, which lands on the ROOT `<span>`
// instead (verified directly against @radix-ui/react-slider's source: `id`
// flows into Root's own `...sliderProps` spread, never down to Thumb). A
// sibling `<Label htmlFor={id}>` therefore never gives the Thumb a real
// accessible name, the same class of gap `generic-select.tsx`'s own
// `aria-label` prop fixes for `role="combobox"`. Before this fix NO consumer
// of this shared component could give its Thumb a real per-instance name --
// this destructures the standard `aria-label` prop off `props` and forwards
// it explicitly onto `Thumb`, closing the gap for every consumer at once, not
// just the one that surfaced it (CustomFields' Rating control). Backward
// compatible: a consumer that passes no `aria-label` gets `undefined` on the
// Thumb, identical to today's behavior.
const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, "aria-label": ariaLabel, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "group relative flex w-full touch-none select-none items-center py-2",
      "data-[disabled]:pointer-events-none",
      className
    )}
    {...props}
  >
    {/* the channel sits sunken on --nx-ground behind an inset hairline; when
        the control goes inert the channel flattens onto the raised step */}
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-nx-ground shadow-[inset_0_0_0_1px_var(--nx-line)] group-data-[disabled]:bg-nx-raised">
      {/* accent fill with a faint on-fill light along the top inner edge —
          inert it drops to a neutral hairline fill, never a dimmed accent */}
      <SliderPrimitive.Range className="absolute h-full bg-nx-accent-fill shadow-[inset_0_1px_0_0_color-mix(in_srgb,var(--nx-on-fill)_25%,transparent)] group-data-[disabled]:bg-nx-line-hi group-data-[disabled]:shadow-none" />
    </SliderPrimitive.Track>
    {/* Raised thumb behind a strong hairline. Press lights the EDGE instead of
        scaling the knob — a 20px circle that grows under the finger reads as a
        wobble, and the pointer is already on it. */}
    <SliderPrimitive.Thumb
      aria-label={ariaLabel}
      className="block h-5 w-5 cursor-grab rounded-full border border-nx-line-hi bg-nx-raised-2 shadow-nx-sm transition-[border-color,background-color,box-shadow] duration-nx-micro ease-nx-enter hover:border-nx-accent focus-visible:border-nx-accent focus-visible:shadow-nx-focus focus-visible:outline-none active:cursor-grabbing active:border-nx-accent active:shadow-[inset_0_0_0_1px_var(--nx-accent)] group-data-[disabled]:cursor-not-allowed group-data-[disabled]:border-nx-line group-data-[disabled]:bg-nx-raised group-data-[disabled]:shadow-none motion-reduce:transition-none"
    />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
