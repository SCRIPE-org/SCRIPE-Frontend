"use client";

import type React from "react";
import { useState, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@core/ui/button";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { cn } from "@core/common/utils";
import { Logo } from "@core/ui/logo";
import { UserProfileDropdown } from "@core/ui/user-profile-dropdown";
import { LanguageSwitcher, ThemeSwitcher } from "../common";
import { NavRenderer } from "../shared/nav-renderer";
import { LogoutButton } from "../shared/logout-button";
import { Footer } from "../shared/footer";
import { useDynamicNavigation } from "@core/ui/navigation/dynamic-navigation";
import {
      isNavigationItemActive,
      type NavigationItem,
} from "@core/config/navigation";

interface TabbedLayoutProps {
      children: React.ReactNode;
      sidebarOpen: boolean;
      onSidebarOpenChange: (open: boolean) => void;
}

/**
 * Tabbed Layout — Inspired by Google Cloud Console / Jira.
 *
 * Structure:
 * ┌──────────────────────────────────────────┐
 * │ HEADER (56px) — logo, search, profile    │
 * ├──────────────────────────────────────────┤
 * │ TAB BAR (44px) — horizontal scrollable   │
 * ├──────────┬───────────────────────────────┤
 * │ SUB-NAV  │                               │
 * │ (240px)  │       MAIN CONTENT            │
 * │ children │                               │
 * │ of tab   │                               │
 * ├──────────┴───────────────────────────────┤
 * │ FOOTER (if enabled)                      │
 * └──────────────────────────────────────────┘
 */
export function TabbedLayout({
      children,
      sidebarOpen,
      onSidebarOpenChange,
}: TabbedLayoutProps) {
      const pathname = usePathname();
      const { t, direction } = useI18n();
      const { showFooter, collapsibleSidebar } = useSettings();
      const navigation = useDynamicNavigation();

      // Top-level items become tabs
      const tabs = useMemo(
            () => navigation.filter((item) => !item.disabled),
            [navigation]
      );

      // Find the active tab (the top-level item whose children contain the active page)
      const activeTabIndex = useMemo(() => {
            const idx = tabs.findIndex(
                  (tab) =>
                        isNavigationItemActive(tab, pathname) ||
                        tab.children?.some((child) => isNavigationItemActive(child, pathname))
            );
            return idx >= 0 ? idx : 0;
      }, [tabs, pathname]);

      const [selectedTab, setSelectedTab] = useState(activeTabIndex);
      useEffect(() => setSelectedTab(activeTabIndex), [activeTabIndex]);

      const activeTab = tabs[selectedTab];
      const hasSubNav = activeTab?.children && activeTab.children.length > 0;

      return (
            <div
                  className={cn(
                        "min-h-screen bg-background",
                        direction === "rtl" ? "rtl" : "ltr"
                  )}
            >
                  {/* ── HEADER ── */}
                  <header className="fixed top-0 inset-x-0 z-40 h-14 bg-card border-b border-border flex items-center px-4 lg:px-6 backdrop-blur-sm">
                        {/* Left: Logo + Mobile Toggle */}
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

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2">
                              <ThemeSwitcher buttonClassName="hover:bg-accent" contentClassName="bg-popover border-border" />
                              <LanguageSwitcher buttonClassName="hover:bg-accent" contentClassName="bg-popover border-border" />
                              <UserProfileDropdown variant="navigation" showName={false} />
                        </div>
                  </header>

                  {/* ── TAB BAR ── */}
                  <div className="fixed top-14 inset-x-0 z-30 h-11 bg-card/95 backdrop-blur-sm border-b border-border">
                        <div className="h-full flex items-end overflow-x-auto px-4 lg:px-6 gap-0 scrollbar-none">
                              {tabs.map((tab, idx) => {
                                    const Icon = tab.icon;
                                    const isActive = idx === selectedTab;
                                    return (
                                          <button
                                                key={tab.name}
                                                onClick={() => setSelectedTab(idx)}
                                                className={cn(
                                                      "relative flex items-center gap-2 px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors shrink-0",
                                                      isActive
                                                            ? "text-primary"
                                                            : "text-muted-foreground hover:text-foreground"
                                                )}
                                          >
                                                {Icon && <Icon className="w-4 h-4" />}
                                                <span>{tab.name}</span>
                                                {tab.badge && (
                                                      <span className="px-1.5 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                                                            {tab.badge}
                                                      </span>
                                                )}
                                                {/* Active indicator line */}
                                                {isActive && (
                                                      <span className="absolute bottom-0 inset-x-2 h-0.5 bg-primary rounded-full" />
                                                )}
                                          </button>
                                    );
                              })}
                        </div>
                  </div>

                  {/* ── SUB-NAV SIDEBAR (desktop) ── */}
                  {hasSubNav && (
                        <aside
                              className={cn(
                                    "fixed top-[6.25rem] bottom-0 z-20 w-72 bg-card/50 border-e border-border overflow-y-auto hidden lg:block",
                                    direction === "rtl" ? "right-0" : "left-0"
                              )}
                        >
                              <div className="p-3">
                                    <NavRenderer
                                          variant="compact"
                                          items={activeTab!.children!}
                                          onNavigate={() => { }}
                                    />
                              </div>
                              <div className="absolute bottom-0 inset-x-0 p-3 border-t border-border">
                                    <LogoutButton />
                              </div>
                        </aside>
                  )}

                  {/* ── MOBILE SIDEBAR OVERLAY ── */}
                  {sidebarOpen && (
                        <>
                              <div
                                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                                    onClick={() => onSidebarOpenChange(false)}
                              />
                              <aside
                                    className={cn(
                                          "fixed top-0 bottom-0 w-72 z-50 bg-card shadow-2xl lg:hidden overflow-y-auto",
                                          direction === "rtl" ? "right-0" : "left-0"
                                    )}
                              >
                                    <div className="p-4 border-b border-border flex items-center justify-between">
                                          <h2 className="font-semibold">{t("app.title")}</h2>
                                          <Button variant="ghost" size="icon" onClick={() => onSidebarOpenChange(false)}>
                                                <X className="w-4 h-4" />
                                          </Button>
                                    </div>
                                    <div className="p-3">
                                          <NavRenderer
                                                variant="compact"
                                                onNavigate={() => onSidebarOpenChange(false)}
                                          />
                                    </div>
                                    <div className="p-3 border-t border-border mt-auto">
                                          <LogoutButton />
                                    </div>
                              </aside>
                        </>
                  )}

                  {/* ── MAIN CONTENT ── */}
                  <main
                        className={cn(
                              "pt-[6.25rem] transition-all duration-300",
                              hasSubNav ? (direction === "rtl" ? "lg:pr-72" : "lg:pl-72") : ""
                        )}
                  >
                        <div className="p-6 animate-fade-in">{children}</div>
                  </main>

                  {showFooter && <Footer />}
            </div>
      );
}
