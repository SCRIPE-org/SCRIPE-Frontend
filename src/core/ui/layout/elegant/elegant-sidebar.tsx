"use client";

import { X } from "lucide-react";
import { Button } from "@core/ui/button";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import { Logo } from "@core/ui/logo";
import { NavRenderer } from "@core/ui/layout/shared/nav-renderer";
import { UserCard } from "@core/ui/layout/shared/user-card";
import { LogoutButton } from "@core/ui/layout/shared/logout-button";

interface ElegantSidebarProps {
      open: boolean;
      onOpenChange: (open: boolean) => void;
}

/**
 * Elegant Sidebar — Premium glassmorphism design.
 *
 * Features:
 * - Frosted glass effect (backdrop-blur-2xl + translucent bg)
 * - Rounded corners with margin from edges (m-3 rounded-2xl)
 * - Glow effect on active items
 * - Shimmer animation on hover
 * - Premium Inter typography with wider letter-spacing
 *
 * Inspired by Linear + Raycast + Apple Music.
 */
export function ElegantSidebar({
      open,
      onOpenChange,
}: ElegantSidebarProps) {
      const { t, direction } = useI18n();

      return (
            <aside
                  dir={direction}
                  className={cn(
                        "fixed z-50 flex flex-col w-72",
                        // Floating with margin and rounded corners
                        "top-3 bottom-3 rounded-2xl",
                        // Glassmorphism
                        "bg-sidebar/80 backdrop-blur-2xl",
                        "border border-sidebar-border/20",
                        "shadow-[0_8px_40px_rgba(0,0,0,0.12)]",
                        // RTL
                        direction === "rtl" ? "right-3" : "left-3",
                        // Slide animation
                        "transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
                        open
                              ? "translate-x-0 opacity-100"
                              : direction === "rtl"
                                    ? "translate-x-full lg:translate-x-0 opacity-0 lg:opacity-100"
                                    : "-translate-x-full lg:translate-x-0 opacity-0 lg:opacity-100"
                  )}
            >
                  {/* ── Logo Header ── */}
                  <div className="flex items-center justify-between px-5 py-4">
                        <div className="flex items-center gap-3">
                              <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center",
                                    "bg-gradient-to-br from-primary to-primary/80",
                                    "shadow-[0_0_20px_rgba(var(--primary-rgb,59,130,246),0.3)]",
                                    "transition-shadow duration-500 hover:shadow-[0_0_30px_rgba(var(--primary-rgb,59,130,246),0.5)]"
                              )}>
                                    <Logo size="sm" className="text-primary-foreground" />
                              </div>
                              <div>
                                    <h1 className="text-sm font-semibold text-sidebar-foreground tracking-wide">
                                          {t("app.title")}
                                    </h1>
                                    <p className="text-[10px] text-sidebar-foreground/40 tracking-wider uppercase">
                                          {t("app.version")}
                                    </p>
                              </div>
                        </div>

                        <Button
                              variant="ghost"
                              size="icon"
                              className="lg:hidden text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-white/10 rounded-xl h-8 w-8"
                              onClick={() => onOpenChange(false)}
                        >
                              <X className="w-4 h-4" />
                        </Button>
                  </div>

                  {/* ── User Card ── */}
                  <div className="px-4 py-2">
                        <UserCard
                              size="md"
                              className="bg-white/5 border-white/10 backdrop-blur-sm"
                        />
                  </div>

                  {/* ── Navigation ── */}
                  <div className="flex-1 px-3 py-3 overflow-y-auto scrollbar-thin">
                        <NavRenderer
                              variant="elegant"
                              onNavigate={() => {
                                    if (window.innerWidth < 1024) onOpenChange(false);
                              }}
                        />
                  </div>

                  {/* ── Footer ── */}
                  <div className="px-3 py-3">
                        <LogoutButton />
                  </div>
            </aside>
      );
}
