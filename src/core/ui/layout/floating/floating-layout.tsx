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
 * Floating Layout — Everything floats as detached panels over a background.
 *
 * Design philosophy:
 * - A subtle background pattern/gradient is always visible behind all panels
 * - Header floats with margins, rounded corners, shadow
 * - Sidebar floats as an overlay card (not edge-attached)
 * - Content area itself is wrapped in a floating card
 * - Gaps between all elements create a sense of depth and space
 * - Close sidebar on Escape key press
 *
 * Inspired by Figma/Framer floating panel aesthetic.
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
                        "min-h-screen",
                        // Subtle background — visible behind floating panels
                        "bg-gradient-to-br from-muted/30 via-background to-muted/20",
                        styles.getAnimationClass(),
                        direction === "rtl" ? "rtl" : "ltr",
                        settings.compactMode === true && "compact-mode",
                        settings.highContrast === true && "high-contrast",
                        settings.reducedMotion === true && "reduce-motion"
                  )}
            >
                  {/* Subtle dot pattern overlay for texture */}
                  <div
                        className="fixed inset-0 pointer-events-none opacity-[0.015] dark:opacity-[0.03]"
                        style={{
                              backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
                              backgroundSize: "24px 24px",
                        }}
                  />

                  {/* Floating Sidebar — an overlay card */}
                  <FloatingSidebar
                        open={sidebarOpen}
                        onOpenChange={onSidebarOpenChange}
                  />

                  {/* Floating Header — detached from edges */}
                  <FloatingHeader
                        onMenuClick={() => onSidebarOpenChange(!sidebarOpen)}
                        sidebarOpen={sidebarOpen}
                  />

                  {/* Floating Content — wrapped in a card with margins */}
                  <main className="px-3 py-3">
                        <div
                              className={cn(
                                    "max-w-7xl mx-auto",
                                    "rounded-2xl",
                                    "bg-card/80 backdrop-blur-sm",
                                    "border border-border/40",
                                    "shadow-sm",
                                    "min-h-[calc(100vh-8rem)]",
                                    settings.animationLevel === "high" && "animate-fade-in",
                              )}
                        >
                              <div className={cn(styles.getSpacingClass())}>
                                    <div
                                          style={{
                                                borderRadius: "var(--border-radius)",
                                                padding: "var(--spacing-unit)",
                                          }}
                                    >
                                          {children}
                                    </div>
                              </div>
                        </div>
                  </main>

                  {settings.showFooter === true && (
                        <div className="px-3 pb-3">
                              <div className="rounded-2xl bg-card/60 border border-border/30 overflow-hidden">
                                    <Footer />
                              </div>
                        </div>
                  )}
            </div>
      );
}
