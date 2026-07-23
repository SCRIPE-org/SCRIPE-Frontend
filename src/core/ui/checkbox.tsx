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
export const CONTROL_SURFACE = {
  default:
    "border border-nx-line bg-nx-ground hover:border-nx-line-hi data-[state=checked]:border-nx-accent data-[state=checked]:bg-nx-accent-fill data-[state=checked]:text-nx-on-fill",
  minimal:
    "border border-nx-line bg-transparent hover:border-nx-line-hi data-[state=checked]:border-nx-accent data-[state=checked]:bg-nx-accent-fill data-[state=checked]:text-nx-on-fill",
} as const;

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
          "h-4 w-4 shrink-0 rounded-nx-sm",
          CONTROL_SURFACE[effectiveDesign],
          // colour-only transition at micro speed; motion-reduce drops it
          "transition-[border-color,background-color,box-shadow] duration-nx-micro ease-nx-enter motion-reduce:transition-none",
          "focus-visible:outline-none focus-visible:border-nx-accent focus-visible:shadow-nx-focus",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator
          // check-in at micro speed — transform+opacity only; the indicator
          // only mounts when checked, so animate-in needs no state variant
          className="flex items-center justify-center text-current animate-in fade-in zoom-in-75 duration-nx-micro ease-nx-enter motion-reduce:animate-none"
        >
          <Check className="h-3 w-3" strokeWidth={3} />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    );
  }
);

Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
