"use client";

import { Menu, X, Home } from "lucide-react";
import { Button } from "@core/ui/button";
import { useI18n } from "@core/providers/i18n-provider";
import { useLayoutStyles } from "../shared/use-layout-styles";
import { UserProfileDropdown } from "@core/ui/user-profile-dropdown";
import { cn } from "@core/common/utils";
import { Logo } from "../../logo";
import { LanguageSwitcher, ThemeSwitcher, HeaderSearch } from "../common";
import { useRouter } from "next/navigation";
import { useSettings } from "@core/providers/settings-provider";

interface CompactHeaderProps {
  onMenuClick: () => void;
}

export function CompactHeader({ onMenuClick }: CompactHeaderProps) {
  const { t } = useI18n();
  const settings = useSettings();
  const router = useRouter();
  const {
    getHeaderStyleClass,
    getAnimationClass,
    getButtonStyleClass,
  } = useLayoutStyles();
  const animationClass = getAnimationClass();
  const buttonClass = getButtonStyleClass({
    modern: "rounded-2xl",
    default: "rounded-xl",
  });

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-background via-background/98 to-background border-b border-border/80",
        "shadow-lg shadow-primary/5 backdrop-blur-xl",
        getHeaderStyleClass({
          compact: "h-14 px-3",
          elevated: "h-16 px-4 shadow-lg",
          transparent: "h-16 px-4 bg-transparent backdrop-blur-md",
          default: "h-16 px-4",
        }),
        getAnimationClass()
      )}
    >
      <div className="flex items-center justify-between h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md">
              <Logo size="xs" className="text-primary-foreground" />
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
                getAnimationClass()
              )}
              onClick={onMenuClick}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        {/* Left Section */}
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          {/* Mobile Menu Button */}
          {settings.collapsibleSidebar && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "lg:hidden h-9 w-9 hover:bg-primary/10 hover:text-primary",
                "shadow-sm hover:shadow-md hover:scale-105",
                buttonClass,
                getAnimationClass()
              )}
              onClick={onMenuClick}
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex-1 max-w-sm mx-4">
          <HeaderSearch
            containerClassName={cn("group", getAnimationClass())}
            inputClassName={cn(
              "w-full h-9 border-0 bg-muted/50 shadow-sm",
              "focus:bg-background focus:ring-2 focus:ring-primary/20 focus:shadow-md",
              getAnimationClass(),
              buttonClass
            )}
            iconClassName={getAnimationClass()}
          />
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {/* Home Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            className={cn(
              "h-9 w-9 hover:bg-primary/10 hover:text-primary",
              "shadow-sm hover:shadow-md hover:scale-105",
              buttonClass,
              animationClass
            )}
            title={t("nav.home") || "Home"}
          >
            <Home className="h-4 w-4" />
          </Button>

          <ThemeSwitcher
            buttonClassName={cn(
              "h-9 w-9 hover:bg-primary/10 hover:text-primary",
              "shadow-sm hover:shadow-md hover:scale-105",
              buttonClass,
              animationClass
            )}
          />

          <LanguageSwitcher
            buttonClassName={cn(
              "h-9 w-9 hover:bg-primary/10 hover:text-primary",
              "shadow-sm hover:shadow-md hover:scale-105",
              buttonClass,
              animationClass
            )}
          />

          {/* User Profile Dropdown */}
          <UserProfileDropdown variant="compact" showName={false} />
        </div>
      </div>
    </header>
  );
}
