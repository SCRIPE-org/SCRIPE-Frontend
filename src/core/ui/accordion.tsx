"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

import { cn } from "@core/common/utils";

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("border-b border-nx-line", className)}
    {...props}
  />
));
AccordionItem.displayName = "AccordionItem";

// The trigger rests at secondary ink and shifts to strong ink at micro speed
// on hover — no underline. The open trigger wears the lit edge: a 2px inset
// accent line under its title. Focus is the --nx-focus lit-edge ring (the
// old version had no focus treatment at all).
//
// The chevron now reads from the trigger's group rather than a bare
// [&[data-state=open]>svg] descendant hack, so it also tracks hover and
// disabled — and gap-4 keeps a long title from butting into it, which
// justify-between alone never prevented.
const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "group flex flex-1 items-center justify-between gap-4 rounded-nx-sm py-4 text-start font-medium text-nx-ink-2 transition-[color,box-shadow] duration-nx-micro ease-nx-enter hover:text-nx-ink focus-visible:shadow-nx-focus focus-visible:outline-none disabled:pointer-events-none disabled:text-nx-ink-3 disabled:shadow-none data-[state=open]:text-nx-ink data-[state=open]:shadow-[inset_0_-2px_0_0_var(--nx-accent)] motion-reduce:transition-none",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown
        aria-hidden="true"
        className="h-4 w-4 shrink-0 text-nx-ink-3 transition-transform duration-nx-standard ease-nx-enter group-hover:text-nx-ink-2 group-data-[state=open]:rotate-180 group-data-[state=open]:text-nx-ink-2 motion-reduce:transition-none"
      />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down motion-reduce:animate-none"
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
));

AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
