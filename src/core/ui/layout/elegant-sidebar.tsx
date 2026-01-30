"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { X, ChevronDown, ChevronRight, Crown, Star } from "lucide-react";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Avatar, AvatarFallback } from "@core/ui/avatar";
import { useI18n } from "@core/providers/i18n-provider";
import { useAuth } from "@core/providers/auth-provider";
import { useSettings } from "@core/providers/settings-provider";
import { cn } from "@core/common/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@core/ui/collapsible";
import {
  isNavigationItemActive,
  type NavigationItem,
} from "@/config/navigation";
import { useDynamicNavigation } from "@/components/navigation/dynamic-navigation";
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
  const pathname = usePathname();
  const { t, direction } = useI18n();
  const { user } = useAuth();
  const { sidebarStyle, animationLevel, buttonStyle, spacingSize } =
    useSettings();

  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Get navigation items with translations
  const navigation = useDynamicNavigation();

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((name) => name !== itemName)
        : [...prev, itemName]
    );
  };

  const getSidebarStyleClass = () => {
    switch (sidebarStyle) {
      case "compact":
        return "w-64";
      case "floating":
        return "w-72 m-3 rounded-2xl shadow-xl";
      case "minimal":
        return "w-60 border-r-0";
      default:
        return "w-72";
    }
  };

  const getAnimationClass = () => {
    if (animationLevel === "none") return "";
    if (animationLevel === "minimal") return "transition-colors duration-200";
    if (animationLevel === "moderate") return "transition-all duration-300";
    return "transition-all duration-500 ease-out";
  };

  const getButtonStyleClass = () => {
    switch (buttonStyle) {
      case "rounded":
        return "rounded-full";
      case "sharp":
        return "rounded-none";
      case "modern":
        return "rounded-2xl";
      default:
        return "rounded-xl";
    }
  };

  const getSpacingClass = () => {
    switch (spacingSize) {
      case "compact":
        return "space-y-1 p-3";
      case "comfortable":
        return "space-y-2 p-4";
      case "spacious":
        return "space-y-3 p-6";
      default:
        return "space-y-2 p-4";
    }
  };

  const getItemPadding = () => {
    switch (spacingSize) {
      case "compact":
        return "px-3 py-2";
      case "comfortable":
        return "px-4 py-3";
      case "spacious":
        return "px-5 py-4";
      default:
        return "px-4 py-3";
    }
  };

  const getIconSize = () => {
    switch (spacingSize) {
      case "compact":
        return "w-5 h-5";
      case "comfortable":
        return "w-5 h-5";
      case "spacious":
        return "w-6 h-6";
      default:
        return "w-5 h-5";
    }
  };

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const isActive = isNavigationItemActive(item, pathname);
    const isExpanded = expandedItems.includes(item.name);
    const hasChildren = item.children && item.children.length > 0;
    const Icon = item.icon;
    const indent = level * 12; // Reduced indent

    if (hasChildren) {
      return (
        <Collapsible
          key={item.name}
          open={isExpanded}
          onOpenChange={() => toggleExpanded(item.name)}
        >
          <CollapsibleTrigger asChild>
            <div
              className={cn(
                "group flex items-center justify-between w-full text-sm font-medium cursor-pointer relative overflow-hidden",
                getItemPadding(),
                getButtonStyleClass(),
                getAnimationClass(),
                item.disabled && "opacity-50 cursor-not-allowed",
                isActive
                  ? "bg-gradient-to-r from-primary via-primary/95 to-primary/85 text-primary-foreground shadow-lg"
                  : "text-foreground/80 hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:text-primary",
                "before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/10 before:to-white/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300"
              )}
              style={{ paddingLeft: `${16 + indent}px` }}
            >
              <div className="flex items-center space-x-3 rtl:space-x-reverse relative z-10">
                <div
                  className={cn(
                    "flex items-center justify-center relative",
                    getAnimationClass(),
                    spacingSize === "compact"
                      ? "w-8 h-8"
                      : spacingSize === "spacious"
                      ? "w-10 h-10"
                      : "w-9 h-9",
                    isActive
                      ? "bg-white/20 shadow-md"
                      : "bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/15 group-hover:to-primary/10",
                    getButtonStyleClass()
                  )}
                >
                  {Icon ? (
                    <Icon
                      className={cn(
                        getIconSize(),
                        isActive ? "text-white" : "text-primary",
                        "group-hover:scale-105",
                        getAnimationClass()
                      )}
                    />
                  ) : (
                    <div
                      className={cn(
                        "rounded-full",
                        spacingSize === "compact" ? "w-2 h-2" : "w-2.5 h-2.5",
                        isActive ? "bg-white" : "bg-primary"
                      )}
                    />
                  )}
                </div>
                <span className="truncate font-semibold">{item.name}</span>
                {item.badge && (
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs h-5 px-2 border-0 font-medium",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-gradient-to-r from-primary/10 to-primary/5 text-primary"
                    )}
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>
              <ChevronDown
                className={cn(
                  "w-4 h-4 relative z-10 group-hover:scale-110",
                  getAnimationClass(),
                  isExpanded && "rotate-180",
                  isActive ? "text-white" : "text-primary"
                )}
              />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 mt-1">
            {item.children?.map((child) =>
              renderNavigationItem(child, level + 1)
            )}
          </CollapsibleContent>
        </Collapsible>
      );
    }

    return (
      <Link
        key={item.name}
        href={item.href || "#"}
        className={cn(
          "group flex items-center justify-between text-sm font-medium relative overflow-hidden",
          getItemPadding(),
          getButtonStyleClass(),
          getAnimationClass(),
          item.disabled && "opacity-50 cursor-not-allowed pointer-events-none",
          isActive
            ? "bg-gradient-to-r from-primary via-primary/95 to-primary/85 text-primary-foreground shadow-lg"
            : "text-foreground/80 hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:text-primary",
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/10 before:to-white/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300"
        )}
        style={{ paddingLeft: `${16 + indent}px` }}
        onClick={() => !item.disabled && collapsible && onOpenChange(false)}
      >
        <div className="flex items-center space-x-3 rtl:space-x-reverse relative z-10">
          <div
            className={cn(
              "flex items-center justify-center relative",
              getAnimationClass(),
              spacingSize === "compact"
                ? "w-8 h-8"
                : spacingSize === "spacious"
                ? "w-10 h-10"
                : "w-9 h-9",
              isActive
                ? "bg-white/20 shadow-md"
                : "bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/15 group-hover:to-primary/10",
              getButtonStyleClass()
            )}
          >
            {Icon ? (
              <Icon
                className={cn(
                  getIconSize(),
                  isActive ? "text-white" : "text-primary",
                  "group-hover:scale-105",
                  getAnimationClass()
                )}
              />
            ) : (
              <div
                className={cn(
                  "rounded-full",
                  spacingSize === "compact" ? "w-2 h-2" : "w-2.5 h-2.5",
                  isActive ? "bg-white" : "bg-primary"
                )}
              />
            )}
          </div>
          <span className="truncate font-semibold">{item.name}</span>
        </div>
        <div className="flex items-center space-x-2 rtl:space-x-reverse relative z-10">
          {item.badge && (
            <Badge
              variant="secondary"
              className={cn(
                "text-xs h-5 px-2 border-0 font-medium",
                isActive
                  ? "bg-white/20 text-white"
                  : "bg-gradient-to-r from-primary/10 to-primary/5 text-primary"
              )}
            >
              {item.badge}
            </Badge>
          )}
          {level === 0 && (
            <ChevronRight
              className={cn(
                "w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1",
                getAnimationClass(),
                isActive ? "text-white" : "text-primary"
              )}
            />
          )}
        </div>
      </Link>
    );
  };

  return (
    <>
      <div
        className={cn(
          "fixed inset-y-0 z-40",
          "bg-gradient-to-b from-background/98 via-background/96 to-background/98",
          "backdrop-blur-xl border-r border-border/50",
          "transform lg:translate-x-0 overflow-y-auto",
          getSidebarStyleClass(),
          getAnimationClass(),
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
          {/* Reduced background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 -left-8 w-24 h-24 bg-gradient-to-br from-primary/8 to-transparent rounded-full blur-2xl animate-pulse" />
            <div className="absolute bottom-40 -right-8 w-20 h-20 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-xl animate-pulse delay-1000" />
          </div>

          {/* Close button for mobile */}
          {collapsible && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "lg:hidden absolute top-3 right-3 h-8 w-8 z-50",
                "bg-muted/60 hover:bg-primary/10",
                "border border-border/40 hover:border-primary/30",
                getButtonStyleClass(),
                getAnimationClass(),
                "mt-12"
              )}
              onClick={() => onOpenChange(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          )}

          {/* Compact User Info */}
          {user && (
            <div
              className={cn(
                "relative border-b border-border/30",
                spacingSize === "compact"
                  ? "mt-12 p-4"
                  : spacingSize === "spacious"
                  ? "mt-16 p-6"
                  : "mt-14 p-5",
                "mt-24"
              )}
            >
              <div
                className={cn(
                  "flex items-center rounded-xl",
                  getAnimationClass(),
                  "bg-gradient-to-br from-primary/5 to-primary/2",
                  "border border-primary/10",
                  "hover:shadow-md hover:shadow-primary/5",
                  "backdrop-blur-sm",
                  spacingSize === "compact"
                    ? "space-x-3 rtl:space-x-reverse p-3"
                    : spacingSize === "spacious"
                    ? "space-x-4 rtl:space-x-reverse p-4"
                    : "space-x-3 rtl:space-x-reverse p-3"
                )}
              >
                <div className="relative">
                  <Avatar
                    className={cn(
                      "ring-2 ring-primary/20 shadow-md",
                      "hover:scale-105",
                      getAnimationClass(),
                      spacingSize === "compact"
                        ? "h-10 w-10"
                        : spacingSize === "spacious"
                        ? "h-14 w-14"
                        : "h-12 w-12"
                    )}
                  >
                    <AvatarFallback
                      className={cn(
                        "bg-gradient-to-br from-primary/20 to-primary/10",
                        "text-primary font-semibold border border-primary/20",
                        spacingSize === "compact"
                          ? "text-sm"
                          : spacingSize === "spacious"
                          ? "text-lg"
                          : "text-base"
                      )}
                    >
                      {/*{ user.firstName.charAt(0) ?? user.username}
                      {user.lastName.charAt(0) ?? ""}*/}
                      {user.username}
                    </AvatarFallback>
                  </Avatar>
                  {/* Compact online indicator */}
                  <div
                    className={cn(
                      "absolute rounded-full border-2 border-background",
                      spacingSize === "compact"
                        ? "bottom-0 right-0 w-3 h-3"
                        : spacingSize === "spacious"
                        ? "bottom-0 right-0 w-4 h-4"
                        : "bottom-0 right-0 w-3 h-3"
                    )}
                  >
                    <div className="w-full h-full bg-green-500 rounded-full animate-pulse" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-foreground font-semibold truncate",
                      spacingSize === "compact"
                        ? "text-sm"
                        : spacingSize === "spacious"
                        ? "text-base"
                        : "text-sm"
                    )}
                  >
                    {user.firstName} {user.lastName}
                  </p>
                  <p
                    className={cn(
                      "text-muted-foreground/80 truncate font-medium",
                      spacingSize === "compact"
                        ? "text-xs"
                        : spacingSize === "spacious"
                        ? "text-sm"
                        : "text-xs"
                    )}
                  >
                    {user.adminTypeName}
                  </p>
                  <div className="flex items-center mt-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 rtl:mr-0 rtl:ml-2 animate-pulse" />
                    <span className="text-xs text-green-600 font-medium uppercase">
                      {t("status.online")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Compact Navigation */}
          <nav
            className={cn("relative flex-1 overflow-y-auto", getSpacingClass())}
          >
            {navigation.map((item) => renderNavigationItem(item))}
          </nav>

          {/* Compact Footer */}
          <div
            className={cn(
              "relative border-t border-border/30",
              spacingSize === "compact"
                ? "p-3"
                : spacingSize === "spacious"
                ? "p-5"
                : "p-4"
            )}
          >
            <div className="text-xs text-muted-foreground/60 text-center font-medium">
              {t("app.version")}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
