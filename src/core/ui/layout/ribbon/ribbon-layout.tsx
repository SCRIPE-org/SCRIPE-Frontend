"use client";

import type React from "react";
import { useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
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

interface RibbonLayoutProps {
      children: React.ReactNode;
}

/**
 * Ribbon Layout — Microsoft Office-inspired tabbed toolbar.
 *
 * Structure:
 * - Top header with logo + actions
 * - Ribbon tabs row (selectable tab groups)
 * - Ribbon panel (shows grouped action buttons for selected tab)
 * - Full-width content below
 * - Mobile: ribbon collapses to single icon row
 *
 * Inspired by Microsoft Office 365, Google Docs toolbar
 */
export function RibbonLayout({ children }: RibbonLayoutProps) {
      const { direction, t } = useI18n();
      const settings = useSettings();
      const styles = useLayoutStyles();
      const pathname = usePathname();
      const router = useRouter();
      const navigation = useDynamicNavigation();
      const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

      // Group top-level nav items as "ribbon tabs"
      const ribbonTabs = useMemo(() => {
            return navigation.filter(
                  (item) => item.children && item.children.length > 0,
            );
      }, [navigation]);

      const directItems = useMemo(() => {
            return navigation.filter(
                  (item) => item.href && (!item.children || item.children.length === 0),
            );
      }, [navigation]);

      // Active tab is auto-detected from pathname
      const activeTab = useMemo(() => {
            for (const tab of ribbonTabs) {
                  if (tab.children) {
                        for (const child of tab.children) {
                              if (child.href && isNavigationItemActive(child, pathname)) {
                                    return tab.name;
                              }
                        }
                  }
            }
            return ribbonTabs[0]?.name || null;
      }, [ribbonTabs, pathname]);

      const activeTabItems = useMemo(() => {
            const tab = ribbonTabs.find((t) => t.name === activeTab);
            return tab?.children || [];
      }, [ribbonTabs, activeTab]);

      const [selectedTab, setSelectedTab] = useState<string | null>(null);
      const currentTab = selectedTab || activeTab;
      const currentTabItems = useMemo(() => {
            const tab = ribbonTabs.find((t) => t.name === currentTab);
            return tab?.children || [];
      }, [ribbonTabs, currentTab]);

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
                              "bg-card border-b border-border",
                        )}
                  >
                        {/* Title bar */}
                        <div className="flex items-center justify-between h-11 px-4">
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
                                    <LanguageSwitcher />
                                    <ThemeSwitcher />
                                    <UserProfileDropdown showName={false} />
                              </div>
                        </div>

                        {/* Ribbon tabs */}
                        <div className="hidden lg:flex items-center gap-0 px-4 border-b border-border/50">
                              {/* Direct nav items first */}
                              {directItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = isNavigationItemActive(item, pathname);
                                    return (
                                          <button
                                                key={item.name}
                                                onClick={() => item.href && router.push(item.href)}
                                                className={cn(
                                                      "flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors -mb-px",
                                                      isActive
                                                            ? "border-primary text-primary"
                                                            : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30",
                                                )}
                                          >
                                                {Icon && <Icon className="w-3.5 h-3.5" />}
                                                {t(item.name) || item.name}
                                          </button>
                                    );
                              })}

                              {/* Separator */}
                              {directItems.length > 0 && ribbonTabs.length > 0 && (
                                    <div className="w-px h-5 bg-border mx-1" />
                              )}

                              {/* Group tabs */}
                              {ribbonTabs.map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = currentTab === tab.name;
                                    return (
                                          <button
                                                key={tab.name}
                                                onClick={() => setSelectedTab(tab.name)}
                                                className={cn(
                                                      "flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors -mb-px",
                                                      isActive
                                                            ? "border-primary text-primary bg-primary/5"
                                                            : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30",
                                                )}
                                          >
                                                {Icon && <Icon className="w-3.5 h-3.5" />}
                                                {t(tab.name) || tab.name}
                                          </button>
                                    );
                              })}
                        </div>

                        {/* Ribbon panel — grouped action buttons for selected tab */}
                        {currentTabItems.length > 0 && (
                              <div className="hidden lg:flex items-center gap-1 px-4 py-2 bg-muted/30">
                                    {currentTabItems.map((item) => {
                                          const Icon = item.icon;
                                          const isActive = item.href && isNavigationItemActive(item, pathname);
                                          return (
                                                <button
                                                      key={item.name}
                                                      onClick={() => item.href && router.push(item.href)}
                                                      className={cn(
                                                            "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[64px]",
                                                            isActive
                                                                  ? "bg-primary/10 text-primary"
                                                                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                                                      )}
                                                >
                                                      {Icon && <Icon className="w-5 h-5" />}
                                                      <span className="text-[10px] font-medium leading-none text-center">
                                                            {t(item.name) || item.name}
                                                      </span>
                                                </button>
                                          );
                                    })}
                              </div>
                        )}
                  </header>

                  {/* ── Mobile Drawer ── */}
                  {mobileMenuOpen && (
                        <>
                              <div
                                    className="fixed inset-0 z-30 bg-black/30 lg:hidden"
                                    onClick={() => setMobileMenuOpen(false)}
                              />
                              <aside
                                    dir={direction}
                                    className={cn(
                                          "fixed top-0 bottom-0 w-80 z-40 bg-card border-e border-border overflow-y-auto flex flex-col lg:hidden",
                                          direction === "rtl" ? "right-0" : "left-0",
                                    )}
                              >
                                    <div className="flex items-center justify-between p-4 border-b border-border">
                                          <Logo size="sm" />
                                          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                                                <X className="w-4 h-4" />
                                          </Button>
                                    </div>
                                    <div className="p-3 border-b border-border">
                                          <UserCard size="sm" />
                                    </div>
                                    <div className="flex-1 p-3 overflow-y-auto">
                                          <NavRenderer variant="default" onNavigate={() => setMobileMenuOpen(false)} />
                                    </div>
                                    <div className="p-3 border-t border-border">
                                          <LogoutButton />
                                    </div>
                              </aside>
                        </>
                  )}

                  {/* ── Content ── */}
                  <main className="flex-1 p-6">
                        <div style={{ borderRadius: "var(--border-radius)" }}>
                              {children}
                        </div>
                  </main>

                  {settings.showFooter && <Footer />}
            </div>
      );
}
