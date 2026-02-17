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
import { isNavigationItemActive, type NavigationItem } from "@core/config/navigation";
import { Home, ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@core/common/utils";
import { NotificationBell } from "@core/ui/notification";

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
 * - Tabs with children show dropdown on click
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

  // Close dropdown on route change
  useEffect(() => {
    setOpenDropdown(null);
  }, [pathname]);

  // Track active group
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

  // Count total badges for a group
  const getGroupBadgeCount = (item: NavigationItem): string | number | undefined => {
    if (item.badge) return item.badge;
    if (item.children) {
      let total = 0;
      for (const child of item.children) {
        if (child.badge && typeof child.badge === "number") total += child.badge;
        else if (child.badge) return child.badge; // string badge — show as-is
      }
      return total > 0 ? total : undefined;
    }
    return undefined;
  };

  return (
    <div
      className={cn(
        "flex min-h-screen flex-col bg-background",
        styles.getAnimationClass(),
        direction === "rtl" ? "rtl" : "ltr"
      )}
      dir={direction}
    >
      {/* ── Mega Header ── */}
      <header
        className={cn(
          settings.stickyHeader ? "sticky top-0 z-30" : "relative",
          "border-b border-border bg-card"
        )}
      >
        {/* Primary bar */}
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Logo size="md" />
            <div className="hidden h-6 w-px bg-border md:block" />
            <HeaderSearch
              containerClassName="hidden md:block"
              inputClassName="bg-muted/50 border-0 focus:bg-background w-80 rounded-lg"
              iconClassName={isRTL ? "right-3 left-auto" : "left-3"}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/")}
              title={t("nav.home") || "Home"}
            >
              <Home className="h-4 w-4" />
            </Button>
            <LanguageSwitcher />
            <ThemeSwitcher />
            {settings.showNotifications && (
              <NotificationBell iconClassName="h-5 w-5" />
            )}
            <div className="mx-1 h-6 w-px bg-border" />
            <UserProfileDropdown showName />
          </div>
        </div>

        {/* Breadcrumb bar */}
        {settings.showBreadcrumbs !== false && (
          <div className="flex items-center gap-1 px-6 pb-1 text-xs text-muted-foreground">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="h-3 w-3" />}
                {crumb.href ? (
                  <button
                    onClick={() => router.push(crumb.href!)}
                    className="transition-colors hover:text-foreground"
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span className="font-medium text-foreground">{crumb.label}</span>
                )}
              </span>
            ))}
          </div>
        )}

        {/* Secondary tab bar with dropdowns */}
        <div className="border-t border-border/50" ref={dropdownRef}>
          <div className="flex flex-wrap items-center px-6">
            {navigation.map((tab) => {
              const isActive = tab === activeGroup;
              const Icon = tab.icon;
              const hasChildren = tab.children && tab.children.length > 0;
              const isDropdownOpen = openDropdown === tab.name;
              const badge = getGroupBadgeCount(tab);

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
                      "flex items-center gap-2 whitespace-nowrap px-4 py-2.5 text-sm font-medium",
                      "-mb-px border-b-2 transition-colors",
                      isActive
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                    )}
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    {t(tab.name) || tab.name}
                    {badge && (
                      <Badge
                        variant="secondary"
                        className="h-4 min-w-[16px] bg-primary/10 px-1.5 py-0 text-[10px] text-primary"
                      >
                        {badge}
                      </Badge>
                    )}
                    {hasChildren && (
                      <ChevronDown
                        className={cn(
                          "h-3 w-3 transition-transform",
                          isDropdownOpen && "rotate-180"
                        )}
                      />
                    )}
                  </button>

                  {/* Dropdown for children */}
                  {hasChildren && isDropdownOpen && (
                    <div
                      className={cn(
                        "absolute top-full z-50 mt-1",
                        "min-w-[200px] py-1",
                        "rounded-lg border border-border bg-card shadow-xl",
                        "duration-150 animate-in fade-in slide-in-from-top-1",
                        isRTL ? "right-0" : "left-0"
                      )}
                    >
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
                              "flex w-full items-center gap-2.5 px-4 py-2 text-sm transition-colors",
                              childActive
                                ? "bg-primary/10 font-medium text-primary"
                                : "text-foreground/80 hover:bg-muted/60 hover:text-foreground"
                            )}
                          >
                            {ChildIcon && <ChildIcon className="h-4 w-4 shrink-0" />}
                            <span className="flex-1 text-start">{t(child.name) || child.name}</span>
                            {child.badge && (
                              <Badge
                                variant="secondary"
                                className="h-4 bg-primary/10 px-1.5 py-0 text-[10px] text-primary"
                              >
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
