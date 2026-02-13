"use client";

import type React from "react";
import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";

interface LayoutWrapperProps {
      children: React.ReactNode;
      className?: string;
}

const DIR_MAP: Record<string, string> = {
      "to-t": "0deg", "to-tr": "45deg", "to-r": "90deg", "to-br": "135deg",
      "to-b": "180deg", "to-bl": "225deg", "to-l": "270deg", "to-tl": "315deg",
};

/**
 * Common wrapper for ALL layout variants.
 * Applies global settings: direction, fontSize, compactMode,
 * highContrast, reducedMotion, and accessibility attributes.
 * 
 * Also applies the active background mode (preset, gradient, custom).
 */
export function LayoutWrapper({ children, className }: LayoutWrapperProps) {
      const { direction } = useI18n();
      const settings = useSettings();
      const {
            fontSize,
            compactMode,
            highContrast,
            reducedMotion,
      } = settings;

      const bgMode = settings.backgroundMode || "preset";

      // Compute inline background style for gradient/custom modes
      let bgStyle: React.CSSProperties | undefined;

      if (bgMode === "gradient") {
            const angle = DIR_MAP[settings.gradientDirection] || "135deg";
            if (settings.gradientStartColor && settings.gradientEndColor) {
                  // Custom gradient colors
                  bgStyle = {
                        backgroundImage: `linear-gradient(${angle}, ${settings.gradientStartColor}, ${settings.gradientEndColor})`,
                        backgroundAttachment: "fixed",
                  };
            }
            // For preset gradients, CSS handles it via data attributes + globals.css
      } else if (bgMode === "custom") {
            const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");
            const customBg = isDark ? settings.customDarkBgColor : settings.customLightBgColor;
            if (customBg) {
                  bgStyle = { backgroundColor: customBg };
            }
      }

      return (
            <div
                  dir={direction}
                  className={cn(
                        "min-h-screen text-foreground",
                        // Only use bg-background when in preset mode (no custom bg applied)
                        !bgStyle && "bg-background",
                        fontSize === "small" && "text-sm",
                        fontSize === "large" && "text-lg",
                        compactMode && "layout-compact",
                        highContrast && "layout-high-contrast",
                        reducedMotion && "motion-reduce",
                        className
                  )}
                  style={bgStyle}
            >
                  {children}
            </div>
      );
}
