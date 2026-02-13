"use client";

import type React from "react";
import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";

interface LayoutWrapperProps {
      children: React.ReactNode;
      className?: string;
}

/**
 * Common wrapper for ALL layout variants.
 * Applies global settings: direction, fontSize, compactMode,
 * highContrast, reducedMotion, and accessibility attributes.
 */
export function LayoutWrapper({ children, className }: LayoutWrapperProps) {
      const { direction } = useI18n();
      const {
            fontSize,
            compactMode,
            highContrast,
            reducedMotion,
      } = useSettings();

      return (
            <div
                  dir={direction}
                  className={cn(
                        "min-h-screen bg-background text-foreground",
                        fontSize === "small" && "text-sm",
                        fontSize === "large" && "text-lg",
                        compactMode && "layout-compact",
                        highContrast && "layout-high-contrast",
                        reducedMotion && "motion-reduce",
                        className
                  )}
            >
                  {children}
            </div>
      );
}
