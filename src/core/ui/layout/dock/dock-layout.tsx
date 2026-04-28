"use client";

import type React from "react";
import { useState, useMemo, useRef, useCallback } from "react";
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
import { isNavigationItemActive, type NavigationItem } from "@core/config/navigation";
import { Home, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@core/common/utils";
import { NotificationBell } from "@core/ui/notification";

interface DockLayoutProps {
  children: React.ReactNode;
}

/**
 * Dock Layout — macOS-style bottom dock bar.
 *
 * Structure:
 * - Thin topbar with branding + user profile + actions
 * - Full-width content area (maximum space)
 * - Bottom floating dock bar with animated icons, scroll, badge counts
 * - No sidebar at all
 *
 * Features:
 * - Scrollable dock with left/right arrows on overflow
 * - macOS magnification — hovered icon scales up, neighbors scale mid
 * - Badge count dots on items with badges
 * - Handles tree items by flattening children
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
  const isRTL = direction === "rtl";

  // Flatten navigation: top-level with href + children from groups
  const dockItems = useMemo(() => {
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
    return items; // No cap — scrollable
  }, [navigation]);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    if (isRTL) {
      setCanScrollLeft(
        scrollLeft < 0 ? Math.abs(scrollLeft) < scrollWidth - clientWidth - 2 : false
      );
      setCanScrollRight(scrollLeft < 0 ? true : scrollWidth > clientWidth);
    } else {
      setCanScrollLeft(scrollLeft > 2);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 2);
    }
  }, [isRTL]);

  const scrollDock = useCallback(
    (dir: "left" | "right") => {
      const el = scrollRef.current;
      if (!el) return;
      const amount = dir === "left" ? -160 : 160;
      el.scrollBy({ left: isRTL ? -amount : amount, behavior: "smooth" });
      setTimeout(updateScrollArrows, 300);
    },
    [isRTL, updateScrollArrows]
  );

  return (
    <div
      className={cn(
        "flex min-h-screen flex-col",
        styles.getAnimationClass(),
        direction === "rtl" ? "rtl" : "ltr"
      )}
      dir={direction}
    >
      {/* ── Thin Topbar ── */}
      <header
        className={cn(
          settings.stickyHeader ? "sticky top-0 z-30" : "relative",
          "glass border-b border-border",
          "flex h-12 items-center justify-between px-6"
        )}
      >
        <div className="flex items-center gap-3">
          <Logo size="sm" />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push("/")}>
            <Home className="h-4 w-4" />
          </Button>
          <LanguageSwitcher />
          <ThemeSwitcher />
          {settings.showNotifications && (
            <NotificationBell iconClassName="h-5 w-5" className="h-8 w-8" />
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
      <div className="fixed bottom-4 left-1/2 z-50 max-w-[90vw] -translate-x-1/2">
        <TooltipProvider delayDuration={100}>
          <div className="relative flex items-center">
            {/* Left scroll arrow */}
            {canScrollLeft && (
              <button
                onClick={() => scrollDock("left")}
                className={cn(
                  "absolute z-10 h-7 w-7 rounded-full",
                  "border border-border/60 bg-card/95 backdrop-blur",
                  "flex items-center justify-center",
                  "text-muted-foreground shadow-lg hover:text-foreground",
                  "transition-all",
                  isRTL ? "-right-3" : "-left-3"
                )}
              >
                <ChevronLeft className={cn("h-4 w-4", isRTL && "rotate-180")} />
              </button>
            )}

            {/* Dock container */}
            <div
              ref={scrollRef}
              onScroll={updateScrollArrows}
              onMouseEnter={updateScrollArrows}
              className={cn(
                "flex items-end gap-1 px-3 py-2",
                "rounded-2xl",
                "bg-card/90 backdrop-blur-xl",
                "border border-border/60",
                "shadow-2xl shadow-black/20 dark:shadow-black/40",
                "scrollbar-hide overflow-x-auto",
                "scroll-smooth"
              )}
              style={{ maxWidth: "80vw" }}
            >
              {dockItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = isNavigationItemActive(item, pathname, navigation);
                const isHovered = hoveredIndex === index;
                const isNeighbor = hoveredIndex !== null && Math.abs(hoveredIndex - index) === 1;

                // macOS magnification effect
                const scale = isHovered ? 1.4 : isNeighbor ? 1.15 : 1;
                const translateY = isHovered ? -10 : isNeighbor ? -4 : 0;

                return (
                  <Tooltip key={item.name}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => item.href && router.push(item.href)}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        className={cn(
                          "relative flex flex-col items-center justify-center",
                          "h-12 w-12 shrink-0 rounded-xl",
                          "transition-all duration-200 ease-out",
                          "cursor-pointer",
                          isActive
                            ? "bg-primary/15 text-primary"
                            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                        )}
                        style={{
                          transform: `scale(${scale}) translateY(${translateY}px)`,
                        }}
                      >
                        {Icon && <Icon className="h-5 w-5" />}

                        {/* Badge count */}
                        {item.badge && (
                          <span
                            className={cn(
                              "absolute -end-1 -top-1 h-[18px] min-w-[18px]",
                              "flex items-center justify-center",
                              "rounded-full text-[10px] font-bold leading-none",
                              "bg-destructive text-destructive-foreground",
                              "border-2 border-card",
                              "px-1"
                            )}
                          >
                            {item.badge}
                          </span>
                        )}

                        {/* Active indicator dot */}
                        {isActive && <div className="mt-0.5 h-1 w-1 rounded-full bg-primary" />}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="font-medium">
                      {t(item.name) || item.name}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>

            {/* Right scroll arrow */}
            {canScrollRight && (
              <button
                onClick={() => scrollDock("right")}
                className={cn(
                  "absolute z-10 h-7 w-7 rounded-full",
                  "border border-border/60 bg-card/95 backdrop-blur",
                  "flex items-center justify-center",
                  "text-muted-foreground shadow-lg hover:text-foreground",
                  "transition-all",
                  isRTL ? "-left-3" : "-right-3"
                )}
              >
                <ChevronRight className={cn("h-4 w-4", isRTL && "rotate-180")} />
              </button>
            )}
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
}
