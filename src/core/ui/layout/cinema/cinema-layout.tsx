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
} from "@core/config/navigation";
import { Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@core/common/utils";
import { NotificationBell } from "@core/ui/notification";

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

  // Close on route change (ref-based, no setState in effect)
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMoreOpen(false);
  }

  // Flatten navigation for horizontal nav — ALL items, no cap
  const navItems = useMemo(() => {
    const items: {
      label: string;
      href: string;
      active: boolean;
      icon?: React.ComponentType<{ className?: string }>;
      badge?: string | number;
    }[] = [];
    for (const item of navigation) {
      if (item.href) {
        items.push({
          label: t(item.name) || item.name,
          href: item.href,
          active: isNavigationItemActive(item, pathname, navigation),
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
              active: isNavigationItemActive(child, pathname, navigation),
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
      if (item.href && isNavigationItemActive(item, pathname, navigation)) {
        return t(item.name) || item.name;
      }
    }
    return t("common.welcome") || "Welcome";
  }, [flatItems, pathname, t, navigation]);

  return (
    <div className={cn("flex min-h-screen flex-col", styles.getAnimationClass())} dir={direction}>
      {/* ── Transparent/Solid Header ── */}
      <header
        className={cn(
          "sticky top-0 z-30",
          "transition-all duration-300",
          scrolled
            ? "border-b border-border bg-background/95 shadow-sm backdrop-blur-md"
            : "bg-transparent"
        )}
      >
        <div className="flex h-14 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className={cn(scrolled ? "" : "text-white hover:bg-white/10")}
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Logo size="sm" />
          </div>

          {/* Horizontal nav */}
          <nav className="hidden flex-wrap items-center gap-1 lg:flex">
            {visibleItems.map((item) => (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={cn(
                  "flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  item.active
                    ? scrolled
                      ? "bg-primary/10 text-primary"
                      : "bg-white/20 text-white"
                    : scrolled
                      ? "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                {item.label}
                {item.badge && (
                  <Badge
                    variant="secondary"
                    className={cn(
                      "h-4 min-w-[14px] px-1 py-0 text-[10px]",
                      item.active
                        ? scrolled
                          ? "bg-primary/15 text-primary"
                          : "bg-white/25 text-white"
                        : scrolled
                          ? "bg-muted text-muted-foreground"
                          : "bg-white/15 text-white/80"
                    )}
                  >
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
                    "flex items-center gap-1 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    scrolled
                      ? "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {t("common.more") || "More"}
                  <ChevronDown
                    className={cn("h-3 w-3 transition-transform", moreOpen && "rotate-180")}
                  />
                </button>
                {moreOpen && (
                  <div
                    className={cn(
                      "absolute top-full z-50 mt-1",
                      "min-w-[200px] py-1",
                      "rounded-lg border border-border bg-card shadow-xl",
                      "duration-150 animate-in fade-in slide-in-from-top-1",
                      isRTL ? "right-0" : "left-0"
                    )}
                  >
                    {overflowItems.map((item) => (
                      <button
                        key={item.href}
                        onClick={() => {
                          router.push(item.href);
                          setMoreOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center gap-2.5 px-4 py-2 text-sm transition-colors",
                          item.active
                            ? "bg-primary/10 font-medium text-primary"
                            : "text-foreground/80 hover:bg-muted/60 hover:text-foreground"
                        )}
                      >
                        <span className="flex-1 text-start">{item.label}</span>
                        {item.badge && (
                          <Badge
                            variant="secondary"
                            className="h-4 bg-primary/10 px-1 py-0 text-[10px] text-primary"
                          >
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
              <NotificationBell iconClassName="h-5 w-5" />
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
              "border-e border-border bg-card",
              "shadow-2xl",
              isRTL
                ? "duration-300 animate-in slide-in-from-right"
                : "duration-300 animate-in slide-in-from-left"
            )}
          >
            <div className="flex h-14 items-center justify-between border-b border-border p-4">
              <Logo size="sm" />
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                <X className="h-4 w-4" />
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
          "dark:from-primary/30 dark:via-primary/15 dark:to-background"
        )}
      >
        <div className="px-6 py-12 md:py-16">
          <div className="max-w-4xl">
            <h1 className="text-3xl font-bold text-white dark:text-foreground md:text-4xl">
              {currentTitle}
            </h1>
            <p className="mt-2 max-w-lg text-sm text-white/70 dark:text-muted-foreground md:text-base">
              {t("common.welcomeMessage") || "Manage and monitor your dashboard"}
            </p>
          </div>
        </div>
        {/* Fade out gradient at bottom */}
        <div className="h-16 bg-gradient-to-b from-transparent to-background" />
      </div>

      {/* ── Content ── */}
      <main className="-mt-8 flex-1 px-6">
        <div className="mx-auto max-w-7xl">
          <div className={cn("rounded-2xl border border-border bg-card shadow-lg", "p-4 md:p-6")}>
            {children}
          </div>
        </div>
      </main>

      <div className="mt-6">{settings.showFooter && <Footer />}</div>
    </div>
  );
}
