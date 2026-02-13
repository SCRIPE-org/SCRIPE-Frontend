"use client";

import type React from "react";
import { ElegantSidebar } from "./elegant-sidebar";
import { ElegantHeader } from "./elegant-header";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { cn } from "@core/common/utils";
import { Footer } from "@core/ui/layout/shared/footer";

interface ElegantLayoutProps {
  children: React.ReactNode;
  sidebarOpen: boolean;
  onSidebarOpenChange: (open: boolean) => void;
}

export function ElegantLayout({
  children,
  sidebarOpen,
  onSidebarOpenChange,
}: ElegantLayoutProps) {
  const { direction } = useI18n();
  const settings = useSettings();

  const getSpacingClass = () => {
    switch (settings.spacingSize) {
      case "compact":
        return "p-6 lg:p-8";
      case "comfortable":
        return "p-10 lg:p-14";
      case "spacious":
        return "p-12 lg:p-16";
      default:
        return "p-8 lg:p-12";
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
    return "transition-all duration-700 ease-out";
  };

  return (
    <div
      className={cn(
        "min-h-screen relative overflow-hidden",
        "bg-gradient-to-br from-background via-background/98 to-muted/8",
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
      {/* Enhanced animated background elements - only if animations are enabled */}
      {settings.animationLevel !== "none" && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {/* Large gradient orbs */}
          <div className="absolute -top-48 -left-48 w-96 h-96 bg-gradient-to-br from-primary/12 to-transparent rounded-full blur-3xl animate-pulse" />
          <div className="absolute -top-32 -right-40 w-80 h-80 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute -bottom-40 -left-32 w-88 h-88 bg-gradient-to-tr from-primary/8 to-transparent rounded-full blur-3xl animate-pulse delay-2000" />
          <div className="absolute -bottom-32 -right-48 w-72 h-72 bg-gradient-to-tl from-primary/15 to-transparent rounded-full blur-3xl animate-pulse delay-3000" />

          {/* Medium gradient orbs */}
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-primary/8 to-transparent rounded-full blur-2xl animate-pulse delay-500" />
          <div className="absolute top-1/3 right-1/3 w-24 h-24 bg-gradient-to-bl from-primary/12 to-transparent rounded-full blur-xl animate-pulse delay-1500" />
          <div className="absolute bottom-1/4 left-1/3 w-28 h-28 bg-gradient-to-tr from-primary/6 to-transparent rounded-full blur-2xl animate-pulse delay-2500" />
          <div className="absolute bottom-1/3 right-1/4 w-20 h-20 bg-gradient-to-tl from-primary/10 to-transparent rounded-full blur-xl animate-pulse delay-3500" />

          {/* Floating particles with enhanced animations */}
          {settings.animationLevel === "high" && (
            <>
              <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-primary/40 rounded-full animate-bounce delay-500 shadow-lg shadow-primary/30" />
              <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-primary/50 rounded-full animate-bounce delay-1000 shadow-md shadow-primary/40" />
              <div className="absolute bottom-1/4 left-1/3 w-2.5 h-2.5 bg-primary/30 rounded-full animate-bounce delay-1500 shadow-lg shadow-primary/20" />
              <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-primary/45 rounded-full animate-bounce delay-2000 shadow-md shadow-primary/35" />
              <div className="absolute top-1/2 left-1/6 w-1.5 h-1.5 bg-primary/35 rounded-full animate-bounce delay-2500 shadow-sm shadow-primary/25" />
              <div className="absolute top-2/3 right-1/6 w-2 h-2 bg-primary/40 rounded-full animate-bounce delay-3000 shadow-md shadow-primary/30" />
            </>
          )}

          {/* Gradient lines for depth */}
          <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-primary/10 to-transparent opacity-50" />
          <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-primary/8 to-transparent opacity-40" />
          <div className="absolute left-0 top-1/3 w-full h-px bg-gradient-to-r from-transparent via-primary/6 to-transparent opacity-30" />
          <div className="absolute left-0 bottom-1/4 w-full h-px bg-gradient-to-r from-transparent via-primary/12 to-transparent opacity-60" />
        </div>
      )}

      {/* Fixed Header - Highest z-index */}
      <ElegantHeader onMenuClick={() => onSidebarOpenChange(true)} />

      {/* Sidebar - Lower z-index than header */}
      <ElegantSidebar
        open={sidebarOpen}
        onOpenChange={onSidebarOpenChange}
        collapsible={settings.collapsibleSidebar}
      />

      {/* Main Content - Enhanced with better spacing and animations */}
        <main
          className={cn(
            "relative",
            getAnimationClass(),
            settings.stickyHeader ? "pt-20" : "pt-4",
          // Desktop margins
          direction === "rtl" ? "lg:mr-80 xl:mr-72" : "lg:ml-80 xl:ml-72",
          // Mobile - no margins when sidebar is closed
          sidebarOpen ? "lg:blur-none" : ""
        )}
      >
        <div className={cn("relative", getSpacingClass())}>
          {/* Content background with enhanced gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-background/60 via-transparent to-background/40 rounded-3xl" />
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/2 via-transparent to-primary/4 rounded-3xl" />

          {/* Main content with enhanced animations */}
          <div
            className={cn(
              "relative z-10",
              settings.animationLevel === "high" &&
                "animate-in fade-in-0 slide-in-from-bottom-6 duration-1000",
              settings.animationLevel === "moderate" &&
                "transition-all duration-500 ease-out"
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

        {/* Mobile overlay with enhanced blur and gradient */}
        {sidebarOpen && settings.collapsibleSidebar && (
        <div
          className={cn(
            "fixed inset-0 z-30 lg:hidden",
            "bg-gradient-to-br from-black/50 via-black/40 to-black/30",
            "backdrop-blur-xl",
            settings.animationLevel !== "none" &&
              "animate-in fade-in-0 duration-500"
          )}
          onClick={() => onSidebarOpenChange(false)}
        />
      )}
    </div>
  );
}
