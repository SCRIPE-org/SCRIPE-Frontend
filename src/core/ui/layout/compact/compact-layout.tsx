"use client";

import type React from "react";
import { CompactSidebar } from "./compact-sidebar";
import { CompactHeader } from "./compact-header";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { cn } from "@core/common/utils";
import { Footer } from "@core/ui/layout/shared/footer";

interface CompactLayoutProps {
  children: React.ReactNode;
  sidebarOpen: boolean;
  onSidebarOpenChange: (open: boolean) => void;
}

export function CompactLayout({
  children,
  sidebarOpen,
  onSidebarOpenChange,
}: CompactLayoutProps) {
  const { direction } = useI18n();
  const settings = useSettings();

  const getSpacingClass = () => {
    switch (settings.spacingSize) {
      case "compact":
        return "p-2 lg:p-3";
      case "comfortable":
        return "p-6 lg:p-8";
      case "spacious":
        return "p-8 lg:p-10";
      default:
        return "p-4 lg:p-6";
    }
  };

  const getFontSizeClass = () => {
    switch (settings.fontSize) {
      case "xs":
        return "text-xs";
      case "small":
        return "text-sm";
      case "medium":
        return "text-base";
      case "large":
        return "text-xl";
      case "xl":
        return "text-2xl";
      default:
        return "text-lg";
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
      {/* Fixed Header */}
      <CompactHeader onMenuClick={() => onSidebarOpenChange(true)} />

      {/* Sidebar */}
      <CompactSidebar
        open={sidebarOpen}
        onOpenChange={onSidebarOpenChange}
        collapsible={settings.collapsibleSidebar}
      />

      {/* Main Content - Proper responsive margins */}
      <main
        className={cn(
          getAnimationClass(),
          settings.stickyHeader ? "pt-16" : "pt-4",
          // Desktop margins - sidebar width is 18rem (288px)
          direction === "rtl" ? "lg:mr-72" : "lg:ml-72"
        )}
      >
        <div className={cn(getSpacingClass())}>
          <div
            className={cn(
              "animate-fade-in space-y-6 max-w-7xl mx-auto",
              settings.cardStyle === "bordered" &&
              "border border-border rounded-lg p-6",
              settings.cardStyle === "elevated" &&
              "bg-card shadow-lg rounded-lg p-6",
              settings.cardStyle === "glass" &&
              "bg-background/80 backdrop-blur-sm rounded-lg p-6"
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
            "fixed inset-0 bg-black/50 z-30 lg:hidden",
            getAnimationClass()
          )}
          onClick={() => onSidebarOpenChange(false)}
        />
      )}
    </div>
  );
}
