"use client";

import type React from "react";
import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { useLayoutStyles } from "@core/ui/layout/shared/use-layout-styles";
import { Logo } from "@core/ui/logo";
import { Button } from "@core/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@core/ui/tooltip";
import { LanguageSwitcher, ThemeSwitcher } from "@core/ui/layout/common";
import { UserProfileDropdown } from "@core/ui/user-profile-dropdown";
import { Footer } from "@core/ui/layout/shared/footer";
import { useDynamicNavigation } from "@core/ui/navigation/dynamic-navigation";
import {
      isNavigationItemActive,
      getFlatNavigationItems,
      type NavigationItem,
} from "@core/config/navigation";
import { Bell } from "lucide-react";
import { cn } from "@core/common/utils";

interface MagazineLayoutProps {
      children: React.ReactNode;
}

/**
 * Magazine Layout — Content-first reading experience.
 *
 * Structure:
 * - Ultra-slim left icon rail (48px) — icons only, tooltip on hover
 * - Wide centered content column (max-720px) — reading-optimized
 * - Optional right widget sidebar (200px) — contextual widgets
 * - Thin top bar with minimal actions
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
      const flatItems = useMemo(() => getFlatNavigationItems(navigation), [navigation]);
      const isRTL = direction === "rtl";

      // Get navigable items for the icon rail
      const railItems = useMemo(() => {
            const items: NavigationItem[] = [];
            for (const item of navigation) {
                  if (item.href) items.push(item);
                  else if (item.children) {
                        items.push(item); // group icon
                        for (const child of item.children) {
                              if (child.href) items.push(child);
                        }
                  }
            }
            return items.slice(0, 10);
      }, [navigation]);

      return (
            <div
                  className={cn(
                        "min-h-screen flex bg-background",
                        styles.getAnimationClass(),
                  )}
                  dir={direction}
            >
                  {/* ── Ultra-Slim Icon Rail (48px) ── */}
                  <aside
                        className={cn(
                              "hidden lg:flex flex-col items-center w-12 shrink-0",
                              "bg-card border-e border-border",
                              "py-3 gap-1",
                        )}
                  >
                        <div className="mb-3">
                              <Logo size="sm" />
                        </div>

                        <TooltipProvider delayDuration={0}>
                              <nav className="flex flex-col items-center gap-0.5 flex-1">
                                    {railItems.map((item) => {
                                          const Icon = item.icon;
                                          const isActive = item.href ? isNavigationItemActive(item, pathname) : false;
                                          return (
                                                <Tooltip key={item.name}>
                                                      <TooltipTrigger asChild>
                                                            <button
                                                                  onClick={() => item.href && router.push(item.href)}
                                                                  className={cn(
                                                                        "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
                                                                        isActive
                                                                              ? "bg-primary/15 text-primary"
                                                                              : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                                                                        !item.href && "opacity-50 cursor-default",
                                                                  )}
                                                            >
                                                                  {Icon && <Icon className="w-4 h-4" />}
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
                  </aside>

                  {/* ── Main Area ── */}
                  <div className="flex-1 flex flex-col min-w-0">
                        {/* Thin header */}
                        <header
                              className={cn(
                                    settings.stickyHeader ? "sticky top-0 z-30" : "relative",
                                    "glass border-b border-border",
                                    "flex items-center justify-between px-6 h-11",
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
                                          <Button variant="ghost" size="icon" className="w-8 h-8">
                                                <Bell className="w-4 h-4" />
                                          </Button>
                                    )}
                                    <UserProfileDropdown showName={false} />
                              </div>
                        </header>

                        {/* Content + Widget sidebar */}
                        <div className="flex-1 flex">
                              {/* Centered content column */}
                              <main className="flex-1 flex justify-center">
                                    <div className="w-full max-w-3xl px-6 py-8">
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
                                          "hidden xl:flex flex-col w-56 shrink-0",
                                          "border-s border-border bg-card/50",
                                          "p-4 gap-4",
                                    )}
                              >
                                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                          {t("common.quickActions") || "Quick Info"}
                                    </div>
                                    {/* Placeholder widgets */}
                                    <div className="rounded-lg bg-muted/30 border border-border/40 p-3">
                                          <div className="text-xs text-muted-foreground">{t("common.stats") || "Stats"}</div>
                                          <div className="text-lg font-bold mt-1">—</div>
                                    </div>
                                    <div className="rounded-lg bg-muted/30 border border-border/40 p-3">
                                          <div className="text-xs text-muted-foreground">{t("common.recent") || "Recent"}</div>
                                          <div className="text-sm text-muted-foreground mt-1">—</div>
                                    </div>
                              </aside>
                        </div>

                        {settings.showFooter && <Footer />}
                  </div>
            </div>
      );
}
