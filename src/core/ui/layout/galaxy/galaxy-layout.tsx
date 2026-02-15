"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { useLayoutStyles } from "@core/ui/layout/shared/use-layout-styles";
import { Logo } from "@core/ui/logo";
import { Button } from "@core/ui/button";
import { ScrollArea } from "@core/ui/scroll-area";
import { LanguageSwitcher, ThemeSwitcher, HeaderSearch } from "@core/ui/layout/common";
import { UserProfileDropdown } from "@core/ui/user-profile-dropdown";
import { NavRenderer } from "@core/ui/layout/shared/nav-renderer";
import { UserCard } from "@core/ui/layout/shared/user-card";
import { LogoutButton } from "@core/ui/layout/shared/logout-button";
import { Footer } from "@core/ui/layout/shared/footer";
import { Home, Menu, X } from "lucide-react";
import { cn } from "@core/common/utils";
import { useRouter } from "next/navigation";
import { NotificationBell } from "@core/ui/notification";

interface GalaxyLayoutProps {
  children: React.ReactNode;
}

/**
 * Galaxy Layout — 3D Spatial Depth with CSS perspective.
 *
 * Structure:
 * - Left sidebar with subtle 3D tilt (rotateY) for depth perception
 * - Content cards float at different elevation levels
 * - Header with elevated shadow creating depth
 * - Radial gradient background creating depth illusion
 * - Multiple shadow layers for realistic elevation
 *
 * Inspired by Apple Vision Pro, spatial computing, layered depth design
 */
export function GalaxyLayout({ children }: GalaxyLayoutProps) {
  const { direction, t } = useI18n();
  const settings = useSettings();
  const styles = useLayoutStyles();
  const router = useRouter();
  const isRTL = direction === "rtl";

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div
      className={cn("relative min-h-screen", styles.getAnimationClass())}
      dir={direction}
      style={{ perspective: "1200px" }}
    >
      {/* ── Depth Background ── */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-background" />
        <div className="bg-gradient-radial absolute inset-0 from-primary/5 via-transparent to-transparent" />
        <div
          className="absolute inset-0 opacity-30 dark:opacity-20"
          style={{
            background:
              "radial-gradient(ellipse at 30% 20%, rgba(99,102,241,0.12) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(59,130,246,0.08) 0%, transparent 50%)",
          }}
        />
      </div>

      <div className="flex min-h-screen">
        {/* ── 3D Tilted Sidebar ── */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <aside
          className={cn(
            "fixed top-0 z-50 h-full w-72",
            isRTL ? "right-0" : "left-0",
            "transition-all duration-300 ease-out",
            "bg-card",
            "border-e border-border",
            // Multi-layer depth shadows
            "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_8px_rgba(0,0,0,0.06),0_16px_32px_rgba(0,0,0,0.08),0_32px_64px_rgba(0,0,0,0.06)]",
            // Mobile toggle
            sidebarOpen
              ? "translate-x-0"
              : isRTL
                ? "translate-x-full lg:translate-x-0"
                : "-translate-x-full lg:translate-x-0"
          )}
          style={{
            // Subtle 3D tilt on desktop
            transformStyle: "preserve-3d",
            transform: sidebarOpen || typeof window !== "undefined" ? undefined : undefined,
          }}
        >
          <div className="flex h-14 items-center justify-between border-b border-border p-4">
            <Logo size="sm" />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <ScrollArea className="h-[calc(100vh-56px)] flex-1">
            <div className="p-3">
              <NavRenderer variant="default" onNavigate={() => setSidebarOpen(false)} />
            </div>
            <div className="mt-auto border-t border-border p-3">
              <UserCard />
              <LogoutButton />
            </div>
          </ScrollArea>
        </aside>

        {/* ── Main Area ── */}
        <div className={cn("flex min-w-0 flex-1 flex-col", "lg:ms-72")}>
          {/* Elevated Header */}
          <header
            className={cn(
              settings.stickyHeader ? "sticky top-0 z-30" : "relative",
              "bg-card",
              "border-b border-border",
              "shadow-[0_2px_4px_rgba(0,0,0,0.03),0_8px_16px_rgba(0,0,0,0.04)]",
              "flex h-14 items-center justify-between px-4 md:px-6"
            )}
          >
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="sidebar-trigger lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
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
                <NotificationBell iconClassName="h-4 w-4" />
              )}
              <UserProfileDropdown showName={false} />
            </div>
          </header>

          {/* Layered Content Area */}
          <main className="flex-1 p-4 md:p-6">
            <div
              className={cn(
                "rounded-2xl",
                "bg-card",
                "border border-border",
                // Multi-layer elevation shadow
                "shadow-[0_1px_3px_rgba(0,0,0,0.04),0_6px_12px_rgba(0,0,0,0.05),0_20px_40px_rgba(0,0,0,0.04)]",
                "p-4 md:p-6",
                "hover:shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_16px_rgba(0,0,0,0.06),0_28px_56px_rgba(0,0,0,0.05)]",
                "transition-shadow duration-500"
              )}
            >
              {children}
            </div>
          </main>

          {settings.showFooter && (
            <div className="px-4 pb-4 md:px-6 md:pb-6">
              <div
                className={cn(
                  "rounded-xl border border-border bg-card p-4",
                  "shadow-[0_1px_2px_rgba(0,0,0,0.03),0_4px_8px_rgba(0,0,0,0.04)]"
                )}
              >
                <Footer />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
