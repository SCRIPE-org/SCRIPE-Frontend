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
 *
 * The same resolved direction is also passed to the Radix Root so the
 * scrollbar itself lands on the correct side under RTL (Radix reads dir
 * from context/prop, never from the DOM).
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
      dir={docDir}
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

/**
 * ScrollBar — the rail.
 *
 * Two things were wrong here. The vertical rail's gutter hairline was
 * `border-l`, a PHYSICAL side: in RTL the scrollbar moves to the inline start
 * and the gutter stayed on the left, so the rail drew its edge inside the
 * content. And the thumb was `bg-border` — a pre-nexus token that resolves to a
 * different grey from every other hairline in the shell, with no hover or drag
 * state at all. It now steps nx-line-hi → ink-3 → ink-2 across rest, hover and
 * drag, at the micro beat, with a reduced-motion path.
 */
const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none p-px",
      orientation === "vertical" && "h-full w-2.5 border-s border-s-transparent",
      orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb
      className={cn(
        "relative flex-1 rounded-full bg-nx-line-hi",
        "transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none",
        "hover:bg-nx-ink-3 active:bg-nx-ink-2"
      )}
    />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export { ScrollArea, ScrollBar };
