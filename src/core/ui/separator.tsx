"use client";

import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { useSettings } from "@core/providers/settings-provider";
import { cn } from "@core/common/utils";

// The separator is the quietest line in the system: the hairline token, never
// the shadcn border colour, and never more than one device-pixel.
//
// Its margins are part of the vertical rhythm, not decoration — a rule with no
// air around it reads as a border, not a break — so they stay baked in and
// track the spacing setting. The mapping used to be a four-deep nested ternary
// written twice, once per orientation; it is one table now, and both axes read
// the same row, so compact can never drift from compact.
const SEPARATOR_RHYTHM = {
  compact: { horizontal: "my-2", vertical: "mx-2" },
  comfortable: { horizontal: "my-6", vertical: "mx-6" },
  spacious: { horizontal: "my-8", vertical: "mx-8" },
  default: { horizontal: "my-4", vertical: "mx-4" },
} as const;

type SeparatorAxis = keyof (typeof SEPARATOR_RHYTHM)["default"];

const resolveRhythm = (spacing: string | undefined | null, axis: SeparatorAxis): string =>
  (SEPARATOR_RHYTHM[spacing as keyof typeof SEPARATOR_RHYTHM] ?? SEPARATOR_RHYTHM.default)[axis];

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => {
  const settings = useSettings();
  const axis: SeparatorAxis = orientation === "vertical" ? "vertical" : "horizontal";

  return (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-nx-line",
        axis === "horizontal" ? "h-px w-full" : "h-full w-px",
        resolveRhythm(settings.spacingSize, axis),
        className
      )}
      {...props}
    />
  );
});
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };
