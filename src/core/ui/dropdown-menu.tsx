"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check, ChevronLeft, ChevronRight, Circle } from "lucide-react";

import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { floatingScrollClasses, floatingSurfaceClasses } from "@core/ui/popover";

const DropdownMenu = DropdownMenuPrimitive.Root;

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

const DropdownMenuGroup = DropdownMenuPrimitive.Group;

const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

const DropdownMenuSub = DropdownMenuPrimitive.Sub;

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

/* ── The menu row ────────────────────────────────────────────────────────────
 *
 * Three states, three different signals, no overlap:
 *
 *   highlighted  a hover/keyboard tint (--nx-hover). Pointer and keyboard land
 *                on the same treatment, because Radix moves real DOM focus to
 *                the row it highlights.
 *   selected     a 2px accent bar on the inline-start edge. The bar means
 *                "this is the current value" and nothing else, so it stays off
 *                plain command rows and appears only on checkbox/radio items.
 *   disabled     dedicated dimmed ink. It used to be `opacity-50`, which on a
 *                tinted panel fades the row toward the panel colour rather
 *                than toward "unavailable", and compounds with any tint the
 *                row already carries.
 *
 * min-h-8 pins the row at the 32px hit-target floor even when a consumer drops
 * the type size; the padding alone only reached 32px at exactly text-sm.
 */
const menuItemClasses =
  "group relative flex min-h-8 cursor-default select-none items-center gap-2 rounded-nx-sm px-2 py-1.5 text-sm text-nx-ink outline-none transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none focus:bg-nx-hover focus:text-nx-ink data-[disabled]:pointer-events-none data-[disabled]:text-nx-ink-3 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0";

/**
 * The destructive row. Menus mix "open", "duplicate" and "delete for everyone"
 * in one column, and every consumer that needed the last one was hand-rolling
 * its own red — so the row is a variant now. It stays ink-coloured at rest and
 * only fills with the status wash once highlighted: a permanently red row in a
 * list of six shouts before the user has gone anywhere near it.
 */
const menuItemDestructiveClasses =
  "text-nx-danger focus:bg-destructive/10 focus:text-nx-danger data-[disabled]:text-nx-ink-3";

/** Checkbox/radio geometry: the indicator column at the start, the accent bar
 *  outside it on the very edge. */
const menuIndicatorItemClasses = "pe-2 ps-8";

/** The selection lit edge. Declared at rest as transparent so it crossfades in
 *  rather than appearing instantly under a row that is already animating. */
const menuSelectionBarClasses =
  "before:absolute before:inset-y-1 before:start-0 before:w-0.5 before:rounded-full before:bg-transparent before:transition-colors before:duration-nx-micro motion-reduce:before:transition-none data-[state=checked]:before:bg-nx-accent";

/** A menu is a dropdown on the semantic ladder; the old hardcoded z-index
 *  predated it, so a menu opened inside a modal (z-modal) rendered behind it.
 *  The available-height cap is the fix for the other half of that story: a
 *  long menu used to run off the bottom of the viewport with `overflow-hidden`
 *  clipping the rest of it out of reach. */
const menuPanelClasses =
  "z-dropdown min-w-[8rem] max-h-[var(--radix-dropdown-menu-content-available-height)] rounded-nx-md p-1";

/** 140ms fade + 0.98 scale from the trigger origin; reduced motion keeps the
 *  crossfade and drops the scale. */
const menuMotionClasses =
  "origin-[--radix-dropdown-menu-content-transform-origin] duration-nx-micro ease-nx-enter data-[state=open]:animate-in data-[state=open]:fade-in-0 motion-safe:data-[state=open]:zoom-in-[0.98] data-[state=closed]:animate-out data-[state=closed]:ease-nx-exit data-[state=closed]:fade-out-0 motion-safe:data-[state=closed]:zoom-out-[0.98]";

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => {
  const { direction } = useI18n();
  const isRtl = direction === "rtl";
  const ChevronIcon = isRtl ? ChevronLeft : ChevronRight;

  return (
    <DropdownMenuPrimitive.SubTrigger
      ref={ref}
      className={cn(
        menuItemClasses,
        // An open submenu keeps its parent row lit, or the trail back up the
        // menu tree disappears the moment the pointer leaves it.
        "data-[state=open]:bg-nx-hover data-[state=open]:text-nx-ink",
        inset && "ps-8",
        className
      )}
      {...props}
    >
      {children}
      {/* The chevron is chrome, not content — one ink step down, and it points
          along the reading direction. */}
      <ChevronIcon className="ms-auto text-nx-ink-3" aria-hidden="true" />
    </DropdownMenuPrimitive.SubTrigger>
  );
});
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName;

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      menuPanelClasses,
      floatingSurfaceClasses,
      floatingScrollClasses,
      menuMotionClasses,
      className
    )}
    {...props}
  />
));
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName;

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, collisionPadding = 8, ...props }, ref) => {
  const { direction } = useI18n();

  return (
    <DropdownMenuPrimitive.Portal>
      <div dir={direction}>
        <DropdownMenuPrimitive.Content
          ref={ref}
          sideOffset={sideOffset}
          // 8px of clearance from every viewport edge — a menu flush against
          // the edge reads as clipped rather than placed.
          collisionPadding={collisionPadding}
          className={cn(
            menuPanelClasses,
            floatingSurfaceClasses,
            floatingScrollClasses,
            menuMotionClasses,
            className
          )}
          {...props}
        />
      </div>
    </DropdownMenuPrimitive.Portal>
  );
});
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean;
    /** "destructive" marks a row that removes or revokes something. */
    variant?: "default" | "destructive";
  }
>(({ className, inset, variant = "default", ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    data-variant={variant}
    className={cn(
      menuItemClasses,
      variant === "destructive" && menuItemDestructiveClasses,
      inset && "ps-8",
      className
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(menuItemClasses, menuIndicatorItemClasses, menuSelectionBarClasses, className)}
    checked={checked}
    {...props}
  >
    <span className="absolute start-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        {/* The tick is the ACTIVE mark, so it carries the accent alongside the
            edge bar rather than reading as more body ink. */}
        <Check className="h-4 w-4 text-nx-accent" aria-hidden="true" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
));
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName;

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(menuItemClasses, menuIndicatorItemClasses, menuSelectionBarClasses, className)}
    {...props}
  >
    <span className="absolute start-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current text-nx-accent" aria-hidden="true" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
));
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    // A section label, not a heading: it names the group below it and must sit
    // BELOW the rows in the reading order of weight. `text-sm font-semibold`
    // made it heavier than the commands it introduced — which is why both
    // remaining call sites in the app were already overriding it back down.
    // Sentence case, no uppercase, no tracking — same rule as the table head.
    className={cn("px-2 pb-1 pt-2 text-xs font-medium text-nx-ink-3", inset && "ps-8", className)}
    {...props}
  />
));
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    // Full-bleed across the panel's 4px inset, so groups read as bands rather
    // than as a line floating inside a row.
    className={cn("-mx-1 my-1 h-px bg-nx-line", className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

const DropdownMenuShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      // `tracking-widest` on a two-character hint (⌘K, F2) pushed the glyphs
      // apart until they stopped reading as one chord. tabular-nums keeps the
      // function-key row from jittering; ps-4 guarantees the hint never
      // collides with a long label.
      className={cn("ms-auto ps-4 text-xs tabular-nums text-nx-ink-3", className)}
      {...props}
    />
  );
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
};
