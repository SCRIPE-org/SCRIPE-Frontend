"use client";

import type React from "react";
import { useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Maximize2, Minimize2 } from "lucide-react";
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

interface FocusLayoutProps {
  children: React.ReactNode;
}

/**
 * Focus Mode Layout  Distraction-free with toggle to minimal UI.
 *
 * Structure:
 * - Ultra-minimal header (logo + focus toggle + profile)
 * - Full-screen content area
 * - Sidebar hidden by default, toggleable via menu button
 * - In focus mode: header collapses to floating pill
 *
 * Inspired by Notion zen mode, Obsidian, Typora
 */
export function FocusLayout({ children }: FocusLayoutProps) {
  const { direction, t } = useI18n();
  const settings = useSettings();
  const styles = useLayoutStyles();
  const pathname = usePathname();
  const router = useRouter();
  const navigation = useDynamicNavigation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);

  return (
    <div
      className={cn("min-h-screen bg-background transition-all", styles.getAnimationClass())}
      dir={direction}
    >
      {/*  Focus Mode Pill (shown when header is hidden)  */}
      {focusMode && (
        <div
          className={cn(
            "fixed top-4 z-50 flex items-center gap-2",
            "rounded-full border border-border bg-card/80 px-3 py-1.5 shadow-lg backdrop-blur-xl",
            "transition-all hover:bg-card",
            direction === "rtl" ? "right-4" : "left-4"
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setFocusMode(false)}
            title="Exit focus mode"
          >
            <Minimize2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {/*  Header (hidden in focus mode)  */}
      {!focusMode && (
        <header
          className={cn(
            settings.stickyHeader ? "sticky top-0 z-30" : "relative",
            "glass border-b border-border",
            "flex h-12 items-center justify-between px-4 lg:px-6"
          )}
        >
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <Logo size="sm" />
            <span className="hidden text-sm font-semibold text-foreground md:block">
              {t("app.title")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setFocusMode(true)}
              title="Enter focus mode"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            <LanguageSwitcher />
            <ThemeSwitcher />
            <NotificationBell iconClassName="h-5 w-5" />
            <UserProfileDropdown showName={false} />
          </div>
        </header>
      )}

      {/*  Sidebar Overlay  */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 z-30 bg-black/30" onClick={() => setSidebarOpen(false)} />
          <aside
            dir={direction}
            className={cn(
              "fixed bottom-0 top-0 z-40 flex w-72 flex-col overflow-y-auto border-e border-border bg-card",
              direction === "rtl" ? "right-0" : "left-0"
            )}
          >
            <div className="flex items-center justify-between border-b border-border p-4">
              <Logo size="sm" />
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="border-b border-border p-3">
              <UserCard size="sm" />
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <NavRenderer variant="default" onNavigate={() => setSidebarOpen(false)} />
            </div>
            <div className="border-t border-border p-3">
              <LogoutButton />
            </div>
          </aside>
        </>
      )}

      {/*  Content  */}
      <main className={cn("flex-1 p-6", focusMode && "p-8 lg:p-12")}>
        <div
          className={cn(focusMode && "mx-auto max-w-4xl")}
          style={{ borderRadius: "var(--border-radius)" }}
        >
          {children}
        </div>
      </main>

      {!focusMode && settings.showFooter && <Footer />}
    </div>
  );
}
