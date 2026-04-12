"use client";

import type React from "react";
import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
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
import { useBrandedAppName } from "@core/hooks/use-branded-app-name";

interface BentoLayoutProps {
  children: React.ReactNode;
}

/**
 * Bento Grid Layout  Apple-style grid navigation.
 *
 * Structure:
 * - Header with logo + actions
 * - Bento-style grid of nav items (varying card sizes)
 * - Content area below
 * - Mobile: smaller grid (2 columns)
 *
 * Inspired by Apple Vision Pro, Bento UI trend, Windows tiles
 */
export function BentoLayout({ children }: BentoLayoutProps) {
  const { direction, t } = useI18n();
  const appName = useBrandedAppName();
  const settings = useSettings();
  const styles = useLayoutStyles();
  const pathname = usePathname();
  const router = useRouter();
  const navigation = useDynamicNavigation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Flatten and assign sizes for bento effect
  const bentoItems = useMemo(() => {
    const items: (NavigationItem & { size: "sm" | "md" | "lg" })[] = [];
    for (const item of navigation) {
      if (item.href) {
        // Direct items get larger size if they're first
        items.push({
          ...item,
          size: items.length === 0 ? "lg" : "sm",
        });
      }
      if (item.children) {
        for (const child of item.children) {
          if (child.href) {
            items.push({
              ...child,
              size: items.length % 5 === 0 ? "md" : "sm",
            });
          }
        }
      }
    }
    return items;
  }, [navigation]);

  return (
    <div
      className={cn("flex min-h-screen flex-col bg-background", styles.getAnimationClass())}
      dir={direction}
    >
      {/*  Header  */}
      <header
        className={cn(
          settings.stickyHeader ? "sticky top-0 z-30" : "relative",
          "glass border-b border-border",
          "flex h-12 items-center justify-between px-4 lg:px-6"
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
          <span className="hidden text-sm font-bold text-foreground sm:block">
            {appName}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeSwitcher />
          <NotificationBell iconClassName="h-5 w-5" />
          <UserProfileDropdown showName={false} />
        </div>
      </header>

      {/*  Bento Navigation Grid  */}
      <div className="border-b border-border/50 bg-muted/10 px-4 py-5 lg:px-6">
        <div className="mx-auto grid max-w-5xl auto-rows-[80px] grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {bentoItems.map((item) => {
            const Icon = item.icon;
            const isActive = isNavigationItemActive(item, pathname, navigation);
            return (
              <button
                key={item.name}
                onClick={() => item.href && router.push(item.href)}
                className={cn(
                  "group relative flex flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border transition-all",
                  item.size === "lg" && "col-span-2 row-span-2",
                  item.size === "md" && "col-span-2",
                  isActive
                    ? "border-primary/30 bg-primary/10 text-primary shadow-md"
                    : "border-border bg-card text-foreground hover:scale-[1.02] hover:border-primary/20 hover:shadow-md"
                )}
              >
                {/* Gradient overlay for active */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                )}
                {Icon && (
                  <Icon
                    className={cn(
                      "relative z-10 transition-transform group-hover:scale-110",
                      item.size === "lg" ? "h-8 w-8" : item.size === "md" ? "h-6 w-6" : "h-5 w-5"
                    )}
                  />
                )}
                <span
                  className={cn(
                    "relative z-10 px-1 text-center font-medium leading-tight",
                    item.size === "lg" ? "text-sm" : "text-xs"
                  )}
                >
                  {t(item.name) || item.name}
                </span>
                {item.badge && (
                  <span className="absolute end-2 top-2 z-10 rounded-full bg-destructive px-1.5 py-0.5 text-[9px] font-bold text-destructive-foreground">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

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
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-5xl" style={{ borderRadius: "var(--border-radius)" }}>
          {children}
        </div>
      </main>

      {settings.showFooter && <Footer />}
    </div>
  );
}
