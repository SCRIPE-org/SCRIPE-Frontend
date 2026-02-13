"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, Home } from "lucide-react";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@core/ui/dropdown-menu";
import { Badge } from "@core/ui/badge";
import { useI18n } from "@core/providers/i18n-provider";
import { useLayoutStyles } from "../shared/use-layout-styles";
import { UserProfileDropdown } from "@core/ui/user-profile-dropdown";
import { cn } from "@core/common/utils";
import { useDynamicNavigation } from "@core/ui/navigation/dynamic-navigation";
import { Logo } from "@core/ui/logo";
import { LanguageSwitcher, ThemeSwitcher } from "../common";
import { useRouter } from "next/navigation";

export function MinimalHeader() {
  const { t, direction } = useI18n();
  const router = useRouter();
  const {
    getHeaderStyleClass,
    getAnimationClass,
    getButtonStyleClass,
  } = useLayoutStyles();
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);

  // Get navigation items with translations from centralized config
  const navigation = useDynamicNavigation();

  const headerClass = getHeaderStyleClass({
    compact: "py-3",
    elevated: "py-4 shadow-lg",
    transparent: "py-4 bg-transparent backdrop-blur-md",
    default: "py-4",
  });

  const animationClass = getAnimationClass();

  const buttonClass = getButtonStyleClass({
    modern: "rounded-2xl",
    default: "rounded-md",
  });

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-40 glass border-b border-border",
        headerClass,
        animationClass
      )}
    >
      <div className="flex items-center justify-between px-6">
        {/* Logo and Navigation */}
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div
              className={cn(
                "w-10 h-10 bg-primary flex items-center justify-center shadow-md",
                buttonClass
              )}
            >
              <Logo size="sm" className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{t("app.title")}</h1>
            </div>
          </div>

          {/* Desktop Navigation - Updated to use centralized config */}
          <nav className="hidden md:flex items-center space-x-1 rtl:space-x-reverse">
            {navigation
              .filter((item) => item.href && !item.disabled) // Only show items with href and not disabled
              .map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href!}
                    className={cn(
                      "px-3 py-2 text-sm font-medium relative",
                      buttonClass,
                      animationClass,
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground/70 hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    {item.name}
                    {item.badge && (
                      <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs bg-primary">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}
          </nav>

          {/* Mobile Navigation - Updated to use centralized config */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className={cn(buttonClass, animationClass)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align={direction === "rtl" ? "start" : "end"}
              className="w-56"
            >
              <DropdownMenuLabel>{t("nav.menu")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {navigation
                .filter((item) => item.href && !item.disabled) // Only show items with href and not disabled
                .map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <DropdownMenuItem key={item.name} asChild>
                      <Link
                        href={item.href!}
                        className={cn(
                          "flex items-center justify-between w-full",
                          isActive && "bg-primary/10 text-primary font-medium"
                        )}
                      >
                        <div className="flex items-center">
                          {Icon && <Icon className="mr-2 h-4 w-4" />}
                          <span>{item.name}</span>
                        </div>
                        {item.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          {/* Search */}
          <div className={cn("relative", searchOpen ? "w-64" : "w-10")}>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "absolute right-0 top-0",
                buttonClass,
                animationClass,
                searchOpen && "opacity-0"
              )}
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>
            <Input
              placeholder={t("common.search")}
              className={cn(
                "pl-4 pr-10 h-10 bg-muted/50 border-0 focus:bg-background",
                buttonClass,
                animationClass,
                searchOpen ? "opacity-100 w-full" : "opacity-0 w-0"
              )}
              onBlur={() => setSearchOpen(false)}
              autoFocus={searchOpen}
            />
          </div>

          {/* Home Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            className={cn("hover-lift", buttonClass, animationClass)}
            title={t("nav.home") || "Home"}
          >
            <Home className="h-5 w-5" />
          </Button>

          <LanguageSwitcher
            buttonClassName={cn("hover-lift", buttonClass, animationClass)}
          />
          <ThemeSwitcher
            buttonClassName={cn("hover-lift", buttonClass, animationClass)}
          />

          {/* User Profile Dropdown */}
          <UserProfileDropdown variant="minimal" showName={false} />
        </div>
      </div>
    </header>
  );
}
