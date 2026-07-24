"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

/* ── The floating-panel surface ──────────────────────────────────────────────
 *
 * Popover, HoverCard, DropdownMenu, ContextMenu, Menubar and Command all put
 * the same object on screen: a small panel detached from the page. They now
 * read that surface from here instead of each re-typing it, which is how the
 * six of them stayed identical by accident and would have stopped on the next
 * edit. Only the motion differs per primitive, because each Radix package
 * exposes its transform origin under a different variable name.
 *
 * Shadow is the popover step: these genuinely float, which is the entire list
 * of things allowed to cast one.
 *
 * The radius deliberately is NOT baked in here. tailwind-merge does not know
 * the custom `rounded-nx-*` scale, so it cannot resolve two of them in one
 * cn() — a shared `rounded-nx-md` plus a local `rounded-nx-sm` would emit
 * both and let stylesheet order pick the winner. Each panel states its own
 * step: md (10px) for the menus and popovers, sm for the tooltip.
 */
export const floatingSurfaceClasses =
  "border border-nx-line bg-nx-popover text-nx-ink shadow-nx-popover";

/**
 * Applied together with a max-height cap read from the Radix
 * `content-available-height` variable of whichever primitive owns the panel.
 * Without the cap a long panel simply ran off the bottom of the viewport
 * with no way to reach the rest of it; `overscroll-contain` then stops a
 * flick inside the panel from scrolling the page behind the trigger.
 */
export const floatingScrollClasses =
  "custom-scrollbar overflow-y-auto overflow-x-hidden overscroll-contain";

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, collisionPadding = 8, dir, ...props }, ref) => {
  const { direction } = useI18n();

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        // 8px of breathing room against every viewport edge. At the previous
        // default of 0 a popover opened near the edge sat flush against it,
        // which reads as clipped rather than positioned.
        collisionPadding={collisionPadding}
        dir={dir ?? direction}
        className={cn(
          // Popovers sit one ladder step above dropdowns (filter builders open
          // popovers from inside menus, never the reverse); the old hardcoded
          // z-index predated the ladder.
          "z-popover w-72 rounded-nx-md p-4 outline-none",
          floatingSurfaceClasses,
          "max-h-[var(--radix-popover-content-available-height)]",
          floatingScrollClasses,
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
