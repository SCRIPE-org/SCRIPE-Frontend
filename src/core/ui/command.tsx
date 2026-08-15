"use client";

import * as React from "react";
import { type DialogProps } from "@radix-ui/react-dialog";
import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";

import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { Dialog, DialogContent, DialogTitle } from "@core/ui/dialog";

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      // Surface only — border and shadow belong to whatever floats this
      // (PopoverContent, DialogContent), or they would double up.
      "flex h-full w-full flex-col overflow-hidden rounded-nx-md bg-nx-popover text-nx-ink",
      className
    )}
    {...props}
  />
));
Command.displayName = CommandPrimitive.displayName;

interface CommandDialogProps extends DialogProps {
  /**
   * Accessible name for the palette. Radix requires a title on every dialog
   * and this one had none — it logged an a11y error on open and announced
   * itself as an unnamed dialog. Defaults to the existing common.search
   * string, so no new locale key rides on the fix.
   */
  label?: string;
}

const CommandDialog = ({ children, label, ...props }: CommandDialogProps) => {
  const { t } = useI18n();

  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0">
        <DialogTitle className="sr-only">{label ?? t("common.search")}</DialogTitle>
        {/* The dialog's close control sits at the top inline-end corner, which
            is exactly where the search field ends — the query used to run
            underneath it. The input row reserves that corner instead. */}
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-nx-ink-3 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]]:pe-11 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
};

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div className="flex items-center gap-2 border-b border-nx-line px-3" cmdk-input-wrapper="">
    {/* Was `opacity-50` — opacity math over whatever tint the panel carries.
        The dimmed ink token is the actual "this is chrome" step. */}
    <Search className="h-4 w-4 shrink-0 text-nx-ink-3" aria-hidden="true" />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-nx-sm bg-transparent py-3 text-sm text-nx-ink outline-none placeholder:text-nx-ink-3 disabled:cursor-not-allowed disabled:text-nx-ink-3 disabled:placeholder:text-nx-ink-3",
        className
      )}
      {...props}
    />
  </div>
));

CommandInput.displayName = CommandPrimitive.Input.displayName;

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn(
      // overscroll-contain stops a flick at the end of the result list from
      // scrolling the page behind the palette.
      "custom-scrollbar max-h-[300px] overflow-y-auto overflow-x-hidden overscroll-contain p-1",
      className
    )}
    {...props}
  />
));

CommandList.displayName = CommandPrimitive.List.displayName;

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    // Two fixes. The className was applied WITHOUT cn(), so `{...props}` from
    // any caller that passed one silently replaced the whole thing — the empty
    // state was one prop away from being unstyled. And it inherited full body
    // ink, so "No results found" read exactly as loud as a real result; an
    // empty state is a status line, not content.
    className={cn("px-3 py-8 text-center text-sm text-nx-ink-2", className)}
    {...props}
  />
));

CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      // The group heading matches the menu section label exactly — same size,
      // weight and ink step — so a palette group and a dropdown group read as
      // the same idea.
      "overflow-hidden text-nx-ink [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-nx-ink-3",
      className
    )}
    {...props}
  />
));

CommandGroup.displayName = CommandPrimitive.Group.displayName;

const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    // my-1 to match every other menu separator in the family — without it the
    // rule sat flush against the rows on both sides.
    className={cn("-mx-1 my-1 h-px bg-nx-line", className)}
    {...props}
  />
));
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item> & {
    /** "destructive" marks a row that removes or revokes something. */
    variant?: "default" | "destructive";
  }
>(({ className, variant = "default", ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    data-variant={variant}
    className={cn(
      "group relative flex min-h-8 cursor-default select-none items-center gap-2 rounded-nx-sm px-2 py-1.5 text-sm text-nx-ink outline-none transition-colors duration-nx-micro ease-nx-enter data-[disabled=true]:pointer-events-none data-[selected='true']:bg-nx-hover data-[disabled=true]:text-nx-ink-3 data-[selected=true]:text-nx-ink motion-reduce:transition-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      // cmdk's selected row is the ACTIVE thing — light collects on it: hover
      // tint plus the 2px inline-start accent lit edge. Transparent at rest so
      // it crossfades in with the tint instead of snapping on.
      "before:absolute before:inset-y-1 before:start-0 before:w-0.5 before:rounded-full before:bg-transparent before:transition-colors before:duration-nx-micro data-[selected=true]:before:bg-nx-accent motion-reduce:before:transition-none",
      variant === "destructive" &&
        "text-nx-danger data-[selected=true]:bg-destructive/10 data-[disabled=true]:text-nx-ink-3 data-[selected=true]:text-nx-danger",
      className
    )}
    {...props}
  />
));

CommandItem.displayName = CommandPrimitive.Item.displayName;

const CommandShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    // Same hint treatment as the menus: no letter-spacing stunt, tabular
    // figures so a column of F-keys does not jitter, and a guaranteed gap
    // between the label and the chord.
    <span className={cn("ms-auto ps-4 text-xs tabular-nums text-nx-ink-3", className)} {...props} />
  );
};
CommandShortcut.displayName = "CommandShortcut";

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
