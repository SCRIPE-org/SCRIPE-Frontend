"use client";

import type React from "react";
import { useState } from "react";
import { Menu, X, PanelRightClose, PanelRightOpen } from "lucide-react";
import { Button } from "@core/ui/button";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { cn } from "@core/common/utils";
import { Logo } from "@core/ui/logo";
import { UserProfileDropdown } from "@core/ui/user-profile-dropdown";
import { LanguageSwitcher, ThemeSwitcher } from "../common";
import { NavRenderer } from "../shared/nav-renderer";
import { UserCard } from "../shared/user-card";
import { LogoutButton } from "../shared/logout-button";
import { Footer } from "../shared/footer";

interface DualLayoutProps {
      children: React.ReactNode;
      sidebarOpen: boolean;
      onSidebarOpenChange: (open: boolean) => void;
}

/**
 * Dual Layout — Inspired by Slack / Outlook / Teams.
 *
 * Structure:
 * ┌──────────────────────────────────────────────┐
 * │ HEADER (56px) — logo, search, profile        │
 * ├──────────┬─────────────┬─────────────────────┤
 * │ LEFT NAV │             │ DETAIL PANEL        │
 * │ (240px)  │ MAIN CONTENT│ (320px, toggleable) │
 * │          │             │                     │
 * │          │             │                     │
 * ├──────────┴─────────────┴─────────────────────┤
 * │ FOOTER (if enabled)                          │
 * └──────────────────────────────────────────────┘
 */
export function DualLayout({
      children,
      sidebarOpen,
      onSidebarOpenChange,
}: DualLayoutProps) {
      const { t, direction } = useI18n();
      const { showFooter } = useSettings();
      const [detailOpen, setDetailOpen] = useState(false);

      return (
            <div
                  className={cn(
                        "min-h-screen bg-background",
                        direction === "rtl" ? "rtl" : "ltr"
                  )}
            >
                  {/* ── HEADER ── */}
                  <header className="fixed top-0 inset-x-0 z-40 h-14 bg-card border-b border-border flex items-center px-4 lg:px-6 backdrop-blur-sm">
                        <div className="flex items-center gap-3 shrink-0">
                              <Button
                                    variant="ghost"
                                    size="icon"
                                    className="lg:hidden"
                                    onClick={() => onSidebarOpenChange(!sidebarOpen)}
                              >
                                    {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                              </Button>
                              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                    <Logo size="sm" className="text-primary-foreground" />
                              </div>
                              <h1 className="text-base font-semibold text-foreground hidden sm:block">
                                    {t("app.title")}
                              </h1>
                        </div>

                        <div className="flex-1" />

                        <div className="flex items-center gap-2">
                              {/* Detail panel toggle (desktop) */}
                              <Button
                                    variant="ghost"
                                    size="icon"
                                    className="hidden lg:flex"
                                    onClick={() => setDetailOpen(!detailOpen)}
                                    title={detailOpen ? "Close detail panel" : "Open detail panel"}
                              >
                                    {detailOpen ? (
                                          <PanelRightClose className="w-5 h-5" />
                                    ) : (
                                          <PanelRightOpen className="w-5 h-5" />
                                    )}
                              </Button>
                              <ThemeSwitcher buttonClassName="hover:bg-accent" contentClassName="bg-popover border-border" />
                              <LanguageSwitcher buttonClassName="hover:bg-accent" contentClassName="bg-popover border-border" />
                              <UserProfileDropdown variant="navigation" showName={false} />
                        </div>
                  </header>

                  {/* ── LEFT SIDEBAR (desktop) ── */}
                  <aside
                        className={cn(
                              "fixed top-14 bottom-0 z-20 w-60 bg-sidebar border-e border-sidebar-border overflow-y-auto hidden lg:flex flex-col",
                              direction === "rtl" ? "right-0" : "left-0"
                        )}
                  >
                        <div className="p-4 border-b border-sidebar-border">
                              <UserCard size="sm" />
                        </div>
                        <div className="flex-1 p-3 overflow-y-auto">
                              <NavRenderer variant="default" onNavigate={() => { }} />
                        </div>
                        <div className="p-3 border-t border-sidebar-border">
                              <LogoutButton />
                        </div>
                  </aside>

                  {/* ── MOBILE SIDEBAR OVERLAY ── */}
                  {sidebarOpen && (
                        <>
                              <div
                                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                                    onClick={() => onSidebarOpenChange(false)}
                              />
                              <aside
                                    className={cn(
                                          "fixed top-0 bottom-0 w-72 z-50 bg-card shadow-2xl lg:hidden overflow-y-auto flex flex-col",
                                          direction === "rtl" ? "right-0" : "left-0"
                                    )}
                              >
                                    <div className="p-4 border-b border-border flex items-center justify-between">
                                          <h2 className="font-semibold">{t("app.title")}</h2>
                                          <Button variant="ghost" size="icon" onClick={() => onSidebarOpenChange(false)}>
                                                <X className="w-4 h-4" />
                                          </Button>
                                    </div>
                                    <div className="p-3 flex-1 overflow-y-auto">
                                          <NavRenderer variant="compact" onNavigate={() => onSidebarOpenChange(false)} />
                                    </div>
                                    <div className="p-3 border-t border-border">
                                          <LogoutButton />
                                    </div>
                              </aside>
                        </>
                  )}

                  {/* ── DETAIL PANEL (desktop) ── */}
                  <aside
                        className={cn(
                              "fixed top-14 bottom-0 z-20 w-80 bg-card border-s border-border transition-transform duration-300 overflow-y-auto hidden lg:block",
                              direction === "rtl" ? "left-0" : "right-0",
                              detailOpen
                                    ? "translate-x-0"
                                    : direction === "rtl"
                                          ? "-translate-x-full"
                                          : "translate-x-full"
                        )}
                  >
                        <div className="p-4 border-b border-border">
                              <h3 className="font-semibold text-sm text-foreground">
                                    {t("layout.detail_panel") || "Details"}
                              </h3>
                        </div>
                        <div className="p-4 text-sm text-muted-foreground">
                              {t("layout.detail_placeholder") || "Select an item to see details here."}
                        </div>
                  </aside>

                  {/* ── MAIN CONTENT ── */}
                  <main
                        className={cn(
                              "pt-14 transition-all duration-300",
                              direction === "rtl" ? "lg:pr-60" : "lg:pl-60",
                              detailOpen && (direction === "rtl" ? "lg:pl-80" : "lg:pr-80")
                        )}
                  >
                        <div className="p-6 animate-fade-in">{children}</div>
                  </main>

                  {showFooter && <Footer />}
            </div>
      );
}
