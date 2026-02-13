"use client";

import type React from "react";
import { useState } from "react";
import { Menu, X, PanelRight, PanelRightClose } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { useLayoutStyles } from "@core/ui/layout/shared/use-layout-styles";
import { Logo } from "@core/ui/logo";
import { Button } from "@core/ui/button";
import { LanguageSwitcher, ThemeSwitcher } from "@core/ui/layout/common";
import { UserProfileDropdown } from "@core/ui/user-profile-dropdown";
import { Footer } from "@core/ui/layout/shared/footer";
import { NavRenderer } from "@core/ui/layout/shared/nav-renderer";
import { UserCard } from "@core/ui/layout/shared/user-card";
import { LogoutButton } from "@core/ui/layout/shared/logout-button";
import { cn } from "@core/common/utils";

interface MultiPanelLayoutProps {
      children: React.ReactNode;
}

/**
 * Multi-Panel Workbench Layout — IDE-style with left nav + content + right details.
 *
 * Structure:
 * - Header bar
 * - Left sidebar (navigation)
 * - Main content area (center)
 * - Toggleable right panel (inspector/properties)
 * - Mobile: left sidebar = drawer, right panel hidden
 *
 * Inspired by Figma, Linear, Notion columns
 */
export function MultiPanelLayout({ children }: MultiPanelLayoutProps) {
      const { direction, t } = useI18n();
      const settings = useSettings();
      const styles = useLayoutStyles();
      const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
      const [rightPanelOpen, setRightPanelOpen] = useState(true);

      return (
            <div
                  className={cn(
                        "min-h-screen flex flex-col bg-background",
                        styles.getAnimationClass(),
                  )}
                  dir={direction}
            >
                  {/* ── Header ── */}
                  <header
                        className={cn(
                              settings.stickyHeader ? "sticky top-0 z-30" : "relative",
                              "glass border-b border-border",
                              "flex items-center justify-between px-4 h-11",
                        )}
                  >
                        <div className="flex items-center gap-3">
                              <Button
                                    variant="ghost"
                                    size="icon"
                                    className="lg:hidden h-8 w-8"
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                              >
                                    {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                              </Button>
                              <Logo size="sm" />
                              <span className="text-sm font-semibold text-foreground hidden sm:block">
                                    {t("app.title")}
                              </span>
                        </div>
                        <div className="flex items-center gap-2">
                              <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hidden lg:flex"
                                    onClick={() => setRightPanelOpen(!rightPanelOpen)}
                                    title={rightPanelOpen ? "Hide inspector" : "Show inspector"}
                              >
                                    {rightPanelOpen
                                          ? <PanelRightClose className="w-4 h-4" />
                                          : <PanelRight className="w-4 h-4" />}
                              </Button>
                              <LanguageSwitcher />
                              <ThemeSwitcher />
                              <UserProfileDropdown showName={false} />
                        </div>
                  </header>

                  <div className="flex-1 flex overflow-hidden">
                        {/* ── Left Sidebar ── */}
                        <aside
                              className={cn(
                                    "hidden lg:flex flex-col w-56 shrink-0",
                                    "bg-card border-e border-border",
                              )}
                        >
                              <div className="p-3 border-b border-border"><UserCard size="sm" /></div>
                              <div className="flex-1 p-2 overflow-y-auto">
                                    <NavRenderer variant="compact" />
                              </div>
                              <div className="p-2 border-t border-border"><LogoutButton /></div>
                        </aside>

                        {/* ── Mobile Drawer ── */}
                        {mobileMenuOpen && (
                              <>
                                    <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
                                    <aside
                                          dir={direction}
                                          className={cn(
                                                "fixed top-11 bottom-0 w-72 z-40 bg-card border-e border-border flex flex-col lg:hidden",
                                                direction === "rtl" ? "right-0" : "left-0",
                                          )}
                                    >
                                          <div className="p-3 border-b border-border"><UserCard size="sm" /></div>
                                          <div className="flex-1 p-2 overflow-y-auto">
                                                <NavRenderer variant="default" onNavigate={() => setMobileMenuOpen(false)} />
                                          </div>
                                          <div className="p-2 border-t border-border"><LogoutButton /></div>
                                    </aside>
                              </>
                        )}

                        {/* ── Main Content ── */}
                        <main className="flex-1 min-w-0 p-6 overflow-y-auto">
                              <div style={{ borderRadius: "var(--border-radius)" }}>
                                    {children}
                              </div>
                        </main>

                        {/* ── Right Inspector Panel ── */}
                        {rightPanelOpen && (
                              <aside
                                    className={cn(
                                          "hidden lg:flex flex-col w-64 shrink-0",
                                          "bg-card/50 border-s border-border",
                                    )}
                              >
                                    <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                                                {t("common.details") || "Details"}
                                          </span>
                                          <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => setRightPanelOpen(false)}
                                          >
                                                <X className="w-3 h-3" />
                                          </Button>
                                    </div>
                                    <div className="flex-1 p-4 overflow-y-auto">
                                          <div className="space-y-4">
                                                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                                                      <p className="text-xs font-semibold text-muted-foreground mb-1">
                                                            {t("common.status") || "Status"}
                                                      </p>
                                                      <p className="text-sm text-foreground">
                                                            {t("common.active") || "Active"}
                                                      </p>
                                                </div>
                                                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                                                      <p className="text-xs font-semibold text-muted-foreground mb-1">
                                                            {t("common.lastModified") || "Last Modified"}
                                                      </p>
                                                      <p className="text-sm text-foreground">
                                                            {new Date().toLocaleDateString()}
                                                      </p>
                                                </div>
                                          </div>
                                    </div>
                              </aside>
                        )}
                  </div>

                  {settings.showFooter && <Footer />}
            </div>
      );
}
