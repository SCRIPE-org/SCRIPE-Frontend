"use client";

import type React from "react";
import { useEffect } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { useLayoutStyles } from "@core/ui/layout/shared/use-layout-styles";
import { ElegantSidebar } from "./elegant-sidebar";
import { ElegantHeader } from "./elegant-header";
import { Footer } from "@core/ui/layout/shared/footer";
import { cn } from "@core/common/utils";

interface ElegantLayoutProps {
  children: React.ReactNode;
  sidebarOpen: boolean;
  onSidebarOpenChange: (open: boolean) => void;
}

/**
 * Elegant Layout — Premium glassmorphism design.
 *
 * Subtle gradient mesh background, frosted glass sidebar
 * with rounded corners floating inside the page (m-3).
 * Content wrapped in glass cards.
 *
 * Inspired by Linear + Raycast + Apple Music.
 */
export function ElegantLayout({ children, sidebarOpen, onSidebarOpenChange }: ElegantLayoutProps) {
  const { direction } = useI18n();
  const settings = useSettings();
  const styles = useLayoutStyles();

  // Close sidebar on outside click (mobile)
  useEffect(() => {
    if (!settings.collapsibleSidebar) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (window.innerWidth >= 1024) return;

      const sidebar = document.querySelector(".elegant-sidebar");
      const trigger = document.querySelector(".sidebar-trigger");
      const target = event.target as Node;

      if (sidebar && !sidebar.contains(target) && trigger && !trigger.contains(target)) {
        onSidebarOpenChange(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [settings.collapsibleSidebar, onSidebarOpenChange]);

  return (
    <div
      className={cn(
        "relative min-h-screen",
        // Subtle gradient mesh background
        "bg-background",
        styles.getAnimationClass(),
        direction === "rtl" ? "rtl" : "ltr",
        settings.compactMode === true && "compact-mode",
        settings.highContrast === true && "high-contrast",
        settings.reducedMotion === true && "reduce-motion"
      )}
    >
      {/* Gradient mesh accents — subtle colored orbs behind content */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="bg-primary/3 absolute -right-20 top-1/3 h-80 w-80 rounded-full blur-3xl" />
        <div className="bg-primary/4 absolute -bottom-20 left-1/3 h-72 w-72 rounded-full blur-3xl" />
      </div>

      {/* Sidebar */}
      <div className="elegant-sidebar">
        <ElegantSidebar open={sidebarOpen} onOpenChange={onSidebarOpenChange} />
      </div>

      {/* Header + Content — offset by sidebar width + margin */}
      <div
        className={cn(
          "relative z-10 min-h-screen",
          styles.getAnimationClass(),
          // Sidebar is w-72 + m-3 left margin + gap = ~312px
          direction === "rtl" ? "lg:mr-[306px]" : "lg:ml-[306px]"
        )}
      >
        <ElegantHeader onMenuClick={() => onSidebarOpenChange(true)} />

        <main className="min-h-[calc(100vh-3.5rem)]">
          <div className={cn(styles.getSpacingClass())}>
            <div
              className={cn(
                "mx-auto max-w-6xl",
                styles.getBorderRadiusClass({ large: "rounded-2xl", default: "rounded-xl" }),
                settings.cardStyle === "bordered" && "border border-border/20",
                settings.cardStyle === "elevated" && "bg-card/50 shadow-xl backdrop-blur-sm",
                settings.cardStyle === "glass" &&
                  "border border-white/10 bg-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.1)] backdrop-blur-xl",
                settings.animationLevel === "high" && "animate-fade-in"
              )}
              style={{
                borderRadius: "var(--border-radius)",
                boxShadow: "var(--shadow-intensity)",
                padding: "var(--spacing-unit)",
              }}
            >
              {children}
            </div>
          </div>
        </main>

        {settings.showFooter === true && <Footer />}
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => onSidebarOpenChange(false)}
        />
      )}
    </div>
  );
}
