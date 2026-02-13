"use client";

import type React from "react";
import { useState, useMemo, useRef, useEffect } from "react";
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
      getFlatNavigationItems,
      type NavigationItem,
} from "@core/config/navigation";
import { Bell, Search, Home } from "lucide-react";
import { cn } from "@core/common/utils";

interface DockLayoutProps {
      children: React.ReactNode;
}

/**
 * Dock Layout — macOS-style bottom dock bar.
 *
 * Structure:
 * - Thin topbar with branding + user profile + actions
 * - Full-width content area (maximum space)
 * - Bottom floating dock bar with animated icons
 * - No sidebar at all
 *
 * Inspired by macOS Dock, iPad bottom bar, Material bottom nav
 */
export function DockLayout({ children }: DockLayoutProps) {
      const { direction, t } = useI18n();
      const settings = useSettings();
      const styles = useLayoutStyles();
      const pathname = usePathname();
      const router = useRouter();
      const navigation = useDynamicNavigation();
      const flatItems = useMemo(() => getFlatNavigationItems(navigation), [navigation]);
      const isRTL = direction === "rtl";

      // Only show top-level items and items with href in the dock
      const dockItems = useMemo(() => {
            const items: NavigationItem[] = [];
            for (const item of navigation) {
                  if (item.href) {
                        items.push(item);
                  } else if (item.children) {
                        // Add parent as label, then children
                        for (const child of item.children) {
                              if (child.href) items.push(child);
                        }
                  }
            }
            return items.slice(0, 8); // Max 8 dock items
      }, [navigation]);

      const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

      return (
            <div
                  className={cn(
                        "min-h-screen flex flex-col",
                        styles.getAnimationClass(),
                        direction === "rtl" ? "rtl" : "ltr",
                  )}
                  dir={direction}
            >
                  {/* ── Thin Topbar ── */}
                  <header
                        className={cn(
                              settings.stickyHeader ? "sticky top-0 z-30" : "relative",
                              "glass border-b border-border",
                              "flex items-center justify-between px-6 h-12",
                        )}
                  >
                        <div className="flex items-center gap-3">
                              <Logo size="sm" />
                        </div>
                        <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => router.push("/")}>
                                    <Home className="w-4 h-4" />
                              </Button>
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

                  {/* ── Content Area (full width, max height) ── */}
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

                  {/* ── Floating Dock Bar ── */}
                  <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
                        <TooltipProvider delayDuration={100}>
                              <nav
                                    className={cn(
                                          "flex items-end gap-1 px-3 py-2",
                                          "rounded-2xl",
                                          "bg-card/90 backdrop-blur-xl",
                                          "border border-border/60",
                                          "shadow-2xl shadow-black/20 dark:shadow-black/40",
                                    )}
                              >
                                    {dockItems.map((item, index) => {
                                          const Icon = item.icon;
                                          const isActive = isNavigationItemActive(item, pathname);
                                          const isHovered = hoveredIndex === index;
                                          const isNeighbor =
                                                hoveredIndex !== null &&
                                                Math.abs(hoveredIndex - index) === 1;

                                          // macOS magnification effect
                                          const scale = isHovered ? 1.35 : isNeighbor ? 1.15 : 1;
                                          const translateY = isHovered ? -8 : isNeighbor ? -3 : 0;

                                          return (
                                                <Tooltip key={item.name}>
                                                      <TooltipTrigger asChild>
                                                            <button
                                                                  onClick={() => item.href && router.push(item.href)}
                                                                  onMouseEnter={() => setHoveredIndex(index)}
                                                                  onMouseLeave={() => setHoveredIndex(null)}
                                                                  className={cn(
                                                                        "flex flex-col items-center justify-center",
                                                                        "w-12 h-12 rounded-xl",
                                                                        "transition-all duration-200 ease-out",
                                                                        "cursor-pointer",
                                                                        isActive
                                                                              ? "bg-primary/15 text-primary"
                                                                              : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                                                                  )}
                                                                  style={{
                                                                        transform: `scale(${scale}) translateY(${translateY}px)`,
                                                                  }}
                                                            >
                                                                  {Icon && <Icon className="w-5 h-5" />}
                                                                  {/* Active indicator dot */}
                                                                  {isActive && (
                                                                        <div className="w-1 h-1 rounded-full bg-primary mt-0.5" />
                                                                  )}
                                                            </button>
                                                      </TooltipTrigger>
                                                      <TooltipContent side="top" className="font-medium">
                                                            {t(item.name) || item.name}
                                                      </TooltipContent>
                                                </Tooltip>
                                          );
                                    })}
                              </nav>
                        </TooltipProvider>
                  </div>
            </div>
      );
}
