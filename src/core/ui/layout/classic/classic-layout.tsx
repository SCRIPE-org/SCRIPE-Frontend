"use client";

import type React from "react";
import { useEffect } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { useLayoutStyles } from "@core/ui/layout/shared/use-layout-styles";
import { ClassicSidebar } from "./classic-sidebar";
import { ClassicHeader } from "./classic-header";
import { Footer } from "@core/ui/layout/shared/footer";
import { cn } from "@core/common/utils";

interface ClassicLayoutProps {
  children: React.ReactNode;
  sidebarOpen: boolean;
  onSidebarOpenChange: (open: boolean) => void;
}

/**
 * Classic Layout — Notion/Jira inspired.
 *
 * Traditional wide (w-72) fixed sidebar + slim header layout.
 * Content area adjusts with left/right margin based on sidebar width.
 * Fully RTL-aware and settings-responsive.
 */
export function ClassicLayout({ children, sidebarOpen, onSidebarOpenChange }: ClassicLayoutProps) {
  const { direction } = useI18n();
  const settings = useSettings();
  const styles = useLayoutStyles();

  // Close sidebar on outside click (mobile)
  useEffect(() => {
    if (!settings.collapsibleSidebar) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (window.innerWidth >= 1024) return;

      const sidebar = document.querySelector(".classic-sidebar");
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
        settings.highContrast === true && "high-contrast",
        settings.reducedMotion === true && "reduce-motion"
      )}
    >
      {/* Sidebar */}
      <div className="classic-sidebar">
        <ClassicSidebar
          open={sidebarOpen}
          onOpenChange={onSidebarOpenChange}
          collapsible={settings.collapsibleSidebar ?? false}
        />
      </div>

      {/* Header + Content — pushed by sidebar */}
      <div
        className={cn(
          "min-h-screen",
          styles.getAnimationClass(),
          // Desktop: offset by sidebar width (w-72 = 288px)
          direction === "rtl" ? "lg:mr-72" : "lg:ml-72",
          // Sticky header offset
          settings.stickyHeader === true ? "pt-0" : ""
        )}
      >
        <ClassicHeader onMenuClick={() => onSidebarOpenChange(true)} />

        <main className="min-h-[calc(100vh-3.5rem)]">
          <div className={cn(styles.getSpacingClass())}>
            <div
              className={cn(
                "mx-auto max-w-7xl",
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
