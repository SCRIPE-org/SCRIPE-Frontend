"use client";

import type React from "react";
import { useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
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
import { LanguageSwitcher, ThemeSwitcher } from "@core/ui/layout/common";
import { UserProfileDropdown } from "@core/ui/user-profile-dropdown";
import { Footer } from "@core/ui/layout/shared/footer";
import { NavRenderer } from "@core/ui/layout/shared/nav-renderer";
import { UserCard } from "@core/ui/layout/shared/user-card";
import { LogoutButton } from "@core/ui/layout/shared/logout-button";
import { cn } from "@core/common/utils";

interface CalendarLayoutProps {
      children: React.ReactNode;
}

/**
 * Calendar / Planner Layout — Date-centric navigation.
 *
 * Structure:
 * - Header with date picker and actions
 * - Left: mini sidebar with nav links + mini calendar widget
 * - Content area (full width for calendar/planner content)
 * - Mobile: sidebar collapses
 *
 * Inspired by Google Calendar, Outlook Calendar, Fantastical
 */
export function CalendarLayout({ children }: CalendarLayoutProps) {
      const { direction, t } = useI18n();
      const settings = useSettings();
      const styles = useLayoutStyles();
      const pathname = usePathname();
      const router = useRouter();
      const navigation = useDynamicNavigation();
      const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
      const [currentDate] = useState(new Date());

      // Mini calendar days
      const calendarDays = useMemo(() => {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const days: (number | null)[] = [];
            for (let i = 0; i < firstDay; i++) days.push(null);
            for (let i = 1; i <= daysInMonth; i++) days.push(i);
            return days;
      }, [currentDate]);

      const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December",
      ];

      return (
            <div
                  className={cn(
                        "min-h-screen flex flex-col bg-background",
                        styles.getAnimationClass(),
                  )}
                  dir={direction}
            >
                  {/* ── Header ── */}
                  <header
                        className={cn(
                              settings.stickyHeader ? "sticky top-0 z-30" : "relative",
                              "glass border-b border-border",
                              "flex items-center justify-between px-4 lg:px-6 h-12",
                        )}
                  >
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

                        {/* Date display */}
                        <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                    <ChevronLeft className="w-4 h-4" />
                              </Button>
                              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-muted/50">
                                    <Calendar className="w-3.5 h-3.5 text-primary" />
                                    <span className="text-sm font-medium">
                                          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                                    </span>
                              </div>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                    <ChevronRight className="w-4 h-4" />
                              </Button>
                        </div>

                        <div className="flex items-center gap-2">
                              <LanguageSwitcher />
                              <ThemeSwitcher />
                              <UserProfileDropdown showName={false} />
                        </div>
                  </header>

                  <div className="flex-1 flex">
                        {/* ── Left Sidebar with mini calendar ── */}
                        <aside
                              className={cn(
                                    "hidden lg:flex flex-col w-56 shrink-0",
                                    "bg-card border-e border-border",
                              )}
                        >
                              {/* Mini Calendar Widget */}
                              <div className="p-3 border-b border-border">
                                    <div className="text-xs font-semibold text-muted-foreground text-center mb-2">
                                          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                                    </div>
                                    <div className="grid grid-cols-7 gap-0.5 text-center">
                                          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                                                <span key={i} className="text-[9px] text-muted-foreground/50 font-bold py-0.5">
                                                      {d}
                                                </span>
                                          ))}
                                          {calendarDays.map((day, i) => (
                                                <span
                                                      key={i}
                                                      className={cn(
                                                            "text-[10px] py-1 rounded cursor-pointer transition-colors",
                                                            day === null && "invisible",
                                                            day === currentDate.getDate()
                                                                  ? "bg-primary text-primary-foreground font-bold"
                                                                  : "text-foreground hover:bg-muted/50",
                                                      )}
                                                >
                                                      {day}
                                                </span>
                                          ))}
                                    </div>
                              </div>

                              {/* Nav items */}
                              <div className="flex-1 p-2 overflow-y-auto">
                                    <NavRenderer variant="compact" />
                              </div>
                              <div className="p-2 border-t border-border">
                                    <LogoutButton />
                              </div>
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
                        <main className="flex-1 min-w-0 p-4 overflow-y-auto">
                              <div style={{ borderRadius: "var(--border-radius)" }}>
                                    {children}
                              </div>
                        </main>
                  </div>

                  {settings.showFooter && <Footer />}
            </div>
      );
}
