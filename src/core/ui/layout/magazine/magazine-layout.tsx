"use client";

import type React from "react";
import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { useLayoutStyles } from "@core/ui/layout/shared/use-layout-styles";
import { Logo } from "@core/ui/logo";
import { Button } from "@core/ui/button";
import { ScrollArea } from "@core/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@core/ui/tooltip";
import { LanguageSwitcher, ThemeSwitcher } from "@core/ui/layout/common";
import { UserProfileDropdown } from "@core/ui/user-profile-dropdown";
import { Footer } from "@core/ui/layout/shared/footer";
import { useDynamicNavigation } from "@core/ui/navigation/dynamic-navigation";
import { isNavigationItemActive, type NavigationItem } from "@core/config/navigation";
import { cn } from "@core/common/utils";
import { NotificationBell } from "@core/ui/notification";

interface MagazineLayoutProps {
  children: React.ReactNode;
}

/**
 * Magazine Layout — Content-first reading experience.
 *
 * Structure:
 * - Ultra-slim left icon rail (48px) — icons only, tooltip on hover
 * - Wide centered content column — reading-optimized
 * - Optional right widget sidebar (200px) — contextual widgets
 * - Thin top bar with minimal actions
 *
 * Fixes:
 * - Only shows navigable items (with href) in the rail
 * - Group parents are NOT shown as disabled — only their children appear
 * - No arbitrary item cap — rail scrolls vertically
 * - Badge dots on items with badges
 *
 * Inspired by Medium, Substack, Bloomberg, Financial Times
 */
export function MagazineLayout({ children }: MagazineLayoutProps) {
  const { direction, t } = useI18n();
  const settings = useSettings();
  const styles = useLayoutStyles();
  const pathname = usePathname();
  const router = useRouter();
  const navigation = useDynamicNavigation();
  const isRTL = direction === "rtl";

  // Flatten to only navigable items (with href) — NO group parents
  const railItems = useMemo(() => {
    const items: NavigationItem[] = [];
    for (const item of navigation) {
      if (item.href) {
        items.push(item);
      } else if (item.children) {
        // Only push children with href, skip the parent
        for (const child of item.children) {
          if (child.href) items.push(child);
        }
      }
    }
    return items; // No cap — scrollable rail
  }, [navigation]);

  return (
    <div
      className={cn("flex min-h-screen bg-background", styles.getAnimationClass())}
      dir={direction}
    >
      {/* ── Ultra-Slim Icon Rail (48px) ── */}
      <aside
        className={cn(
          "hidden w-12 shrink-0 flex-col items-center lg:flex",
          "border-e border-border bg-card"
        )}
      >
        <div className="mb-1 py-3">
          <Logo size="sm" />
        </div>

        <ScrollArea className="w-full flex-1">
          <TooltipProvider delayDuration={0}>
            <nav className="flex flex-col items-center gap-0.5 px-1.5 py-1">
              {railItems.map((item) => {
                const Icon = item.icon;
                const isActive = isNavigationItemActive(item, pathname);
                return (
                  <Tooltip key={item.name}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => item.href && router.push(item.href)}
                        className={cn(
                          "relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                          isActive
                            ? "bg-primary/15 text-primary"
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        )}
                      >
                        {Icon && <Icon className="h-4 w-4" />}

                        {/* Badge dot */}
                        {item.badge && (
                          <span
                            className={cn(
                              "absolute end-0.5 top-0.5 h-[14px] min-w-[14px]",
                              "flex items-center justify-center",
                              "rounded-full text-[8px] font-bold leading-none",
                              "bg-destructive text-destructive-foreground",
                              "px-0.5"
                            )}
                          >
                            {typeof item.badge === "number" ? item.badge : "•"}
                          </span>
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side={isRTL ? "left" : "right"}>
                      {t(item.name) || item.name}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </nav>
          </TooltipProvider>
        </ScrollArea>
      </aside>

      {/* ── Main Area ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Thin header */}
        <header
          className={cn(
            settings.stickyHeader ? "sticky top-0 z-30" : "relative",
            "glass border-b border-border",
            "flex h-11 items-center justify-between px-6"
          )}
        >
          <div className="flex items-center gap-2 lg:hidden">
            <Logo size="sm" />
          </div>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeSwitcher />
            {settings.showNotifications && (
              <NotificationBell iconClassName="h-4 w-4" className="h-8 w-8" />
            )}
            <UserProfileDropdown showName={false} />
          </div>
        </header>

        {/* Content + Widget sidebar */}
        <div className="flex flex-1">
          {/* Content column — fills available space */}
          <main className="min-w-0 flex-1">
            <div className="w-full px-6 py-8">
              <div
                style={{
                  borderRadius: "var(--border-radius)",
                }}
              >
                {children}
              </div>
            </div>
          </main>

          {/* Right widget sidebar */}
          <aside
            className={cn(
              "hidden w-56 shrink-0 flex-col xl:flex",
              "border-s border-border bg-card/50",
              "gap-4 p-4"
            )}
          >
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("common.quickActions") || "Quick Info"}
            </div>
            {/* Placeholder widgets */}
            <div className="rounded-lg border border-border/40 bg-muted/30 p-3">
              <div className="text-xs text-muted-foreground">{t("common.stats") || "Stats"}</div>
              <div className="mt-1 text-lg font-bold">—</div>
            </div>
            <div className="rounded-lg border border-border/40 bg-muted/30 p-3">
              <div className="text-xs text-muted-foreground">{t("common.recent") || "Recent"}</div>
              <div className="mt-1 text-sm text-muted-foreground">—</div>
            </div>
          </aside>
        </div>

        {settings.showFooter && <Footer />}
      </div>
    </div>
  );
}
