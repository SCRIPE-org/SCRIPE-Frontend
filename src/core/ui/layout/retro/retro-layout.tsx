"use client";

import type React from "react";
import { useState, useMemo, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { useLayoutStyles } from "@core/ui/layout/shared/use-layout-styles";
import { Logo } from "@core/ui/logo";
import { Button } from "@core/ui/button";
import { ScrollArea } from "@core/ui/scroll-area";
import { LanguageSwitcher, ThemeSwitcher } from "@core/ui/layout/common";
import { UserProfileDropdown } from "@core/ui/user-profile-dropdown";
import { NavRenderer } from "@core/ui/layout/shared/nav-renderer";
import { LogoutButton } from "@core/ui/layout/shared/logout-button";
import { Footer } from "@core/ui/layout/shared/footer";
import { useDynamicNavigation } from "@core/ui/navigation/dynamic-navigation";
import {
  isNavigationItemActive,
  getFlatNavigationItems,
  type NavigationItem,
} from "@core/config/navigation";
import { Minus, Square, X as XIcon, Menu } from "lucide-react";
import { cn } from "@core/common/utils";
import { NotificationBell } from "@core/ui/notification";

interface RetroLayoutProps {
  children: React.ReactNode;
}

/**
 * Retro Layout  Classic Desktop / Windows-inspired.
 *
 * Structure:
 * - Navigation panel styled as a "window" with title bar + [€][â–¡][Ã—]
 * - Main content as another "window" with title bar
 * - Bottom taskbar with module icons
 * - Classic inset/outset borders, System-like UI
 *
 * Inspired by Windows 95/98, classic desktop environments
 */
export function RetroLayout({ children }: RetroLayoutProps) {
  const { direction, t } = useI18n();
  const settings = useSettings();
  const styles = useLayoutStyles();
  const pathname = usePathname();
  const router = useRouter();
  const navigation = useDynamicNavigation();
  const flatItems = useMemo(() => getFlatNavigationItems(navigation), [navigation]);
  const isRTL = direction === "rtl";

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarMinimized, setSidebarMinimized] = useState(false);

  // Get current page title
  const currentPageTitle = useMemo(() => {
    for (const item of flatItems) {
      if (item.href && isNavigationItemActive(item, pathname)) {
        return t(item.name) || item.name;
      }
    }
    return t("common.dashboard") || "Dashboard";
  }, [flatItems, pathname, t]);

  // Taskbar items
  const taskbarItems = useMemo(() => {
    const items: NavigationItem[] = [];
    for (const item of navigation) {
      if (item.href) items.push(item);
      else if (item.children) {
        for (const child of item.children) {
          if (child.href) items.push(child);
        }
      }
    }
    return items.slice(0, 8);
  }, [navigation]);

  // Current time for taskbar
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={cn("flex min-h-screen flex-col", styles.getAnimationClass())} dir={direction}>
      {/* CSS for retro effects */}
      <style jsx global>{`
        .retro-layout {
          --retro-outset:
            inset -1px -1px 0 #0a0a0a, inset 1px 1px 0 #dfdfdf, inset -2px -2px 0 #808080,
            inset 2px 2px 0 #ffffff;
          --retro-inset:
            inset 1px 1px 0 #0a0a0a, inset -1px -1px 0 #dfdfdf, inset 2px 2px 0 #808080,
            inset -2px -2px 0 #ffffff;
          --retro-bg: #c0c0c0;
          --retro-title-active: linear-gradient(90deg, #000080, #1084d0);
          --retro-title-inactive: linear-gradient(90deg, #808080, #b0b0b0);
        }
        .dark .retro-layout {
          --retro-outset:
            inset -1px -1px 0 #1a1a2e, inset 1px 1px 0 #4a4a6a, inset -2px -2px 0 #2a2a4a,
            inset 2px 2px 0 #5a5a7a;
          --retro-inset:
            inset 1px 1px 0 #1a1a2e, inset -1px -1px 0 #4a4a6a, inset 2px 2px 0 #2a2a4a,
            inset -2px -2px 0 #5a5a7a;
          --retro-bg: #2a2a3e;
          --retro-title-active: linear-gradient(90deg, #1a1a4e, #2060a0);
          --retro-title-inactive: linear-gradient(90deg, #3a3a5a, #4a4a6a);
        }
      `}</style>

      <div
        className="retro-layout flex flex-1 gap-2 p-2"
        style={{ backgroundColor: "var(--retro-bg)" }}
      >
        {/*  Navigation Window  */}
        {sidebarOpen && !sidebarMinimized && (
          <>
            {/* Mobile overlay */}
            <div
              className="fixed inset-0 z-40 bg-black/30 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <div
              className={cn(
                "flex w-60 shrink-0 flex-col",
                "fixed z-50 lg:relative lg:z-auto",
                "top-2 h-[calc(100vh-52px)]",
                isRTL ? "right-2" : "left-2"
              )}
              style={{ boxShadow: "var(--retro-outset)" }}
            >
              {/* Title bar */}
              <div
                className="flex h-7 items-center justify-between px-2 py-1"
                style={{ background: "var(--retro-title-active)" }}
              >
                <span className="flex items-center gap-1 text-xs font-bold text-white">
                  ðŸ“ {t("common.navigation") || "Navigation"}
                </span>
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => setSidebarMinimized(true)}
                    className="flex h-4 w-4 items-center justify-center text-xs text-black"
                    style={{ boxShadow: "var(--retro-outset)", backgroundColor: "var(--retro-bg)" }}
                  >
                    <Minus className="h-2.5 w-2.5" />
                  </button>
                  <button
                    className="flex h-4 w-4 items-center justify-center text-xs text-black"
                    style={{ boxShadow: "var(--retro-outset)", backgroundColor: "var(--retro-bg)" }}
                  >
                    <Square className="h-2 w-2" />
                  </button>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="flex h-4 w-4 items-center justify-center text-xs text-black lg:hidden"
                    style={{ boxShadow: "var(--retro-outset)", backgroundColor: "var(--retro-bg)" }}
                  >
                    <XIcon className="h-2.5 w-2.5" />
                  </button>
                </div>
              </div>
              {/* Nav content */}
              <ScrollArea
                className="flex-1"
                style={{ boxShadow: "var(--retro-inset)", backgroundColor: "var(--retro-bg)" }}
              >
                <div className="p-2">
                  <NavRenderer
                    variant="compact"
                    onNavigate={() => {
                      if (window.innerWidth < 1024) setSidebarOpen(false);
                    }}
                  />
                </div>
                <div className="border-t p-2" style={{ borderColor: "#808080" }}>
                  <LogoutButton />
                </div>
              </ScrollArea>
            </div>
          </>
        )}

        {/*  Content Window  */}
        <div className="flex min-w-0 flex-1 flex-col" style={{ boxShadow: "var(--retro-outset)" }}>
          {/* Title bar */}
          <div
            className="flex h-7 shrink-0 items-center justify-between px-2 py-1"
            style={{ background: "var(--retro-title-active)" }}
          >
            <span className="flex items-center gap-1 text-xs font-bold text-white">
              ðŸ“„ {currentPageTitle}
            </span>
            <div className="flex items-center gap-1">
              <LanguageSwitcher />
              <ThemeSwitcher />
              <NotificationBell iconClassName="h-5 w-5" />
              <UserProfileDropdown showName={false} />
            </div>
          </div>
          {/* Menu bar */}
          <div
            className="flex h-6 shrink-0 items-center gap-0 px-1 text-xs"
            style={{ backgroundColor: "var(--retro-bg)" }}
          >
            <button
              className="px-2 py-0.5 transition-colors hover:bg-primary hover:text-primary-foreground lg:hidden"
              onClick={() => {
                setSidebarOpen(true);
                setSidebarMinimized(false);
              }}
            >
              <Menu className="inline h-3 w-3" /> {t("common.menu") || "Menu"}
            </button>
            <button
              className="hidden px-2 py-0.5 transition-colors hover:bg-primary hover:text-primary-foreground lg:block"
              onClick={() => {
                setSidebarOpen(!sidebarOpen);
                setSidebarMinimized(false);
              }}
            >
              {t("common.view") || "View"}
            </button>
            <button
              className="px-2 py-0.5 transition-colors hover:bg-primary hover:text-primary-foreground"
              onClick={() => router.push("/")}
            >
              {t("nav.home") || "Home"}
            </button>
          </div>
          {/* Content */}
          <div
            className="flex-1 overflow-auto"
            style={{ boxShadow: "var(--retro-inset)", backgroundColor: "var(--retro-bg)" }}
          >
            <div className="p-4">{children}</div>
          </div>
        </div>
      </div>

      {/*  Bottom Taskbar  */}
      <div
        className="flex h-10 shrink-0 items-center gap-1 px-1"
        style={{ boxShadow: "var(--retro-outset)", backgroundColor: "var(--retro-bg)" }}
      >
        {/* Start button */}
        <button
          className="flex h-7 items-center gap-1 px-2 text-xs font-bold"
          style={{ boxShadow: "var(--retro-outset)" }}
          onClick={() => {
            setSidebarOpen(true);
            setSidebarMinimized(false);
          }}
        >
          âŠž {t("common.start") || "Start"}
        </button>
        <div className="h-6 w-px" style={{ backgroundColor: "#808080" }} />
        {/* Active windows */}
        <div className="flex flex-1 items-center gap-0.5 overflow-x-auto">
          {sidebarOpen && (
            <button
              className="flex h-6 max-w-[120px] items-center gap-1 truncate px-2 text-xs"
              style={{
                boxShadow: sidebarMinimized ? "var(--retro-outset)" : "var(--retro-inset)",
                backgroundColor: "var(--retro-bg)",
              }}
              onClick={() => setSidebarMinimized(!sidebarMinimized)}
            >
              ðŸ“ {t("common.navigation") || "Nav"}
            </button>
          )}
          <button
            className="flex h-6 max-w-[120px] items-center gap-1 truncate px-2 text-xs"
            style={{ boxShadow: "var(--retro-inset)", backgroundColor: "var(--retro-bg)" }}
          >
            ðŸ“„ {currentPageTitle}
          </button>
        </div>
        {/* System tray */}
        <div
          className="flex h-6 items-center px-2 text-xs"
          style={{ boxShadow: "var(--retro-inset)" }}
        >
          {time}
        </div>
      </div>
    </div>
  );
}
