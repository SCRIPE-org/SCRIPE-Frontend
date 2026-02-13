"use client";

import { X } from "lucide-react";
import { Button } from "@core/ui/button";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import { Logo } from "@core/ui/logo";
import { NavRenderer } from "./nav-renderer";
import { UserCard } from "./user-card";
import { LogoutButton } from "./logout-button";

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
export function Sidebar({
  open,
  onOpenChange,
  isModern = false,
}: SidebarProps) {
  const { t, direction } = useI18n();

  return (
    <>
      <div
        dir={direction}
        className={cn(
          "flex flex-col h-full bg-gradient-to-b from-sidebar via-sidebar/98 to-sidebar border-r border-sidebar-border sidebar-shadow",
          "backdrop-blur-sm"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-md">
              <Logo size="sm" className="text-primary-foreground" />
            </div>
            <div className={cn(isModern && "sidebar-text")}>
              <h1 className="text-lg font-bold text-sidebar-foreground">
                {t("app.title")}
              </h1>
              <p className="text-xs text-sidebar-foreground/60 flex items-center">
                <Logo size="xs" className="me-1" />
                {isModern ? t("app.modern") : t("app.default")}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "lg:hidden text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-300",
              "rounded-lg shadow-sm hover:shadow-md hover:scale-105"
            )}
            onClick={() => onOpenChange(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-sidebar-border">
          <UserCard
            size="md"
            textClassName={cn(isModern && "sidebar-text")}
          />
        </div>

        {/* Navigation — unlimited depth via NavRenderer */}
        <div className="flex-1 p-3 overflow-y-auto">
          <NavRenderer
            variant={isModern ? "modern" : "default"}
            onNavigate={() => onOpenChange(false)}
          />
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-sidebar-border">
          <LogoutButton textClassName={cn(isModern && "sidebar-text")} />
          <div
            className={cn(
              "text-xs text-sidebar-foreground/60 text-center mt-2",
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
