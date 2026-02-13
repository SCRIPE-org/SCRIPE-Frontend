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
import { ScrollArea } from "@core/ui/scroll-area";
import { LanguageSwitcher, ThemeSwitcher } from "@core/ui/layout/common";
import { UserProfileDropdown } from "@core/ui/user-profile-dropdown";
import { NavRenderer } from "@core/ui/layout/shared/nav-renderer";
import { Footer } from "@core/ui/layout/shared/footer";
import { useDynamicNavigation } from "@core/ui/navigation/dynamic-navigation";
import {
      isNavigationItemActive,
      getFlatNavigationItems,
      type NavigationItem,
} from "@core/config/navigation";
import { Bell, Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@core/common/utils";

interface CinemaLayoutProps {
      children: React.ReactNode;
}

/**
 * Cinema Layout — Immersive hero + horizontal carousels.
 *
 * Structure:
 * - No persistent sidebar (overlay-only when triggered)
 * - Horizontal scrollable nav in transparent header
 * - If items overflow, a "More" dropdown shows remaining items
 * - Hero section at top with gradient background
 * - Content below in full width
 * - Dark immersive design
 * - Badge counts on nav items
 *
 * Inspired by Netflix, Spotify, Apple TV+, Disney+
 */
export function CinemaLayout({ children }: CinemaLayoutProps) {
      const { direction, t } = useI18n();
      const settings = useSettings();
      const styles = useLayoutStyles();
      const pathname = usePathname();
      const router = useRouter();
      const navigation = useDynamicNavigation();
      const flatItems = useMemo(() => getFlatNavigationItems(navigation), [navigation]);
      const isRTL = direction === "rtl";

      const [sidebarOpen, setSidebarOpen] = useState(false);
      const [scrolled, setScrolled] = useState(false);
      const [moreOpen, setMoreOpen] = useState(false);
      const moreRef = useRef<HTMLDivElement>(null);

      // Track scroll for header transparency
      useEffect(() => {
            const handler = () => setScrolled(window.scrollY > 50);
            window.addEventListener("scroll", handler, { passive: true });
            return () => window.removeEventListener("scroll", handler);
      }, []);

      // Close "More" dropdown on outside click
      useEffect(() => {
            const handler = (e: MouseEvent) => {
                  if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
                        setMoreOpen(false);
                  }
            };
            document.addEventListener("mousedown", handler);
            return () => document.removeEventListener("mousedown", handler);
      }, []);

      // Close on route change
      useEffect(() => {
            setMoreOpen(false);
      }, [pathname]);

      // Flatten navigation for horizontal nav — ALL items, no cap
      const navItems = useMemo(() => {
            const items: { label: string; href: string; active: boolean; icon?: React.ComponentType<{ className?: string }>; badge?: string | number }[] = [];
            for (const item of navigation) {
                  if (item.href) {
                        items.push({
                              label: t(item.name) || item.name,
                              href: item.href,
                              active: isNavigationItemActive(item, pathname),
                              icon: item.icon,
                              badge: item.badge,
                        });
                  }
                  if (item.children) {
                        for (const child of item.children) {
                              if (child.href) {
                                    items.push({
                                          label: t(child.name) || child.name,
                                          href: child.href,
                                          active: isNavigationItemActive(child, pathname),
                                          icon: child.icon,
                                          badge: child.badge,
                                    });
                              }
                        }
                  }
            }
            return items;
      }, [navigation, pathname, t]);

      // Split: show first 8 inline, rest in "More" dropdown
      const VISIBLE_LIMIT = 8;
      const visibleItems = navItems.slice(0, VISIBLE_LIMIT);
      const overflowItems = navItems.slice(VISIBLE_LIMIT);

      // Get current page title
      const currentTitle = useMemo(() => {
            for (const item of flatItems) {
                  if (item.href && isNavigationItemActive(item, pathname)) {
                        return t(item.name) || item.name;
                  }
            }
            return t("common.welcome") || "Welcome";
      }, [flatItems, pathname, t]);

      return (
            <div
                  className={cn("min-h-screen flex flex-col", styles.getAnimationClass())}
                  dir={direction}
            >
                  {/* ── Transparent/Solid Header ── */}
                  <header
                        className={cn(
                              "sticky top-0 z-30",
                              "transition-all duration-300",
                              scrolled
                                    ? "bg-background/95 backdrop-blur-md border-b border-border shadow-sm"
                                    : "bg-transparent",
                        )}
                  >
                        <div className="flex items-center justify-between px-6 h-14">
                              <div className="flex items-center gap-4">
                                    <Button
                                          variant="ghost"
                                          size="icon"
                                          className={cn(scrolled ? "" : "text-white hover:bg-white/10")}
                                          onClick={() => setSidebarOpen(true)}
                                    >
                                          <Menu className="w-5 h-5" />
                                    </Button>
                                    <Logo size="sm" />
                              </div>

                              {/* Horizontal nav */}
                              <nav className="hidden lg:flex items-center flex-wrap gap-1">
                                    {visibleItems.map((item) => (
                                          <button
                                                key={item.href}
                                                onClick={() => router.push(item.href)}
                                                className={cn(
                                                      "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors",
                                                      item.active
                                                            ? scrolled
                                                                  ? "bg-primary/10 text-primary"
                                                                  : "bg-white/20 text-white"
                                                            : scrolled
                                                                  ? "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                                                  : "text-white/70 hover:text-white hover:bg-white/10",
                                                )}
                                          >
                                                {item.label}
                                                {item.badge && (
                                                      <Badge variant="secondary" className={cn(
                                                            "text-[10px] px-1 py-0 h-4 min-w-[14px]",
                                                            item.active
                                                                  ? scrolled ? "bg-primary/15 text-primary" : "bg-white/25 text-white"
                                                                  : scrolled ? "bg-muted text-muted-foreground" : "bg-white/15 text-white/80",
                                                      )}>
                                                            {item.badge}
                                                      </Badge>
                                                )}
                                          </button>
                                    ))}

                                    {/* "More" dropdown for overflow items */}
                                    {overflowItems.length > 0 && (
                                          <div ref={moreRef} className="relative">
                                                <button
                                                      onClick={() => setMoreOpen(!moreOpen)}
                                                      className={cn(
                                                            "flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors",
                                                            scrolled
                                                                  ? "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                                                  : "text-white/70 hover:text-white hover:bg-white/10",
                                                      )}
                                                >
                                                      {t("common.more") || "More"}
                                                      <ChevronDown className={cn("w-3 h-3 transition-transform", moreOpen && "rotate-180")} />
                                                </button>
                                                {moreOpen && (
                                                      <div className={cn(
                                                            "absolute top-full mt-1 z-50",
                                                            "min-w-[200px] py-1",
                                                            "rounded-lg border border-border bg-card shadow-xl",
                                                            "animate-in fade-in slide-in-from-top-1 duration-150",
                                                            isRTL ? "right-0" : "left-0",
                                                      )}>
                                                            {overflowItems.map((item) => (
                                                                  <button
                                                                        key={item.href}
                                                                        onClick={() => {
                                                                              router.push(item.href);
                                                                              setMoreOpen(false);
                                                                        }}
                                                                        className={cn(
                                                                              "flex items-center gap-2.5 w-full px-4 py-2 text-sm transition-colors",
                                                                              item.active
                                                                                    ? "bg-primary/10 text-primary font-medium"
                                                                                    : "text-foreground/80 hover:bg-muted/60 hover:text-foreground",
                                                                        )}
                                                                  >
                                                                        <span className="flex-1 text-start">{item.label}</span>
                                                                        {item.badge && (
                                                                              <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 bg-primary/10 text-primary">
                                                                                    {item.badge}
                                                                              </Badge>
                                                                        )}
                                                                  </button>
                                                            ))}
                                                      </div>
                                                )}
                                          </div>
                                    )}
                              </nav>

                              <div className="flex items-center gap-2">
                                    <LanguageSwitcher />
                                    <ThemeSwitcher />
                                    {settings.showNotifications && (
                                          <Button
                                                variant="ghost"
                                                size="icon"
                                                className={cn(scrolled ? "" : "text-white hover:bg-white/10")}
                                          >
                                                <Bell className="w-4 h-4" />
                                          </Button>
                                    )}
                                    <UserProfileDropdown showName={false} />
                              </div>
                        </div>
                  </header>

                  {/* ── Sidebar Overlay ── */}
                  {sidebarOpen && (
                        <>
                              <div
                                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                                    onClick={() => setSidebarOpen(false)}
                              />
                              <aside
                                    className={cn(
                                          "fixed top-0 z-50 h-full w-72",
                                          isRTL ? "right-0" : "left-0",
                                          "bg-card border-e border-border",
                                          "shadow-2xl",
                                          isRTL ? "animate-in slide-in-from-right duration-300" : "animate-in slide-in-from-left duration-300",
                                    )}
                              >
                                    <div className="flex items-center justify-between p-4 h-14 border-b border-border">
                                          <Logo size="sm" />
                                          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                                                <X className="w-4 h-4" />
                                          </Button>
                                    </div>
                                    <ScrollArea className="h-[calc(100vh-56px)]">
                                          <div className="p-3">
                                                <NavRenderer variant="default" onNavigate={() => setSidebarOpen(false)} />
                                          </div>
                                    </ScrollArea>
                              </aside>
                        </>
                  )}

                  {/* ── Hero Section ── */}
                  <div
                        className={cn(
                              "relative -mt-14 pt-14", // overlap header
                              "bg-gradient-to-br from-primary/90 via-primary/70 to-primary/40",
                              "dark:from-primary/30 dark:via-primary/15 dark:to-background",
                        )}
                  >
                        <div className="px-6 py-12 md:py-16">
                              <div className="max-w-4xl">
                                    <h1 className="text-3xl md:text-4xl font-bold text-white dark:text-foreground">
                                          {currentTitle}
                                    </h1>
                                    <p className="mt-2 text-white/70 dark:text-muted-foreground text-sm md:text-base max-w-lg">
                                          {t("common.welcomeMessage") || "Manage and monitor your dashboard"}
                                    </p>
                              </div>
                        </div>
                        {/* Fade out gradient at bottom */}
                        <div className="h-16 bg-gradient-to-b from-transparent to-background" />
                  </div>

                  {/* ── Content ── */}
                  <main className="flex-1 px-6 -mt-8">
                        <div className="max-w-7xl mx-auto">
                              <div
                                    className={cn(
                                          "rounded-2xl bg-card border border-border shadow-lg",
                                          "p-4 md:p-6",
                                    )}
                              >
                                    {children}
                              </div>
                        </div>
                  </main>

                  <div className="mt-6">
                        {settings.showFooter && <Footer />}
                  </div>
            </div>
      );
}
