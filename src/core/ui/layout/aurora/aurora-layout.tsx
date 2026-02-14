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
import { Bell, Home, Menu, X } from "lucide-react";
import { cn } from "@core/common/utils";
import { useRouter } from "next/navigation";

interface AuroraLayoutProps {
  children: React.ReactNode;
}

/**
 * Aurora Layout — Animated gradient waves.
 *
 * Structure:
 * - Left sidebar with animated aurora gradient background
 * - Semi-transparent header
 * - Content cards with conic-gradient borders
 * - Gradient text headings
 * - Flowing purple→blue→teal→green animation
 *
 * Inspired by Aurora Borealis, Stripe's design, Vercel's gradients
 */
export function AuroraLayout({ children }: AuroraLayoutProps) {
  const { direction, t } = useI18n();
  const settings = useSettings();
  const styles = useLayoutStyles();
  const router = useRouter();
  const isRTL = direction === "rtl";

  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className={cn("relative min-h-screen", styles.getAnimationClass())} dir={direction}>
      {/* Aurora CSS */}
      <style jsx global>{`
        @keyframes aurora-shift {
          0% {
            background-position: 0% 50%;
          }
          25% {
            background-position: 50% 100%;
          }
          50% {
            background-position: 100% 50%;
          }
          75% {
            background-position: 50% 0%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .aurora-bg {
          background: linear-gradient(
            135deg,
            #7c3aed,
            #6366f1,
            #3b82f6,
            #0ea5e9,
            #14b8a6,
            #10b981,
            #6366f1,
            #7c3aed
          );
          background-size: 400% 400%;
          animation: aurora-shift 12s ease-in-out infinite;
        }
        .dark .aurora-bg {
          background: linear-gradient(
            135deg,
            #4c1d95,
            #3730a3,
            #1e40af,
            #0c4a6e,
            #134e4a,
            #064e3b,
            #3730a3,
            #4c1d95
          );
          background-size: 400% 400%;
          animation: aurora-shift 12s ease-in-out infinite;
        }
        .aurora-gradient-border {
          position: relative;
        }
        .aurora-gradient-border::before {
          content: "";
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          background: conic-gradient(
            from 0deg,
            #7c3aed,
            #6366f1,
            #3b82f6,
            #14b8a6,
            #10b981,
            #7c3aed
          );
          mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          mask-composite: subtract;
          -webkit-mask-composite: xor;
          padding: 1px;
          z-index: -1;
        }
      `}</style>

      <div className="flex min-h-screen bg-background">
        {/* ── Aurora Sidebar ── */}
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
            "transition-transform duration-300 ease-out",
            sidebarOpen
              ? "translate-x-0"
              : isRTL
                ? "translate-x-full lg:translate-x-0"
                : "-translate-x-full lg:translate-x-0"
          )}
        >
          {/* Aurora gradient background */}
          <div className="aurora-bg absolute inset-0 opacity-90" />
          {/* Content overlay */}
          <div className="relative z-10 flex h-full flex-col text-white">
            <div className="flex h-14 items-center justify-between border-b border-white/20 p-4">
              <Logo size="sm" />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-3">
                <NavRenderer variant="elegant" onNavigate={() => setSidebarOpen(false)} />
              </div>
              <div className="border-t border-white/20 p-3">
                <UserCard />
                <LogoutButton />
              </div>
            </ScrollArea>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <div className={cn("flex min-w-0 flex-1 flex-col", "lg:ms-72")}>
          {/* Semi-transparent header */}
          <header
            className={cn(
              settings.stickyHeader ? "sticky top-0 z-30" : "relative",
              "glass border-b border-border",
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
                <Button variant="ghost" size="icon">
                  <Bell className="h-4 w-4" />
                </Button>
              )}
              <UserProfileDropdown showName={false} />
            </div>
          </header>

          {/* Content with gradient-border cards */}
          <main className="flex-1 p-4 md:p-6">
            <div className="aurora-gradient-border rounded-2xl">
              <div className={cn("rounded-2xl bg-card p-4 md:p-6")}>{children}</div>
            </div>
          </main>

          {settings.showFooter && (
            <div className="px-4 pb-4 md:px-6 md:pb-6">
              <div className="aurora-gradient-border rounded-xl">
                <div className="rounded-xl bg-card p-4">
                  <Footer />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
