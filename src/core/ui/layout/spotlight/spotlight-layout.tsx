"use client";

import type React from "react";
import { useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { useLayoutStyles } from "@core/ui/layout/shared/use-layout-styles";
import { Logo } from "@core/ui/logo";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { LanguageSwitcher, ThemeSwitcher } from "@core/ui/layout/common";
import { UserProfileDropdown } from "@core/ui/user-profile-dropdown";
import { Footer } from "@core/ui/layout/shared/footer";
import { useDynamicNavigation } from "@core/ui/navigation/dynamic-navigation";
import {
  isNavigationItemActive,
  getFlatNavigationItems,
  type NavigationItem,
} from "@core/config/navigation";
import { Bell, Search } from "lucide-react";
import { cn } from "@core/common/utils";

interface SpotlightLayoutProps {
  children: React.ReactNode;
}

/**
 * Spotlight Layout — Search-centered navigation.
 *
 * Structure:
 * - Ultra-thin utility bar at top (logo, theme, user)
 * - Giant persistent search bar as hero element
 * - Category pills below search for filtering
 * - Content organized as results grid below
 * - No sidebar — all navigation through search + pills
 *
 * Inspired by macOS Spotlight, Algolia, Google Search Console
 */
export function SpotlightLayout({ children }: SpotlightLayoutProps) {
  const { direction, t } = useI18n();
  const settings = useSettings();
  const styles = useLayoutStyles();
  const pathname = usePathname();
  const router = useRouter();
  const navigation = useDynamicNavigation();
  const isRTL = direction === "rtl";

  const [searchQuery, setSearchQuery] = useState("");

  // Get all navigable items as category pills
  const categoryPills = useMemo(() => {
    const pills: {
      label: string;
      href: string;
      active: boolean;
      icon?: React.ComponentType<{ className?: string }>;
      badge?: string | number;
    }[] = [];
    for (const item of navigation) {
      if (item.href) {
        pills.push({
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
            pills.push({
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
    return pills;
  }, [navigation, pathname, t]);

  return (
    <div
      className={cn("flex min-h-screen flex-col bg-background", styles.getAnimationClass())}
      dir={direction}
    >
      {/* ── Ultra-Thin Utility Bar ── */}
      <header
        className={cn(
          settings.stickyHeader ? "sticky top-0 z-30" : "relative",
          "glass border-b border-border/50",
          "flex h-10 items-center justify-between px-6"
        )}
      >
        <Logo size="sm" />
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeSwitcher />
          {settings.showNotifications && (
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Bell className="h-3.5 w-3.5" />
            </Button>
          )}
          <UserProfileDropdown showName={false} />
        </div>
      </header>

      {/* ── Giant Search Hero ── */}
      <div className="flex flex-col items-center px-6 pb-4 pt-8">
        <div className="w-full max-w-3xl">
          {/* Large search input */}
          <div
            className={cn(
              "flex w-full items-center gap-3 px-5 py-4",
              "rounded-2xl",
              "border-2 border-border/70 bg-card",
              "shadow-lg shadow-black/5 dark:shadow-black/20",
              "focus-within:border-primary/50 focus-within:shadow-primary/5",
              "transition-all duration-200"
            )}
          >
            <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("common.search") || "Search everything..."}
              className="flex-1 bg-transparent text-lg text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>

          {/* Category Pills */}
          <div className="mt-4 flex flex-wrap items-center gap-2 pb-1">
            {categoryPills.map((pill) => {
              const Icon = pill.icon;
              return (
                <button
                  key={pill.href}
                  onClick={() => router.push(pill.href)}
                  className={cn(
                    "flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium",
                    "border transition-all",
                    pill.active
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                  )}
                >
                  {Icon && <Icon className="h-3.5 w-3.5" />}
                  {pill.label}
                  {pill.badge && (
                    <Badge
                      variant="secondary"
                      className={cn(
                        "h-4 min-w-[14px] px-1.5 py-0 text-[10px]",
                        pill.active
                          ? "bg-white/20 text-primary-foreground"
                          : "bg-primary/10 text-primary"
                      )}
                    >
                      {pill.badge}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <main className="flex-1 px-6">
        <div className="mx-auto max-w-7xl">
          <div className={cn(styles.getSpacingClass())}>
            <div
              style={{
                borderRadius: "var(--border-radius)",
                padding: "var(--spacing-unit)",
              }}
            >
              {children}
            </div>
          </div>
        </div>
      </main>

      {settings.showFooter && <Footer />}
    </div>
  );
}
