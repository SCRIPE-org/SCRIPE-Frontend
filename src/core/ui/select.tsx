"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

import { cn } from "@/core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { fieldVariants, resolveFieldStyle } from "@core/ui/input";

/**
 * RTL-aware Select wrapper.
 * Automatically injects `dir` from the i18n context so Radix
 * positions the dropdown correctly in both LTR and RTL layouts.
 * Consumers can still override `dir` explicitly if needed.
 */
function Select({ dir, ...props }: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root>) {
  const { direction } = useI18n();
  return <SelectPrimitive.Root dir={dir ?? direction} {...props} />;
}

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => {
  const settings = useSettings();

  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        // A select trigger is a field. Sizing and trigger chrome live here; the
        // surface (hairline rest, hover lift, lit-edge focus-visible, error and
        // disabled) is the SAME fieldVariants Input and Textarea wear, so all
        // three read as one control — including the Settings inputStyle
        // variants.
        "group flex h-10 w-full items-center justify-between gap-2 px-3 py-2 text-sm data-[placeholder]:text-nx-ink-3 [&>span]:line-clamp-1 [&>span]:text-start",
        // while its list is up the trigger stays the active thing: it keeps the
        // lit edge instead of dropping back to a hairline behind the popover
        "data-[state=open]:border-nx-accent data-[state=open]:shadow-nx-focus",
        fieldVariants({ inputStyle: resolveFieldStyle(settings.inputStyle) }),
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        {/* the chevron turns with the panel — 140ms, transform only, and it
            holds its rest position under reduced motion */}
        <ChevronDown
          className="h-4 w-4 shrink-0 text-nx-ink-3 transition-transform duration-nx-micro ease-nx-enter group-data-[state=open]:rotate-180 motion-reduce:transition-none"
          aria-hidden="true"
        />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
});
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    // opaque popover fill: the rows must disappear UNDER the affordance, not
    // bleed through it
    className={cn(
      "flex cursor-default items-center justify-center bg-nx-popover py-1 text-nx-ink-3",
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" aria-hidden="true" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center bg-nx-popover py-1 text-nx-ink-3",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" aria-hidden="true" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        // A select popover is a dropdown; at z-[1001] it outranked the modal it was
        // usually opened inside, and even a toast.
        "relative z-dropdown max-h-[--radix-select-content-available-height] min-w-[8rem] origin-[--radix-select-content-transform-origin] overflow-y-auto overflow-x-hidden rounded-nx-md border border-nx-line bg-nx-popover text-nx-ink shadow-nx-popover",
        // 140ms fade + 0.98 scale from the trigger origin; reduced motion keeps
        // the crossfade and drops the scale.
        "duration-nx-micro ease-nx-enter data-[state=closed]:ease-nx-exit data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 motion-safe:data-[state=closed]:zoom-out-[0.98] motion-safe:data-[state=open]:zoom-in-[0.98]",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    // a group heading, not an option: smaller, quieter ink, and it never sits
    // on the same type step as the rows it introduces
    className={cn(
      "py-1.5 pe-2 ps-8 text-xs font-semibold uppercase tracking-wide text-nx-ink-3",
      className
    )}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      // 32px rows — a pointer target, not a text line
      "relative flex min-h-8 w-full cursor-default select-none items-center rounded-nx-sm py-1.5 pe-2 ps-8 text-sm outline-none",
      "transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none",
      "focus:bg-nx-hover focus:text-nx-ink",
      // an unavailable option reads inert through the ink token, not through a
      // half-transparent row
      "data-[disabled]:pointer-events-none data-[disabled]:text-nx-ink-3",
      // Checked wears the lit edge: a 2px inline-start accent bar, never a
      // filled row.
      "before:absolute before:inset-y-1 before:start-0 before:w-0.5 before:rounded-full data-[state=checked]:before:bg-nx-accent",
      className
    )}
    {...props}
  >
    <span className="absolute start-2 flex h-3.5 w-3.5 items-center justify-center text-nx-accent">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" aria-hidden="true" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-nx-line", className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
