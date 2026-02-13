"use client";

import type React from "react";
import { useEffect } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { useLayoutStyles } from "@core/ui/layout/shared/use-layout-styles";
import { FloatingSidebar } from "./floating-sidebar";
import { FloatingHeader } from "./floating-header";
import { Footer } from "@core/ui/layout/shared/footer";
import { cn } from "@core/common/utils";

interface FloatingLayoutProps {
      children: React.ReactNode;
      sidebarOpen: boolean;
      onSidebarOpenChange: (open: boolean) => void;
}

/**
 * Floating Layout — Content-first, sidebar hidden by default.
 *
 * Sidebar is an overlay panel triggered from the header's menu button.
 * Content stays full-width at all times — no margin shifts.
 * Close sidebar on Escape key press.
 *
 * Inspired by Figma/Framer overlay panels.
 */
export function FloatingLayout({
      children,
      sidebarOpen,
      onSidebarOpenChange,
}: FloatingLayoutProps) {
      const { direction } = useI18n();
      const settings = useSettings();
      const styles = useLayoutStyles();

      // Close sidebar on Escape key
      useEffect(() => {
            const handleKeyDown = (event: KeyboardEvent) => {
                  if (event.key === "Escape" && sidebarOpen) {
                        onSidebarOpenChange(false);
                  }
            };

            document.addEventListener("keydown", handleKeyDown);
            return () => document.removeEventListener("keydown", handleKeyDown);
      }, [sidebarOpen, onSidebarOpenChange]);

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
                  {/* Overlay Sidebar */}
                  <FloatingSidebar
                        open={sidebarOpen}
                        onOpenChange={onSidebarOpenChange}
                  />

                  {/* Header — always full width */}
                  <FloatingHeader
                        onMenuClick={() => onSidebarOpenChange(!sidebarOpen)}
                        sidebarOpen={sidebarOpen}
                  />

                  {/* Content — always full width, no margin, centered */}
                  <main className="min-h-[calc(100vh-3.5rem)]">
                        <div className={cn(styles.getSpacingClass())}>
                              <div
                                    className={cn(
                                          "max-w-6xl mx-auto",
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
      );
}
