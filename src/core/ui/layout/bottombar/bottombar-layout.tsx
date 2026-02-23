"use client";

import type React from "react";
import { useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MoreHorizontal, X } from "lucide-react";
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

interface BottomBarLayoutProps {
  children: React.ReactNode;
}

/**
 * Bottom Bar Layout  Mobile-first navigation at the bottom.
 *
 * Structure:
 * - Thin top header with logo + actions
 * - Full-width content area
 * - Bottom navigation bar (60px) with icon+label per item
 * - Overflow items go into a "More" sheet
 *
 * Inspired by iOS, Android, Instagram, TikTok
 */
export function BottomBarLayout({ children }: BottomBarLayoutProps) {
  const { direction, t } = useI18n();
  const settings = useSettings();
  const styles = useLayoutStyles();
  const pathname = usePathname();
  const router = useRouter();
  const navigation = useDynamicNavigation();
  const [moreOpen, setMoreOpen] = useState(false);

  // Max 5 items in bottom bar, rest go to "More"
  const MAX_BAR_ITEMS = 4;

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

  const barItems = flatItems.slice(0, MAX_BAR_ITEMS);
  const overflowItems = flatItems.slice(MAX_BAR_ITEMS);
  const hasOverflow = overflowItems.length > 0;

  return (
    <div
      className={cn("flex min-h-screen flex-col bg-background", styles.getAnimationClass())}
      dir={direction}
    >
      {/*  Top Header  */}
      <header
        className={cn(
          settings.stickyHeader ? "sticky top-0 z-30" : "relative",
          "glass border-b border-border",
          "flex h-12 items-center justify-between px-4"
        )}
      >
        <div className="flex items-center gap-3">
          <Logo size="sm" />
          <h1 className="hidden text-sm font-semibold text-foreground sm:block">
            {t("app.title")}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeSwitcher />
          <NotificationBell iconClassName="h-5 w-5" />
          <UserProfileDropdown showName={false} />
        </div>
      </header>

      {/*  Content Area  */}
      <main className="flex-1 p-6 pb-20">
        <div
          style={{
            borderRadius: "var(--border-radius)",
          }}
        >
          {children}
        </div>
      </main>

      {settings.showFooter && <Footer />}

      {/*  "More" Overlay  */}
      {moreOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
            onClick={() => setMoreOpen(false)}
          />
          <div
            className={cn(
              "fixed bottom-16 z-50 max-h-[70vh] w-72",
              "overflow-hidden rounded-2xl border border-border bg-card shadow-2xl",
              "duration-200 animate-in slide-in-from-bottom-4",
              direction === "rtl" ? "left-4" : "right-4"
            )}
          >
            <div className="flex items-center justify-between border-b border-border p-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("layout.navigation") || "More"}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setMoreOpen(false)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="border-b border-border p-2">
              <UserCard size="sm" />
            </div>
            <div className="max-h-[40vh] overflow-y-auto p-2">
              <NavRenderer
                variant="compact"
                items={overflowItems}
                onNavigate={() => setMoreOpen(false)}
              />
            </div>
            <div className="border-t border-border p-2">
              <LogoutButton />
            </div>
          </div>
        </>
      )}

      {/*  Bottom Navigation Bar  */}
      <nav
        className={cn(
          "fixed inset-x-0 bottom-0 z-30",
          "border-t border-border bg-card/95 backdrop-blur-xl",
          "flex h-16 items-center justify-around px-2",
          "safe-area-inset-bottom"
        )}
      >
        {barItems.map((item) => {
          const Icon = item.icon;
          const isActive = isNavigationItemActive(item, pathname);
          return (
            <button
              key={item.name}
              onClick={() => item.href && router.push(item.href)}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {Icon && (
                <Icon className={cn("h-5 w-5 transition-transform", isActive && "scale-110")} />
              )}
              <span className="max-w-[56px] truncate text-[10px] font-medium leading-none">
                {t(item.name) || item.name}
              </span>
              {isActive && <div className="mt-0.5 h-1 w-1 rounded-full bg-primary" />}
            </button>
          );
        })}

        {/* "More" button */}
        {hasOverflow && (
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 transition-colors",
              moreOpen ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <MoreHorizontal className="h-5 w-5" />
            <span className="text-[10px] font-medium leading-none">
              {t("common.more") || "More"}
            </span>
          </button>
        )}
      </nav>
    </div>
  );
}
