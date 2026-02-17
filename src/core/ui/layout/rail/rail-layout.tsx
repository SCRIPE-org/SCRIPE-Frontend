"use client";

import type React from "react";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { useLayoutStyles } from "@core/ui/layout/shared/use-layout-styles";
import { Logo } from "@core/ui/logo";
import { Button } from "@core/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@core/ui/tooltip";
import { LanguageSwitcher, ThemeSwitcher, HeaderSearch } from "@core/ui/layout/common";
import { UserProfileDropdown } from "@core/ui/user-profile-dropdown";
import { Footer } from "@core/ui/layout/shared/footer";
import { useDynamicNavigation } from "@core/ui/navigation/dynamic-navigation";
import { isNavigationItemActive, type NavigationItem } from "@core/config/navigation";
import { Home, ChevronRight } from "lucide-react";
import { cn } from "@core/common/utils";
import { NotificationBell } from "@core/ui/notification";

interface RailLayoutProps {
  children: React.ReactNode;
}

/**
 * Rail Layout — Permanent mini icon rail with floating popovers.
 *
 * Structure:
 * - Ultra-narrow icon rail (56px) — permanently visible, never expands
 * - Clicking icon with children opens a floating popover next to it
 * - Full-width header with all standard controls
 * - Maximum content space
 *
 * Inspired by Figma's left rail, Webflow's tool palette, InDesign
 */
export function RailLayout({ children }: RailLayoutProps) {
  const { direction, t } = useI18n();
  const settings = useSettings();
  const styles = useLayoutStyles();
  const pathname = usePathname();
  const router = useRouter();
  const navigation = useDynamicNavigation();
  const isRTL = direction === "rtl";

  const [activePopover, setActivePopover] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLElement>(null);

  // Close popover on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        railRef.current &&
        !railRef.current.contains(e.target as Node)
      ) {
        setActivePopover(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close popover on route change
  useEffect(() => {
    setActivePopover(null);
  }, [pathname]);

  const handleRailClick = useCallback(
    (item: NavigationItem) => {
      if (item.href && (!item.children || item.children.length === 0)) {
        router.push(item.href);
        setActivePopover(null);
      } else if (item.children && item.children.length > 0) {
        setActivePopover(activePopover === item.name ? null : item.name);
      }
    },
    [activePopover, router]
  );

  // Get the active item's button position for popover
  const [popoverTop, setPopoverTop] = useState(0);
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const openPopoverForItem = useCallback((item: NavigationItem, button: HTMLButtonElement) => {
    const rect = button.getBoundingClientRect();
    setPopoverTop(rect.top);
    setActivePopover(item.name);
  }, []);

  const activePopoverItem = useMemo(
    () => navigation.find((n) => n.name === activePopover),
    [navigation, activePopover]
  );

  return (
    <div
      className={cn("flex min-h-screen bg-background", styles.getAnimationClass())}
      dir={direction}
    >
      {/* ── Permanent Icon Rail (56px) ── */}
      <aside
        ref={railRef}
        className={cn(
          "hidden w-14 shrink-0 flex-col items-center lg:flex",
          "border-e border-border bg-card",
          "py-3"
        )}
      >
        <div className="mb-4">
          <Logo size="sm" />
        </div>

        <TooltipProvider delayDuration={0}>
          <nav className="flex flex-1 flex-col items-center gap-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const hasChildren = item.children && item.children.length > 0;
              const isActive = item.href
                ? isNavigationItemActive(item, pathname)
                : item.children?.some((c) => c.href && isNavigationItemActive(c, pathname));
              const isPopoverOpen = activePopover === item.name;

              return (
                <Tooltip key={item.name}>
                  <TooltipTrigger asChild>
                    <button
                      ref={(el) => {
                        if (el) buttonRefs.current.set(item.name, el);
                      }}
                      onClick={(e) => {
                        if (hasChildren) {
                          openPopoverForItem(item, e.currentTarget);
                        } else {
                          handleRailClick(item);
                        }
                      }}
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl transition-all",
                        isActive
                          ? "bg-primary/15 text-primary"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                        isPopoverOpen && "bg-muted text-foreground ring-1 ring-border"
                      )}
                    >
                      {Icon && <Icon className="w-4.5 h-4.5" />}
                    </button>
                  </TooltipTrigger>
                  {!isPopoverOpen && (
                    <TooltipContent side={isRTL ? "left" : "right"}>
                      {t(item.name) || item.name}
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </nav>
        </TooltipProvider>
      </aside>

      {/* ── Floating Popover ── */}
      {activePopoverItem && activePopoverItem.children && (
        <div
          ref={popoverRef}
          className={cn("fixed z-50", isRTL ? "right-[60px]" : "left-[60px]")}
          style={{ top: `${popoverTop}px` }}
        >
          <div
            className={cn(
              "w-56 rounded-xl py-2",
              "border border-border bg-card",
              "shadow-xl shadow-black/10 dark:shadow-black/30"
            )}
          >
            <div className="px-3 pb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t(activePopoverItem.name) || activePopoverItem.name}
            </div>
            {activePopoverItem.children.map((child) => {
              const ChildIcon = child.icon;
              const isChildActive = child.href ? isNavigationItemActive(child, pathname) : false;
              return (
                <button
                  key={child.name}
                  onClick={() => {
                    if (child.href) {
                      router.push(child.href);
                      setActivePopover(null);
                    }
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors",
                    isChildActive
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-foreground/70 hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  {ChildIcon && <ChildIcon className="h-4 w-4 shrink-0" />}
                  <span>{t(child.name) || child.name}</span>
                  {isChildActive && <div className="ms-auto h-1.5 w-1.5 rounded-full bg-primary" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Main Area ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header
          className={cn(
            settings.stickyHeader ? "sticky top-0 z-30" : "relative",
            "glass border-b border-border",
            "flex h-14 items-center justify-between px-6"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="lg:hidden">
              <Logo size="sm" />
            </div>
            <HeaderSearch
              containerClassName="hidden md:block"
              inputClassName="bg-muted/50 border-0 focus:bg-background w-72 rounded-lg"
              iconClassName={isRTL ? "right-3 left-auto" : "left-3"}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
              <Home className="h-4 w-4" />
            </Button>
            <LanguageSwitcher />
            <ThemeSwitcher />
            {settings.showNotifications && (
              <NotificationBell iconClassName="h-5 w-5" />
            )}
            <UserProfileDropdown showName={false} />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1">
          <div className={cn(styles.getSpacingClass())}>
            <div style={{ borderRadius: "var(--border-radius)", padding: "var(--spacing-unit)" }}>
              {children}
            </div>
          </div>
        </main>

        {settings.showFooter && <Footer />}
      </div>
    </div>
  );
}
