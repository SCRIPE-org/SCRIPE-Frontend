"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";

/**
 * Tabs Root Component with automatic RTL/LTR support
 */
const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>
>(({ dir, ...props }, ref) => {
  const { direction } = useI18n();

  return <TabsPrimitive.Root ref={ref} dir={dir || direction} {...props} />;
});
Tabs.displayName = "Tabs";

// Two shapes, one system. The default is the underline treatment: a
// transparent list over a hairline, with the active trigger carrying a 2px
// accent lit edge on its bottom border and strong ink. "pill" keeps the raised-
// track look as the secondary variant. The list hands its variant to the
// triggers through context so callers only say it once.
type TabsVariant = "underline" | "pill";
const TabsVariantContext = React.createContext<TabsVariant>("underline");

const tabsListVariants = cva("inline-flex h-10 items-center justify-center text-nx-ink-2", {
  variants: {
    variant: {
      underline: "border-b border-nx-line bg-transparent",
      pill: "gap-1 rounded-nx-control bg-nx-raised p-1",
    },
  },
  defaultVariants: {
    variant: "underline",
  },
});

const tabsTriggerVariants = cva(
  // Only colour/edge properties transition, at the micro token speed (140ms)
  // — never an unscoped transition without an explicit duration. `relative`
  // plus the semantic z step keeps the focus halo above the neighbouring
  // trigger instead of being clipped by it.
  "relative inline-flex select-none items-center justify-center whitespace-nowrap px-3 py-1.5 text-sm font-medium tabular-nums transition-[color,background-color,border-color,box-shadow] duration-nx-micro ease-nx-enter motion-reduce:transition-none focus-visible:outline-none focus-visible:shadow-nx-focus focus-visible:z-raised disabled:pointer-events-none disabled:text-nx-ink-3",
  {
    variants: {
      variant: {
        // -mb-px sits the trigger's 2px edge on top of the list's hairline;
        // the transparent rest border reserves the space so activation never
        // shifts layout. Hover previews the edge at hairline strength, so the
        // pointer lands on something before it commits.
        underline:
          "-mb-px h-full border-b-2 border-transparent hover:border-nx-line-hi hover:text-nx-ink data-[state=active]:border-nx-accent data-[state=active]:text-nx-ink disabled:border-transparent",
        // The active pill is a raised surface behind an inset hairline, not a
        // drop shadow: it sits IN the track, it does not float above it.
        pill: "min-h-8 rounded-nx-sm hover:text-nx-ink data-[state=active]:bg-nx-surface data-[state=active]:text-nx-ink data-[state=active]:shadow-[inset_0_0_0_1px_var(--nx-line-hi)] disabled:bg-transparent disabled:shadow-none",
      },
    },
    defaultVariants: {
      variant: "underline",
    },
  }
);

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> &
    VariantProps<typeof tabsListVariants>
>(({ className, variant, ...props }, ref) => (
  <TabsVariantContext.Provider value={variant ?? "underline"}>
    <TabsPrimitive.List
      ref={ref}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  </TabsVariantContext.Provider>
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> &
    VariantProps<typeof tabsTriggerVariants>
>(({ className, variant, ...props }, ref) => {
  const contextVariant = React.useContext(TabsVariantContext);

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(tabsTriggerVariants({ variant: variant ?? contextVariant }), className)}
      {...props}
    />
  );
});
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  // Radix gives the panel tabIndex=0 when it holds no focusable child, so it
  // is a real tab stop and owes a real ring — with a radius, so the ring
  // traces a shape rather than a rectangle around arbitrary content.
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 rounded-nx-sm focus-visible:outline-none focus-visible:shadow-nx-focus",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
