"use client";

import * as React from "react";
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import { Check, ChevronLeft, ChevronRight, Circle } from "lucide-react";

import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";

const ContextMenu = ContextMenuPrimitive.Root;

const ContextMenuTrigger = ContextMenuPrimitive.Trigger;

const ContextMenuGroup = ContextMenuPrimitive.Group;

const ContextMenuPortal = ContextMenuPrimitive.Portal;

const ContextMenuSub = ContextMenuPrimitive.Sub;

const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup;

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
        "flex cursor-default select-none items-center rounded-nx-sm px-2 py-1.5 text-sm outline-none focus:bg-nx-hover focus:text-nx-ink data-[state=open]:bg-nx-hover data-[state=open]:text-nx-ink",
        inset && "ps-8",
        className
      )}
      {...props}
    >
      {children}
      <ChevronIcon className="ms-auto h-4 w-4" />
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
      // A menu is a dropdown; the old hardcoded z-index predated the semantic
      // ladder, so a menu opened inside a modal (z-modal) rendered behind it.
      "z-dropdown min-w-[8rem] overflow-hidden rounded-nx-md border border-nx-line bg-nx-popover p-1 text-nx-ink shadow-nx-popover",
      // 140ms fade + 0.98 scale from the pointer origin; reduced motion keeps
      // the crossfade and drops the scale.
      "origin-[--radix-context-menu-content-transform-origin] duration-nx-micro ease-nx-enter data-[state=open]:animate-in data-[state=open]:fade-in-0 motion-safe:data-[state=open]:zoom-in-[0.98] data-[state=closed]:animate-out data-[state=closed]:ease-nx-exit data-[state=closed]:fade-out-0 motion-safe:data-[state=closed]:zoom-out-[0.98]",
      className
    )}
    {...props}
  />
));
ContextMenuSubContent.displayName = ContextMenuPrimitive.SubContent.displayName;

const ContextMenuContent = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Portal>
    <ContextMenuPrimitive.Content
      ref={ref}
      className={cn(
        // A menu is a dropdown; the old hardcoded z-index predated the semantic
        // ladder, so a menu opened inside a modal (z-modal) rendered behind it.
        // The old unconditional animate-in fade-in-80 also re-ran the enter
        // animation redundantly next to the data-[state=open] one — gone.
        "z-dropdown min-w-[8rem] overflow-hidden rounded-nx-md border border-nx-line bg-nx-popover p-1 text-nx-ink shadow-nx-popover",
        // 140ms fade + 0.98 scale from the pointer origin; reduced motion keeps
        // the crossfade and drops the scale.
        "origin-[--radix-context-menu-content-transform-origin] duration-nx-micro ease-nx-enter data-[state=open]:animate-in data-[state=open]:fade-in-0 motion-safe:data-[state=open]:zoom-in-[0.98] data-[state=closed]:animate-out data-[state=closed]:ease-nx-exit data-[state=closed]:fade-out-0 motion-safe:data-[state=closed]:zoom-out-[0.98]",
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
  }
>(({ className, inset, ...props }, ref) => (
  <ContextMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-nx-sm px-2 py-1.5 text-sm outline-none focus:bg-nx-hover focus:text-nx-ink data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
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
    className={cn(
      "relative flex cursor-default select-none items-center rounded-nx-sm py-1.5 pe-2 ps-8 text-sm outline-none focus:bg-nx-hover focus:text-nx-ink data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      // Checked wears the lit edge: a 2px inline-start accent bar, never a
      // filled row.
      "before:absolute before:inset-y-1 before:start-0 before:w-0.5 before:rounded-full data-[state=checked]:before:bg-nx-accent",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute start-2 flex h-3.5 w-3.5 items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
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
    className={cn(
      "relative flex cursor-default select-none items-center rounded-nx-sm py-1.5 pe-2 ps-8 text-sm outline-none focus:bg-nx-hover focus:text-nx-ink data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      // Checked wears the lit edge: a 2px inline-start accent bar, never a
      // filled row.
      "before:absolute before:inset-y-1 before:start-0 before:w-0.5 before:rounded-full data-[state=checked]:before:bg-nx-accent",
      className
    )}
    {...props}
  >
    <span className="absolute start-2 flex h-3.5 w-3.5 items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
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
    className={cn("px-2 py-1.5 text-sm font-semibold", inset && "ps-8", className)}
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
    <span className={cn("ms-auto text-xs tracking-widest text-nx-ink-3", className)} {...props} />
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
