"use client";

import type React from "react";
import { useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Search, Plus, Users, BarChart3 } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { useLayoutStyles } from "@core/ui/layout/shared/use-layout-styles";
import { useDynamicNavigation } from "@core/ui/navigation/dynamic-navigation";
import { isNavigationItemActive, type NavigationItem } from "@core/config/navigation";
import { Logo } from "@core/ui/logo";
import { Button } from "@core/ui/button";
import { ScrollArea } from "@core/ui/scroll-area";
import { LanguageSwitcher, ThemeSwitcher } from "@core/ui/layout/common";
import { UserProfileDropdown } from "@core/ui/user-profile-dropdown";
import { Footer } from "@core/ui/layout/shared/footer";
import { NavRenderer } from "@core/ui/layout/shared/nav-renderer";
import { UserCard } from "@core/ui/layout/shared/user-card";
import { LogoutButton } from "@core/ui/layout/shared/logout-button";
import { cn } from "@core/common/utils";
import { NotificationBell } from "@core/ui/notification";

interface CRMLayoutProps {
  children: React.ReactNode;
}

/**
 * CRM / Sales Layout — Pipeline-focused with quick KPI bar.
 *
 * Structure:
 * - Slim top bar with search, notifications, quick-add
 * - KPI strip (metrics bar) below header
 * - Left sidebar with navigation grouped by CRM areas
 * - Full content area
 * - Mobile: sidebar as drawer
 *
 * Inspired by Salesforce, HubSpot, Pipedrive
 */
export function CRMLayout({ children }: CRMLayoutProps) {
  const { direction, t } = useI18n();
  const settings = useSettings();
  const styles = useLayoutStyles();
  const pathname = usePathname();
  const router = useRouter();
  const navigation = useDynamicNavigation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <div
      className={cn("flex min-h-screen flex-col bg-background", styles.getAnimationClass())}
      dir={direction}
    >
      {/* ── Top Action Bar ── */}
      <header
        className={cn(
          settings.stickyHeader ? "sticky top-0 z-30" : "relative",
          "border-b border-border bg-card"
        )}
      >
        <div className="flex h-12 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
            <Logo size="sm" />
            <span className="hidden text-sm font-bold text-foreground md:block">
              {t("app.title")}
            </span>
          </div>

          {/* Center: Search */}
          <div className="mx-6 hidden max-w-md flex-1 md:flex">
            <div
              className={cn(
                "flex w-full items-center gap-2 rounded-lg border px-3 py-1.5 transition-colors",
                searchFocused ? "border-primary bg-card" : "border-border bg-muted/30"
              )}
            >
              <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <input
                type="text"
                placeholder={t("common.searchEverything") || "Search contacts, deals..."}
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Button variant="default" size="sm" className="hidden h-8 gap-1 sm:flex">
              <Plus className="h-3.5 w-3.5" />
              <span className="text-xs">{t("common.create") || "New"}</span>
            </Button>
            <NotificationBell iconClassName="h-4 w-4" className="h-8 w-8" />
            <LanguageSwitcher />
            <ThemeSwitcher />
            <UserProfileDropdown showName={false} />
          </div>
        </div>

        {/* ── KPI Strip ── */}
        <div className="scrollbar-none flex items-center gap-6 overflow-x-auto border-t border-border/30 bg-muted/10 px-4 py-2 lg:px-6">
          {[
            { icon: Users, label: t("common.contacts") || "Contacts", value: "2,450" },
            { icon: BarChart3, label: t("common.deals") || "Deals", value: "127" },
            { icon: BarChart3, label: t("common.pipeline") || "Pipeline", value: "$1.2M" },
            { icon: BarChart3, label: t("common.wonThisMonth") || "Won", value: "48" },
          ].map((kpi) => (
            <div key={kpi.label} className="flex shrink-0 items-center gap-2">
              <kpi.icon className="h-3.5 w-3.5 text-primary" />
              <div>
                <p className="text-[10px] leading-none text-muted-foreground">{kpi.label}</p>
                <p className="text-sm font-bold text-foreground">{kpi.value}</p>
              </div>
            </div>
          ))}
        </div>
      </header>

      <div className="flex flex-1">
        {/* ── Left Sidebar ── */}
        <aside
          className={cn("hidden w-56 shrink-0 flex-col lg:flex", "border-e border-border bg-card")}
        >
          <div className="border-b border-border p-3">
            <UserCard size="sm" />
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <NavRenderer variant="compact" />
          </div>
          <div className="border-t border-border p-2">
            <LogoutButton />
          </div>
        </aside>

        {/* ── Mobile Drawer ── */}
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-30 bg-black/30 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside
              dir={direction}
              className={cn(
                "fixed bottom-0 top-0 z-40 flex w-72 flex-col border-e border-border bg-card lg:hidden",
                direction === "rtl" ? "right-0" : "left-0"
              )}
            >
              <div className="flex items-center justify-between border-b border-border p-4">
                <Logo size="sm" />
                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="border-b border-border p-3">
                <UserCard size="sm" />
              </div>
              <div className="flex-1 overflow-y-auto p-3">
                <NavRenderer variant="default" onNavigate={() => setMobileMenuOpen(false)} />
              </div>
              <div className="border-t border-border p-3">
                <LogoutButton />
              </div>
            </aside>
          </>
        )}

        {/* ── Content ── */}
        <main className="min-w-0 flex-1 overflow-y-auto p-6">
          <div style={{ borderRadius: "var(--border-radius)" }}>{children}</div>
        </main>
      </div>

      {settings.showFooter && <Footer />}
    </div>
  );
}
