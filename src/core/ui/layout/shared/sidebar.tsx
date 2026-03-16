"use client";

import { X } from "lucide-react";
import { Button } from "@core/ui/button";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import { Logo } from "@core/ui/logo";
import { NavRenderer } from "./nav-renderer";
import { UserCard } from "./user-card";
import { LogoutButton } from "./logout-button";
import { useBrandedAppName } from "@core/hooks/use-branded-app-name";

interface SidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isModern?: boolean;
}

/**
 * Generic sidebar used as fallback and by Modern layout.
 * Now uses shared NavRenderer (unlimited depth, ARIA, RTL),
 * shared UserCard, and shared LogoutButton (no @modules/auth import).
 */
export function Sidebar({ open, onOpenChange, isModern = false }: SidebarProps) {
  const { t, direction } = useI18n();
  const appName = useBrandedAppName();

  return (
    <>
      <div
        dir={direction}
        className={cn(
          "via-sidebar/98 sidebar-shadow flex h-full flex-col border-r border-sidebar-border bg-gradient-to-b from-sidebar to-sidebar",
          "backdrop-blur-sm"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary shadow-md">
              <Logo size="sm" className="text-primary-foreground" />
            </div>
            <div className={cn(isModern && "sidebar-text")}>
              <h1 className="text-lg font-bold text-sidebar-foreground">{appName}</h1>
              <p className="flex items-center text-xs text-sidebar-foreground/60">
                <Logo size="xs" className="me-1" />
                {isModern ? t("app.modern") : t("app.default")}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "text-sidebar-foreground transition-all duration-300 hover:bg-sidebar-accent lg:hidden",
              "rounded-lg shadow-sm hover:scale-105 hover:shadow-md"
            )}
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* User Info */}
        <div className="border-b border-sidebar-border p-4">
          <UserCard size="md" textClassName={cn(isModern && "sidebar-text")} />
        </div>

        {/* Navigation — unlimited depth via NavRenderer */}
        <div className="flex-1 overflow-y-auto p-3">
          <NavRenderer
            variant={isModern ? "modern" : "default"}
            onNavigate={() => onOpenChange(false)}
          />
        </div>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-3">
          <LogoutButton textClassName={cn(isModern && "sidebar-text")} />
          <div
            className={cn(
              "mt-2 text-center text-xs text-sidebar-foreground/60",
              isModern && "sidebar-text"
            )}
          >
            {t("app.version")}
          </div>
        </div>
      </div>
    </>
  );
}
