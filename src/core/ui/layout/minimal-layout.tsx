"use client";

import type React from "react";
import { MinimalHeader } from "./minimal-header";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { cn } from "@core/common/utils";

interface MinimalLayoutProps {
  children: React.ReactNode;
}

export function MinimalLayout({ children }: MinimalLayoutProps) {
  const { direction } = useI18n();
  const settings = useSettings();

  const getSpacingClass = () => {
    switch (settings.spacingSize) {
      case "compact":
        return "p-4";
      case "comfortable":
        return "p-8";
      case "spacious":
        return "p-10";
      default:
        return "p-6";
    }
  };

  const getFontSizeClass = () => {
    switch (settings.fontSize) {
      case "small":
        return "text-sm";
      case "large":
        return "text-lg";
      default:
        return "text-base";
    }
  };

  const getAnimationClass = () => {
    if (settings.animationLevel === "none") return "";
    if (settings.animationLevel === "minimal")
      return "transition-colors duration-200";
    if (settings.animationLevel === "moderate")
      return "transition-all duration-300";
    return "transition-all duration-500 ease-in-out";
  };

  return (
    <div
      className={cn(
        "min-h-screen bg-background",
        direction === "rtl" ? "rtl" : "ltr",
        getFontSizeClass(),
        settings.compactMode && "compact-mode",
        settings.highContrast && "high-contrast",
        settings.reducedMotion && "reduce-motion"
      )}
      style={{
        fontSize: `var(--font-size-base)`,
      }}
    >
      {/* Minimal layout has no sidebar, just a header with dropdown navigation */}
      <MinimalHeader />

      <main
        className={cn(
          getSpacingClass(),
          settings.stickyHeader ? "pt-20" : "pt-6"
        )}
      >
        <div
          className={cn(
            "animate-fade-in max-w-7xl mx-auto",
            settings.cardStyle === "bordered" &&
              "border border-border rounded-lg p-6",
            settings.cardStyle === "elevated" &&
              "bg-card shadow-lg rounded-lg p-6",
            settings.cardStyle === "glass" &&
              "bg-background/80 backdrop-blur-sm rounded-lg p-6",
            getAnimationClass()
          )}
          style={{
            borderRadius: `var(--border-radius)`,
            boxShadow: `var(--shadow-intensity)`,
            padding: `var(--spacing-unit)`,
          }}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
