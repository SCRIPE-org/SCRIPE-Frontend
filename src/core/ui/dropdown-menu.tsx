"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check, ChevronLeft, ChevronRight, Circle } from "lucide-react";

import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";

const DropdownMenu = DropdownMenuPrimitive.Root;

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

const DropdownMenuGroup = DropdownMenuPrimitive.Group;

const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

const DropdownMenuSub = DropdownMenuPrimitive.Sub;

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

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
        "flex cursor-default select-none items-center gap-2 rounded-nx-sm px-2 py-1.5 text-sm outline-none focus:bg-nx-hover focus:text-nx-ink data-[state=open]:bg-nx-hover data-[state=open]:text-nx-ink [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        inset && "ps-8",
        className
      )}
      {...props}
    >
      {children}
      <ChevronIcon className="ms-auto" />
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
      // A menu is a dropdown; the old hardcoded z-index predated the semantic
      // ladder, so a menu opened inside a modal (z-modal) rendered behind it.
      "z-dropdown min-w-[8rem] overflow-hidden rounded-nx-md border border-nx-line bg-nx-popover p-1 text-nx-ink shadow-nx-popover",
      // 140ms fade + 0.98 scale from the trigger origin; reduced motion keeps
      // the crossfade and drops the scale.
      "origin-[--radix-dropdown-menu-content-transform-origin] duration-nx-micro ease-nx-enter data-[state=open]:animate-in data-[state=open]:fade-in-0 motion-safe:data-[state=open]:zoom-in-[0.98] data-[state=closed]:animate-out data-[state=closed]:ease-nx-exit data-[state=closed]:fade-out-0 motion-safe:data-[state=closed]:zoom-out-[0.98]",
      className
    )}
    {...props}
  />
));
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName;

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => {
  const { direction } = useI18n();

  return (
    <DropdownMenuPrimitive.Portal>
      <div dir={direction}>
        <DropdownMenuPrimitive.Content
          ref={ref}
          sideOffset={sideOffset}
          className={cn(
            // A menu is a dropdown; the old hardcoded z-index predated the
            // semantic ladder, so a menu opened inside a modal (z-modal)
            // rendered behind it.
            "z-dropdown min-w-[8rem] overflow-hidden rounded-nx-md border border-nx-line bg-nx-popover p-1 text-nx-ink shadow-nx-popover",
            // 140ms fade + 0.98 scale from the trigger origin; reduced motion
            // keeps the crossfade and drops the scale.
            "origin-[--radix-dropdown-menu-content-transform-origin] duration-nx-micro ease-nx-enter data-[state=open]:animate-in data-[state=open]:fade-in-0 motion-safe:data-[state=open]:zoom-in-[0.98] data-[state=closed]:animate-out data-[state=closed]:ease-nx-exit data-[state=closed]:fade-out-0 motion-safe:data-[state=closed]:zoom-out-[0.98]",
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
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center gap-2 rounded-nx-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-nx-hover focus:text-nx-ink data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
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
    className={cn(
      "relative flex cursor-default select-none items-center rounded-nx-sm py-1.5 pe-2 ps-8 text-sm outline-none transition-colors focus:bg-nx-hover focus:text-nx-ink data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      // Checked wears the lit edge: a 2px inline-start accent bar, never a
      // filled row.
      "before:absolute before:inset-y-1 before:start-0 before:w-0.5 before:rounded-full data-[state=checked]:before:bg-nx-accent",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute start-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
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
    className={cn(
      "relative flex cursor-default select-none items-center rounded-nx-sm py-1.5 pe-2 ps-8 text-sm outline-none transition-colors focus:bg-nx-hover focus:text-nx-ink data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      // Checked wears the lit edge: a 2px inline-start accent bar, never a
      // filled row.
      "before:absolute before:inset-y-1 before:start-0 before:w-0.5 before:rounded-full data-[state=checked]:before:bg-nx-accent",
      className
    )}
    {...props}
  >
    <span className="absolute start-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
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
    className={cn("px-2 py-1.5 text-sm font-semibold", inset && "ps-8", className)}
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
    className={cn("-mx-1 my-1 h-px bg-nx-line", className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

const DropdownMenuShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span className={cn("ms-auto text-xs tracking-widest text-nx-ink-3", className)} {...props} />
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
