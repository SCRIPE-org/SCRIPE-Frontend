"use client";

import { X } from "lucide-react";
import { Button } from "@core/ui/button";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import { NavRenderer, UserCard, LogoutButton } from "../shared";
import { useLayoutStyles } from "../shared/use-layout-styles";
import { Logo } from "@core/ui/logo";

interface ClassicSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collapsible?: boolean;
}

export function ClassicSidebar({
  open,
  onOpenChange,
  collapsible = true,
}: ClassicSidebarProps) {
  const { t, direction } = useI18n();
  const {
    getSpacingClass,
    getBorderRadiusClass,
    getShadowClass,
    getAnimationClass,
    getCardStyleClass,
  } = useLayoutStyles();

  const borderRadiusClass = getBorderRadiusClass({
    large: "rounded-2xl",
    full: "rounded-3xl",
    default: "rounded-xl",
  });
  const animationClass = getAnimationClass({
    high: "transition-all duration-500 ease-in-out",
  });
  const shadowClass = getShadowClass();

  return (
    <>
      <div
        className={cn(
          "sidebar fixed inset-y-0 z-50 w-80 border-r-2 border-sidebar-border",
          "transform lg:translate-x-0 custom-scrollbar overflow-y-auto",
          getCardStyleClass(), shadowClass, animationClass,
          direction === "rtl" ? "right-0" : "left-0",
          open
            ? "translate-x-0"
            : direction === "rtl"
              ? "translate-x-full"
              : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-sidebar-border">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div
                className={cn(
                  "w-12 h-12 bg-primary flex items-center justify-center shadow-lg",
                  borderRadiusClass, animationClass,
                  "hover:scale-105 hover:shadow-xl"
                )}
              >
                <Logo size="md" className="text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-sidebar-foreground">
                  {t("app.title")}
                </h1>
                <p className="text-xs text-sidebar-foreground/60 flex items-center">
                  <Logo size="xs" className="mr-1 rtl:mr-0 rtl:ml-1" />
                  {t("app.classic")}
                </p>
              </div>
            </div>
            {collapsible && (
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "lg:hidden text-sidebar-foreground hover:bg-sidebar-accent",
                  borderRadiusClass, animationClass,
                  "shadow-md hover:shadow-lg hover:scale-105"
                )}
                onClick={() => onOpenChange(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>

          {/* User Info — replaces 70-line manual Avatar + 9-way color ternary */}
          <div className="p-6 border-b-2 border-sidebar-border">
            <UserCard size="lg" showStatus showRole />
          </div>

          {/* Navigation — replaces 186-line renderNavigationItem + 9-way color ternary ×2 */}
          <NavRenderer
            variant="default"
            className={cn(
              "flex-1 overflow-y-auto",
              getSpacingClass({
                compact: "p-2 space-y-1",
                comfortable: "p-8 space-y-6",
                spacious: "p-12 space-y-8",
                default: "p-6 space-y-4",
              })
            )}
            onNavigate={collapsible ? () => onOpenChange(false) : undefined}
          />

          {/* Footer with logout */}
          <div className="border-t border-sidebar-border p-4">
            <LogoutButton className="w-full justify-start" />
          </div>
        </div>
      </div>
    </>
  );
}
