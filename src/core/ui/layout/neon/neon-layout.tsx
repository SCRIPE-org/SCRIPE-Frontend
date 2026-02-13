"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { useLayoutStyles } from "@core/ui/layout/shared/use-layout-styles";
import { Logo } from "@core/ui/logo";
import { Button } from "@core/ui/button";
import { ScrollArea } from "@core/ui/scroll-area";
import { LanguageSwitcher, ThemeSwitcher, HeaderSearch } from "@core/ui/layout/common";
import { UserProfileDropdown } from "@core/ui/user-profile-dropdown";
import { NavRenderer } from "@core/ui/layout/shared/nav-renderer";
import { UserCard } from "@core/ui/layout/shared/user-card";
import { LogoutButton } from "@core/ui/layout/shared/logout-button";
import { Footer } from "@core/ui/layout/shared/footer";
import { Bell, Home, Menu, X, Zap } from "lucide-react";
import { cn } from "@core/common/utils";
import { useRouter } from "next/navigation";

interface NeonLayoutProps {
      children: React.ReactNode;
}

/**
 * Neon Layout — Cyberpunk / Gaming aesthetic.
 *
 * Structure:
 * - Left sidebar with neon-glow border
 * - Scanline overlay on header
 * - Neon accent borders on content cards
 * - Animated gradient lines between sections
 * - Dark bg (#0a0a0f), neon colors (cyan, magenta)
 * - Monospace accents, sharp corners
 *
 * Inspired by Cyberpunk 2077 UI, Razer, ASUS ROG dashboards
 */
export function NeonLayout({ children }: NeonLayoutProps) {
      const { direction, t } = useI18n();
      const settings = useSettings();
      const styles = useLayoutStyles();
      const router = useRouter();
      const isRTL = direction === "rtl";

      const [sidebarOpen, setSidebarOpen] = useState(false);

      useEffect(() => {
            const handler = (e: KeyboardEvent) => {
                  if (e.key === "Escape") setSidebarOpen(false);
            };
            window.addEventListener("keydown", handler);
            return () => window.removeEventListener("keydown", handler);
      }, []);

      return (
            <div
                  className={cn(
                        "min-h-screen relative",
                        styles.getAnimationClass(),
                  )}
                  dir={direction}
                  style={{ backgroundColor: "#0a0a0f" }}
            >
                  {/* CSS for neon effects */}
                  <style jsx global>{`
                        .neon-layout {
                              --neon-cyan: #00f0ff;
                              --neon-magenta: #ff00aa;
                              --neon-lime: #39ff14;
                              --neon-glow-cyan: 0 0 10px rgba(0,240,255,0.3), 0 0 20px rgba(0,240,255,0.1);
                              --neon-glow-magenta: 0 0 10px rgba(255,0,170,0.3), 0 0 20px rgba(255,0,170,0.1);
                        }
                        .neon-border-cyan {
                              border-color: rgba(0,240,255,0.4);
                              box-shadow: 0 0 8px rgba(0,240,255,0.15), inset 0 0 8px rgba(0,240,255,0.05);
                        }
                        .neon-border-magenta {
                              border-color: rgba(255,0,170,0.3);
                              box-shadow: 0 0 8px rgba(255,0,170,0.15);
                        }
                        .neon-text-cyan { color: var(--neon-cyan); text-shadow: 0 0 8px rgba(0,240,255,0.5); }
                        .neon-text-magenta { color: var(--neon-magenta); text-shadow: 0 0 8px rgba(255,0,170,0.5); }
                        .scanline-overlay {
                              background: repeating-linear-gradient(
                                    0deg,
                                    transparent,
                                    transparent 2px,
                                    rgba(0,240,255,0.015) 2px,
                                    rgba(0,240,255,0.015) 4px
                              );
                              pointer-events: none;
                        }
                        @keyframes neon-pulse {
                              0%, 100% { opacity: 1; }
                              50% { opacity: 0.7; }
                        }
                        @keyframes neon-line-sweep {
                              0% { transform: translateX(-100%); }
                              100% { transform: translateX(100%); }
                        }
                  `}</style>

                  <div className="min-h-screen flex neon-layout">
                        {/* Scanline overlay */}
                        <div className="fixed inset-0 z-[1] scanline-overlay" />

                        {/* ── Neon Sidebar ── */}
                        {sidebarOpen && (
                              <div
                                    className="fixed inset-0 z-40 bg-black/60 lg:hidden"
                                    onClick={() => setSidebarOpen(false)}
                              />
                        )}
                        <aside
                              className={cn(
                                    "fixed top-0 z-50 h-full w-64",
                                    isRTL ? "right-0" : "left-0",
                                    "transition-transform duration-300 ease-out",
                                    "border-e neon-border-cyan",
                                    sidebarOpen
                                          ? "translate-x-0"
                                          : isRTL ? "translate-x-full lg:translate-x-0" : "-translate-x-full lg:translate-x-0",
                              )}
                              style={{ backgroundColor: "#0d0d14" }}
                        >
                              <div className="flex items-center justify-between p-4 h-14 border-b neon-border-cyan">
                                    <div className="flex items-center gap-2">
                                          <Zap className="w-5 h-5 neon-text-cyan" style={{ animation: "neon-pulse 2s ease-in-out infinite" }} />
                                          <span className="font-bold text-sm neon-text-cyan tracking-widest uppercase" style={{ fontFamily: "monospace" }}>
                                                SYSTEM
                                          </span>
                                    </div>
                                    <Button
                                          variant="ghost"
                                          size="icon"
                                          className="lg:hidden w-8 h-8 text-white/50 hover:text-white"
                                          onClick={() => setSidebarOpen(false)}
                                    >
                                          <X className="w-4 h-4" />
                                    </Button>
                              </div>
                              <ScrollArea className="flex-1 h-[calc(100vh-56px)]">
                                    <div className="p-3">
                                          <NavRenderer variant="compact" onNavigate={() => setSidebarOpen(false)} />
                                    </div>
                                    <div className="p-3 mt-auto border-t neon-border-cyan">
                                          <UserCard />
                                          <LogoutButton />
                                    </div>
                              </ScrollArea>
                        </aside>

                        {/* ── Main Content ── */}
                        <div className={cn("flex-1 flex flex-col min-w-0 z-[2]", "lg:ms-64")}>
                              {/* Neon Header */}
                              <header
                                    className={cn(
                                          settings.stickyHeader ? "sticky top-0 z-30" : "relative",
                                          "border-b neon-border-cyan",
                                          "flex items-center justify-between px-4 md:px-6 h-14",
                                    )}
                                    style={{ backgroundColor: "#0d0d14" }}
                              >
                                    <div className="flex items-center gap-3">
                                          <Button
                                                variant="ghost"
                                                size="icon"
                                                className="lg:hidden sidebar-trigger text-white/50 hover:text-white"
                                                onClick={() => setSidebarOpen(true)}
                                          >
                                                <Menu className="w-5 h-5" />
                                          </Button>
                                          <div className="hidden md:flex items-center">
                                                <span
                                                      className="text-xs font-mono tracking-widest uppercase neon-text-cyan"
                                                      style={{ animation: "neon-pulse 3s ease-in-out infinite" }}
                                                >
                                                      ═══ {t("common.dashboard") || "DASHBOARD"} ═══
                                                </span>
                                          </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                          <Button variant="ghost" size="icon" onClick={() => router.push("/")} className="text-white/50 hover:neon-text-cyan">
                                                <Home className="w-4 h-4" />
                                          </Button>
                                          <LanguageSwitcher />
                                          <ThemeSwitcher />
                                          {settings.showNotifications && (
                                                <Button variant="ghost" size="icon" className="text-white/50 hover:neon-text-cyan">
                                                      <Bell className="w-4 h-4" />
                                                </Button>
                                          )}
                                          <UserProfileDropdown showName={false} />
                                    </div>
                              </header>

                              {/* Animated neon line */}
                              <div className="h-px relative overflow-hidden" style={{ backgroundColor: "rgba(0,240,255,0.1)" }}>
                                    <div
                                          className="absolute inset-y-0 w-32"
                                          style={{
                                                background: "linear-gradient(90deg, transparent, rgba(0,240,255,0.6), transparent)",
                                                animation: "neon-line-sweep 4s linear infinite",
                                          }}
                                    />
                              </div>

                              {/* Content */}
                              <main className="flex-1 p-4 md:p-6">
                                    <div
                                          className={cn(
                                                "rounded-lg border neon-border-cyan",
                                                "p-4 md:p-6",
                                          )}
                                          style={{ backgroundColor: "#0d0d16" }}
                                    >
                                          {children}
                                    </div>
                              </main>

                              {/* Neon footer line */}
                              <div className="h-px relative overflow-hidden" style={{ backgroundColor: "rgba(255,0,170,0.1)" }}>
                                    <div
                                          className="absolute inset-y-0 w-24"
                                          style={{
                                                background: "linear-gradient(90deg, transparent, rgba(255,0,170,0.6), transparent)",
                                                animation: "neon-line-sweep 5s linear infinite reverse",
                                          }}
                                    />
                              </div>

                              {settings.showFooter && (
                                    <div className="px-4 md:px-6 pb-4 md:pb-6">
                                          <div className="rounded-lg border neon-border-magenta p-4" style={{ backgroundColor: "#0d0d14" }}>
                                                <Footer />
                                          </div>
                                    </div>
                              )}
                        </div>
                  </div>
            </div>
      );
}
