"use client";

import type React from "react";
import { useState } from "react";
import { Menu, X, PanelBottomClose, PanelBottomOpen } from "lucide-react";
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

interface SplitPaneLayoutProps {
      children: React.ReactNode;
}

/**
 * Split Pane / IDE Layout — Sidebar + content + resizable bottom panel.
 *
 * Structure:
 * - Header bar
 * - Left nav sidebar (240px)
 * - Main content area
 * - Toggleable bottom panel (activity/logs/console)
 * - Mobile: sidebar as hamburger, bottom panel hidden
 *
 * Inspired by VS Code, Outlook, Figma
 */
export function SplitPaneLayout({ children }: SplitPaneLayoutProps) {
      const { direction, t } = useI18n();
      const settings = useSettings();
      const styles = useLayoutStyles();
      const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
      const [bottomPanelOpen, setBottomPanelOpen] = useState(false);

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
                              {/* Bottom panel toggle */}
                              <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hidden lg:flex"
                                    onClick={() => setBottomPanelOpen(!bottomPanelOpen)}
                                    title={bottomPanelOpen ? "Hide panel" : "Show panel"}
                              >
                                    {bottomPanelOpen
                                          ? <PanelBottomClose className="w-4 h-4" />
                                          : <PanelBottomOpen className="w-4 h-4" />}
                              </Button>
                              <LanguageSwitcher />
                              <ThemeSwitcher />
                              <UserProfileDropdown showName={false} />
                        </div>
                  </header>

                  <div className="flex-1 flex overflow-hidden">
                        {/* ── Desktop Sidebar ── */}
                        <aside
                              className={cn(
                                    "hidden lg:flex flex-col w-60 shrink-0",
                                    "bg-card border-e border-border",
                              )}
                        >
                              <div className="p-3 border-b border-border">
                                    <UserCard size="sm" />
                              </div>
                              <div className="flex-1 p-2 overflow-y-auto">
                                    <NavRenderer variant="compact" />
                              </div>
                              <div className="p-2 border-t border-border">
                                    <LogoutButton />
                              </div>
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

                        {/* ── Content + Bottom Panel ── */}
                        <div className="flex-1 flex flex-col min-w-0">
                              <main className="flex-1 p-6 overflow-y-auto">
                                    <div style={{ borderRadius: "var(--border-radius)" }}>
                                          {children}
                                    </div>
                              </main>

                              {/* Bottom Panel */}
                              {bottomPanelOpen && (
                                    <div className="hidden lg:block border-t border-border bg-card h-44 shrink-0">
                                          <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
                                                <div className="flex items-center gap-4">
                                                      <span className="text-xs font-semibold text-primary">
                                                            {t("common.output") || "Output"}
                                                      </span>
                                                      <span className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                                                            {t("common.activity") || "Activity"}
                                                      </span>
                                                      <span className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                                                            {t("common.console") || "Console"}
                                                      </span>
                                                </div>
                                                <Button
                                                      variant="ghost"
                                                      size="icon"
                                                      className="h-6 w-6"
                                                      onClick={() => setBottomPanelOpen(false)}
                                                >
                                                      <X className="w-3 h-3" />
                                                </Button>
                                          </div>
                                          <div className="p-3 text-xs font-mono text-muted-foreground overflow-y-auto h-[calc(100%-36px)]">
                                                <div className="space-y-1">
                                                      <p><span className="text-muted-foreground/60">[info]</span> {t("common.ready") || "System ready"}</p>
                                                      <p><span className="text-green-500">[ok]</span> {t("common.connected") || "Connected"}</p>
                                                </div>
                                          </div>
                                    </div>
                              )}
                        </div>
                  </div>

                  {settings.showFooter && <Footer />}
            </div>
      );
}
