"use client";

import type React from "react";
import { FloatingNavigation } from "./floating-navigation";
import { FloatingHeader } from "./floating-header";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { cn } from "@core/common/utils";
import { Footer } from "@core/ui/layout/shared/footer";

interface FloatingLayoutProps {
  children: React.ReactNode;
  sidebarOpen: boolean;
  onSidebarOpenChange: (open: boolean) => void;
}

export function FloatingLayout({
  children,
  sidebarOpen,
  onSidebarOpenChange,
}: FloatingLayoutProps) {
  const { direction } = useI18n();
  const settings = useSettings();

  const getSpacingClass = () => {
    switch (settings.spacingSize) {
      case "compact":
        return "px-2 lg:px-4";
      case "comfortable":
        return "px-6 lg:px-10";
      case "spacious":
        return "px-8 lg:px-12";
      default:
        return "px-4 lg:px-8";
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
        "min-h-screen bg-gradient-to-br from-background to-muted/30 relative overflow-hidden",
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
      {/* Background Effects - only if animations are enabled */}
      {settings.animationLevel !== "none" && (
        <>
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-grid-16" />
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        </>
      )}

      {/* Fixed Header */}
      <FloatingHeader onMenuClick={() => onSidebarOpenChange(true)} />

      {/* Floating Navigation - Properly positioned */}
      <FloatingNavigation
        open={sidebarOpen}
        onOpenChange={onSidebarOpenChange}
        collapsible={settings.collapsibleSidebar}
      />

      {/* Main Content */}
        <main
          className={cn(
            "relative z-10",
            settings.stickyHeader ? "pt-24" : "pt-8",
            getSpacingClass()
          )}
        >
        <div className="max-w-7xl mx-auto">
          <div
            className={cn(
              "animate-fade-in",
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
        </div>
        </main>
        {settings.showFooter && <Footer />}

        {/* Mobile overlay */}
        {sidebarOpen && settings.collapsibleSidebar && (
          <div
            className={cn(
              "fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden",
              getAnimationClass()
          )}
          onClick={() => onSidebarOpenChange(false)}
        />
      )}
    </div>
  );
}
