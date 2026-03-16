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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@core/ui/tooltip";
import { useBrandedAppName } from "@core/hooks/use-branded-app-name";

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
  const appName = useBrandedAppName();
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
        dir={direction}
        className={cn(
          "fixed bottom-0 top-0 z-50 flex",
          direction === "rtl" ? "right-0" : "left-0",
          "transition-all duration-300 ease-in-out",
          // Mobile: full slide in/out
          !open &&
            (direction === "rtl"
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
            "flex w-16 shrink-0 flex-col items-center",
            "border-sidebar-border bg-sidebar",
            direction === "rtl" ? "border-l" : "border-r",
            // Slightly darker than expanded panel for two-tone effect
            "bg-gradient-to-b from-sidebar via-sidebar to-sidebar/95"
          )}
        >
          {/* Logo */}
          <div className="py-4">
            <Link href="/" className="block">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-sm transition-shadow hover:shadow-md">
                <Logo size="sm" className="text-primary-foreground" />
              </div>
            </Link>
          </div>

          {/* Nav icons */}
          <div className="scrollbar-none flex flex-1 flex-col items-center gap-1 overflow-y-auto py-2">
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
                        "flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5" />
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
            <UserCard
              size="sm"
              showRole={false}
              showStatus={false}
              className="h-10 w-10 justify-center border-0 bg-transparent p-0 shadow-none"
            />
          </div>
        </div>

        {/* ── Expanded Panel (visible on hover/pin) ── */}
        <div
          className={cn(
            "flex flex-col overflow-hidden bg-sidebar",
            direction === "rtl"
              ? "border-l border-sidebar-border/30"
              : "border-r border-sidebar-border/30",
            "transition-[width,opacity] duration-300 ease-in-out",
            expanded ? "w-56 opacity-100" : "w-0 opacity-0"
          )}
        >
          {/* Panel header */}
          <div className="flex shrink-0 items-center justify-between border-b border-sidebar-border/20 px-3 py-3.5">
            <h2 className="truncate text-xs font-bold text-sidebar-foreground">{appName}</h2>
            <div className="flex items-center gap-1">
              {/* Pin toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded text-sidebar-foreground/50 hover:text-sidebar-foreground"
                onClick={() => onPinnedChange(!pinned)}
                title={pinned ? "Unpin sidebar" : "Pin sidebar"}
              >
                {pinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
              </Button>
              {/* Close (mobile) */}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded text-sidebar-foreground/50 hover:text-sidebar-foreground lg:hidden"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Full navigation */}
          <div className="scrollbar-thin flex-1 overflow-y-auto px-2 py-2">
            <NavRenderer
              variant="compact"
              onNavigate={() => {
                if (window.innerWidth < 1024) onOpenChange(false);
              }}
            />
          </div>

          {/* Footer */}
          <div className="shrink-0 border-t border-sidebar-border/20 px-2 py-2">
            <LogoutButton />
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
