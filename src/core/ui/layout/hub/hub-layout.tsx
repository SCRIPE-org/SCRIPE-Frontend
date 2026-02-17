"use client";

import type React from "react";
import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
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

interface HubLayoutProps {
  children: React.ReactNode;
}

/**
 * Hub / Portal Layout â€” Card-grid as primary navigation.
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
      className={cn("flex min-h-screen flex-col bg-background", styles.getAnimationClass())}
      dir={direction}
    >
      {/* â”€â”€ Header â”€â”€ */}
      <header
        className={cn(
          settings.stickyHeader ? "sticky top-0 z-30" : "relative",
          "glass border-b border-border",
          "flex h-14 items-center justify-between px-6"
        )}
      >
        <div className="flex items-center gap-3">
          <Logo size="sm" />
          <h1 className="text-sm font-bold text-foreground">{t("app.title")}</h1>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeSwitcher />
          <NotificationBell iconClassName="h-5 w-5" />
          <UserProfileDropdown showName />
        </div>
      </header>

      {/* â”€â”€ Hub Navigation Grid â”€â”€ */}
      <div className="border-b border-border/50 bg-muted/20 px-6 py-6">
        <div className="mx-auto max-w-5xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {t("common.quickActions") || "Quick Navigation"}
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {hubItems.map((item) => {
              const Icon = item.icon;
              const isActive = isNavigationItemActive(item, pathname);
              return (
                <button
                  key={item.name}
                  onClick={() => item.href && router.push(item.href)}
                  className={cn(
                    "group flex flex-col items-center gap-2 rounded-xl border p-4 transition-all",
                    isActive
                      ? "border-primary/30 bg-primary/10 text-primary shadow-sm"
                      : "border-border bg-card text-foreground hover:border-primary/20 hover:bg-primary/5 hover:shadow-sm"
                  )}
                >
                  {Icon && (
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
                        isActive ? "bg-primary/20" : "bg-muted group-hover:bg-primary/10"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                  )}
                  <span className="text-center text-xs font-medium leading-tight">
                    {t(item.name) || item.name}
                  </span>
                  {item.badge && (
                    <span className="rounded-full bg-destructive px-1.5 py-0.5 text-[9px] font-bold text-destructive-foreground">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* â”€â”€ Content â”€â”€ */}
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-5xl" style={{ borderRadius: "var(--border-radius)" }}>
          {children}
        </div>
      </main>

      {settings.showFooter && <Footer />}
    </div>
  );
}
