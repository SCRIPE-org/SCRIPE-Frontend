"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
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
import { Bell, Home, Menu, X } from "lucide-react";
import { cn } from "@core/common/utils";
import { useRouter } from "next/navigation";

interface GlassmorphismLayoutProps {
  children: React.ReactNode;
}

/**
 * Glassmorphism Layout — Full transparent glass UI.
 *
 * Structure:
 * - Animated gradient mesh background visible through ALL panels
 * - Semi-transparent sidebar (bg-white/10 dark:bg-black/10, backdrop-blur-3xl)
 * - Semi-transparent header with deep blur
 * - All content wrapped in glass cards
 *
 * Inspired by Apple Vision Pro, iOS Control Center, Windows 11 widgets
 */
export function GlassmorphismLayout({ children }: GlassmorphismLayoutProps) {
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
      className={cn("relative min-h-screen overflow-hidden", styles.getAnimationClass())}
      dir={direction}
    >
      {/* ── Animated Gradient Mesh Background ── */}
      <div className="fixed inset-0 -z-10">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 via-blue-500/15 to-teal-500/20 dark:from-violet-900/30 dark:via-blue-900/20 dark:to-teal-900/30" />
        {/* Moving orbs */}
        <div
          className="absolute h-[500px] w-[500px] rounded-full opacity-30 blur-3xl dark:opacity-20"
          style={{
            background: "radial-gradient(circle, rgba(139,92,246,0.4), transparent 70%)",
            top: "10%",
            left: "20%",
            animation: "glassmorphism-orb-1 15s ease-in-out infinite",
          }}
        />
        <div
          className="absolute h-[400px] w-[400px] rounded-full opacity-25 blur-3xl dark:opacity-15"
          style={{
            background: "radial-gradient(circle, rgba(59,130,246,0.4), transparent 70%)",
            top: "50%",
            right: "15%",
            animation: "glassmorphism-orb-2 20s ease-in-out infinite",
          }}
        />
        <div
          className="absolute h-[350px] w-[350px] rounded-full opacity-20 blur-3xl dark:opacity-10"
          style={{
            background: "radial-gradient(circle, rgba(20,184,166,0.4), transparent 70%)",
            bottom: "10%",
            left: "40%",
            animation: "glassmorphism-orb-3 18s ease-in-out infinite",
          }}
        />
        {/* Noise texture */}
        <div className="absolute inset-0 bg-background/40 dark:bg-background/60" />
      </div>

      {/* CSS animations */}
      <style jsx global>{`
        @keyframes glassmorphism-orb-1 {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(50px, -30px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 40px) scale(0.9);
          }
        }
        @keyframes glassmorphism-orb-2 {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(-40px, 20px) scale(1.05);
          }
          66% {
            transform: translate(30px, -50px) scale(0.95);
          }
        }
        @keyframes glassmorphism-orb-3 {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(60px, -20px) scale(1.15);
          }
        }
      `}</style>

      <div className="flex min-h-screen">
        {/* ── Glass Sidebar Overlay ── */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <aside
          className={cn(
            "fixed top-0 z-50 h-full w-72",
            isRTL ? "right-0" : "left-0",
            "transition-transform duration-300 ease-out",
            // Glass effect
            "bg-white/8 dark:bg-black/15",
            "backdrop-blur-3xl",
            "border-e border-white/15 dark:border-white/10",
            "shadow-2xl shadow-black/5",
            // Mobile toggle
            sidebarOpen
              ? "translate-x-0"
              : isRTL
                ? "translate-x-full lg:translate-x-0"
                : "-translate-x-full lg:translate-x-0"
          )}
        >
          <div className="flex h-14 items-center justify-between border-b border-white/10 p-4">
            <Logo size="sm" />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-foreground/70 hover:text-foreground lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <ScrollArea className="h-[calc(100vh-56px)] flex-1">
            <div className="p-3">
              <NavRenderer variant="elegant" onNavigate={() => setSidebarOpen(false)} />
            </div>
            <div className="mt-auto border-t border-white/10 p-3">
              <UserCard />
              <LogoutButton />
            </div>
          </ScrollArea>
        </aside>

        {/* ── Main content ── */}
        <div className={cn("flex min-w-0 flex-1 flex-col", "lg:ms-72")}>
          {/* Glass Header */}
          <header
            className={cn(
              settings.stickyHeader ? "sticky top-0 z-30" : "relative",
              "bg-white/8 dark:bg-black/12",
              "backdrop-blur-2xl",
              "border-white/12 dark:border-white/8 border-b",
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
                inputClassName="bg-white/5 dark:bg-white/5 border-white/10 focus:bg-white/10 w-72 rounded-xl"
                iconClassName={isRTL ? "right-3 left-auto" : "left-3"}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/")}
                className="text-foreground/70 hover:text-foreground"
              >
                <Home className="h-4 w-4" />
              </Button>
              <LanguageSwitcher />
              <ThemeSwitcher />
              {settings.showNotifications && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-foreground/70 hover:text-foreground"
                >
                  <Bell className="h-4 w-4" />
                </Button>
              )}
              <UserProfileDropdown showName={false} />
            </div>
          </header>

          {/* Glass Content */}
          <main className="flex-1 p-4 md:p-6">
            <div
              className={cn(
                "rounded-2xl",
                "bg-white/6 dark:bg-black/10",
                "backdrop-blur-xl",
                "border border-white/10 dark:border-white/5",
                "p-4 md:p-6",
                "shadow-lg shadow-black/5"
              )}
            >
              {children}
            </div>
          </main>

          {settings.showFooter && (
            <div className="px-4 pb-4 md:px-6 md:pb-6">
              <div className="dark:bg-black/8 border-white/8 rounded-xl border bg-white/5 p-4 backdrop-blur-lg">
                <Footer />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
