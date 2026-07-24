"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import { cn } from "@core/common/utils";
import { useSettings } from "@core/providers/settings-provider";

// The legacy design union stays intact: Settings still stores any of these
// values and sibling files type against it. Every value that is not a
// surviving style resolves to "default" below — the stored-value migration
// itself is Wave C's job.
export type CheckboxDesign =
  | "default"
  | "modern"
  | "glass"
  | "neon"
  | "gradient"
  | "neumorphism"
  | "cyberpunk"
  | "luxury"
  | "aurora"
  | "cosmic"
  | "minimal"
  | "elegant"
  | "organic"
  | "retro"
  | "matrix"
  | "diamond"
  | "liquid"
  | "crystal"
  | "plasma"
  | "quantum"
  | "holographic"
  | "stellar"
  | "vortex"
  | "phoenix";

// The ONE control-surface map shared by Checkbox and RadioGroupItem — the
// square and round takes of the same treatment. Unchecked sits sunken on
// --nx-ground behind a hairline; checked is the accent fill behind the lit
// accent edge, glyph in --nx-on-fill. "minimal" skips the sunken surface
// and stays transparent until checked. Shape and size stay per-component.
//
// Press is physical without being bouncy: the edge lights to accent the moment
// the pointer goes down, so the control commits before the state does. No
// scale-pop — a 16px box that grows on click reads as a wobble, not as weight.
// Hover is scoped to the UNCHECKED state: a checked control already wears the
// accent edge and must not drop back to a neutral hairline under the pointer.
export const CONTROL_SURFACE = {
  default:
    "border border-nx-line bg-nx-ground data-[state=unchecked]:enabled:hover:border-nx-line-hi enabled:active:border-nx-accent data-[state=checked]:border-nx-accent data-[state=checked]:bg-nx-accent-fill data-[state=checked]:text-nx-on-fill",
  minimal:
    "border border-nx-line bg-transparent data-[state=unchecked]:enabled:hover:border-nx-line-hi enabled:active:border-nx-accent data-[state=checked]:border-nx-accent data-[state=checked]:bg-nx-accent-fill data-[state=checked]:text-nx-on-fill",
} as const;

// Inert, not faded: a checked-and-disabled control keeps its glyph but drops
// to the neutral raised step with ink-3 ink. Dedicated tokens both ways, so it
// reads the same on ground, surface and inside a table row.
export const CONTROL_DISABLED = cn(
  "disabled:cursor-not-allowed disabled:border-nx-line disabled:bg-nx-raised disabled:text-nx-ink-3 disabled:shadow-none",
  "disabled:data-[state=checked]:border-nx-line disabled:data-[state=checked]:bg-nx-raised-2 disabled:data-[state=checked]:text-nx-ink-3"
);

// 16px is the drawn box; the hit target is 32px. An invisible inset pseudo
// grows the pointer/touch area without touching layout or the visual rhythm.
export const CONTROL_HIT_TARGET =
  "relative before:absolute before:-inset-2 before:content-['']";

export type ControlSurfaceStyle = keyof typeof CONTROL_SURFACE;

// Stored settings can hold values the map no longer knows; unknowns fall
// back to default so first paint is always a styled control.
export const resolveControlSurface = (value: string | null | undefined): ControlSurfaceStyle =>
  value && value in CONTROL_SURFACE ? (value as ControlSurfaceStyle) : "default";

interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  design?: CheckboxDesign;
}

const Checkbox = React.forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(
  ({ className, design = "default", ...props }, ref) => {
    // Read the workspace setting directly instead of the old document-level
    // root-attribute effect — the first paint is correct, no post-mount
    // design flip.
    const settings = useSettings();
    const effectiveDesign = resolveControlSurface(
      design !== "default" ? design : settings.checkboxStyle
    );

    return (
      <CheckboxPrimitive.Root
        ref={ref}
        className={cn(
          // explicit centring so the glyph sits dead centre in every engine
          "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-nx-sm",
          CONTROL_HIT_TARGET,
          CONTROL_SURFACE[effectiveDesign],
          // colour-only transition at micro speed; motion-reduce drops it
          "transition-[border-color,background-color,box-shadow] duration-nx-micro ease-nx-enter motion-reduce:transition-none",
          "focus-visible:outline-none focus-visible:border-nx-accent focus-visible:shadow-nx-focus",
          CONTROL_DISABLED,
          className
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator
          // check-in at micro speed — transform+opacity only; the indicator
          // only mounts when checked, so animate-in needs no state variant
          className="flex items-center justify-center text-current animate-in fade-in zoom-in-75 duration-nx-micro ease-nx-enter motion-reduce:animate-none"
        >
          <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    );
  }
);

Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
