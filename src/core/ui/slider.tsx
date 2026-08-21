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
//
// `aria-valuetext` is forwarded by the SAME mechanism and for the same reason.
// Radix computes `aria-valuenow`/`aria-valuemin`/`aria-valuemax` onto the Thumb
// itself but has no notion of a human-readable value, and an `aria-valuetext`
// left on Root lands on a `<span>` with no `role="slider"` — so a screen reader
// announces the bare number ("3") where the control actually means something
// else ("3 of 5 stars", "Medium", "12 hours"). WCAG 4.1.2 wants the value
// announced as the user understands it; without this a consumer had no way to
// supply that string at all. Same backward-compatibility shape as `aria-label`:
// omit it and the Thumb gets `undefined`, exactly as before.
const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, "aria-label": ariaLabel, "aria-valuetext": ariaValueText, ...props }, ref) => (
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
        wobble, and the pointer is already on it.

        THE BORDER TOKEN IS --nx-ink-3, NOT --nx-line-hi. The knob's border is
        the entire visual boundary of a focusable control, so WCAG 1.4.11 wants
        3:1 against BOTH the fill it sits on and the surface behind it. Measured
        against the values in globals.css: --nx-line-hi is #3f4347 dark and
        #aeb4ad light, which is 1.95:1 on --nx-surface (#0d0d0e), 1.64:1 on the
        knob's own --nx-raised-2 (#1d2022), and 2.11:1 on light #ffffff — the
        knob's edge was effectively invisible on every surface it appears on.
        --nx-ink-3 (#8c918d dark, #6f756f light) measures 6.06:1 / 5.11:1 dark
        and 4.72:1 / 3.82:1 light against those same pairs. The disabled step
        below deliberately keeps the quieter --nx-line: an inert control is
        exempt from 1.4.11 and must read as inert. */}
    <SliderPrimitive.Thumb
      aria-label={ariaLabel}
      aria-valuetext={ariaValueText}
      className="block h-5 w-5 cursor-grab rounded-full border border-nx-ink-3 bg-nx-raised-2 shadow-nx-sm transition-[border-color,background-color,box-shadow] duration-nx-micro ease-nx-enter hover:border-nx-accent focus-visible:border-nx-accent focus-visible:shadow-nx-focus focus-visible:outline-none active:cursor-grabbing active:border-nx-accent active:shadow-[inset_0_0_0_1px_var(--nx-accent)] group-data-[disabled]:cursor-not-allowed group-data-[disabled]:border-nx-line group-data-[disabled]:bg-nx-raised group-data-[disabled]:shadow-none motion-reduce:transition-none"
    />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
