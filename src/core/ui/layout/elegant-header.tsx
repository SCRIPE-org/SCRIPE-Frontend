"use client";

import { Menu, X, Home } from "lucide-react";
import { Button } from "@core/ui/button";
import { useI18n } from "@core/providers/i18n-provider";
import { useLayoutStyles } from "./use-layout-styles";
import { UserProfileDropdown } from "@core/ui/user-profile-dropdown";
import { cn } from "@core/common/utils";
import { Logo } from "../ui/logo";
import { LanguageSwitcher, ThemeSwitcher, HeaderSearch } from "./common";
import { useRouter } from "next/navigation";
import { useSettings } from "@core/providers/settings-provider";

interface ElegantHeaderProps {
  onMenuClick: () => void;
}

export function ElegantHeader({ onMenuClick }: ElegantHeaderProps) {
  const { t, direction } = useI18n();
  const settings = useSettings();
  const router = useRouter();
  const {
    getHeaderStyleClass,
    getAnimationClass,
    getButtonStyleClass,
  } = useLayoutStyles();

  const headerClass = getHeaderStyleClass({
    compact: "h-16",
    elevated: "h-20 shadow-2xl shadow-primary/15",
    transparent: "h-20 bg-transparent backdrop-blur-3xl",
    default: "h-20",
  });

  const animationClass = getAnimationClass({
    minimal: "transition-colors duration-300",
    moderate: "transition-all duration-500",
    default: "transition-all duration-700 ease-out",
  });

  const buttonClass = getButtonStyleClass({
    modern: "rounded-3xl",
    default: "rounded-3xl",
  });

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50",
        "bg-gradient-to-r from-background/98 via-background/95 to-background/98",
        "backdrop-blur-3xl border-b border-gradient-to-r from-transparent via-border/60 to-transparent",
        "shadow-2xl shadow-primary/10",
        headerClass,
        animationClass,
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/8 before:via-primary/4 before:to-primary/8 before:opacity-60",
        "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-primary/50 after:to-transparent"
      )}
    >
      <div className="relative flex items-center justify-between h-full px-6 lg:px-8 z-10">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-6 -left-6 w-32 h-32 bg-gradient-to-br from-primary/15 to-transparent rounded-full blur-2xl animate-pulse" />
          <div className="absolute -top-4 -right-10 w-40 h-40 bg-gradient-to-bl from-primary/12 to-transparent rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-2 bg-gradient-to-r from-transparent via-primary/10 to-transparent blur-sm animate-pulse delay-2000" />
        </div>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md">
              <Logo className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground">
                {t("app.title")}
              </h1>
            </div>
          </div>

          {settings.collapsibleSidebar && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "lg:hidden h-8 w-8 hover:bg-primary/10",
                "shadow-sm hover:shadow-md hover:scale-105",
                buttonClass,
                animationClass
              )}
              onClick={onMenuClick}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        {/* Left Section */}
        <div className="relative flex items-center space-x-4 rtl:space-x-reverse z-20">
          {/* Mobile Menu Button */}
          {settings.collapsibleSidebar && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "lg:hidden h-12 w-12",
                "bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5",
                "hover:from-primary/25 hover:via-primary/15 hover:to-primary/10",
                "border border-primary/20 hover:border-primary/40",
                "shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30",
                "hover:scale-110 active:scale-95",
                "backdrop-blur-xl",
                "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300",
                buttonClass,
                animationClass
              )}
              onClick={onMenuClick}
            >
              <Menu className="h-5 w-5 text-primary drop-shadow-sm" />
            </Button>
          )}
        </div>

        {/* Center Section - Enhanced Search */}
        <div className="flex-1 max-w-2xl mx-8 lg:mx-12">
          <div className="relative group">
            <div
              className={cn(
                "absolute inset-0",
                "bg-gradient-to-r from-primary/15 via-primary/8 to-primary/15",
                "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
                "blur-lg group-hover:blur-sm group-focus-within:blur-sm",
                "scale-105 group-hover:scale-100 group-focus-within:scale-100",
                buttonClass,
                animationClass
              )}
            />
            <div
              className={cn(
                "absolute inset-0",
                "bg-gradient-to-r from-background/80 via-background/90 to-background/80",
                "backdrop-blur-xl border border-border/50",
                "group-focus-within:border-primary/40 group-hover:border-primary/30",
                "shadow-lg group-focus-within:shadow-xl group-focus-within:shadow-primary/20",
                buttonClass,
                animationClass
              )}
            />
            <HeaderSearch
              inputClassName={cn(
                "relative w-full h-14 border-0 bg-transparent z-10",
                "text-base font-medium",
                "focus:ring-0 focus:outline-none",
                "placeholder:text-muted-foreground/60 placeholder:font-medium",
                buttonClass,
                animationClass,
                direction === "rtl" ? "pr-14 text-right" : "pl-14"
              )}
              iconClassName={cn(
                "top-1/2 -translate-y-1/2 h-5 w-5 z-10",
                "text-muted-foreground/60 group-focus-within:text-primary group-hover:text-primary/80",
                "group-focus-within:scale-110",
                animationClass,
                direction === "rtl" ? "right-5" : "left-5"
              )}
            />
          </div>
        </div>

        {/* Right Section - Enhanced buttons */}
        <div className="relative flex items-center space-x-4 rtl:space-x-reverse z-20">
          {/* Home Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            className={cn(
              "h-12 w-12",
              "bg-gradient-to-br from-muted/60 via-muted/40 to-muted/20",
              "hover:from-primary/15 hover:via-primary/10 hover:to-primary/5",
              "border border-border/60 hover:border-primary/40",
              "shadow-lg hover:shadow-xl hover:shadow-primary/15",
              "hover:scale-110 active:scale-95",
              "backdrop-blur-xl",
              "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300",
              buttonClass,
              animationClass
            )}
            title={t("nav.home") || "Home"}
          >
            <Home className="h-5 w-5" />
          </Button>

          <ThemeSwitcher
            buttonClassName={cn(
              "h-12 w-12",
              "bg-gradient-to-br from-muted/60 via-muted/40 to-muted/20",
              "hover:from-primary/15 hover:via-primary/10 hover:to-primary/5",
              "border border-border/60 hover:border-primary/40",
              "shadow-lg hover:shadow-xl hover:shadow-primary/15",
              "hover:scale-110 active:scale-95",
              "backdrop-blur-xl",
              "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300",
              buttonClass,
              animationClass
            )}
          />

          <LanguageSwitcher
            buttonClassName={cn(
              "h-12 w-12",
              "bg-gradient-to-br from-muted/60 via-muted/40 to-muted/20",
              "hover:from-primary/15 hover:via-primary/10 hover:to-primary/5",
              "border border-border/60 hover:border-primary/40",
              "shadow-lg hover:shadow-xl hover:shadow-primary/15",
              "hover:scale-110 active:scale-95",
              "backdrop-blur-xl",
              "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300",
              buttonClass,
              animationClass
            )}
          />

          {/* User Profile Dropdown */}
          <UserProfileDropdown variant="elegant" showName={true} />
        </div>
      </div>
    </header>
  );
}
