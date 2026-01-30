"use client";

import { Menu, Home } from "lucide-react";
import { Button } from "@core/ui/button";
import { useI18n } from "@core/providers/i18n-provider";
import { useLayoutStyles } from "./use-layout-styles";
import { UserProfileDropdown } from "@core/ui/user-profile-dropdown";
import { cn } from "@core/common/utils";
import { LanguageSwitcher, ThemeSwitcher, HeaderSearch } from "./common";
import { useRouter } from "next/navigation";

interface ClassicHeaderProps {
  onMenuClick: () => void;
}

export function ClassicHeader({ onMenuClick }: ClassicHeaderProps) {
  const { t } = useI18n();
  const router = useRouter();
  const {
    getSpacingClass,
    getHeaderStyleClass,
    getShadowClass,
    getAnimationClass,
    getBorderRadiusClass,
    getCardStyleClass,
  } = useLayoutStyles();

  const animationClass = getAnimationClass();

  const cardStyleClass = getCardStyleClass();
  
  const headerClass = getHeaderStyleClass({
    compact: cn("h-14 border-b", cardStyleClass),
    elevated: cn("border-b-2 border-border/80 shadow-xl shadow-primary/10", cardStyleClass),
    transparent: cn("bg-transparent backdrop-blur-xl border-b border-border/30", cardStyleClass),
    default: cn("border-b-2 border-border/80 shadow-lg shadow-primary/5", cardStyleClass),
  });

  return (
    <header
      className={cn(
        "sticky top-0 z-40",
        headerClass,
        getShadowClass(),
        animationClass
      )}
    >
      <div
        className={cn("flex items-center justify-between", getSpacingClass())}
      >
        {/* Left side */}
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "lg:hidden hover:bg-primary/10 hover:text-primary",
              getBorderRadiusClass(),
              animationClass,
              "shadow-md hover:shadow-lg hover:scale-105"
            )}
            onClick={onMenuClick}
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-6 rtl:space-x-reverse">
          <HeaderSearch
            containerClassName="hidden md:block"
            inputClassName={cn(
              "w-64 bg-muted/50 border-0 focus:bg-background",
              getBorderRadiusClass(),
              animationClass,
              "shadow-sm focus:shadow-md hover:shadow-md",
              "pl-10 rtl:pl-4 rtl:pr-10"
            )}
            iconClassName="left-3 rtl:left-auto rtl:right-3"
          />

          {/* Home Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            className={cn(
              "hover:bg-primary/10 hover:text-primary",
              getBorderRadiusClass(),
              animationClass,
              "shadow-md hover:shadow-lg hover:scale-105"
            )}
            title={t("nav.home") || "Home"}
          >
            <Home className="w-5 h-5" />
          </Button>

          <LanguageSwitcher
            buttonClassName={cn(
              "hover:bg-primary/10 hover:text-primary",
              getBorderRadiusClass(),
              animationClass,
              "shadow-md hover:shadow-lg hover:scale-105"
            )}
            contentClassName={cn(getBorderRadiusClass(), "shadow-xl")}
          />
          <ThemeSwitcher
            buttonClassName={cn(
              "hover:bg-primary/10 hover:text-primary",
              getBorderRadiusClass(),
              animationClass,
              "shadow-md hover:shadow-lg hover:scale-105"
            )}
            contentClassName={cn(getBorderRadiusClass(), "shadow-xl")}
          />

          {/* User Profile Dropdown */}
          <UserProfileDropdown variant="default" />
        </div>
      </div>
    </header>
  );
}
