"use client";

import type React from "react";
import { useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { useLayoutStyles } from "@core/ui/layout/shared/use-layout-styles";
import { useDynamicNavigation } from "@core/ui/navigation/dynamic-navigation";
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
import { useBrandedAppName } from "@core/hooks/use-branded-app-name";

interface CalendarLayoutProps {
  children: React.ReactNode;
}

/**
 * Calendar / Planner Layout  Date-centric navigation.
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
  const appName = useBrandedAppName();
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
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div
      className={cn("flex min-h-screen flex-col bg-background", styles.getAnimationClass())}
      dir={direction}
    >
      {/*  Header  */}
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
            className="h-8 w-8 lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
          <Logo size="sm" />
          <span className="hidden text-sm font-bold text-foreground md:block">{appName}</span>
        </div>

        {/* Date display */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-1">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span className="text-sm font-medium">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeSwitcher />
          <NotificationBell iconClassName="h-5 w-5" />
          <UserProfileDropdown showName={false} />
        </div>
      </header>

      <div className="flex flex-1">
        {/*  Left Sidebar with mini calendar  */}
        <aside
          className={cn("hidden w-56 shrink-0 flex-col lg:flex", "border-e border-border bg-card")}
        >
          {/* Mini Calendar Widget */}
          <div className="border-b border-border p-3">
            <div className="mb-2 text-center text-xs font-semibold text-muted-foreground">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </div>
            <div className="grid grid-cols-7 gap-0.5 text-center">
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <span key={i} className="py-0.5 text-[9px] font-bold text-muted-foreground/50">
                  {d}
                </span>
              ))}
              {calendarDays.map((day, i) => (
                <span
                  key={i}
                  className={cn(
                    "cursor-pointer rounded py-1 text-[10px] transition-colors",
                    day === null && "invisible",
                    day === currentDate.getDate()
                      ? "bg-primary font-bold text-primary-foreground"
                      : "text-foreground hover:bg-muted/50"
                  )}
                >
                  {day}
                </span>
              ))}
            </div>
          </div>

          {/* Nav items */}
          <div className="flex-1 overflow-y-auto p-2">
            <NavRenderer variant="compact" />
          </div>
          <div className="border-t border-border p-2">
            <LogoutButton />
          </div>
        </aside>

        {/*  Mobile Drawer  */}
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

        {/*  Content  */}
        <main className="min-w-0 flex-1 overflow-y-auto p-4">
          <div style={{ borderRadius: "var(--border-radius)" }}>{children}</div>
        </main>
      </div>

      {settings.showFooter && <Footer />}
    </div>
  );
}
