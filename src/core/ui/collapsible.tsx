"use client";

import * as React from "react";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";

import { cn } from "@core/common/utils";

const Collapsible = CollapsiblePrimitive.Root;

const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger;

// Radix keeps a closing panel mounted only while a CSS *animation* runs — a
// grid-rows transition can never play the exit, the content would be hidden
// on its first frame. The accordion keyframes in tailwind.config.js already
// animate measured height at the 200ms standard step; Collapsible publishes
// the same measurement under its own variable name, so a one-line bridge
// re-points those keyframes at it instead of duplicating them. Reduced motion
// drops the movement entirely and the panel snaps — expand/collapse has no
// transform+opacity equivalent to fall back on.
const CollapsibleContent = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.CollapsibleContent>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.CollapsibleContent>
>(({ className, style, ...props }, ref) => (
  <CollapsiblePrimitive.CollapsibleContent
    ref={ref}
    style={
      {
        ...style,
        "--radix-accordion-content-height": "var(--radix-collapsible-content-height)",
      } as React.CSSProperties
    }
    className={cn(
      "overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up motion-reduce:animate-none",
      className
    )}
    {...props}
  />
));
CollapsibleContent.displayName = CollapsiblePrimitive.CollapsibleContent.displayName;

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
