"use client";

import { X } from "lucide-react";
import { Button } from "@core/ui/button";
import { Card, CardContent } from "@core/ui/card";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import { NavRenderer, UserCard, LogoutButton } from "../shared";
import { useLayoutStyles } from "../shared/use-layout-styles";
import { Logo } from "@core/ui/logo";

interface FloatingNavigationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collapsible?: boolean;
}

export function FloatingNavigation({
  open,
  onOpenChange,
  collapsible = true,
}: FloatingNavigationProps) {
  const { t, direction } = useI18n();
  const {
    getAnimationClass,
    getButtonStyleClass,
    getCardStyleClass,
  } = useLayoutStyles();

  const animationClass = getAnimationClass();
  const buttonClass = getButtonStyleClass({ modern: "rounded-3xl" });

  return (
    <Card
      className={cn(
        "fixed z-40 w-80 max-h-[calc(100vh-8rem)] sidebar-shadow",
        getCardStyleClass({
          glass: "bg-background/95 backdrop-blur-xl border-0",
          solid: "bg-background border border-border",
          bordered: "bg-background border-2 border-border",
          elevated: "bg-background border border-border shadow-2xl",
          default: "bg-background/95 backdrop-blur-xl border-0",
        }),
        animationClass,
        "top-24 left-4 right-4 sm:left-8 sm:right-auto sm:w-80",
        open ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0",
        "lg:translate-y-0 lg:opacity-100",
        direction === "rtl" && "sm:left-auto sm:right-8"
      )}
    >
      <CardContent className="p-0">
        <div className="flex flex-col h-full max-h-[calc(100vh-8rem)]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/20">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className={cn("w-10 h-10 bg-primary flex items-center justify-center shadow-lg", buttonClass)}>
                <Logo size="sm" className="text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">{t("app.title")}</h1>
                <p className="text-xs text-muted-foreground flex items-center">
                  <Logo size="xs" className="mr-1 rtl:mr-0 rtl:ml-1" />
                  {t("app.floating")}
                </p>
              </div>
            </div>
            {collapsible && (
              <Button
                variant="ghost"
                size="icon"
                className={cn("lg:hidden h-8 w-8 hover:bg-primary/10 shadow-sm hover:shadow-md hover:scale-105", buttonClass, animationClass)}
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-border/50">
            <UserCard size="lg" showStatus showRole />
          </div>

          {/* Navigation — replaces 134-line renderNavigationItem + 4 inline utils */}
          <div className="flex-1 overflow-y-auto">
            <NavRenderer
              variant="floating"
              className="space-y-2 p-4"
              onNavigate={collapsible ? () => onOpenChange(false) : undefined}
            />
          </div>

          {/* Footer */}
          <div className="border-t border-border/50 p-3 space-y-2">
            <LogoutButton className="w-full justify-start" />
            <div className="text-xs text-muted-foreground text-center">
              {t("app.version")} • {t("app.floatingDesign")}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
