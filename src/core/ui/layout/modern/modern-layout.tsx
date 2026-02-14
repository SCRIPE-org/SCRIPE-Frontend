"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { useLayoutStyles } from "@core/ui/layout/shared/use-layout-styles";
import { ModernSidebar } from "./modern-sidebar";
import { ModernHeader } from "./modern-header";
import { Footer } from "@core/ui/layout/shared/footer";
import { cn } from "@core/common/utils";

interface ModernLayoutProps {
  children: React.ReactNode;
  sidebarOpen: boolean;
  onSidebarOpenChange: (open: boolean) => void;
}

/**
 * Modern Layout — Icon rail + expandable panel.
 *
 * Default: 64px icon rail always visible (desktop).
 * On hover or pin: panel expands to 64+224=288px.
 * Content area smoothly shifts with margin transitions.
 *
 * Inspired by Arc Browser + VS Code Activity Bar.
 */
export function ModernLayout({ children, sidebarOpen, onSidebarOpenChange }: ModernLayoutProps) {
  const { direction } = useI18n();
  const settings = useSettings();
  const styles = useLayoutStyles();
  const [expanded, setExpanded] = useState(false);
  const [pinned, setPinned] = useState(false);

  // When pinned, keep expanded
  const isExpanded = pinned || expanded;

  // Close sidebar on outside click (mobile)
  useEffect(() => {
    if (!settings.collapsibleSidebar) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (window.innerWidth >= 1024) return;

      const sidebar = document.querySelector(".modern-sidebar");
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
        "min-h-screen bg-background",
        styles.getAnimationClass(),
        direction === "rtl" ? "rtl" : "ltr",
        settings.compactMode === true && "compact-mode",
        settings.highContrast === true && "high-contrast",
        settings.reducedMotion === true && "reduce-motion"
      )}
    >
      {/* Sidebar */}
      <div className="modern-sidebar">
        <ModernSidebar
          open={sidebarOpen}
          onOpenChange={onSidebarOpenChange}
          expanded={isExpanded}
          onExpandedChange={setExpanded}
          pinned={pinned}
          onPinnedChange={setPinned}
        />
      </div>

      {/* Content area — shifts based on rail + panel width */}
      <div
        className={cn(
          "min-h-screen transition-[margin] duration-300 ease-in-out",
          // Desktop: always offset by rail (64px = w-16)
          // When expanded/pinned: offset by rail + panel (64+224 = 288px)
          direction === "rtl"
            ? cn("lg:mr-16", isExpanded && pinned && "lg:mr-[288px]")
            : cn("lg:ml-16", isExpanded && pinned && "lg:ml-[288px]")
        )}
      >
        <ModernHeader onMenuClick={() => onSidebarOpenChange(true)} />

        <main className="min-h-[calc(100vh-3rem)]">
          <div className={cn(styles.getSpacingClass())}>
            <div
              className={cn(
                styles.getBorderRadiusClass(),
                styles.getShadowClass(),
                settings.cardStyle === "bordered" && "border border-border",
                settings.cardStyle === "elevated" && "bg-card shadow-lg",
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
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => onSidebarOpenChange(false)}
        />
      )}
    </div>
  );
}
