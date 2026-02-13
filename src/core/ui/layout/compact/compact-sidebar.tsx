"use client";

import { X } from "lucide-react";
import { Button } from "@core/ui/button";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import { NavRenderer, UserCard, LogoutButton } from "../shared";
import { useLayoutStyles } from "../shared/use-layout-styles";
import { Logo } from "@core/ui/logo";

interface CompactSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collapsible?: boolean;
}

export function CompactSidebar({
  open,
  onOpenChange,
  collapsible = true,
}: CompactSidebarProps) {
  const { t, direction } = useI18n();
  const {
    getSidebarStyleClass,
    getAnimationClass,
    getSpacingClass,
  } = useLayoutStyles();

  const sidebarStyleClass = getSidebarStyleClass({
    compact: "w-56",
    floating: "w-64 m-2 rounded-2xl shadow-2xl",
    minimal: "w-60 border-r-0 shadow-lg",
    default: "w-64",
  });
  const animationClass = getAnimationClass();

  return (
    <>
      <div
        className={cn(
          "sidebar fixed inset-y-0 z-40",
          "bg-gradient-to-b from-background via-background/98 to-background",
          "border-r border-border/80 backdrop-blur-sm sidebar-shadow",
          "transform lg:translate-x-0 overflow-y-auto mt-16",
          sidebarStyleClass, animationClass,
          direction === "rtl" ? "right-0" : "left-0",
          open
            ? "translate-x-0"
            : direction === "rtl"
              ? "translate-x-full"
              : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Mobile close */}
          {collapsible && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "lg:hidden absolute top-2 right-2 h-7 w-7 z-50",
                "hover:bg-primary/10", animationClass
              )}
              onClick={() => onOpenChange(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          )}

          {/* User Info */}
          <div className="p-3 border-b border-border/80">
            <UserCard size="sm" showStatus showRole />
          </div>

          {/* Navigation — replaces 162-line renderNavigationItem */}
          <NavRenderer
            variant="compact"
            className={cn(
              "flex-1 overflow-y-auto",
              getSpacingClass({
                compact: "space-y-1 p-2",
                comfortable: "space-y-3 p-4",
                spacious: "space-y-4 p-6",
                default: "space-y-2 p-3",
              })
            )}
            onNavigate={collapsible ? () => onOpenChange(false) : undefined}
          />

          {/* Footer */}
          <div className="border-t border-border/80 p-2 space-y-1">
            <LogoutButton iconOnly={false} className="w-full justify-start text-xs h-8" />
            <div className="text-xs text-muted-foreground text-center">
              {t("app.version")}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
