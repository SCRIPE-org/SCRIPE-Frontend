"use client";

import type React from "react";
import { useState, useCallback, useRef, useEffect } from "react";
import { Menu, X, Pin, PinOff } from "lucide-react";
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

interface StackedLayoutProps {
      children: React.ReactNode;
}

/**
 * Stacked Layout — Inspired by Notion / Apple Notes / Obsidian.
 *
 * Full-width content with an overlay drawer sidebar.
 * The drawer can be pinned to push content instead of overlaying.
 *
 * Structure (unpinned):
 * ┌──────────────────────────────────┐
 * │ HEADER (56px) — ☰ toggle        │
 * ├──────────────────────────────────┤
 * │                                  │
 * │      FULL-WIDTH CONTENT          │  ← drawer overlays
 * │                                  │
 * └──────────────────────────────────┘
 *
 * Structure (pinned):
 * ┌──────────────────────────────────┐
 * │ HEADER (56px) — ☰ toggle        │
 * ├──────────┬───────────────────────┤
 * │ DRAWER   │                       │
 * │ (300px)  │  MAIN CONTENT         │  ← content pushed
 * │ pinned   │                       │
 * ├──────────┴───────────────────────┤
 * │ FOOTER                           │
 * └──────────────────────────────────┘
 */
export function StackedLayout({ children }: StackedLayoutProps) {
      const { t, direction } = useI18n();
      const { showFooter } = useSettings();
      const [drawerOpen, setDrawerOpen] = useState(false);
      const [pinned, setPinned] = useState(false);
      const drawerRef = useRef<HTMLDivElement>(null);
      const edgeRef = useRef<HTMLDivElement>(null);

      // Edge-hover trigger (4px strip at the start edge)
      const handleEdgeHover = useCallback(() => {
            if (!pinned && !drawerOpen) {
                  setDrawerOpen(true);
            }
      }, [pinned, drawerOpen]);

      // Close drawer when clicking outside (unpinned mode)
      useEffect(() => {
            if (!drawerOpen || pinned) return;
            const handler = (e: MouseEvent) => {
                  if (
                        drawerRef.current &&
                        !drawerRef.current.contains(e.target as Node)
                  ) {
                        setDrawerOpen(false);
                  }
            };
            document.addEventListener("mousedown", handler);
            return () => document.removeEventListener("mousedown", handler);
      }, [drawerOpen, pinned]);

      const isDrawerVisible = drawerOpen || pinned;

      return (
            <div
                  className={cn(
                        "min-h-screen bg-background",
                        direction === "rtl" ? "rtl" : "ltr"
                  )}
            >
                  {/* ── EDGE HOVER TRIGGER ── */}
                  {!pinned && !drawerOpen && (
                        <div
                              ref={edgeRef}
                              className={cn(
                                    "fixed top-14 bottom-0 w-1 z-30 hover:w-2 transition-all cursor-pointer",
                                    "hover:bg-primary/20",
                                    direction === "rtl" ? "right-0" : "left-0"
                              )}
                              onMouseEnter={handleEdgeHover}
                        />
                  )}

                  {/* ── HEADER ── */}
                  <header className="fixed top-0 inset-x-0 z-40 h-14 bg-card border-b border-border flex items-center px-4 lg:px-6 backdrop-blur-sm">
                        <div className="flex items-center gap-3 shrink-0">
                              <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setDrawerOpen(!drawerOpen)}
                              >
                                    {drawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
                              <ThemeSwitcher buttonClassName="hover:bg-accent" contentClassName="bg-popover border-border" />
                              <LanguageSwitcher buttonClassName="hover:bg-accent" contentClassName="bg-popover border-border" />
                              <UserProfileDropdown variant="navigation" showName={false} />
                        </div>
                  </header>

                  {/* ── DRAWER OVERLAY (unpinned mode) ── */}
                  {drawerOpen && !pinned && (
                        <div
                              className="fixed inset-0 bg-black/30 z-30 backdrop-blur-[2px]"
                              onClick={() => setDrawerOpen(false)}
                        />
                  )}

                  {/* ── DRAWER SIDEBAR ── */}
                  <aside
                        ref={drawerRef}
                        className={cn(
                              "fixed top-14 bottom-0 z-40 w-[300px] bg-card border-e border-border shadow-2xl overflow-y-auto flex flex-col transition-transform duration-300",
                              direction === "rtl" ? "right-0" : "left-0",
                              isDrawerVisible
                                    ? "translate-x-0"
                                    : direction === "rtl"
                                          ? "translate-x-full"
                                          : "-translate-x-full"
                        )}
                  >
                        {/* Pin toggle */}
                        <div className="flex items-center justify-between p-3 border-b border-border">
                              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    {t("layout.navigation") || "Navigation"}
                              </span>
                              <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => {
                                          setPinned(!pinned);
                                          if (!pinned) setDrawerOpen(true);
                                    }}
                                    title={pinned ? "Unpin sidebar" : "Pin sidebar"}
                              >
                                    {pinned ? (
                                          <PinOff className="w-3.5 h-3.5 text-primary" />
                                    ) : (
                                          <Pin className="w-3.5 h-3.5 text-muted-foreground" />
                                    )}
                              </Button>
                        </div>

                        {/* User card */}
                        <div className="p-3 border-b border-border">
                              <UserCard size="sm" />
                        </div>

                        {/* Navigation */}
                        <div className="flex-1 p-3 overflow-y-auto">
                              <NavRenderer
                                    variant="default"
                                    onNavigate={() => {
                                          if (!pinned) setDrawerOpen(false);
                                    }}
                              />
                        </div>

                        {/* Logout */}
                        <div className="p-3 border-t border-border">
                              <LogoutButton />
                        </div>
                  </aside>

                  {/* ── MAIN CONTENT ── */}
                  <main
                        className={cn(
                              "pt-14 transition-all duration-300",
                              pinned && (direction === "rtl" ? "lg:pr-[300px]" : "lg:pl-[300px]")
                        )}
                  >
                        <div className="p-6 animate-fade-in">{children}</div>
                  </main>

                  {showFooter && <Footer />}
            </div>
      );
}
