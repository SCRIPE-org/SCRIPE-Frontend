"use client";

import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@core/common/utils";
import { toggleVariants } from "@core/ui/toggle";

// Two presets. "default" is the loose row of independent toggles. "segmented"
// is the segmented control: one hairline shell that owns the radius, divider
// hairlines between the items, and the lit-edge on-state from toggleVariants
// marking the active segment. The preset travels to the items through the
// same context that already carries variant/size.
const toggleGroupVariants = cva("flex items-center justify-center", {
  variants: {
    preset: {
      default: "gap-1",
      // The [data-state] child selector strips the items' own radius with
      // class+attribute specificity — a bare rounded-none on the item would
      // tie with rounded-nx-control and lose to stylesheet order (twMerge
      // does not know the nx radius scale) — then hands the end segments a
      // logical start/end radius one step down the ladder so they nest inside
      // the shell without bleeding past its corners.
      //
      // overflow-hidden used to do that clipping, and it also amputated the
      // outer 3px of every item's focus halo: keyboard focus inside a
      // segmented control was down to a 1px inset line. The radii do the job
      // without clipping anything.
      segmented:
        "gap-0 rounded-nx-control border border-nx-line [&>[data-state]]:rounded-none [&>[data-state]:first-child]:rounded-s-nx-sm [&>[data-state]:last-child]:rounded-e-nx-sm",
    },
  },
  defaultVariants: {
    preset: "default",
  },
});

type ToggleGroupContextValue = VariantProps<typeof toggleVariants> &
  VariantProps<typeof toggleGroupVariants>;

const ToggleGroupContext = React.createContext<ToggleGroupContextValue>({
  size: "default",
  variant: "default",
  preset: "default",
});

const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> & ToggleGroupContextValue
>(({ className, variant, size, preset, children, ...props }, ref) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    className={cn(toggleGroupVariants({ preset }), className)}
    {...props}
  >
    <ToggleGroupContext.Provider value={{ variant, size, preset }}>
      {children}
    </ToggleGroupContext.Provider>
  </ToggleGroupPrimitive.Root>
));

ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName;

const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> &
    VariantProps<typeof toggleVariants>
>(({ className, children, variant, size, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext);

  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        // Inside the segmented shell (which strips the item radius — see the
        // preset above) the item draws a start-edge divider hairline, skipped
        // on the first item where the shell border already covers that edge.
        context.preset === "segmented" && "border-s border-s-nx-line first:border-s-transparent",
        className
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
});

ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;

export { ToggleGroup, ToggleGroupItem };
