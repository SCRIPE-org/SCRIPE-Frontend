"use client";

import type React from "react";
import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, Menu, X } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { useLayoutStyles } from "@core/ui/layout/shared/use-layout-styles";
import { useDynamicNavigation } from "@core/ui/navigation/dynamic-navigation";
import { isNavigationItemActive, type NavigationItem } from "@core/config/navigation";
import { Logo } from "@core/ui/logo";
import { Button } from "@core/ui/button";
import { LanguageSwitcher, ThemeSwitcher } from "@core/ui/layout/common";
import { UserProfileDropdown } from "@core/ui/user-profile-dropdown";
import { Footer } from "@core/ui/layout/shared/footer";
import { NavRenderer } from "@core/ui/layout/shared/nav-renderer";
import { UserCard } from "@core/ui/layout/shared/user-card";
import { LogoutButton } from "@core/ui/layout/shared/logout-button";
import { cn } from "@core/common/utils";
import { NotificationBell } from "@core/ui/notification";

interface BreadcrumbLayoutProps {
  children: React.ReactNode;
}

/**
 * Breadcrumb Layout  No sidebar, navigate entirely via breadcrumb trail.
 *
 * Structure:
 * - Top bar with logo, breadcrumb trail, and actions
 * - Full-width content below
 * - Mobile: breadcrumb collapses to "..." with dropdown
 *
 * Inspired by AWS Console, IBM Carbon, Cloudflare Dashboard
 */
export function BreadcrumbLayout({ children }: BreadcrumbLayoutProps) {
  const { direction, t } = useI18n();
  const settings = useSettings();
  const styles = useLayoutStyles();
  const pathname = usePathname();
  const router = useRouter();
  const navigation = useDynamicNavigation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isRTL = direction === "rtl";
  const Separator = isRTL ? ChevronLeft : ChevronRight;

  // Build breadcrumb trail from pathname + navigation structure
  const breadcrumbs = useMemo(() => {
    const crumbs: { label: string; href: string }[] = [
      { label: t("nav.home") || "Home", href: "/" },
    ];

    const segments = pathname.split("/").filter(Boolean);
    let currentPath = "";

    for (const segment of segments) {
      currentPath += `/${segment}`;
      // Find matching nav item
      const findItem = (items: NavigationItem[]): NavigationItem | null => {
        for (const item of items) {
          if (item.href === currentPath) return item;
          if (item.children) {
            const found = findItem(item.children);
            if (found) return found;
          }
        }
        return null;
      };
      const navItem = findItem(navigation);
      const label = navItem ? t(navItem.name) || navItem.name : segment;
      crumbs.push({ label, href: currentPath });
    }

    return crumbs;
  }, [pathname, navigation, t]);

  return (
    <div
      className={cn("flex min-h-screen flex-col bg-background", styles.getAnimationClass())}
      dir={direction}
    >
      {/*  Header with Breadcrumbs  */}
      <header
        className={cn(
          settings.stickyHeader ? "sticky top-0 z-30" : "relative",
          "border-b border-border bg-card"
        )}
      >
        {/* Primary bar */}
        <div className="flex h-14 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <Logo size="sm" />
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeSwitcher />
            <NotificationBell iconClassName="h-5 w-5" />
            <UserProfileDropdown showName={false} />
          </div>
        </div>

        {/* Breadcrumb trail */}
        <div className="scrollbar-none flex items-center gap-1 overflow-x-auto px-4 pb-3 lg:px-6">
          {breadcrumbs.map((crumb, i) => {
            const isLast = i === breadcrumbs.length - 1;
            return (
              <div key={crumb.href} className="flex shrink-0 items-center gap-1">
                {i > 0 && <Separator className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />}
                <button
                  onClick={() => {
                    if (!isLast) router.push(crumb.href);
                  }}
                  className={cn(
                    "rounded-md px-2 py-1 text-sm transition-colors",
                    isLast
                      ? "bg-muted/50 font-semibold text-foreground"
                      : "cursor-pointer text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  {crumb.label}
                </button>
              </div>
            );
          })}
        </div>
      </header>

      {/*  Mobile Navigation Drawer  */}
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
      <main className="flex-1 p-6">
        <div
          style={{
            borderRadius: "var(--border-radius)",
          }}
        >
          {children}
        </div>
      </main>

      {settings.showFooter && <Footer />}
    </div>
  );
}
