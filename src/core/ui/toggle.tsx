"use client";

import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@core/common/utils";

// The on-state is the lit-edge treatment: raised fill behind a 1px accent
// border reinforced by a 1px inset accent line — not a flat bg-accent. The
// rest state keeps a transparent border so toggling on never shifts layout.
// Hover is the shared tint; focus is the --nx-focus lit-edge ring, lifted one
// semantic z step so a segmented neighbour cannot clip its halo.
//
// Two states that were previously undesigned:
//   press     a fill step, not a transform — the control sinks, nothing moves.
//   disabled  dedicated surface + ink tokens instead of a 50% veil. A disabled
//             ON toggle keeps its raised fill so the state is still readable,
//             but drops the accent: light only collects on live controls.
//             The stacked disabled:data-[state=on]: form is deliberate —
//             plain `disabled:` loses the cascade to `data-[state=on]:`.
const toggleVariants = cva(
  [
    "relative inline-flex select-none items-center justify-center gap-2 rounded-nx-control",
    "border border-transparent text-sm font-medium text-nx-ink-2",
    "transition-[color,background-color,border-color,box-shadow] duration-nx-micro ease-nx-enter motion-reduce:transition-none",
    "hover:bg-nx-hover hover:text-nx-ink",
    "focus-visible:outline-none focus-visible:shadow-nx-focus focus-visible:z-raised",
    "active:bg-nx-raised-2",
    "data-[state=on]:border-nx-accent data-[state=on]:bg-nx-raised data-[state=on]:text-nx-ink data-[state=on]:shadow-[inset_0_0_0_1px_var(--nx-accent)]",
    "data-[state=on]:active:bg-nx-raised-2",
    "disabled:pointer-events-none disabled:border-nx-line disabled:bg-nx-raised disabled:text-nx-ink-3 disabled:shadow-none",
    "disabled:data-[state=on]:border-nx-line-hi disabled:data-[state=on]:bg-nx-raised-2 disabled:data-[state=on]:text-nx-ink-2 disabled:data-[state=on]:shadow-none",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border-nx-line bg-transparent",
      },
      size: {
        // Every step clears the 32px hit-target floor, and min-w keeps an
        // icon-only toggle square instead of collapsing to its glyph.
        default: "h-10 min-w-10 px-3",
        sm: "h-9 min-w-9 px-2.5",
        lg: "h-11 min-w-11 px-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(toggleVariants({ variant, size, className }))}
    {...props}
  />
));

Toggle.displayName = TogglePrimitive.Root.displayName;

export { Toggle, toggleVariants };
