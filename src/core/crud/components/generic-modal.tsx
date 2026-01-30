"use client";

import React from "react";
import { PAGE_BLUR_Z_INDEX, PAGE_BLUR_PX, PAGE_BLUR_BRIGHTNESS, MODAL_Z_INDEX, OVERLAY_Z_INDEX } from "@core/ui/modal-tokens";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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

export function GenericModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  size = "md",
  formKey,
  showHeader = true,
  showDescription = true,
  headerClassName,
  contentClassName,
}: GenericModalProps) {
  const settings = useSettings();

  // Apply blur to ENTIRE layout (sidebars, headers, main content) when modal is open
  // This ensures the whole app is blurred except the modal itself
  React.useEffect(() => {
    if (open) {
      // Find the root layout wrapper - try multiple selectors to catch all layout types
      const selectors = [
        'body > div.min-h-screen', // Most common layout wrapper
        'body > div[class*="min-h-screen"]', // Any div with min-h-screen
        'body > div:not([data-radix-portal]):first-child', // First non-portal child
        '#__next > div:not([data-radix-portal])', // Next.js root div
      ];
      
      let layoutWrapper: HTMLElement | null = null;
      for (const selector of selectors) {
        const found = document.querySelector(selector);
        if (found && !found.hasAttribute('data-radix-portal')) {
          layoutWrapper = found as HTMLElement;
          break;
        }
      }
      
      // If no single wrapper found, blur all direct children of body except portals and scripts
      if (!layoutWrapper) {
        const bodyChildren = Array.from(document.body.children) as HTMLElement[];
        bodyChildren.forEach((child) => {
          if (
            !child.hasAttribute('data-radix-portal') && 
            child.tagName !== 'SCRIPT' && 
            child.tagName !== 'STYLE' &&
            child.tagName !== 'NOSCRIPT'
          ) {
            child.classList.add('modal-blurred-content');
          }
        });
      } else {
        // Blur the entire layout wrapper (includes sidebars, headers, main content)
        layoutWrapper.classList.add('modal-blurred-content');
      }
      
      // Also blur html to catch anything else
      document.documentElement.classList.add('modal-blur-open');
      document.body.classList.add("modal-blur-open");
    } else {
      // Remove from all elements
      document.querySelectorAll('.modal-blurred-content').forEach((el) => {
        el.classList.remove('modal-blurred-content');
      });
      document.documentElement.classList.remove('modal-blur-open');
      document.body.classList.remove("modal-blur-open");
    }

    return () => {
      document.querySelectorAll('.modal-blurred-content').forEach((el) => {
        el.classList.remove('modal-blurred-content');
      });
      document.documentElement.classList.remove('modal-blur-open');
      document.body.classList.remove("modal-blur-open");
    };
  }, [open]);

  // Prevent interacting with the background - always active
  React.useEffect(() => {
    if (!open) return;

    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    // Find the active dialog content (our modal)
    const dialogContent = document.querySelector('[data-radix-dialog-content]') as HTMLElement | null;
    const portalRoot = dialogContent?.parentElement || null;

    // Collect all top-level elements that should be disabled (siblings of the portal root)
    const disabledElements: Array<HTMLElement & { __prevInert?: any; __prevAriaHidden?: string | null }> = [];
    const roots = Array.from(document.body.children) as HTMLElement[];
    roots.forEach((el) => {
      if (portalRoot && (el === portalRoot || portalRoot.contains(el))) return; // keep portal interactive
      // Skip the overlay/content themselves since they're within portalRoot
      if (dialogContent && (el === dialogContent || dialogContent.contains(el))) return;
      // Disable everything else
      (el as any).__prevInert = (el as any).inert;
      (el as any).__prevAriaHidden = el.getAttribute("aria-hidden");
      try { (el as any).inert = true; } catch {}
      el.setAttribute("aria-hidden", "true");
      disabledElements.push(el as any);
    });

    return () => {
      // Restore overflow
      document.documentElement.style.overflow = prevOverflow;
      // Restore disabled siblings
      disabledElements.forEach((el) => {
        const prevHidden = (el as any).__prevAriaHidden;
        if (prevHidden == null) el.removeAttribute("aria-hidden");
        else el.setAttribute("aria-hidden", prevHidden);
        try { (el as any).inert = (el as any).__prevInert; } catch {}
        delete (el as any).__prevAriaHidden;
        delete (el as any).__prevInert;
      });
    };
  }, [open]);

  const getSizeClasses = () => {
    const baseSizes = {
      sm: "sm:max-w-sm",
      md: "sm:max-w-md",
      lg: "sm:max-w-lg",
      xl: "sm:max-w-xl",
      full: "sm:max-w-4xl",
    };

    // Adjust sizes based on spacing settings
    if (settings.spacingSize === "compact") {
      return {
        sm: "sm:max-w-xs",
        md: "sm:max-w-sm",
        lg: "sm:max-w-md",
        xl: "sm:max-w-lg",
        full: "sm:max-w-3xl",
      }[size];
    } else if (settings.spacingSize === "spacious") {
      return {
        sm: "sm:max-w-md",
        md: "sm:max-w-lg",
        lg: "sm:max-w-xl",
        xl: "sm:max-w-2xl",
        full: "sm:max-w-6xl",
      }[size];
    }

    return baseSizes[size];
  };

  const getModalClasses = () => {
    const baseClasses = "p-0 overflow-visible flex flex-col";
    let sizeClasses = "";
    let styleClasses = "";

    switch (settings.modalStyle) {
      case "centered":
        // Keep default centering behavior
        sizeClasses =
          "w-[95vw] max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[90vh]";
        break;
      case "fullscreen":
        // Responsive fullscreen - full on mobile, large on desktop
        sizeClasses =
          "w-[98vw] h-[95vh] max-w-none max-h-none sm:w-[95vw] sm:h-[90vh] md:w-[90vw] md:h-[85vh]";
        styleClasses = "sm:rounded-lg";
        break;
      case "drawer":
        // Drawer from right side - responsive width
        sizeClasses =
          "w-full h-[95vh] max-w-md sm:max-w-lg md:max-w-xl max-h-none";
        styleClasses =
          "!translate-x-0 !translate-y-0 !left-auto !top-0 right-0 rounded-l-lg rounded-r-none";
        break;
      case "glass":
        sizeClasses = "w-[85vw] max-w-2xl max-h-[80vh]";
        styleClasses =
          "bg-background/20 backdrop-blur-2xl border-2 border-blue-500/30 shadow-[0_0_50px_rgba(59,130,246,0.2)] rounded-3xl";
        break;
      case "floating":
        // Compact floating with theme-aware colors
        sizeClasses = "w-[70vw] max-w-sm max-h-[60vh]";
        styleClasses =
          "bg-background border border-purple-500/30 shadow-[0_30px_60px_-12px_rgba(168,85,247,0.3)] rounded-2xl transform rotate-1";
        break;
      case "card":
        // Wide card with proper contrast
        sizeClasses = "w-[95vw] max-w-4xl max-h-[85vh]";
        styleClasses =
          "bg-background border-4 border-emerald-500/40 shadow-2xl rounded-xl";
        break;
      case "overlay":
        // Full screen with inverted theme colors
        sizeClasses = "w-[98vw] h-[95vh] max-w-none max-h-none";
        styleClasses =
          "bg-muted/95 border-2 border-orange-500/50 shadow-[0_0_100px_rgba(251,146,60,0.3)] rounded-none";
        break;
      default:
        // Default modal with responsive sizing
        sizeClasses = "w-[95vw] max-h-[90vh]";
    }

    // Apply border radius based on settings (except for drawer which has custom radius)
    let radiusClasses = "";
    if (settings.modalStyle !== "drawer") {
      switch (settings.borderRadius) {
        case "none":
          radiusClasses = "rounded-none";
          break;
        case "small":
          radiusClasses = "rounded-sm";
          break;
        case "large":
          radiusClasses = "rounded-xl";
          break;
        case "full":
          radiusClasses = "rounded-2xl";
          break;
        default:
          radiusClasses = "rounded-lg";
      }
    }

    // Apply shadow based on settings
    let shadowClasses = "";
    switch (settings.shadowIntensity) {
      case "none":
        shadowClasses = "shadow-none";
        break;
      case "subtle":
        shadowClasses = "shadow-sm";
        break;
      case "strong":
        shadowClasses = "shadow-2xl";
        break;
      default:
        shadowClasses = "shadow-lg";
    }

    return cn(
      baseClasses,
      sizeClasses,
      styleClasses,
      radiusClasses,
      shadowClasses
    );
  };

  const getHeaderPadding = () => {
    switch (settings.spacingSize) {
      case "compact":
        return "px-4 py-3";
      case "comfortable":
        return "px-8 py-6";
      case "spacious":
        return "px-10 py-8";
      default:
        return "px-6 py-4";
    }
  };

  const getContentPadding = () => {
    switch (settings.spacingSize) {
      case "compact":
        return "px-4 py-3";
      case "comfortable":
        return "px-8 py-6";
      case "spacious":
        return "px-10 py-8";
      default:
        return "px-6 py-4";
    }
  };

  const getTitleSize = () => {
    switch (settings.fontSize) {
      case "small":
        return "text-base";
      case "large":
        return "text-2xl";
      default:
        return "text-lg";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogContent 
        className={cn(getModalClasses())}
      >
        {showHeader && (
          <DialogHeader
            className={cn(
              getHeaderPadding(),
              "border-b shrink-0",
              headerClassName
            )}
          >
            <DialogTitle className={cn("font-semibold", getTitleSize())}>
              {title}
            </DialogTitle>
            {showDescription && (
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                {description || "Please fill out the form below."}
              </DialogDescription>
            )}
          </DialogHeader>
        )}

        <ScrollArea className="flex-1">
          <div className={cn(getContentPadding(), "pr-4", contentClassName)}>
            {formKey ? <div key={formKey}>{children}</div> : children}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
