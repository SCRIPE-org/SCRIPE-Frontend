"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { useLayoutStyles } from "@core/ui/layout/shared/use-layout-styles";
import { useDynamicNavigation } from "@core/ui/navigation/dynamic-navigation";
import { NavRenderer } from "@core/ui/layout/shared/nav-renderer";
import { UserCard } from "@core/ui/layout/shared/user-card";
import { LogoutButton } from "@core/ui/layout/shared/logout-button";
import { Logo } from "@core/ui/logo";
import { Button } from "@core/ui/button";
import { ScrollArea } from "@core/ui/scroll-area";
import { X } from "lucide-react";
import { cn } from "@core/common/utils";

interface FloatingSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Floating Sidebar — A truly floating panel that hovers over the page.
 *
 * - Detached from all edges with margins (m-3)
 * - Large rounded corners (rounded-2xl) for a card-like feel
 * - Semi-transparent background with backdrop blur
 * - RTL-aware: flips position and close button placement
 */
export function FloatingSidebar({ open, onOpenChange }: FloatingSidebarProps) {
  const { direction, t } = useI18n();
  const settings = useSettings();
  const styles = useLayoutStyles();
  const isRTL = direction === "rtl";

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] transition-opacity duration-300"
          onClick={() => onOpenChange(false)}
        />
      )}

      {/* Floating Panel */}
      <aside
        className={cn(
          "sidebar fixed z-50 transition-all duration-300 ease-out",
          // Floating dimensions — not full height, has margins
          "bottom-3 top-3 w-80",
          isRTL ? "right-3" : "left-3",
          // Floating card styling
          "rounded-2xl",
          "bg-card/95 backdrop-blur-xl",
          "border border-border/60",
          "shadow-2xl shadow-black/10 dark:shadow-black/30",
          // Slide animation
          open
            ? "translate-x-0 opacity-100"
            : isRTL
              ? "pointer-events-none translate-x-8 opacity-0"
              : "pointer-events-none -translate-x-8 opacity-0"
        )}
        dir={direction}
      >
        <div className="flex h-full flex-col">
          {/* Header — Logo + Close (RTL-aware) */}
          <div className="flex items-center justify-between border-b border-border/40 px-5 py-4">
            <Logo size="sm" />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 rounded-xl hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* User Card */}
          <div className="border-b border-border/30 px-4 py-3">
            <UserCard size="md" />
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-3">
            <NavRenderer variant="floating" onNavigate={() => onOpenChange(false)} />
          </ScrollArea>

          {/* Footer */}
          <div className="border-t border-border/30 px-4 py-3">
            <LogoutButton />
          </div>
        </div>
      </aside>
    </>
  );
}
