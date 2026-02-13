"use client";

import { useState } from "react";
import { Pin, PinOff, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@core/ui/button";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import { Logo } from "@core/ui/logo";
import { NavRenderer } from "@core/ui/layout/shared/nav-renderer";
import { UserCard } from "@core/ui/layout/shared/user-card";
import { LogoutButton } from "@core/ui/layout/shared/logout-button";
import { useDynamicNavigation } from "@core/ui/navigation/dynamic-navigation";
import { isNavigationItemActive } from "@core/config/navigation";
import {
      Tooltip,
      TooltipContent,
      TooltipProvider,
      TooltipTrigger,
} from "@core/ui/tooltip";

interface ModernSidebarProps {
      open: boolean;
      onOpenChange: (open: boolean) => void;
      expanded: boolean;
      onExpandedChange: (expanded: boolean) => void;
      pinned: boolean;
      onPinnedChange: (pinned: boolean) => void;
}

/**
 * Modern Sidebar — Icon rail + expandable panel.
 *
 * Default: 64px icon rail with tooltips.
 * Hover or pin: expands to show full labels + sub-items.
 * Two-tone design: rail is darker, panel is lighter.
 *
 * Inspired by Arc Browser + VS Code Activity Bar.
 */
export function ModernSidebar({
      open,
      onOpenChange,
      expanded,
      onExpandedChange,
      pinned,
      onPinnedChange,
}: ModernSidebarProps) {
      const { t, direction } = useI18n();
      const pathname = usePathname();
      const navigation = useDynamicNavigation();

      const handleMouseEnter = () => {
            if (!pinned) onExpandedChange(true);
      };

      const handleMouseLeave = () => {
            if (!pinned) onExpandedChange(false);
      };

      return (
            <TooltipProvider delayDuration={300}>
                  <aside
                        className={cn(
                              "fixed top-0 bottom-0 z-50 flex",
                              direction === "rtl" ? "right-0" : "left-0",
                              "transition-all duration-300 ease-in-out",
                              // Mobile: full slide in/out
                              !open && (direction === "rtl"
                                    ? "translate-x-full lg:translate-x-0"
                                    : "-translate-x-full lg:translate-x-0"),
                              open && "translate-x-0"
                        )}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                  >
                        {/* ── Icon Rail (always visible on desktop) ── */}
                        <div
                              className={cn(
                                    "w-16 flex flex-col items-center shrink-0",
                                    "bg-sidebar border-sidebar-border",
                                    direction === "rtl" ? "border-l" : "border-r",
                                    // Slightly darker than expanded panel for two-tone effect
                                    "bg-gradient-to-b from-sidebar via-sidebar to-sidebar/95"
                              )}
                        >
                              {/* Logo */}
                              <div className="py-4">
                                    <Link href="/" className="block">
                                          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
                                                <Logo size="sm" className="text-primary-foreground" />
                                          </div>
                                    </Link>
                              </div>

                              {/* Nav icons */}
                              <div className="flex-1 flex flex-col items-center gap-1 py-2 overflow-y-auto scrollbar-none">
                                    {navigation.map((item) => {
                                          const Icon = item.icon;
                                          const isActive = isNavigationItemActive(item, pathname);

                                          if (!Icon) return null;

                                          return (
                                                <Tooltip key={item.name}>
                                                      <TooltipTrigger asChild>
                                                            <Link
                                                                  href={item.href || "#"}
                                                                  className={cn(
                                                                        "w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200",
                                                                        isActive
                                                                              ? "bg-primary text-primary-foreground shadow-md"
                                                                              : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                                                                  )}
                                                            >
                                                                  <Icon className="w-5 h-5" />
                                                            </Link>
                                                      </TooltipTrigger>
                                                      {!expanded && (
                                                            <TooltipContent
                                                                  side={direction === "rtl" ? "left" : "right"}
                                                                  className="text-sm"
                                                            >
                                                                  {item.name}
                                                            </TooltipContent>
                                                      )}
                                                </Tooltip>
                                          );
                                    })}
                              </div>

                              {/* Bottom: User avatar */}
                              <div className="py-3">
                                    <UserCard size="sm" showRole={false} showStatus={false}
                                          className="w-10 h-10 justify-center p-0 bg-transparent border-0 shadow-none"
                                    />
                              </div>
                        </div>

                        {/* ── Expanded Panel (visible on hover/pin) ── */}
                        <div
                              className={cn(
                                    "flex flex-col bg-sidebar overflow-hidden",
                                    direction === "rtl" ? "border-l border-sidebar-border/30" : "border-r border-sidebar-border/30",
                                    "transition-[width,opacity] duration-300 ease-in-out",
                                    expanded ? "w-56 opacity-100" : "w-0 opacity-0"
                              )}
                        >
                              {/* Panel header */}
                              <div className="flex items-center justify-between px-3 py-3.5 border-b border-sidebar-border/20 shrink-0">
                                    <h2 className="text-xs font-bold text-sidebar-foreground truncate">
                                          {t("app.title")}
                                    </h2>
                                    <div className="flex items-center gap-1">
                                          {/* Pin toggle */}
                                          <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 rounded text-sidebar-foreground/50 hover:text-sidebar-foreground"
                                                onClick={() => onPinnedChange(!pinned)}
                                                title={pinned ? "Unpin sidebar" : "Pin sidebar"}
                                          >
                                                {pinned ? (
                                                      <PinOff className="w-3 h-3" />
                                                ) : (
                                                      <Pin className="w-3 h-3" />
                                                )}
                                          </Button>
                                          {/* Close (mobile) */}
                                          <Button
                                                variant="ghost"
                                                size="icon"
                                                className="lg:hidden h-6 w-6 rounded text-sidebar-foreground/50 hover:text-sidebar-foreground"
                                                onClick={() => onOpenChange(false)}
                                          >
                                                <X className="w-3 h-3" />
                                          </Button>
                                    </div>
                              </div>

                              {/* Full navigation */}
                              <div className="flex-1 px-2 py-2 overflow-y-auto scrollbar-thin">
                                    <NavRenderer
                                          variant="compact"
                                          onNavigate={() => {
                                                if (window.innerWidth < 1024) onOpenChange(false);
                                          }}
                                    />
                              </div>

                              {/* Footer */}
                              <div className="px-2 py-2 border-t border-sidebar-border/20 shrink-0">
                                    <LogoutButton />
                              </div>
                        </div>
                  </aside>
            </TooltipProvider>
      );
}
