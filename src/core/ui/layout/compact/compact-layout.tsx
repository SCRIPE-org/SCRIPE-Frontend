"use client";

import type React from "react";
import { useEffect } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { useLayoutStyles } from "@core/ui/layout/shared/use-layout-styles";
import { CompactSidebar } from "./compact-sidebar";
import { CompactHeader } from "./compact-header";
import { Footer } from "@core/ui/layout/shared/footer";
import { cn } from "@core/common/utils";

interface CompactLayoutProps {
  children: React.ReactNode;
  sidebarOpen: boolean;
  onSidebarOpenChange: (open: boolean) => void;
}

/**
 * Compact Layout — Slack/Discord inspired.
 *
 * Narrow sidebar (w-56), ultra-slim header (40px),
 * full-width content with no max-width constraint.
 * Dense, efficient — every pixel earns its place.
 */
export function CompactLayout({ children, sidebarOpen, onSidebarOpenChange }: CompactLayoutProps) {
  const { direction } = useI18n();
  const settings = useSettings();
  const styles = useLayoutStyles();

  // Close sidebar on outside click (mobile)
  useEffect(() => {
    if (!settings.collapsibleSidebar) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (window.innerWidth >= 1024) return;

      const sidebar = document.querySelector(".compact-sidebar");
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
      <div className="compact-sidebar">
        <CompactSidebar open={sidebarOpen} onOpenChange={onSidebarOpenChange} />
      </div>

      {/* Content area — pushed by narrow sidebar */}
      <div
        className={cn(
          "min-h-screen",
          styles.getAnimationClass(),
          // w-56 = 224px
          direction === "rtl" ? "lg:mr-56" : "lg:ml-56"
        )}
      >
        <CompactHeader onMenuClick={() => onSidebarOpenChange(true)} />

        {/* Dense content — no max-width, uses all available space */}
        <main className="min-h-[calc(100vh-2.5rem)]">
          <div
            className={cn(
              styles.getSpacingClass({
                compact: "px-3 py-2",
                comfortable: "px-6 py-4",
                spacious: "px-8 py-6",
                default: "px-4 py-3",
              })
            )}
          >
            <div
              className={cn(
                styles.getBorderRadiusClass(),
                settings.cardStyle === "bordered" && "border border-border",
                settings.cardStyle === "elevated" && "bg-card shadow-md",
                settings.animationLevel === "high" && "animate-fade-in"
              )}
              style={{
                borderRadius: "var(--border-radius)",
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
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => onSidebarOpenChange(false)}
        />
      )}
    </div>
  );
}
