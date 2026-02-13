"use client";

import type React from "react";
import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { useLayoutStyles } from "@core/ui/layout/shared/use-layout-styles";
import { useDynamicNavigation } from "@core/ui/navigation/dynamic-navigation";
import {
      isNavigationItemActive,
      type NavigationItem,
} from "@core/config/navigation";
import { Logo } from "@core/ui/logo";
import { LanguageSwitcher, ThemeSwitcher } from "@core/ui/layout/common";
import { UserProfileDropdown } from "@core/ui/user-profile-dropdown";
import { Footer } from "@core/ui/layout/shared/footer";
import { cn } from "@core/common/utils";

interface HubLayoutProps {
      children: React.ReactNode;
}

/**
 * Hub / Portal Layout — Card-grid as primary navigation.
 *
 * Structure:
 * - Simple header bar
 * - Cards grid as module navigation (when at root)
 * - When inside a module, shows content directly
 *
 * Inspired by Windows Start, Notion Home, Vercel Dashboard
 */
export function HubLayout({ children }: HubLayoutProps) {
      const { direction, t } = useI18n();
      const settings = useSettings();
      const styles = useLayoutStyles();
      const pathname = usePathname();
      const router = useRouter();
      const navigation = useDynamicNavigation();

      // Flatten navigable items
      const hubItems = useMemo(() => {
            const items: NavigationItem[] = [];
            for (const item of navigation) {
                  if (item.href) {
                        items.push(item);
                  } else if (item.children) {
                        for (const child of item.children) {
                              if (child.href) items.push(child);
                        }
                  }
            }
            return items;
      }, [navigation]);

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
                              "glass border-b border-border",
                              "flex items-center justify-between px-6 h-14",
                        )}
                  >
                        <div className="flex items-center gap-3">
                              <Logo size="sm" />
                              <h1 className="text-sm font-bold text-foreground">
                                    {t("app.title")}
                              </h1>
                        </div>
                        <div className="flex items-center gap-2">
                              <LanguageSwitcher />
                              <ThemeSwitcher />
                              <UserProfileDropdown showName />
                        </div>
                  </header>

                  {/* ── Hub Navigation Grid ── */}
                  <div className="px-6 py-6 border-b border-border/50 bg-muted/20">
                        <div className="max-w-5xl mx-auto">
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
                                    {t("common.quickActions") || "Quick Navigation"}
                              </p>
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                    {hubItems.map((item) => {
                                          const Icon = item.icon;
                                          const isActive = isNavigationItemActive(item, pathname);
                                          return (
                                                <button
                                                      key={item.name}
                                                      onClick={() => item.href && router.push(item.href)}
                                                      className={cn(
                                                            "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all group",
                                                            isActive
                                                                  ? "bg-primary/10 border-primary/30 text-primary shadow-sm"
                                                                  : "bg-card border-border hover:border-primary/20 hover:bg-primary/5 hover:shadow-sm text-foreground",
                                                      )}
                                                >
                                                      {Icon && (
                                                            <div
                                                                  className={cn(
                                                                        "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                                                        isActive
                                                                              ? "bg-primary/20"
                                                                              : "bg-muted group-hover:bg-primary/10",
                                                                  )}
                                                            >
                                                                  <Icon className="w-5 h-5" />
                                                            </div>
                                                      )}
                                                      <span className="text-xs font-medium text-center leading-tight">
                                                            {t(item.name) || item.name}
                                                      </span>
                                                      {item.badge && (
                                                            <span className="bg-destructive text-destructive-foreground text-[9px] rounded-full px-1.5 py-0.5 font-bold">
                                                                  {item.badge}
                                                            </span>
                                                      )}
                                                </button>
                                          );
                                    })}
                              </div>
                        </div>
                  </div>

                  {/* ── Content ── */}
                  <main className="flex-1 p-6">
                        <div className="max-w-5xl mx-auto" style={{ borderRadius: "var(--border-radius)" }}>
                              {children}
                        </div>
                  </main>

                  {settings.showFooter && <Footer />}
            </div>
      );
}
