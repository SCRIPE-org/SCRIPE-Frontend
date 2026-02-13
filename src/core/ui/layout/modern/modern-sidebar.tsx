"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@core/ui/button";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import { NavRenderer, UserCard, LogoutButton } from "../shared";
import { Logo } from "@core/ui/logo";

interface ModernSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onHoverChange: (hovered: boolean) => void;
  collapsible?: boolean;
}

export function ModernSidebar({
  open,
  onOpenChange,
  onHoverChange,
  collapsible = true,
}: ModernSidebarProps) {
  const { t, direction } = useI18n();
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHoverChange(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onHoverChange(false);
  };

  return (
    <>
      <div
        className={cn(
          "sidebar fixed inset-y-0 z-50",
          "bg-gradient-to-b from-sidebar via-sidebar/98 to-sidebar",
          "border-r border-sidebar-border",
          "transform transition-all duration-300 ease-in-out lg:translate-x-0",
          "custom-scrollbar overflow-y-auto",
          "shadow-2xl shadow-primary/10 backdrop-blur-sm",
          direction === "rtl" ? "right-0" : "left-0",
          open
            ? "translate-x-0"
            : direction === "rtl"
              ? "translate-x-full"
              : "-translate-x-full",
          isHovered ? "w-80" : "w-20"
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start justify-between p-4 border-b border-sidebar-border">
            <div className="flex items-start space-x-3 rtl:space-x-reverse flex-1 min-w-0">
              <div
                className={cn(
                  "flex items-center justify-center rounded-2xl flex-shrink-0",
                  "bg-gradient-to-br from-primary to-primary/80 shadow-lg",
                  "transition-all duration-300 hover:scale-105 hover:shadow-xl",
                  "w-12 h-12"
                )}
              >
                <Logo size="sm" className="text-primary-foreground" />
              </div>
              {isHovered && (
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg font-bold text-sidebar-foreground leading-tight break-words hyphens-auto">
                    {t("app.title")}
                  </h1>
                  <p className="text-xs text-sidebar-foreground/60 flex items-center mt-1 break-words">
                    <Logo size="sm" className="mr-1 rtl:mr-0 rtl:ml-1 flex-shrink-0" />
                    <span className="break-words">{t("app.modern")}</span>
                  </p>
                </div>
              )}
            </div>
            {collapsible && (
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent flex-shrink-0 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                onClick={() => onOpenChange(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>

          {/* User Info — use UserCard but hide text when collapsed */}
          <div className="p-3 border-b border-sidebar-border">
            <UserCard
              size="sm"
              showStatus
              showRole={isHovered}
              textClassName={isHovered ? "" : "hidden"}
              className={cn(
                "transition-all duration-300",
                !isHovered && "justify-center"
              )}
            />
          </div>

          {/* Navigation — uses modern variant which is designed for rail-expand */}
          <NavRenderer
            variant="modern"
            className="flex-1 p-3 space-y-2"
            onNavigate={collapsible ? () => onOpenChange(false) : undefined}
          />

          {/* Footer — LogoutButton with icon-only when collapsed */}
          <div className="p-3 border-t border-sidebar-border">
            <LogoutButton
              iconOnly={!isHovered}
              className={cn(
                "w-full transition-all duration-300",
                isHovered ? "justify-start" : "justify-center"
              )}
            />
          </div>
        </div>
      </div>
    </>
  );
}
