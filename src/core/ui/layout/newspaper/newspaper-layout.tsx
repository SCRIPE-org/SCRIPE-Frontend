"use client";

import type React from "react";
import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { useLayoutStyles } from "@core/ui/layout/shared/use-layout-styles";
import { Logo } from "@core/ui/logo";
import { Button } from "@core/ui/button";
import { LanguageSwitcher, ThemeSwitcher, HeaderSearch } from "@core/ui/layout/common";
import { UserProfileDropdown } from "@core/ui/user-profile-dropdown";
import { Footer } from "@core/ui/layout/shared/footer";
import { useDynamicNavigation } from "@core/ui/navigation/dynamic-navigation";
import {
      isNavigationItemActive,
      type NavigationItem,
} from "@core/config/navigation";
import { Bell, Home } from "lucide-react";
import { cn } from "@core/common/utils";

interface NewspaperLayoutProps {
      children: React.ReactNode;
}

/**
 * Newspaper Layout — Multi-column grid flow.
 *
 * Structure:
 * - No sidebar
 * - Masthead header with logo, search, actions
 * - Horizontal tab nav for modules
 * - Content uses CSS for dense information display
 * - Thin column dividers, compact spacing
 *
 * Inspired by Bloomberg Terminal, Financial Times, Google News
 */
export function NewspaperLayout({ children }: NewspaperLayoutProps) {
      const { direction, t } = useI18n();
      const settings = useSettings();
      const styles = useLayoutStyles();
      const pathname = usePathname();
      const router = useRouter();
      const navigation = useDynamicNavigation();
      const isRTL = direction === "rtl";

      // Top-level tabs
      const tabItems = useMemo(() => {
            const items: NavigationItem[] = [];
            for (const item of navigation) {
                  if (item.href) items.push(item);
                  else if (item.children) {
                        items.push(item);
                  }
            }
            return items;
      }, [navigation]);

      const activeTab = useMemo(() => {
            for (const item of navigation) {
                  if (item.href && isNavigationItemActive(item, pathname)) return item;
                  if (item.children) {
                        for (const child of item.children) {
                              if (child.href && isNavigationItemActive(child, pathname)) return item;
                        }
                  }
            }
            return navigation[0] || null;
      }, [navigation, pathname]);

      return (
            <div
                  className={cn("min-h-screen flex flex-col bg-background", styles.getAnimationClass())}
                  dir={direction}
            >
                  {/* ── Masthead Header ── */}
                  <header
                        className={cn(
                              settings.stickyHeader ? "sticky top-0 z-30" : "relative",
                              "bg-card border-b-2 border-foreground/10",
                        )}
                  >
                        {/* Top utility bar */}
                        <div className="flex items-center justify-between px-6 h-8 text-xs text-muted-foreground border-b border-border/50">
                              <div className="flex items-center gap-3">
                                    <span>{new Date().toLocaleDateString(direction === "rtl" ? "ar" : "en", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                    <LanguageSwitcher />
                                    <ThemeSwitcher />
                              </div>
                        </div>

                        {/* Masthead */}
                        <div className="flex items-center justify-between px-6 py-3">
                              <div className="flex items-center gap-4">
                                    <Logo size="md" />
                                    <div className="hidden md:block h-8 w-px bg-border" />
                                    <span className="hidden md:block text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                                          {t("common.dashboard") || "Dashboard"}
                                    </span>
                              </div>
                              <div className="flex items-center gap-3">
                                    <HeaderSearch
                                          containerClassName="hidden md:block"
                                          inputClassName="bg-muted/40 border border-border focus:bg-background w-60 rounded-md text-sm"
                                          iconClassName={isRTL ? "right-2.5 left-auto" : "left-2.5"}
                                    />
                                    <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => router.push("/")}>
                                          <Home className="w-4 h-4" />
                                    </Button>
                                    {settings.showNotifications && (
                                          <Button variant="ghost" size="icon" className="w-8 h-8">
                                                <Bell className="w-4 h-4" />
                                          </Button>
                                    )}
                                    <UserProfileDropdown showName={false} />
                              </div>
                        </div>

                        {/* Navigation tabs */}
                        <div className="border-t border-border/50">
                              <div className="flex items-center px-6 overflow-x-auto scrollbar-hide">
                                    {tabItems.map((tab) => {
                                          const isActive = tab === activeTab;
                                          const Icon = tab.icon;
                                          return (
                                                <button
                                                      key={tab.name}
                                                      onClick={() => {
                                                            if (tab.href) router.push(tab.href);
                                                            else if (tab.children?.[0]?.href) router.push(tab.children[0].href);
                                                      }}
                                                      className={cn(
                                                            "flex items-center gap-1.5 px-4 py-2 text-xs font-semibold uppercase tracking-wider whitespace-nowrap",
                                                            "border-b-2 -mb-px transition-colors",
                                                            isActive
                                                                  ? "border-foreground text-foreground"
                                                                  : "border-transparent text-muted-foreground hover:text-foreground",
                                                      )}
                                                >
                                                      {Icon && <Icon className="w-3.5 h-3.5" />}
                                                      {t(tab.name) || tab.name}
                                                </button>
                                          );
                                    })}
                              </div>
                        </div>
                  </header>

                  {/* ── Content Area ── */}
                  <main className="flex-1 px-6 py-6">
                        <div className="max-w-7xl mx-auto">
                              {children}
                        </div>
                  </main>

                  {settings.showFooter && <Footer />}
            </div>
      );
}
