"use client";

import { X } from "lucide-react";
import { Button } from "@core/ui/button";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { cn } from "@core/common/utils";
import { NavRenderer, UserCard, LogoutButton } from "../shared";
import { useLayoutStyles } from "../shared/use-layout-styles";
import { Logo } from "@core/ui/logo";

interface ElegantSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collapsible?: boolean;
}

export function ElegantSidebar({
  open,
  onOpenChange,
  collapsible = true,
}: ElegantSidebarProps) {
  const { t, direction } = useI18n();
  const { sidebarStyle } = useSettings();
  const {
    getAnimationClass,
    getButtonStyleClass,
  } = useLayoutStyles();

  const animationClass = getAnimationClass();
  const buttonClass = getButtonStyleClass();

  const sidebarWidth =
    sidebarStyle === "compact" ? "w-64"
      : sidebarStyle === "floating" ? "w-72 m-3 rounded-2xl shadow-xl"
        : sidebarStyle === "minimal" ? "w-60 border-r-0"
          : "w-72";

  return (
    <>
      <div
        className={cn(
          "sidebar fixed inset-y-0 z-40",
          "bg-gradient-to-b from-background/98 via-background/96 to-background/98",
          "backdrop-blur-xl border-r border-border/50",
          "transform lg:translate-x-0 overflow-y-auto",
          sidebarWidth,
          animationClass,
          direction === "rtl" ? "right-0" : "left-0",
          open
            ? "translate-x-0"
            : direction === "rtl"
              ? "translate-x-full"
              : "-translate-x-full",
          "before:absolute before:inset-0 before:bg-gradient-to-b before:from-primary/5 before:via-primary/2 before:to-primary/5 before:opacity-60"
        )}
      >
        <div className="relative flex flex-col h-full">
          {/* Decorative blurred orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 -left-8 w-24 h-24 bg-gradient-to-br from-primary/8 to-transparent rounded-full blur-2xl animate-pulse" />
            <div className="absolute bottom-40 -right-8 w-20 h-20 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-xl animate-pulse delay-1000" />
          </div>

          {/* Mobile close */}
          {collapsible && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "lg:hidden absolute top-3 right-3 h-8 w-8 z-50 mt-12",
                "bg-muted/60 hover:bg-primary/10",
                "border border-border/40 hover:border-primary/30",
                buttonClass, animationClass
              )}
              onClick={() => onOpenChange(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          )}

          {/* Logo header */}
          <div className="relative p-5 mt-14 border-b border-border/30">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className={cn(
                "w-10 h-10 bg-primary flex items-center justify-center shadow-lg rounded-xl",
                animationClass, "hover:scale-105"
              )}>
                <Logo size="sm" className="text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-base font-bold text-foreground">{t("app.title")}</h1>
                <p className="text-xs text-muted-foreground">{t("app.tagline")}</p>
              </div>
            </div>
          </div>

          {/* User Card */}
          <div className="relative px-4 py-3 border-b border-border/30">
            <UserCard size="md" showStatus showRole />
          </div>

          {/* Navigation — shared NavRenderer eliminates 180 duplicate lines */}
          <NavRenderer
            variant="elegant"
            className="relative flex-1 overflow-y-auto p-4 space-y-1"
            onNavigate={collapsible ? () => onOpenChange(false) : undefined}
          />

          {/* Footer */}
          <div className="relative border-t border-border/30 p-3 space-y-2">
            <LogoutButton className="w-full justify-start" />
            <div className="text-xs text-muted-foreground/60 text-center font-medium">
              {t("app.version")}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
