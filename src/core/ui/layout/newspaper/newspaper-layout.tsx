"use client";

import type React from "react";
import { useState, useMemo, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { useLayoutStyles } from "@core/ui/layout/shared/use-layout-styles";
import { Logo } from "@core/ui/logo";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { LanguageSwitcher, ThemeSwitcher, HeaderSearch } from "@core/ui/layout/common";
import { UserProfileDropdown } from "@core/ui/user-profile-dropdown";
import { Footer } from "@core/ui/layout/shared/footer";
import { useDynamicNavigation } from "@core/ui/navigation/dynamic-navigation";
import {
      isNavigationItemActive,
      type NavigationItem,
} from "@core/config/navigation";
import { Bell, Home, ChevronDown } from "lucide-react";
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
 * - Horizontal tab nav for modules (tabs with children show dropdown)
 * - Content uses CSS for dense information display
 * - Badge counts on tabs
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

      const [openDropdown, setOpenDropdown] = useState<string | null>(null);
      const dropdownRef = useRef<HTMLDivElement>(null);

      // Close dropdown on click outside
      useEffect(() => {
            const handler = (e: MouseEvent) => {
                  if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                        setOpenDropdown(null);
                  }
            };
            document.addEventListener("mousedown", handler);
            return () => document.removeEventListener("mousedown", handler);
      }, []);

      // Close on route change
      useEffect(() => {
            setOpenDropdown(null);
      }, [pathname]);

      // Active tab
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

      // Badge helper
      const getGroupBadge = (item: NavigationItem): string | number | undefined => {
            if (item.badge) return item.badge;
            if (item.children) {
                  let total = 0;
                  for (const child of item.children) {
                        if (child.badge && typeof child.badge === "number") total += child.badge;
                        else if (child.badge) return child.badge;
                  }
                  return total > 0 ? total : undefined;
            }
            return undefined;
      };

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

                        {/* Navigation tabs with dropdowns */}
                        <div className="border-t border-border/50" ref={dropdownRef}>
                              <div className="flex items-center flex-wrap px-6">
                                    {navigation.map((tab) => {
                                          const isActive = tab === activeTab;
                                          const Icon = tab.icon;
                                          const hasChildren = tab.children && tab.children.length > 0;
                                          const isDropdownOpen = openDropdown === tab.name;
                                          const badge = getGroupBadge(tab);

                                          return (
                                                <div key={tab.name} className="relative">
                                                      <button
                                                            onClick={() => {
                                                                  if (hasChildren) {
                                                                        setOpenDropdown(isDropdownOpen ? null : tab.name);
                                                                  } else if (tab.href) {
                                                                        router.push(tab.href);
                                                                  }
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
                                                            {badge && (
                                                                  <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 min-w-[14px] bg-primary/10 text-primary">
                                                                        {badge}
                                                                  </Badge>
                                                            )}
                                                            {hasChildren && (
                                                                  <ChevronDown className={cn(
                                                                        "w-3 h-3 transition-transform",
                                                                        isDropdownOpen && "rotate-180",
                                                                  )} />
                                                            )}
                                                      </button>

                                                      {/* Dropdown for children */}
                                                      {hasChildren && isDropdownOpen && (
                                                            <div className={cn(
                                                                  "absolute top-full mt-1 z-50",
                                                                  "min-w-[200px] py-1",
                                                                  "rounded-lg border border-border bg-card shadow-xl",
                                                                  "animate-in fade-in slide-in-from-top-1 duration-150",
                                                                  isRTL ? "right-0" : "left-0",
                                                            )}>
                                                                  {tab.children!.map((child) => {
                                                                        const childActive = child.href && isNavigationItemActive(child, pathname);
                                                                        const ChildIcon = child.icon;
                                                                        return (
                                                                              <button
                                                                                    key={child.name}
                                                                                    onClick={() => {
                                                                                          if (child.href) {
                                                                                                router.push(child.href);
                                                                                                setOpenDropdown(null);
                                                                                          }
                                                                                    }}
                                                                                    className={cn(
                                                                                          "flex items-center gap-2.5 w-full px-4 py-2 text-sm transition-colors",
                                                                                          childActive
                                                                                                ? "bg-primary/10 text-primary font-medium"
                                                                                                : "text-foreground/80 hover:bg-muted/60 hover:text-foreground",
                                                                                    )}
                                                                              >
                                                                                    {ChildIcon && <ChildIcon className="w-3.5 h-3.5 shrink-0" />}
                                                                                    <span className="flex-1 text-start">{t(child.name) || child.name}</span>
                                                                                    {child.badge && (
                                                                                          <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 bg-primary/10 text-primary">
                                                                                                {child.badge}
                                                                                          </Badge>
                                                                                    )}
                                                                              </button>
                                                                        );
                                                                  })}
                                                            </div>
                                                      )}
                                                </div>
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
