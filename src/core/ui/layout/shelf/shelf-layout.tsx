"use client";

import type React from "react";
import { useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { GripHorizontal } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { useLayoutStyles } from "@core/ui/layout/shared/use-layout-styles";
import { useDynamicNavigation } from "@core/ui/navigation/dynamic-navigation";
import { isNavigationItemActive, type NavigationItem } from "@core/config/navigation";
import { Logo } from "@core/ui/logo";
import { LanguageSwitcher, ThemeSwitcher } from "@core/ui/layout/common";
import { UserProfileDropdown } from "@core/ui/user-profile-dropdown";
import { Footer } from "@core/ui/layout/shared/footer";
import { cn } from "@core/common/utils";
import { NotificationBell } from "@core/ui/notification";
import { useBrandedAppName } from "@core/hooks/use-branded-app-name";

interface ShelfLayoutProps {
  children: React.ReactNode;
}

/**
 * Shelf / Drawer Layout  Bottom drawer navigation that slides up.
 *
 * Structure:
 * - Header with logo + actions
 * - Content area (most of the screen)
 * - Bottom shelf (collapsed: shows icons row, expanded: full nav)
 *
 * Inspired by Google Maps, Apple Maps, Android bottom sheets
 */
export function ShelfLayout({ children }: ShelfLayoutProps) {
  const { direction, t } = useI18n();
  const appName = useBrandedAppName();
  const settings = useSettings();
  const styles = useLayoutStyles();
  const pathname = usePathname();
  const router = useRouter();
  const navigation = useDynamicNavigation();
  const [expanded, setExpanded] = useState(false);

  const flatItems = useMemo(() => {
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
      className={cn("flex min-h-screen flex-col bg-background", styles.getAnimationClass())}
      dir={direction}
    >
      {/*  Header  */}
      <header
        className={cn(
          settings.stickyHeader ? "sticky top-0 z-30" : "relative",
          "glass border-b border-border",
          "flex h-12 items-center justify-between px-6"
        )}
      >
        <div className="flex items-center gap-3">
          <Logo size="sm" />
          <span className="hidden text-sm font-semibold text-foreground sm:block">{appName}</span>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeSwitcher />
          <NotificationBell iconClassName="h-5 w-5" />
          <UserProfileDropdown showName={false} />
        </div>
      </header>

      {/*  Content  */}
      <main className={cn("flex-1 p-6", expanded ? "pb-72" : "pb-24")}>
        <div style={{ borderRadius: "var(--border-radius)" }}>{children}</div>
      </main>

      {settings.showFooter && <Footer />}

      {/*  Backdrop when expanded  */}
      {expanded && (
        <div className="fixed inset-0 z-30 bg-black/20" onClick={() => setExpanded(false)} />
      )}

      {/*  Bottom Shelf  */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-40",
          "rounded-t-2xl border-t border-border bg-card shadow-2xl",
          "transition-all duration-300 ease-out",
          expanded ? "h-64" : "h-20"
        )}
      >
        {/* Drag handle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full cursor-pointer items-center justify-center pb-1 pt-2"
        >
          <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
        </button>

        {expanded ? (
          /*  Expanded: full grid  */
          <div className="h-[calc(100%-24px)] overflow-y-auto px-4 pb-4">
            <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t("layout.navigation") || "Navigation"}
            </p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
              {flatItems.map((item) => {
                const Icon = item.icon;
                const isActive = isNavigationItemActive(item, pathname, navigation);
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      if (item.href) router.push(item.href);
                      setExpanded(false);
                    }}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-xl p-3 transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    {Icon && <Icon className="h-5 w-5" />}
                    <span className="w-full truncate text-center text-[10px] font-medium leading-tight">
                      {t(item.name) || item.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /*  Collapsed: icon row  */
          <div className="flex h-[calc(100%-16px)] items-center justify-around px-2">
            {flatItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const isActive = isNavigationItemActive(item, pathname, navigation);
              return (
                <button
                  key={item.name}
                  onClick={() => item.href && router.push(item.href)}
                  className={cn(
                    "flex flex-col items-center gap-0.5 py-1 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {Icon && <Icon className="h-5 w-5" />}
                  <span className="text-[9px] font-medium">{t(item.name) || item.name}</span>
                </button>
              );
            })}
            <button
              onClick={() => setExpanded(true)}
              className="flex flex-col items-center gap-0.5 py-1 text-muted-foreground hover:text-foreground"
            >
              <GripHorizontal className="h-5 w-5" />
              <span className="text-[9px] font-medium">{t("common.more") || "More"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
