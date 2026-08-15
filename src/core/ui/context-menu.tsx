"use client";

import * as React from "react";
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import { Check, ChevronLeft, ChevronRight, Circle } from "lucide-react";

import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { floatingScrollClasses, floatingSurfaceClasses } from "@core/ui/popover";

const ContextMenu = ContextMenuPrimitive.Root;

const ContextMenuTrigger = ContextMenuPrimitive.Trigger;

const ContextMenuGroup = ContextMenuPrimitive.Group;

const ContextMenuPortal = ContextMenuPrimitive.Portal;

const ContextMenuSub = ContextMenuPrimitive.Sub;

const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup;

// The menu row, identical to dropdown-menu's by intent: a right-click menu and
// a button menu are the same list reached two ways, and a user who learns one
// should not have to re-learn the other. The row used to differ here in two
// small ways that both showed — no `gap`/icon sizing (so a leading icon sat
// flush against its label at whatever size it happened to be) and no motion
// tokens on the tint crossfade.
//
// highlighted = tint · selected = inline-start accent bar · disabled =
// dedicated dimmed ink (never opacity math on a tinted panel).
const menuItemClasses =
  "group relative flex min-h-8 cursor-default select-none items-center gap-2 rounded-nx-sm px-2 py-1.5 text-sm text-nx-ink outline-none transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none focus:bg-nx-hover focus:text-nx-ink data-[disabled]:pointer-events-none data-[disabled]:text-nx-ink-3 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0";

/** Ink at rest, status wash once highlighted — a permanently red row shouts
 *  before the pointer has gone anywhere near it. */
const menuItemDestructiveClasses =
  "text-nx-danger focus:bg-destructive/10 focus:text-nx-danger data-[disabled]:text-nx-ink-3";

const menuIndicatorItemClasses = "pe-2 ps-8";

const menuSelectionBarClasses =
  "before:absolute before:inset-y-1 before:start-0 before:w-0.5 before:rounded-full before:bg-transparent before:transition-colors before:duration-nx-micro motion-reduce:before:transition-none data-[state=checked]:before:bg-nx-accent";

/** A menu is a dropdown on the semantic ladder; the old hardcoded z-index
 *  predated it, so a menu opened inside a modal (z-modal) rendered behind it.
 *  The available-height cap replaces an `overflow-hidden` that clipped long
 *  menus out of reach instead of letting them scroll. */
const menuPanelClasses =
  "z-dropdown min-w-[8rem] max-h-[var(--radix-context-menu-content-available-height)] rounded-nx-md p-1";

/** 140ms fade + 0.98 scale from the pointer origin; reduced motion keeps the
 *  crossfade and drops the scale. */
const menuMotionClasses =
  "origin-[--radix-context-menu-content-transform-origin] duration-nx-micro ease-nx-enter data-[state=open]:animate-in data-[state=open]:fade-in-0 motion-safe:data-[state=open]:zoom-in-[0.98] data-[state=closed]:animate-out data-[state=closed]:ease-nx-exit data-[state=closed]:fade-out-0 motion-safe:data-[state=closed]:zoom-out-[0.98]";

const ContextMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => {
  // Same as dropdown-menu (the RTL reference): the submenu chevron points
  // toward the reading direction, so it flips in RTL.
  const { direction } = useI18n();
  const isRtl = direction === "rtl";
  const ChevronIcon = isRtl ? ChevronLeft : ChevronRight;

  return (
    <ContextMenuPrimitive.SubTrigger
      ref={ref}
      className={cn(
        menuItemClasses,
        "data-[state=open]:bg-nx-hover data-[state=open]:text-nx-ink",
        inset && "ps-8",
        className
      )}
      {...props}
    >
      {children}
      <ChevronIcon className="ms-auto text-nx-ink-3" aria-hidden="true" />
    </ContextMenuPrimitive.SubTrigger>
  );
});
ContextMenuSubTrigger.displayName = ContextMenuPrimitive.SubTrigger.displayName;

const ContextMenuSubContent = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.SubContent
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
ContextMenuSubContent.displayName = ContextMenuPrimitive.SubContent.displayName;

const ContextMenuContent = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Content>
>(({ className, collisionPadding = 8, ...props }, ref) => (
  <ContextMenuPrimitive.Portal>
    <ContextMenuPrimitive.Content
      ref={ref}
      // A context menu opens wherever the pointer is, including 4px from the
      // viewport edge — the clearance matters more here than anywhere else.
      collisionPadding={collisionPadding}
      // The old unconditional `animate-in fade-in-80` also re-ran the enter
      // animation redundantly next to the data-[state=open] one — gone.
      className={cn(
        menuPanelClasses,
        floatingSurfaceClasses,
        floatingScrollClasses,
        menuMotionClasses,
        className
      )}
      {...props}
    />
  </ContextMenuPrimitive.Portal>
));
ContextMenuContent.displayName = ContextMenuPrimitive.Content.displayName;

const ContextMenuItem = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item> & {
    inset?: boolean;
    /** "destructive" marks a row that removes or revokes something. */
    variant?: "default" | "destructive";
  }
>(({ className, inset, variant = "default", ...props }, ref) => (
  <ContextMenuPrimitive.Item
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
ContextMenuItem.displayName = ContextMenuPrimitive.Item.displayName;

const ContextMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <ContextMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(menuItemClasses, menuIndicatorItemClasses, menuSelectionBarClasses, className)}
    checked={checked}
    {...props}
  >
    <span className="absolute start-2 flex h-3.5 w-3.5 items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4 text-nx-accent" aria-hidden="true" />
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.CheckboxItem>
));
ContextMenuCheckboxItem.displayName = ContextMenuPrimitive.CheckboxItem.displayName;

const ContextMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <ContextMenuPrimitive.RadioItem
    ref={ref}
    className={cn(menuItemClasses, menuIndicatorItemClasses, menuSelectionBarClasses, className)}
    {...props}
  >
    <span className="absolute start-2 flex h-3.5 w-3.5 items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current text-nx-accent" aria-hidden="true" />
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.RadioItem>
));
ContextMenuRadioItem.displayName = ContextMenuPrimitive.RadioItem.displayName;

const ContextMenuLabel = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <ContextMenuPrimitive.Label
    ref={ref}
    // A quiet section label that names the group below it — not a heading that
    // outweighs the commands it introduces.
    className={cn("px-2 pb-1 pt-2 text-xs font-medium text-nx-ink-3", inset && "ps-8", className)}
    {...props}
  />
));
ContextMenuLabel.displayName = ContextMenuPrimitive.Label.displayName;

const ContextMenuSeparator = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-nx-line", className)}
    {...props}
  />
));
ContextMenuSeparator.displayName = ContextMenuPrimitive.Separator.displayName;

const ContextMenuShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span className={cn("ms-auto ps-4 text-xs tabular-nums text-nx-ink-3", className)} {...props} />
  );
};
ContextMenuShortcut.displayName = "ContextMenuShortcut";

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
};
