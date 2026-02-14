"use client";

import { X } from "lucide-react";
import { Button } from "@core/ui/button";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import { Logo } from "@core/ui/logo";
import { NavRenderer } from "@core/ui/layout/shared/nav-renderer";
import { UserCard } from "@core/ui/layout/shared/user-card";
import { LogoutButton } from "@core/ui/layout/shared/logout-button";

interface CompactSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Compact Sidebar — Slack/Discord inspired.
 *
 * Features:
 * - Narrow width (w-56 = 224px) — every pixel earns its place
 * - Dense spacing, small text (text-xs), tight gaps
 * - Flat design: no shadows, no gradients — border + bg contrast only
 * - Small user card (sm size, no role subtitle)
 * - Collapsible sections with tiny chevrons
 */
export function CompactSidebar({ open, onOpenChange }: CompactSidebarProps) {
  const { t, direction } = useI18n();

  return (
    <aside
      dir={direction}
      className={cn(
        "fixed bottom-0 top-0 z-50 flex w-56 flex-col",
        "border-sidebar-border bg-sidebar",
        direction === "rtl" ? "right-0 border-l" : "left-0 border-r",
        "transition-transform duration-200 ease-out",
        !open &&
          (direction === "rtl"
            ? "translate-x-full lg:translate-x-0"
            : "-translate-x-full lg:translate-x-0"),
        open && "translate-x-0"
      )}
    >
      {/* ── Compact Logo Header ── */}
      <div className="flex items-center justify-between border-b border-sidebar-border/40 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
            <Logo size="xs" className="text-primary-foreground" />
          </div>
          <h1 className="truncate text-xs font-bold text-sidebar-foreground">{t("app.title")}</h1>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded text-sidebar-foreground/50 hover:text-sidebar-foreground lg:hidden"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>

      {/* ── User Card (small, no role) ── */}
      <div className="border-b border-sidebar-border/20 px-2.5 py-2">
        <UserCard size="sm" showRole={false} showStatus={false} />
      </div>

      {/* ── Navigation (dense) ── */}
      <div className="scrollbar-thin flex-1 overflow-y-auto px-2 py-1.5">
        <NavRenderer
          variant="compact"
          onNavigate={() => {
            if (window.innerWidth < 1024) onOpenChange(false);
          }}
        />
      </div>

      {/* ── Compact Footer ── */}
      <div className="border-t border-sidebar-border/20 px-2.5 py-2">
        <LogoutButton />
      </div>
    </aside>
  );
}
