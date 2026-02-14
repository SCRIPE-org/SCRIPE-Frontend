"use client";

import type React from "react";
import { useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, MapPin } from "lucide-react";
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
import { NavRenderer } from "@core/ui/layout/shared/nav-renderer";
import { UserCard } from "@core/ui/layout/shared/user-card";
import { LogoutButton } from "@core/ui/layout/shared/logout-button";
import { cn } from "@core/common/utils";

interface MapLayoutProps {
  children: React.ReactNode;
}

/**
 * Map-Centric Layout — Content/map takes full space, nav in floating sidebar.
 *
 * Structure:
 * - Full-bleed content area (designed for maps / dashboards)
 * - Floating overlay controls (top-left logo, top-right actions)
 * - Left panel toggleable (sliding over content)
 * - Mobile: panel as full-width bottom sheet
 *
 * Inspired by Google Maps, Uber, Mapbox Studio
 */
export function MapLayout({ children }: MapLayoutProps) {
  const { direction, t } = useI18n();
  const settings = useSettings();
  const styles = useLayoutStyles();
  const pathname = usePathname();
  const router = useRouter();
  const navigation = useDynamicNavigation();
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <div
      className={cn("relative h-screen overflow-hidden bg-background", styles.getAnimationClass())}
      dir={direction}
    >
      {/* ── Full-bleed content ── */}
      <main className="absolute inset-0">{children}</main>

      {/* ── Floating header controls ── */}
      <div className="pointer-events-none absolute inset-x-3 top-3 z-20 flex items-start justify-between">
        {/* Start side: logo + menu */}
        <div className="pointer-events-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 border-border bg-card/90 shadow-lg backdrop-blur-xl"
            onClick={() => setPanelOpen(!panelOpen)}
          >
            {panelOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
          <div className="hidden items-center gap-2 rounded-lg border border-border bg-card/90 px-3 py-2 shadow-lg backdrop-blur-xl sm:flex">
            <Logo size="sm" />
            <span className="text-sm font-bold text-foreground">{t("app.title")}</span>
          </div>
        </div>

        {/* End side: actions */}
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-border bg-card/90 px-1 shadow-lg backdrop-blur-xl">
            <LanguageSwitcher />
            <ThemeSwitcher />
            <UserProfileDropdown showName={false} />
          </div>
        </div>
      </div>

      {/* ── Sliding Panel ── */}
      {panelOpen && (
        <>
          <div className="absolute inset-0 z-20 bg-black/10" onClick={() => setPanelOpen(false)} />
          <aside
            dir={direction}
            className={cn(
              "absolute top-16 z-30 max-h-[calc(100vh-80px)] w-72",
              "flex flex-col overflow-hidden rounded-2xl border border-border bg-card/95 shadow-2xl backdrop-blur-xl",
              direction === "rtl" ? "right-3" : "left-3",
              // On mobile, make it wider
              "max-sm:inset-x-3 max-sm:bottom-3 max-sm:w-auto"
            )}
          >
            <div className="border-b border-border p-3">
              <UserCard size="sm" />
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              <NavRenderer variant="compact" onNavigate={() => setPanelOpen(false)} />
            </div>
            <div className="border-t border-border p-2">
              <LogoutButton />
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
