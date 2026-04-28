"use client";

import type React from "react";
import { useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, X } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { useLayoutStyles } from "@core/ui/layout/shared/use-layout-styles";
import { useDynamicNavigation } from "@core/ui/navigation/dynamic-navigation";
import { isNavigationItemActive } from "@core/config/navigation";
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
import { useBrandedAppName } from "@core/hooks/use-branded-app-name";

interface TopSideLayoutProps {
  children: React.ReactNode;
}

/**
 * Top+Side Combo Layout  Header with module tabs + sidebar for sub-items.
 *
 * Structure:
 * - Top header with logo + group tabs + actions
 * - Left sidebar showing children of the selected tab
 * - Content area
 * - Mobile: hamburger menu replaces both tiers
 *
 * Inspired by Azure Portal, Notion workspace
 */
export function TopSideLayout({ children }: TopSideLayoutProps) {
  const { direction, t } = useI18n();
  const appName = useBrandedAppName();
  const settings = useSettings();
  const styles = useLayoutStyles();
  const pathname = usePathname();
  const router = useRouter();
  const navigation = useDynamicNavigation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Top-level groups as tabs
  const groups = useMemo(() => {
    return navigation.filter((item) => item.children && item.children.length > 0);
  }, [navigation]);

  const directItems = useMemo(() => {
    return navigation.filter((item) => item.href && (!item.children || item.children.length === 0));
  }, [navigation]);

  // Find active group
  const activeGroup = useMemo(() => {
    for (const group of groups) {
      if (group.children) {
        for (const child of group.children) {
          if (child.href && isNavigationItemActive(child, pathname, navigation)) {
            return group;
          }
        }
      }
    }
    return groups[0] || null;
  }, [groups, pathname, navigation]);

  const sidebarItems = useMemo(() => {
    return activeGroup?.children?.filter((c) => c.href) || [];
  }, [activeGroup]);

  return (
    <div
      className={cn("flex min-h-screen flex-col bg-background", styles.getAnimationClass())}
      dir={direction}
    >
      {/*  Header with Tabs  */}
      <header
        className={cn(
          settings.stickyHeader ? "sticky top-0 z-30" : "relative",
          "border-b border-border bg-card"
        )}
      >
        <div className="flex h-12 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <Logo size="sm" />
            <span className="hidden text-sm font-bold text-foreground md:block">
              {appName}
            </span>
          </div>

          {/* Desktop tabs */}
          <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
            {directItems.map((item) => {
              const Icon = item.icon;
              const isActive = isNavigationItemActive(item, pathname, navigation);
              return (
                <button
                  key={item.name}
                  onClick={() => item.href && router.push(item.href)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  {Icon && <Icon className="h-3.5 w-3.5" />}
                  {t(item.name) || item.name}
                </button>
              );
            })}
            {groups.map((group) => {
              const Icon = group.icon;
              const isActive = activeGroup?.name === group.name;
              return (
                <button
                  key={group.name}
                  onClick={() => {
                    const href = group.children?.[0]?.href;
                    if (href) router.push(href);
                  }}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  {Icon && <Icon className="h-3.5 w-3.5" />}
                  {t(group.name) || group.name}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeSwitcher />
            <NotificationBell iconClassName="h-5 w-5" />
            <UserProfileDropdown showName={false} />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/*  Left Sidebar (sub-items of active group)  */}
        {sidebarItems.length > 0 && (
          <aside
            className={cn(
              "hidden w-56 shrink-0 flex-col lg:flex",
              "border-e border-border bg-card/50"
            )}
          >
            <div className="border-b border-border px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {activeGroup ? t(activeGroup.name) || activeGroup.name : ""}
              </p>
            </div>
            <ScrollArea className="flex-1 py-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.href && isNavigationItemActive(item, pathname, navigation);
                return (
                  <button
                    key={item.name}
                    onClick={() => item.href && router.push(item.href)}
                    className={cn(
                      "flex w-full items-center gap-2 px-4 py-2 text-start text-sm transition-colors",
                      isActive
                        ? "border-s-2 border-s-primary bg-primary/10 font-medium text-primary"
                        : "text-foreground hover:bg-muted/50"
                    )}
                  >
                    {Icon && <Icon className="h-4 w-4 shrink-0" />}
                    <span className="truncate">{t(item.name) || item.name}</span>
                  </button>
                );
              })}
            </ScrollArea>
          </aside>
        )}

        {/*  Mobile Drawer  */}
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-30 bg-black/30 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside
              dir={direction}
              className={cn(
                "fixed bottom-0 top-0 z-40 flex w-80 flex-col overflow-y-auto border-e border-border bg-card lg:hidden",
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

        {/*  Content  */}
        <main className="min-w-0 flex-1 p-6">
          <div style={{ borderRadius: "var(--border-radius)" }}>{children}</div>
        </main>
      </div>

      {settings.showFooter && <Footer />}
    </div>
  );
}
