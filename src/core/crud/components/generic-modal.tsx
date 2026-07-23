"use client";

import React, { memo } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogPortal,
} from "@core/ui/dialog";
import { ScrollArea } from "@core/ui/scroll-area";
import { useSettings } from "@core/providers/settings-provider";
import { cn } from "@core/common/utils";

interface GenericModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  // Enhanced props for unified modal behavior
  formKey?: string; // Key for form re-rendering
  showHeader?: boolean; // Whether to show header (default: true)
  showDescription?: boolean; // Whether to show description (default: true)
  headerClassName?: string; // Custom header classes
  contentClassName?: string; // Custom content classes
}

// Header and body padding ride the Wave-C --spacing-unit var (0.5rem compact
// → 2rem spacious), so the density setting lands here without the former
// four-way JS switches. The title needs no ladder at all: text-* classes are
// rem-based, so they already scale with the --font-size-base root token.
const sectionPaddingClasses = "px-[calc(var(--spacing-unit)*1.5)] py-[var(--spacing-unit)]";

// The scrim is DialogOverlay's exact recipe (see @core/ui/dialog). Radix only
// mounts its own overlay in modal mode, and modal mode is off here (see the
// render), so the same treatment renders explicitly: the token scrim at the
// overlay step of the z ladder, fading on the token pair — 200ms enter, ~2/3
// exit. A fade is the one movement reduced motion keeps, so no motion-safe
// split is needed.
const scrimClasses =
  "fixed inset-0 z-overlay bg-scrim duration-nx-standard ease-nx-enter data-[state=closed]:duration-nx-micro data-[state=closed]:ease-nx-exit data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0";

function GenericModalInner({
  open,
  onOpenChange,
  title,
  description,
  children,
  size,
  formKey,
  showHeader = true,
  showDescription = true,
  headerClassName,
  contentClassName,
}: GenericModalProps) {
  const settings = useSettings();

  // The scrim swallows pointer interaction by existing, but wheel and touch
  // moves over it would still scroll-chain into the page. The old code cut
  // that chain by setting overflow:hidden on <html> — exactly the global-DOM
  // reach this remaster bans — so the lock lives on the scrim node instead:
  // React's root-delegated wheel/touch handlers are passive and cannot cancel,
  // so a non-passive pair attaches directly, and it dies with the node when
  // the portal unmounts.
  const lockScrimScroll = React.useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    const cancelScroll = (event: Event) => event.preventDefault();
    node.addEventListener("wheel", cancelScroll, { passive: false });
    node.addEventListener("touchmove", cancelScroll, { passive: false });
  }, []);

  // The explicit width ladder behind the `size` prop. The prop was dead —
  // nothing called this function, so the 19 call sites asking for sm/lg/xl
  // silently received the settings.modalStyle width instead. An explicit
  // size now wins over the settings-derived footprint; omitting it keeps
  // the modalStyle footprint exactly as before (the old `= "md"` default is
  // gone so absence stays distinguishable from a caller asking for md).
  const getSizeClasses = () => {
    if (!size) return undefined;
    const widths = {
      sm: "sm:max-w-sm",
      md: "sm:max-w-md",
      lg: "sm:max-w-lg",
      xl: "sm:max-w-xl",
      full: "sm:max-w-4xl",
    } as const;
    // A sized drawer keeps its edge-pinned height and takes only the width;
    // every other style collapses to the standard centered footprint.
    return cn(
      settings.modalStyle === "drawer" ? "h-[95vh] max-h-none" : "w-[95vw] max-h-[90vh]",
      widths[size]
    );
  };

  // Footprint only. The surface itself — popover fill behind a hairline, the
  // modal step of the shadow ladder, the large radius token — is
  // DialogContent's nx recipe, and the old per-style skins (glass
  // backdrop-blur, border-4 success frames, warning glow, rotate-1) fought it
  // with literal colours and shadows. They are gone: every modalStyle keeps
  // its geometry and inherits the one surface.
  const getModalClasses = () => {
    const baseClasses = "p-0 overflow-visible flex flex-col";

    // Explicit size supplies the footprint — see getSizeClasses at the
    // render site — so the settings-derived footprint stands down entirely.
    if (size) return baseClasses;

    switch (settings.modalStyle) {
      case "centered":
        // Keep default centering behavior
        return cn(baseClasses, "w-[95vw] max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[90vh]");
      case "fullscreen":
        // Responsive fullscreen - full on mobile, large on desktop
        return cn(
          baseClasses,
          "w-[98vw] h-[95vh] max-w-none max-h-none sm:w-[95vw] sm:h-[90vh] md:w-[90vw] md:h-[85vh]"
        );
      case "drawer":
        // Drawer from the inline-end edge - responsive width. Position, slide
        // and radius come from DialogContent's explicit variant="drawer" (see
        // below); the old !important overrides existed only to fight the
        // centered layout from outside.
        return cn(baseClasses, "w-full h-[95vh] max-w-md sm:max-w-lg md:max-w-xl max-h-none");
      case "glass":
        return cn(baseClasses, "w-[85vw] max-w-2xl max-h-[80vh]");
      case "floating":
        return cn(baseClasses, "w-[70vw] max-w-sm max-h-[60vh]");
      case "card":
        return cn(baseClasses, "w-[95vw] max-w-4xl max-h-[85vh]");
      case "overlay":
        return cn(baseClasses, "w-[98vw] h-[95vh] max-w-none max-h-none");
      default:
        // Default modal with responsive sizing
        return cn(baseClasses, "w-[95vw] max-h-[90vh]");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      {/* modal={false} is deliberate: Radix's modal mode traps focus inside
          the panel, which breaks the body-portaled searchable-select and
          date-picker dropdowns (their search inputs live outside the trap).
          The cost of non-modal mode is that Radix skips its own overlay, so
          the scrim renders here instead — it swallows background clicks at
          the overlay z step and lets DismissableLayer close on outside
          pointerdown, replacing the old effect pair that blurred and
          disabled every body child on each open. */}
      <DialogPortal>
        <div
          ref={lockScrimScroll}
          aria-hidden="true"
          data-state={open ? "open" : "closed"}
          className={scrimClasses}
        />
      </DialogPortal>
      <DialogContent
        variant={settings.modalStyle === "drawer" ? "drawer" : "default"}
        className={cn(getModalClasses(), getSizeClasses())}
      >
        {showHeader && (
          <DialogHeader
            className={cn(
              sectionPaddingClasses,
              "shrink-0 border-b border-nx-line",
              headerClassName
            )}
          >
            <DialogTitle>{title}</DialogTitle>
            {showDescription && (
              <DialogDescription className="mt-1">
                {description || "Please fill out the form below."}
              </DialogDescription>
            )}
          </DialogHeader>
        )}

        <ScrollArea className="flex-1">
          <div className={cn(sectionPaddingClasses, "pe-4", contentClassName)}>
            {formKey ? <div key={formKey}>{children}</div> : children}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// P1.4: Memoize to prevent re-renders when parent state changes
export const GenericModal = memo(GenericModalInner);
