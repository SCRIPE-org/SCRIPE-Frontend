"use client";

import type React from "react";
import { useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, MapPin } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { useLayoutStyles } from "@core/ui/layout/shared/use-layout-styles";
import { useDynamicNavigation } from "@core/ui/navigation/dynamic-navigation";
import {
      isNavigationItemActive,
      type NavigationItem,
} from "@core/config/navigation";
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
                  className={cn(
                        "h-screen relative bg-background overflow-hidden",
                        styles.getAnimationClass(),
                  )}
                  dir={direction}
            >
                  {/* ── Full-bleed content ── */}
                  <main className="absolute inset-0">
                        {children}
                  </main>

                  {/* ── Floating header controls ── */}
                  <div className="absolute top-3 inset-x-3 z-20 flex items-start justify-between pointer-events-none">
                        {/* Start side: logo + menu */}
                        <div className="flex items-center gap-2 pointer-events-auto">
                              <Button
                                    variant="outline"
                                    size="icon"
                                    className="bg-card/90 backdrop-blur-xl shadow-lg border-border h-10 w-10"
                                    onClick={() => setPanelOpen(!panelOpen)}
                              >
                                    {panelOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                              </Button>
                              <div className="bg-card/90 backdrop-blur-xl rounded-lg px-3 py-2 shadow-lg border border-border hidden sm:flex items-center gap-2">
                                    <Logo size="sm" />
                                    <span className="text-sm font-bold text-foreground">
                                          {t("app.title")}
                                    </span>
                              </div>
                        </div>

                        {/* End side: actions */}
                        <div className="flex items-center gap-2 pointer-events-auto">
                              <div className="bg-card/90 backdrop-blur-xl rounded-lg shadow-lg border border-border flex items-center gap-1 px-1">
                                    <LanguageSwitcher />
                                    <ThemeSwitcher />
                                    <UserProfileDropdown showName={false} />
                              </div>
                        </div>
                  </div>

                  {/* ── Sliding Panel ── */}
                  {panelOpen && (
                        <>
                              <div
                                    className="absolute inset-0 z-20 bg-black/10"
                                    onClick={() => setPanelOpen(false)}
                              />
                              <aside
                                    dir={direction}
                                    className={cn(
                                          "absolute top-16 z-30 w-72 max-h-[calc(100vh-80px)]",
                                          "bg-card/95 backdrop-blur-xl rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col",
                                          direction === "rtl" ? "right-3" : "left-3",
                                          // On mobile, make it wider
                                          "max-sm:inset-x-3 max-sm:w-auto max-sm:bottom-3",
                                    )}
                              >
                                    <div className="p-3 border-b border-border">
                                          <UserCard size="sm" />
                                    </div>
                                    <div className="flex-1 p-2 overflow-y-auto">
                                          <NavRenderer variant="compact" onNavigate={() => setPanelOpen(false)} />
                                    </div>
                                    <div className="p-2 border-t border-border">
                                          <LogoutButton />
                                    </div>
                              </aside>
                        </>
                  )}
            </div>
      );
}
