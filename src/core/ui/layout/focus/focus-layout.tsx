"use client";

import type React from "react";
import { useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Maximize2, Minimize2 } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { useLayoutStyles } from "@core/ui/layout/shared/use-layout-styles";
import { useDynamicNavigation } from "@core/ui/navigation/dynamic-navigation";
import {
      isNavigationItemActive,
      type NavigationItem,
} from "@core/config/navigation";
import { Logo } from "@core/ui/logo";
import { Button } from "@core/ui/button";
import { LanguageSwitcher, ThemeSwitcher } from "@core/ui/layout/common";
import { UserProfileDropdown } from "@core/ui/user-profile-dropdown";
import { Footer } from "@core/ui/layout/shared/footer";
import { NavRenderer } from "@core/ui/layout/shared/nav-renderer";
import { UserCard } from "@core/ui/layout/shared/user-card";
import { LogoutButton } from "@core/ui/layout/shared/logout-button";
import { cn } from "@core/common/utils";

interface FocusLayoutProps {
      children: React.ReactNode;
}

/**
 * Focus Mode Layout — Distraction-free with toggle to minimal UI.
 *
 * Structure:
 * - Ultra-minimal header (logo + focus toggle + profile)
 * - Full-screen content area
 * - Sidebar hidden by default, toggleable via menu button
 * - In focus mode: header collapses to floating pill
 *
 * Inspired by Notion zen mode, Obsidian, Typora
 */
export function FocusLayout({ children }: FocusLayoutProps) {
      const { direction, t } = useI18n();
      const settings = useSettings();
      const styles = useLayoutStyles();
      const pathname = usePathname();
      const router = useRouter();
      const navigation = useDynamicNavigation();
      const [sidebarOpen, setSidebarOpen] = useState(false);
      const [focusMode, setFocusMode] = useState(false);

      return (
            <div
                  className={cn(
                        "min-h-screen bg-background transition-all",
                        styles.getAnimationClass(),
                  )}
                  dir={direction}
            >
                  {/* ── Focus Mode Pill (shown when header is hidden) ── */}
                  {focusMode && (
                        <div
                              className={cn(
                                    "fixed top-4 z-50 flex items-center gap-2",
                                    "bg-card/80 backdrop-blur-xl border border-border rounded-full px-3 py-1.5 shadow-lg",
                                    "transition-all hover:bg-card",
                                    direction === "rtl" ? "right-4" : "left-4",
                              )}
                        >
                              <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => setSidebarOpen(!sidebarOpen)}
                              >
                                    <Menu className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => setFocusMode(false)}
                                    title="Exit focus mode"
                              >
                                    <Minimize2 className="w-3.5 h-3.5" />
                              </Button>
                        </div>
                  )}

                  {/* ── Header (hidden in focus mode) ── */}
                  {!focusMode && (
                        <header
                              className={cn(
                                    settings.stickyHeader ? "sticky top-0 z-30" : "relative",
                                    "glass border-b border-border",
                                    "flex items-center justify-between px-4 lg:px-6 h-12",
                              )}
                        >
                              <div className="flex items-center gap-3">
                                    <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={() => setSidebarOpen(!sidebarOpen)}
                                    >
                                          <Menu className="w-4 h-4" />
                                    </Button>
                                    <Logo size="sm" />
                                    <span className="text-sm font-semibold text-foreground hidden md:block">
                                          {t("app.title")}
                                    </span>
                              </div>
                              <div className="flex items-center gap-2">
                                    <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={() => setFocusMode(true)}
                                          title="Enter focus mode"
                                    >
                                          <Maximize2 className="w-4 h-4" />
                                    </Button>
                                    <LanguageSwitcher />
                                    <ThemeSwitcher />
                                    <UserProfileDropdown showName={false} />
                              </div>
                        </header>
                  )}

                  {/* ── Sidebar Overlay ── */}
                  {sidebarOpen && (
                        <>
                              <div
                                    className="fixed inset-0 z-30 bg-black/30"
                                    onClick={() => setSidebarOpen(false)}
                              />
                              <aside
                                    dir={direction}
                                    className={cn(
                                          "fixed top-0 bottom-0 w-72 z-40 bg-card border-e border-border overflow-y-auto flex flex-col",
                                          direction === "rtl" ? "right-0" : "left-0",
                                    )}
                              >
                                    <div className="flex items-center justify-between p-4 border-b border-border">
                                          <Logo size="sm" />
                                          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                                                <X className="w-4 h-4" />
                                          </Button>
                                    </div>
                                    <div className="p-3 border-b border-border"><UserCard size="sm" /></div>
                                    <div className="flex-1 p-3 overflow-y-auto">
                                          <NavRenderer variant="default" onNavigate={() => setSidebarOpen(false)} />
                                    </div>
                                    <div className="p-3 border-t border-border"><LogoutButton /></div>
                              </aside>
                        </>
                  )}

                  {/* ── Content ── */}
                  <main className={cn("flex-1 p-6", focusMode && "p-8 lg:p-12")}>
                        <div
                              className={cn(focusMode && "max-w-4xl mx-auto")}
                              style={{ borderRadius: "var(--border-radius)" }}
                        >
                              {children}
                        </div>
                  </main>

                  {!focusMode && settings.showFooter && <Footer />}
            </div>
      );
}
