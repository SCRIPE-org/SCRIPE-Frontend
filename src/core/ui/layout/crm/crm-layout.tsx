"use client";

import type React from "react";
import { useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Search, Bell, Plus, Users, BarChart3 } from "lucide-react";
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
import { Footer } from "@core/ui/layout/shared/footer";
import { NavRenderer } from "@core/ui/layout/shared/nav-renderer";
import { UserCard } from "@core/ui/layout/shared/user-card";
import { LogoutButton } from "@core/ui/layout/shared/logout-button";
import { cn } from "@core/common/utils";

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
                  className={cn(
                        "min-h-screen flex flex-col bg-background",
                        styles.getAnimationClass(),
                  )}
                  dir={direction}
            >
                  {/* ── Top Action Bar ── */}
                  <header
                        className={cn(
                              settings.stickyHeader ? "sticky top-0 z-30" : "relative",
                              "bg-card border-b border-border",
                        )}
                  >
                        <div className="flex items-center justify-between h-12 px-4 lg:px-6">
                              <div className="flex items-center gap-3">
                                    <Button
                                          variant="ghost"
                                          size="icon"
                                          className="lg:hidden h-8 w-8"
                                          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                    >
                                          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                                    </Button>
                                    <Logo size="sm" />
                                    <span className="text-sm font-bold text-foreground hidden md:block">
                                          {t("app.title")}
                                    </span>
                              </div>

                              {/* Center: Search */}
                              <div className="hidden md:flex flex-1 max-w-md mx-6">
                                    <div
                                          className={cn(
                                                "flex items-center gap-2 w-full px-3 py-1.5 rounded-lg border transition-colors",
                                                searchFocused
                                                      ? "border-primary bg-card"
                                                      : "border-border bg-muted/30",
                                          )}
                                    >
                                          <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                          <input
                                                type="text"
                                                placeholder={t("common.searchEverything") || "Search contacts, deals..."}
                                                className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
                                                onFocus={() => setSearchFocused(true)}
                                                onBlur={() => setSearchFocused(false)}
                                          />
                                    </div>
                              </div>

                              <div className="flex items-center gap-1.5">
                                    <Button variant="default" size="sm" className="h-8 gap-1 hidden sm:flex">
                                          <Plus className="w-3.5 h-3.5" />
                                          <span className="text-xs">{t("common.create") || "New"}</span>
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 relative">
                                          <Bell className="w-4 h-4" />
                                          <span className="absolute -top-0.5 -end-0.5 w-2 h-2 bg-destructive rounded-full" />
                                    </Button>
                                    <LanguageSwitcher />
                                    <ThemeSwitcher />
                                    <UserProfileDropdown showName={false} />
                              </div>
                        </div>

                        {/* ── KPI Strip ── */}
                        <div className="flex items-center gap-6 px-4 lg:px-6 py-2 border-t border-border/30 bg-muted/10 overflow-x-auto scrollbar-none">
                              {[
                                    { icon: Users, label: t("common.contacts") || "Contacts", value: "2,450" },
                                    { icon: BarChart3, label: t("common.deals") || "Deals", value: "127" },
                                    { icon: BarChart3, label: t("common.pipeline") || "Pipeline", value: "$1.2M" },
                                    { icon: BarChart3, label: t("common.wonThisMonth") || "Won", value: "48" },
                              ].map((kpi) => (
                                    <div key={kpi.label} className="flex items-center gap-2 shrink-0">
                                          <kpi.icon className="w-3.5 h-3.5 text-primary" />
                                          <div>
                                                <p className="text-[10px] text-muted-foreground leading-none">{kpi.label}</p>
                                                <p className="text-sm font-bold text-foreground">{kpi.value}</p>
                                          </div>
                                    </div>
                              ))}
                        </div>
                  </header>

                  <div className="flex-1 flex">
                        {/* ── Left Sidebar ── */}
                        <aside
                              className={cn(
                                    "hidden lg:flex flex-col w-56 shrink-0",
                                    "bg-card border-e border-border",
                              )}
                        >
                              <div className="p-3 border-b border-border"><UserCard size="sm" /></div>
                              <div className="flex-1 p-2 overflow-y-auto">
                                    <NavRenderer variant="compact" />
                              </div>
                              <div className="p-2 border-t border-border"><LogoutButton /></div>
                        </aside>

                        {/* ── Mobile Drawer ── */}
                        {mobileMenuOpen && (
                              <>
                                    <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
                                    <aside
                                          dir={direction}
                                          className={cn(
                                                "fixed top-0 bottom-0 w-72 z-40 bg-card border-e border-border flex flex-col lg:hidden",
                                                direction === "rtl" ? "right-0" : "left-0",
                                          )}
                                    >
                                          <div className="flex items-center justify-between p-4 border-b border-border">
                                                <Logo size="sm" />
                                                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                                                      <X className="w-4 h-4" />
                                                </Button>
                                          </div>
                                          <div className="p-3 border-b border-border"><UserCard size="sm" /></div>
                                          <div className="flex-1 p-3 overflow-y-auto">
                                                <NavRenderer variant="default" onNavigate={() => setMobileMenuOpen(false)} />
                                          </div>
                                          <div className="p-3 border-t border-border"><LogoutButton /></div>
                                    </aside>
                              </>
                        )}

                        {/* ── Content ── */}
                        <main className="flex-1 min-w-0 p-6 overflow-y-auto">
                              <div style={{ borderRadius: "var(--border-radius)" }}>
                                    {children}
                              </div>
                        </main>
                  </div>

                  {settings.showFooter && <Footer />}
            </div>
      );
}
