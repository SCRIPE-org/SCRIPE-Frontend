"use client";

import type React from "react";
import { useState, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@core/ui/button";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { cn } from "@core/common/utils";
import { Logo } from "@core/ui/logo";
import { UserProfileDropdown } from "@core/ui/user-profile-dropdown";
import { LanguageSwitcher, ThemeSwitcher } from "../common";
import { NavRenderer } from "../shared/nav-renderer";
import { LogoutButton } from "../shared/logout-button";
import { Footer } from "../shared/footer";
import { useDynamicNavigation } from "@core/ui/navigation/dynamic-navigation";
import { isNavigationItemActive, type NavigationItem } from "@core/config/navigation";
import { NotificationBell } from "@core/ui/notification";

interface TabbedLayoutProps {
  children: React.ReactNode;
  sidebarOpen: boolean;
  onSidebarOpenChange: (open: boolean) => void;
}

/**
 * Tabbed Layout â€” Inspired by Google Cloud Console / Jira.
 *
 * Structure:
 * â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
 * â”‚ HEADER (56px) â€” logo, search, profile    â”‚
 * â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
 * â”‚ TAB BAR (44px) â€” horizontal scrollable   â”‚
 * â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
 * â”‚ SUB-NAV  â”‚                               â”‚
 * â”‚ (240px)  â”‚       MAIN CONTENT            â”‚
 * â”‚ children â”‚                               â”‚
 * â”‚ of tab   â”‚                               â”‚
 * â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
 * â”‚ FOOTER (if enabled)                      â”‚
 * â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
 */
export function TabbedLayout({ children, sidebarOpen, onSidebarOpenChange }: TabbedLayoutProps) {
  const pathname = usePathname();
  const { t, direction } = useI18n();
  const { showFooter, collapsibleSidebar } = useSettings();
  const navigation = useDynamicNavigation();

  // Top-level items become tabs
  const tabs = useMemo(() => navigation.filter((item) => !item.disabled), [navigation]);

  // Find the active tab (the top-level item whose children contain the active page)
  const activeTabIndex = useMemo(() => {
    const idx = tabs.findIndex(
      (tab) =>
        isNavigationItemActive(tab, pathname) ||
        tab.children?.some((child) => isNavigationItemActive(child, pathname))
    );
    return idx >= 0 ? idx : 0;
  }, [tabs, pathname]);

  const [selectedTab, setSelectedTab] = useState(activeTabIndex);
  useEffect(() => setSelectedTab(activeTabIndex), [activeTabIndex]);

  const activeTab = tabs[selectedTab];
  const hasSubNav = activeTab?.children && activeTab.children.length > 0;

  return (
    <div className={cn("min-h-screen bg-background", direction === "rtl" ? "rtl" : "ltr")}>
      {/* â”€â”€ HEADER â”€â”€ */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center border-b border-border bg-card px-4 backdrop-blur-sm lg:px-6">
        {/* Left: Logo + Mobile Toggle */}
        <div className="flex shrink-0 items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => onSidebarOpenChange(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Logo size="sm" className="text-primary-foreground" />
          </div>
          <h1 className="hidden text-base font-semibold text-foreground sm:block">
            {t("app.title")}
          </h1>
        </div>

        <div className="flex-1" />

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <ThemeSwitcher
            buttonClassName="hover:bg-accent"
            contentClassName="bg-popover border-border"
          />
          <LanguageSwitcher
            buttonClassName="hover:bg-accent"
            contentClassName="bg-popover border-border"
          />
          <NotificationBell iconClassName="h-5 w-5" />
          <UserProfileDropdown variant="navigation" showName={false} />
        </div>
      </header>

      {/* â”€â”€ TAB BAR â”€â”€ */}
      <div className="fixed inset-x-0 top-14 z-30 h-11 border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="scrollbar-none flex h-full items-end gap-0 overflow-x-auto px-4 lg:px-6">
          {tabs.map((tab, idx) => {
            const Icon = tab.icon;
            const isActive = idx === selectedTab;
            return (
              <button
                key={tab.name}
                onClick={() => setSelectedTab(idx)}
                className={cn(
                  "relative flex shrink-0 items-center gap-2 whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {Icon && <Icon className="h-4 w-4" />}
                <span>{tab.name}</span>
                {tab.badge && (
                  <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                    {tab.badge}
                  </span>
                )}
                {/* Active indicator line */}
                {isActive && (
                  <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* â”€â”€ SUB-NAV SIDEBAR (desktop) â”€â”€ */}
      {hasSubNav && (
        <aside
          className={cn(
            "fixed bottom-0 top-[6.25rem] z-20 hidden w-72 overflow-y-auto border-e border-border bg-card/50 lg:block",
            direction === "rtl" ? "right-0" : "left-0"
          )}
        >
          <div className="p-3">
            <NavRenderer variant="compact" items={activeTab!.children!} onNavigate={() => {}} />
          </div>
          <div className="absolute inset-x-0 bottom-0 border-t border-border p-3">
            <LogoutButton />
          </div>
        </aside>
      )}

      {/* â”€â”€ MOBILE SIDEBAR OVERLAY â”€â”€ */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => onSidebarOpenChange(false)}
          />
          <aside
            className={cn(
              "fixed bottom-0 top-0 z-50 w-72 overflow-y-auto bg-card shadow-2xl lg:hidden",
              direction === "rtl" ? "right-0" : "left-0"
            )}
          >
            <div className="flex items-center justify-between border-b border-border p-4">
              <h2 className="font-semibold">{t("app.title")}</h2>
              <Button variant="ghost" size="icon" onClick={() => onSidebarOpenChange(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-3">
              <NavRenderer variant="compact" onNavigate={() => onSidebarOpenChange(false)} />
            </div>
            <div className="mt-auto border-t border-border p-3">
              <LogoutButton />
            </div>
          </aside>
        </>
      )}

      {/* â”€â”€ MAIN CONTENT â”€â”€ */}
      <main
        className={cn(
          "pt-[6.25rem] transition-all duration-300",
          hasSubNav ? (direction === "rtl" ? "lg:pr-72" : "lg:pl-72") : ""
        )}
      >
        <div className="animate-fade-in p-6">{children}</div>
      </main>

      {showFooter && <Footer />}
    </div>
  );
}
