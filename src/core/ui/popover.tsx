"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, dir, ...props }, ref) => {
  const { direction } = useI18n();

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        dir={dir ?? direction}
        className={cn(
          // Popovers sit one ladder step above dropdowns (filter builders open
          // popovers from inside menus, never the reverse); the old hardcoded
          // z-index predated the ladder.
          "z-popover w-72 rounded-nx-md border border-nx-line bg-nx-popover p-4 text-nx-ink shadow-nx-popover outline-none",
          // 140ms fade + 0.98 scale from the trigger origin; reduced motion
          // keeps the crossfade and drops the scale.
          "origin-[--radix-popover-content-transform-origin] duration-nx-micro ease-nx-enter data-[state=open]:animate-in data-[state=open]:fade-in-0 motion-safe:data-[state=open]:zoom-in-[0.98] data-[state=closed]:animate-out data-[state=closed]:ease-nx-exit data-[state=closed]:fade-out-0 motion-safe:data-[state=closed]:zoom-out-[0.98]",
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
});
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent };
