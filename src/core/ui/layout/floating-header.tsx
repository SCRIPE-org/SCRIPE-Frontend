"use client";

import { Menu, Home } from "lucide-react";
import { Button } from "@core/ui/button";
import { useI18n } from "@core/providers/i18n-provider";
import { useLayoutStyles } from "./use-layout-styles";
import { UserProfileDropdown } from "@core/ui/user-profile-dropdown";
import { cn } from "@core/common/utils";
import { Logo } from "@core/ui/logo";
import { LanguageSwitcher, ThemeSwitcher, HeaderSearch } from "./common";
import { useRouter } from "next/navigation";
import { useSettings } from "@core/providers/settings-provider";

interface FloatingHeaderProps {
  onMenuClick: () => void;
}

export function FloatingHeader({ onMenuClick }: FloatingHeaderProps) {
  const { t } = useI18n();
  const settings = useSettings();
  const router = useRouter();
  const {
    getHeaderStyleClass,
    getAnimationClass,
    getButtonStyleClass,
  } = useLayoutStyles();

  const headerClass = getHeaderStyleClass({
    compact: "h-14 top-4",
    elevated: "h-16 top-6 shadow-3xl shadow-primary/20",
    transparent: "h-16 top-6 bg-transparent backdrop-blur-3xl",
    default: "h-16 top-6",
  });

  const animationClass = getAnimationClass({
    default: "transition-all duration-500 hover:shadow-3xl hover:shadow-primary/15",
  });

  const buttonClass = getButtonStyleClass({
    modern: "rounded-3xl",
    default: "rounded-2xl",
  });

  return (
    <header
      className={cn(
        "fixed left-4 right-4 sm:left-8 sm:right-8 z-50",
        "bg-gradient-to-r from-background/98 via-background/95 to-background/98 backdrop-blur-2xl",
        "border border-border/60 shadow-2xl shadow-primary/10",
        headerClass,
        buttonClass,
        animationClass
      )}
    >
      <div className="flex items-center justify-between h-full px-6">
        {/* Left Section */}
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          {/* Mobile Menu Button */}
          {settings.collapsibleSidebar && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "lg:hidden h-10 w-10 hover:bg-primary/10 hover:text-primary",
                "shadow-md hover:shadow-lg hover:scale-105",
                buttonClass,
                animationClass
              )}
              onClick={onMenuClick}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          {/* Logo/Title - Keep this for floating layout */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div
              className={cn(
                "w-10 h-10 bg-primary flex items-center justify-center shadow-lg",
                buttonClass
              )}
            >
              <Logo
                size="sm"
                className="text-primary-foreground animate-pulse"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                {t("app.title")}
              </h1>
              <p className="text-xs text-muted-foreground">
                {t("app.floating")}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-md mx-4 lg:mx-8">
          <HeaderSearch
            containerClassName={cn("group", animationClass)}
            inputClassName={cn(
              "w-full h-11 border-0 bg-muted/50 backdrop-blur-sm shadow-sm",
              "focus:bg-background focus:ring-2 focus:ring-primary/20 focus:shadow-md",
              buttonClass,
              animationClass
            )}
            iconClassName={animationClass}
          />
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          {/* Home Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            className={cn(
              "h-10 w-10 hover:bg-primary/10 hover:text-primary",
              "shadow-md hover:shadow-lg hover:scale-105",
              buttonClass,
              animationClass
            )}
            title={t("nav.home") || "Home"}
          >
            <Home className="h-5 w-5" />
          </Button>

          <ThemeSwitcher
            buttonClassName={cn(
              "h-10 w-10 hover:bg-primary/10 hover:text-primary",
              "shadow-md hover:shadow-lg hover:scale-105",
              buttonClass,
              animationClass
            )}
          />

          <LanguageSwitcher
            buttonClassName={cn(
              "h-10 w-10 hover:bg-primary/10 hover:text-primary",
              "shadow-md hover:shadow-lg hover:scale-105",
              buttonClass,
              animationClass
            )}
          />

          {/* User Profile Dropdown */}
          <UserProfileDropdown variant="floating" showName={false} />
        </div>
      </div>
    </header>
  );
}
