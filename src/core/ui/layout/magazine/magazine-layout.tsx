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
import {
      isNavigationItemActive,
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
                        )}
                  >
                        <div className="py-3 mb-1">
                              <Logo size="sm" />
                        </div>

                        <ScrollArea className="flex-1 w-full">
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
                                                                              "relative w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
                                                                              isActive
                                                                                    ? "bg-primary/15 text-primary"
                                                                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                                                                        )}
                                                                  >
                                                                        {Icon && <Icon className="w-4 h-4" />}

                                                                        {/* Badge dot */}
                                                                        {item.badge && (
                                                                              <span className={cn(
                                                                                    "absolute top-0.5 end-0.5 min-w-[14px] h-[14px]",
                                                                                    "flex items-center justify-center",
                                                                                    "rounded-full text-[8px] font-bold leading-none",
                                                                                    "bg-destructive text-destructive-foreground",
                                                                                    "px-0.5",
                                                                              )}>
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
                              {/* Content column — fills available space */}
                              <main className="flex-1 min-w-0">
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
