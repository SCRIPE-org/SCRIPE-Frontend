"use client";

import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

import { cn } from "@core/common/utils";

/** Read dir from <html> — safe for SSR (returns "ltr" on server). */
function getDocumentDir(): "ltr" | "rtl" {
  if (typeof document === "undefined") return "ltr";
  return (document.documentElement.getAttribute("dir") as "ltr" | "rtl") || "ltr";
}

/**
 * ScrollArea — wraps Radix UI ScrollArea with an RTL fix.
 *
 * Radix's Viewport forces `direction: ltr` as an inline style to keep
 * scrollbars on the correct side. That breaks flex ordering for RTL content.
 *
 * Fix: we wrap children in a `<div dir="...">` that re-applies the actual
 * document direction (read from `<html dir="...">`), so children respect
 * the intended RTL/LTR ordering.
 */
const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> & {
    /** Explicitly set the direction for scroll content */
    dir?: "ltr" | "rtl";
  }
>(({ className, children, dir, ...props }, ref) => {
  // Initialize with actual value (avoids LTR flash)
  const [docDir, setDocDir] = React.useState<"ltr" | "rtl">(dir || getDocumentDir);

  React.useEffect(() => {
    if (dir) {
      setDocDir(dir);
      return;
    }
    // Sync with current value
    setDocDir(getDocumentDir());

    // Watch <html dir="..."> for language switches
    const observer = new MutationObserver(() => setDocDir(getDocumentDir()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["dir"] });
    return () => observer.disconnect();
  }, [dir]);

  return (
    <ScrollAreaPrimitive.Root
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        className="h-full w-full rounded-[inherit]"
        style={{ direction: docDir }}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
});
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export { ScrollArea, ScrollBar };
