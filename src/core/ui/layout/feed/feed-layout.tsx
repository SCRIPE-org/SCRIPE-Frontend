"use client";

import type React from "react";
import { useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, TrendingUp, Bookmark } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { useLayoutStyles } from "@core/ui/layout/shared/use-layout-styles";
import { useDynamicNavigation } from "@core/ui/navigation/dynamic-navigation";
import { isNavigationItemActive, type NavigationItem } from "@core/config/navigation";
import { Logo } from "@core/ui/logo";
import { Button } from "@core/ui/button";
import { ScrollArea } from "@core/ui/scroll-area";
import { LanguageSwitcher, ThemeSwitcher } from "@core/ui/layout/common";
import { UserProfileDropdown } from "@core/ui/user-profile-dropdown";
import { Footer } from "@core/ui/layout/shared/footer";
import { NavRenderer } from "@core/ui/layout/shared/nav-renderer";
import { UserCard } from "@core/ui/layout/shared/user-card";
import { LogoutButton } from "@core/ui/layout/shared/logout-button";
import { cn } from "@core/common/utils";
import { NotificationBell } from "@core/ui/notification";

interface FeedLayoutProps {
  children: React.ReactNode;
}

/**
 * Social Feed Layout  Three-column social media style.
 *
 * Structure:
 * - Left: navigation sidebar
 * - Center: content feed (children)
 * - Right: trending/widget sidebar
 * - Mobile: hamburger nav, right sidebar hidden
 *
 * Inspired by Twitter/X, LinkedIn, Facebook
 */
export function FeedLayout({ children }: FeedLayoutProps) {
  const { direction, t } = useI18n();
  const settings = useSettings();
  const styles = useLayoutStyles();
  const pathname = usePathname();
  const router = useRouter();
  const navigation = useDynamicNavigation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Flatten for left sidebar
  const navItems = useMemo(() => {
    const items: NavigationItem[] = [];
    for (const item of navigation) {
      if (item.href) items.push(item);
      else if (item.children) {
        for (const child of item.children) {
          if (child.href) items.push(child);
        }
      }
    }
    return items;
  }, [navigation]);

  return (
    <div className={cn("min-h-screen bg-background", styles.getAnimationClass())} dir={direction}>
      {/* â”€â”€ Top Bar â”€â”€ */}
      <header
        className={cn(
          settings.stickyHeader ? "sticky top-0 z-30" : "relative",
          "glass border-b border-border",
          "flex h-12 items-center justify-between px-4"
        )}
      >
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
          <Logo size="sm" />
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeSwitcher />
          <NotificationBell iconClassName="h-5 w-5" />
          <UserProfileDropdown showName={false} />
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl">
        {/* â”€â”€ Left: Navigation â”€â”€ */}
        <aside className="sticky top-12 hidden h-[calc(100vh-3rem)] w-56 shrink-0 flex-col lg:flex">
          <ScrollArea className="flex-1 py-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isNavigationItemActive(item, pathname);
              return (
                <button
                  key={item.name}
                  onClick={() => item.href && router.push(item.href)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-full px-4 py-2.5 text-start text-sm transition-colors",
                    isActive
                      ? "font-bold text-foreground"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  {Icon && <Icon className={cn("h-5 w-5", isActive && "text-primary")} />}
                  <span>{t(item.name) || item.name}</span>
                </button>
              );
            })}
          </ScrollArea>
          <div className="p-3">
            <UserCard size="sm" />
          </div>
        </aside>

        {/* â”€â”€ Center: Content Feed â”€â”€ */}
        <main className="min-h-screen min-w-0 flex-1 border-x border-border">
          <div className="p-4">{children}</div>
        </main>

        {/* â”€â”€ Right: Trending / Widgets â”€â”€ */}
        <aside className="sticky top-12 hidden h-[calc(100vh-3rem)] w-72 shrink-0 flex-col p-4 xl:flex">
          <div className="mb-4 rounded-2xl border border-border bg-card p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
              <TrendingUp className="h-4 w-4 text-primary" />
              {t("common.trending") || "Trending"}
            </h3>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <div>
                    <p className="text-xs font-medium text-foreground">
                      {t("common.trendingItem") || "Trending Item"} #{i}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {t("common.posts") || "Posts"}: {Math.floor(Math.random() * 1000)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
              <Bookmark className="h-4 w-4 text-primary" />
              {t("common.quickLinks") || "Quick Links"}
            </h3>
            <div className="space-y-1">
              {navItems.slice(0, 4).map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => item.href && router.push(item.href)}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-start text-xs text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                  >
                    {Icon && <Icon className="h-3.5 w-3.5" />}
                    {t(item.name) || item.name}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      </div>

      {/* â”€â”€ Mobile Drawer â”€â”€ */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/30 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside
            dir={direction}
            className={cn(
              "fixed bottom-0 top-0 z-40 flex w-72 flex-col border-e border-border bg-card lg:hidden",
              direction === "rtl" ? "right-0" : "left-0"
            )}
          >
            <div className="flex items-center justify-between border-b border-border p-4">
              <Logo size="sm" />
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="border-b border-border p-3">
              <UserCard size="sm" />
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <NavRenderer variant="default" onNavigate={() => setMobileMenuOpen(false)} />
            </div>
            <div className="border-t border-border p-3">
              <LogoutButton />
            </div>
          </aside>
        </>
      )}

      {settings.showFooter && <Footer />}
    </div>
  );
}
