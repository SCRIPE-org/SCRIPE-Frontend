"use client";

import type React from "react";
import { useState, useMemo } from "react";
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
import { Bell, Home, ChevronRight } from "lucide-react";
import { cn } from "@core/common/utils";

interface ExecutiveLayoutProps {
      children: React.ReactNode;
}

/**
 * Executive Layout — Corporate Enterprise style.
 *
 * Structure:
 * - Mega header (h-16) with logo, search, actions
 * - Breadcrumb bar
 * - Secondary horizontal tab bar for module navigation
 * - Full-width content area (no sidebar)
 *
 * Inspired by SAP Fiori, Salesforce Lightning, Oracle Fusion
 */
export function ExecutiveLayout({ children }: ExecutiveLayoutProps) {
      const { direction, t } = useI18n();
      const settings = useSettings();
      const styles = useLayoutStyles();
      const pathname = usePathname();
      const router = useRouter();
      const navigation = useDynamicNavigation();
      const isRTL = direction === "rtl";

      // Flatten top-level items for tab bar
      const tabItems = useMemo(() => {
            const items: NavigationItem[] = [];
            for (const item of navigation) {
                  if (item.href) {
                        items.push(item);
                  } else if (item.children) {
                        items.push(item);
                        for (const child of item.children) {
                              if (child.href) items.push(child);
                        }
                  }
            }
            return items;
      }, [navigation]);

      // Get top-level groups for tabs
      const topLevelTabs = navigation;

      // Track active group and child
      const activeGroup = useMemo(() => {
            for (const group of navigation) {
                  if (group.href && isNavigationItemActive(group, pathname)) return group;
                  if (group.children) {
                        for (const child of group.children) {
                              if (child.href && isNavigationItemActive(child, pathname)) return group;
                        }
                  }
            }
            return navigation[0] || null;
      }, [navigation, pathname]);

      // Breadcrumb segments
      const breadcrumbs = useMemo(() => {
            const segments: { label: string; href?: string }[] = [
                  { label: t("nav.home") || "Home", href: "/" },
            ];
            if (activeGroup) {
                  segments.push({ label: t(activeGroup.name) || activeGroup.name });
                  if (activeGroup.children) {
                        const activeChild = activeGroup.children.find(
                              (c) => c.href && isNavigationItemActive(c, pathname)
                        );
                        if (activeChild) {
                              segments.push({ label: t(activeChild.name) || activeChild.name });
                        }
                  }
            }
            return segments;
      }, [activeGroup, pathname, t]);

      return (
            <div
                  className={cn(
                        "min-h-screen flex flex-col bg-background",
                        styles.getAnimationClass(),
                        direction === "rtl" ? "rtl" : "ltr",
                  )}
                  dir={direction}
            >
                  {/* ── Mega Header ── */}
                  <header
                        className={cn(
                              settings.stickyHeader ? "sticky top-0 z-30" : "relative",
                              "bg-card border-b border-border",
                        )}
                  >
                        {/* Primary bar */}
                        <div className="flex items-center justify-between px-6 h-16">
                              <div className="flex items-center gap-4">
                                    <Logo size="md" />
                                    <div className="hidden md:block h-6 w-px bg-border" />
                                    <HeaderSearch
                                          containerClassName="hidden md:block"
                                          inputClassName="bg-muted/50 border-0 focus:bg-background w-80 rounded-lg"
                                          iconClassName={isRTL ? "right-3 left-auto" : "left-3"}
                                    />
                              </div>
                              <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => router.push("/")} title={t("nav.home") || "Home"}>
                                          <Home className="w-4 h-4" />
                                    </Button>
                                    <LanguageSwitcher />
                                    <ThemeSwitcher />
                                    {settings.showNotifications && (
                                          <Button variant="ghost" size="icon">
                                                <Bell className="w-4 h-4" />
                                          </Button>
                                    )}
                                    <div className="h-6 w-px bg-border mx-1" />
                                    <UserProfileDropdown showName />
                              </div>
                        </div>

                        {/* Breadcrumb bar */}
                        {settings.showBreadcrumbs !== false && (
                              <div className="px-6 pb-1 flex items-center gap-1 text-xs text-muted-foreground">
                                    {breadcrumbs.map((crumb, i) => (
                                          <span key={i} className="flex items-center gap-1">
                                                {i > 0 && <ChevronRight className="w-3 h-3" />}
                                                {crumb.href ? (
                                                      <button
                                                            onClick={() => router.push(crumb.href!)}
                                                            className="hover:text-foreground transition-colors"
                                                      >
                                                            {crumb.label}
                                                      </button>
                                                ) : (
                                                      <span className="text-foreground font-medium">{crumb.label}</span>
                                                )}
                                          </span>
                                    ))}
                              </div>
                        )}

                        {/* Secondary tab bar */}
                        <div className="border-t border-border/50">
                              <div className="flex items-center px-6 overflow-x-auto scrollbar-hide">
                                    {topLevelTabs.map((tab) => {
                                          const isActive = tab === activeGroup;
                                          const Icon = tab.icon;
                                          return (
                                                <button
                                                      key={tab.name}
                                                      onClick={() => {
                                                            if (tab.href) {
                                                                  router.push(tab.href);
                                                            } else if (tab.children?.[0]?.href) {
                                                                  router.push(tab.children[0].href);
                                                            }
                                                      }}
                                                      className={cn(
                                                            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap",
                                                            "border-b-2 -mb-px transition-colors",
                                                            isActive
                                                                  ? "border-primary text-primary"
                                                                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
                                                      )}
                                                >
                                                      {Icon && <Icon className="w-4 h-4" />}
                                                      {t(tab.name) || tab.name}
                                                </button>
                                          );
                                    })}
                              </div>
                        </div>
                  </header>

                  {/* ── Content ── */}
                  <main className="flex-1">
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
                  </main>

                  {settings.showFooter && <Footer />}
            </div>
      );
}
