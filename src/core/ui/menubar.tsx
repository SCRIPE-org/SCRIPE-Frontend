"use client";

import * as React from "react";
import * as MenubarPrimitive from "@radix-ui/react-menubar";
import { Check, ChevronLeft, ChevronRight, Circle } from "lucide-react";

import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { floatingScrollClasses, floatingSurfaceClasses } from "@core/ui/popover";

const MenubarMenu = MenubarPrimitive.Menu;

const MenubarGroup = MenubarPrimitive.Group;

const MenubarPortal = MenubarPrimitive.Portal;

const MenubarSub = MenubarPrimitive.Sub;

const MenubarRadioGroup = MenubarPrimitive.RadioGroup;

// One menu row for the whole product — the same recipe dropdown-menu and
// context-menu use. highlighted = tint · selected = inline-start accent bar ·
// disabled = dedicated dimmed ink (never opacity math on a tinted panel).
const menuItemClasses =
  "group relative flex min-h-8 cursor-default select-none items-center gap-2 rounded-nx-sm px-2 py-1.5 text-sm text-nx-ink outline-none transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none focus:bg-nx-hover focus:text-nx-ink data-[disabled]:pointer-events-none data-[disabled]:text-nx-ink-3 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0";

/** Ink at rest, status wash once highlighted. */
const menuItemDestructiveClasses =
  "text-nx-danger focus:bg-destructive/10 focus:text-nx-danger data-[disabled]:text-nx-ink-3";

const menuIndicatorItemClasses = "pe-2 ps-8";

const menuSelectionBarClasses =
  "before:absolute before:inset-y-1 before:start-0 before:w-0.5 before:rounded-full before:bg-transparent before:transition-colors before:duration-nx-micro motion-reduce:before:transition-none data-[state=checked]:before:bg-nx-accent";

/** A menu is a dropdown on the semantic ladder; the old hardcoded z-index
 *  predated it. The available-height cap replaces an `overflow-hidden` that
 *  clipped long menus out of reach instead of letting them scroll. */
const menuPanelClasses =
  "z-dropdown min-w-[12rem] max-h-[var(--radix-menubar-content-available-height)] rounded-nx-md p-1";

/** 140ms fade + 0.98 scale from the trigger origin; reduced motion keeps the
 *  crossfade and drops the scale. */
const menuMotionClasses =
  "origin-[--radix-menubar-content-transform-origin] duration-nx-micro ease-nx-enter data-[state=open]:animate-in data-[state=open]:fade-in-0 motion-safe:data-[state=open]:zoom-in-[0.98] data-[state=closed]:animate-out data-[state=closed]:ease-nx-exit data-[state=closed]:fade-out-0 motion-safe:data-[state=closed]:zoom-out-[0.98]";

const Menubar = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Root
    ref={ref}
    className={cn(
      // gap-1 instead of the old inter-item margin utility: that one was a
      // physical margin and reversed wrongly in RTL. The bar is chrome, so it
      // sits on the plain surface step behind a hairline — no shadow: it is
      // anchored to the page, not floating above it.
      "flex h-10 items-center gap-1 rounded-nx-control border border-nx-line bg-nx-surface p-1",
      className
    )}
    {...props}
  />
));
Menubar.displayName = MenubarPrimitive.Root.displayName;

const MenubarTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-8 cursor-default select-none items-center rounded-nx-sm px-3 text-sm font-medium text-nx-ink-2 outline-none transition-colors duration-nx-micro ease-nx-enter hover:text-nx-ink focus:bg-nx-hover focus:text-nx-ink focus-visible:shadow-nx-focus data-[state=open]:bg-nx-hover data-[state=open]:text-nx-ink motion-reduce:transition-none",
      className
    )}
    {...props}
  />
));
MenubarTrigger.displayName = MenubarPrimitive.Trigger.displayName;

const MenubarSubTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => {
  // Same as dropdown-menu (the RTL reference): the submenu chevron points
  // toward the reading direction, so it flips in RTL.
  const { direction } = useI18n();
  const isRtl = direction === "rtl";
  const ChevronIcon = isRtl ? ChevronLeft : ChevronRight;

  return (
    <MenubarPrimitive.SubTrigger
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
    </MenubarPrimitive.SubTrigger>
  );
});
MenubarSubTrigger.displayName = MenubarPrimitive.SubTrigger.displayName;

const MenubarSubContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.SubContent
    ref={ref}
    className={cn(
      menuPanelClasses,
      "min-w-[8rem]",
      floatingSurfaceClasses,
      floatingScrollClasses,
      menuMotionClasses,
      className
    )}
    {...props}
  />
));
MenubarSubContent.displayName = MenubarPrimitive.SubContent.displayName;

const MenubarContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Content>
>(
  (
    {
      className,
      align = "start",
      alignOffset = -4,
      sideOffset = 8,
      collisionPadding = 8,
      ...props
    },
    ref
  ) => (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.Content
        ref={ref}
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
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
    </MenubarPrimitive.Portal>
  )
);
MenubarContent.displayName = MenubarPrimitive.Content.displayName;

const MenubarItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Item> & {
    inset?: boolean;
    /** "destructive" marks a row that removes or revokes something. */
    variant?: "default" | "destructive";
  }
>(({ className, inset, variant = "default", ...props }, ref) => (
  <MenubarPrimitive.Item
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
MenubarItem.displayName = MenubarPrimitive.Item.displayName;

const MenubarCheckboxItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <MenubarPrimitive.CheckboxItem
    ref={ref}
    className={cn(menuItemClasses, menuIndicatorItemClasses, menuSelectionBarClasses, className)}
    checked={checked}
    {...props}
  >
    <span className="absolute start-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Check className="h-4 w-4 text-nx-accent" aria-hidden="true" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.CheckboxItem>
));
MenubarCheckboxItem.displayName = MenubarPrimitive.CheckboxItem.displayName;

const MenubarRadioItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <MenubarPrimitive.RadioItem
    ref={ref}
    className={cn(menuItemClasses, menuIndicatorItemClasses, menuSelectionBarClasses, className)}
    {...props}
  >
    <span className="absolute start-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current text-nx-accent" aria-hidden="true" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.RadioItem>
));
MenubarRadioItem.displayName = MenubarPrimitive.RadioItem.displayName;

const MenubarLabel = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Label
    ref={ref}
    // A quiet section label that names the group below it — not a heading that
    // outweighs the commands it introduces.
    className={cn("px-2 pb-1 pt-2 text-xs font-medium text-nx-ink-3", inset && "ps-8", className)}
    {...props}
  />
));
MenubarLabel.displayName = MenubarPrimitive.Label.displayName;

const MenubarSeparator = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-nx-line", className)}
    {...props}
  />
));
MenubarSeparator.displayName = MenubarPrimitive.Separator.displayName;

const MenubarShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span className={cn("ms-auto ps-4 text-xs tabular-nums text-nx-ink-3", className)} {...props} />
  );
};
MenubarShortcut.displayName = "MenubarShortcut";

export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarPortal,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarGroup,
  MenubarSub,
  MenubarShortcut,
};
