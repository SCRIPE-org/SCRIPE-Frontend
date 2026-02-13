"use client";

import type React from "react";
import { useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { useLayoutStyles } from "@core/ui/layout/shared/use-layout-styles";
import { Logo } from "@core/ui/logo";
import { Button } from "@core/ui/button";
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
            const pills: { label: string; href: string; active: boolean; icon?: React.ComponentType<{ className?: string }> }[] = [];
            for (const item of navigation) {
                  if (item.href) {
                        pills.push({
                              label: t(item.name) || item.name,
                              href: item.href,
                              active: isNavigationItemActive(item, pathname),
                              icon: item.icon,
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
                                    });
                              }
                        }
                  }
            }
            return pills;
      }, [navigation, pathname, t]);

      return (
            <div
                  className={cn(
                        "min-h-screen flex flex-col bg-background",
                        styles.getAnimationClass(),
                  )}
                  dir={direction}
            >
                  {/* ── Ultra-Thin Utility Bar ── */}
                  <header
                        className={cn(
                              settings.stickyHeader ? "sticky top-0 z-30" : "relative",
                              "glass border-b border-border/50",
                              "flex items-center justify-between px-6 h-10",
                        )}
                  >
                        <Logo size="sm" />
                        <div className="flex items-center gap-2">
                              <LanguageSwitcher />
                              <ThemeSwitcher />
                              {settings.showNotifications && (
                                    <Button variant="ghost" size="icon" className="w-7 h-7">
                                          <Bell className="w-3.5 h-3.5" />
                                    </Button>
                              )}
                              <UserProfileDropdown showName={false} />
                        </div>
                  </header>

                  {/* ── Giant Search Hero ── */}
                  <div className="px-6 pt-8 pb-4 flex flex-col items-center">
                        <div className="w-full max-w-2xl">
                              {/* Large search input */}
                              <div className={cn(
                                    "flex items-center gap-3 w-full px-5 py-4",
                                    "rounded-2xl",
                                    "bg-card border-2 border-border/70",
                                    "shadow-lg shadow-black/5 dark:shadow-black/20",
                                    "focus-within:border-primary/50 focus-within:shadow-primary/5",
                                    "transition-all duration-200",
                              )}>
                                    <Search className="w-5 h-5 text-muted-foreground shrink-0" />
                                    <input
                                          type="text"
                                          value={searchQuery}
                                          onChange={(e) => setSearchQuery(e.target.value)}
                                          placeholder={t("common.search") || "Search everything..."}
                                          className="flex-1 bg-transparent outline-none text-lg text-foreground placeholder:text-muted-foreground"
                                    />
                              </div>

                              {/* Category Pills */}
                              <div className="flex items-center gap-2 mt-4 overflow-x-auto scrollbar-hide pb-1">
                                    {categoryPills.map((pill) => {
                                          const Icon = pill.icon;
                                          return (
                                                <button
                                                      key={pill.href}
                                                      onClick={() => router.push(pill.href)}
                                                      className={cn(
                                                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap",
                                                            "border transition-all",
                                                            pill.active
                                                                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                                                  : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-foreground/30",
                                                      )}
                                                >
                                                      {Icon && <Icon className="w-3.5 h-3.5" />}
                                                      {pill.label}
                                                </button>
                                          );
                                    })}
                              </div>
                        </div>
                  </div>

                  {/* ── Content ── */}
                  <main className="flex-1 px-6">
                        <div className="max-w-6xl mx-auto">
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
