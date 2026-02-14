"use client";

import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { useSettings } from "@core/providers/settings-provider";
import { cn } from "@core/common/utils";

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => {
  const settings = useSettings();

  const getSeparatorClasses = () => {
    const baseClasses = "shrink-0 bg-border";

    if (orientation === "horizontal") {
      return cn(
        baseClasses,
        "h-[1px] w-full",
        settings.spacingSize === "compact"
          ? "my-2"
          : settings.spacingSize === "comfortable"
            ? "my-6"
            : settings.spacingSize === "spacious"
              ? "my-8"
              : "my-4"
      );
    }

    return cn(
      baseClasses,
      "h-full w-[1px]",
      settings.spacingSize === "compact"
        ? "mx-2"
        : settings.spacingSize === "comfortable"
          ? "mx-6"
          : settings.spacingSize === "spacious"
            ? "mx-8"
            : "mx-4"
    );
  };

  return (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(getSeparatorClasses(), className)}
      {...props}
    />
  );
});
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };
