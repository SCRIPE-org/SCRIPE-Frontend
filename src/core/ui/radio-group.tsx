"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Circle } from "lucide-react";

import { cn } from "@core/common/utils";
import { useSettings } from "@core/providers/settings-provider";
import {
  CONTROL_DISABLED,
  CONTROL_HIT_TARGET,
  CONTROL_SURFACE,
  resolveControlSurface,
} from "./checkbox";

// The legacy design union stays intact: Settings still stores any of these
// values and sibling files type against it. Every value that is not a
// surviving style resolves to "default" via the shared control-surface map
// in checkbox.tsx — the stored-value migration itself is Wave C's job.
export type RadioDesign =
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

interface RadioGroupProps extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> {
  design?: RadioDesign;
}

interface RadioGroupItemProps extends React.ComponentPropsWithoutRef<
  typeof RadioGroupPrimitive.Item
> {
  design?: RadioDesign;
}

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  RadioGroupProps
>(({ className, design = "default", ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("grid gap-2", className)}
      {...props}
      ref={ref}
      data-design={design}
    />
  );
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupItemProps
>(({ className, design = "default", ...props }, ref) => {
  // Read the workspace setting directly instead of the old document-level
  // root-attribute effect — the first paint is correct, no post-mount
  // design flip.
  const settings = useSettings();
  const effectiveDesign = resolveControlSurface(
    design !== "default" ? design : settings.radioStyle
  );

  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        // explicit centring so the dot sits dead centre in every engine
        "inline-flex aspect-square h-4 w-4 shrink-0 items-center justify-center rounded-full",
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
      <RadioGroupPrimitive.Indicator
        // dot-in at micro speed — transform+opacity only; the indicator
        // only mounts when checked, so animate-in needs no state variant
        className="flex h-full w-full items-center justify-center animate-in fade-in zoom-in-75 duration-nx-micro ease-nx-enter motion-reduce:animate-none"
      >
        <Circle className="h-2 w-2 fill-current text-current" aria-hidden="true" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroup, RadioGroupItem };
