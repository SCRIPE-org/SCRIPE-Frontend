"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { X, ChevronDown } from "lucide-react";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { useI18n } from "@core/providers/i18n-provider";
import { useAuth } from "@core/providers/auth-provider";
import { useSettings } from "@core/providers/settings-provider";
import { useLayoutStyles } from "./use-layout-styles";
import { cn } from "@core/common/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@core/ui/collapsible";
import {
  isNavigationItemActive,
  type NavigationItem,
} from "@core/config/navigation";
import { useDynamicNavigation } from "@core/ui/navigation/dynamic-navigation";
import { Avatar, AvatarFallback } from "@core/ui/avatar";
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
  const pathname = usePathname();
  const { t, direction } = useI18n();
  const { user } = useAuth();
  const { colorTheme } = useSettings();

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
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Get navigation items with translations and filter out profile, settings, logout
  const navigation = useDynamicNavigation().filter(
    (item: NavigationItem) => !["nav.profile", "nav.settings", "nav.logout"].includes(item.name)
  );

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((name) => name !== itemName)
        : [...prev, itemName]
    );
  };

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const isActive = isNavigationItemActive(item, pathname);
    const isExpanded = expandedItems.includes(item.name);
    const hasChildren = item.children && item.children.length > 0;
    const Icon = item.icon;
    const indent = level * 16; // 16px per level

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
                "group flex items-center justify-between w-full px-6 py-4 text-base font-medium cursor-pointer",
                borderRadiusClass,
                animationClass,
                item.disabled && "opacity-50 cursor-not-allowed",
                isActive
                  ? cn(
                      "text-primary-foreground shadow-lg",
                      colorTheme === "blue" &&
                        "bg-gradient-to-r from-blue-500 to-blue-600",
                      colorTheme === "purple" &&
                        "bg-gradient-to-r from-purple-500 to-purple-600",
                      colorTheme === "green" &&
                        "bg-gradient-to-r from-green-500 to-green-600",
                      colorTheme === "orange" &&
                        "bg-gradient-to-r from-orange-500 to-orange-600",
                      colorTheme === "red" &&
                        "bg-gradient-to-r from-red-500 to-red-600",
                      colorTheme === "teal" &&
                        "bg-gradient-to-r from-teal-500 to-teal-600",
                      colorTheme === "pink" &&
                        "bg-gradient-to-r from-pink-500 to-pink-600",
                      colorTheme === "indigo" &&
                        "bg-gradient-to-r from-indigo-500 to-indigo-600",
                      colorTheme === "cyan" &&
                        "bg-gradient-to-r from-cyan-500 to-cyan-600"
                    )
                  : "text-sidebar-foreground/70 hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:text-primary hover:shadow-md"
              )}
              style={{ paddingLeft: `${24 + indent}px` }}
            >
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <div
                  className={cn(
                    "flex items-center justify-center rounded-lg transition-all duration-300",
                    level === 0 ? "w-10 h-10" : "w-8 h-8",
                    isActive
                      ? "bg-white/20"
                      : "bg-primary/10 group-hover:bg-primary/20"
                  )}
                >
                  {Icon ? (
                    <Icon
                      className={cn(
                        "transition-all duration-300 group-hover:scale-110",
                        level === 0 ? "w-5 h-5" : "w-4 h-4",
                        isActive ? "text-white" : "text-primary"
                      )}
                    />
                  ) : (
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        isActive ? "bg-white" : "bg-primary"
                      )}
                    />
                  )}
                </div>
                <span className="flex-1">{item.name}</span>
                {item.badge && (
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-primary/10 text-primary"
                    )}
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>
              <ChevronDown
                className={cn(
                  "w-5 h-5 transition-transform duration-300",
                  isExpanded && "rotate-180",
                  isActive ? "text-white" : "text-primary"
                )}
              />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 mt-2">
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
          "group flex items-center justify-between px-6 py-4 text-base font-medium",
          borderRadiusClass,
          animationClass,
          item.disabled && "opacity-50 cursor-not-allowed pointer-events-none",
          isActive
            ? cn(
                "text-primary-foreground shadow-lg",
                colorTheme === "blue" &&
                  "bg-gradient-to-r from-blue-500 to-blue-600",
                colorTheme === "purple" &&
                  "bg-gradient-to-r from-purple-500 to-purple-600",
                colorTheme === "green" &&
                  "bg-gradient-to-r from-green-500 to-green-600",
                colorTheme === "orange" &&
                  "bg-gradient-to-r from-orange-500 to-orange-600",
                colorTheme === "red" &&
                  "bg-gradient-to-r from-red-500 to-red-600",
                colorTheme === "teal" &&
                  "bg-gradient-to-r from-teal-500 to-teal-600",
                colorTheme === "pink" &&
                  "bg-gradient-to-r from-pink-500 to-pink-600",
                colorTheme === "indigo" &&
                  "bg-gradient-to-r from-indigo-500 to-indigo-600",
                colorTheme === "cyan" &&
                  "bg-gradient-to-r from-cyan-500 to-cyan-600"
              )
            : "text-sidebar-foreground/70 hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:text-primary hover:shadow-md"
        )}
        style={{ paddingLeft: `${24 + indent}px` }}
        onClick={() => !item.disabled && collapsible && onOpenChange(false)}
      >
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <div
            className={cn(
              "flex items-center justify-center rounded-lg transition-all duration-300",
              level === 0 ? "w-10 h-10" : "w-8 h-8",
              isActive
                ? "bg-white/20"
                : "bg-primary/10 group-hover:bg-primary/20"
            )}
          >
            {Icon ? (
              <Icon
                className={cn(
                  "transition-all duration-300 group-hover:scale-110",
                  level === 0 ? "w-5 h-5" : "w-4 h-4",
                  isActive ? "text-white" : "text-primary"
                )}
              />
            ) : (
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  isActive ? "bg-white" : "bg-primary"
                )}
              />
            )}
          </div>
          <span className="flex-1">{item.name}</span>
        </div>
        {item.badge && (
          <Badge
            variant="secondary"
            className={cn(
              "text-xs",
              isActive ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
            )}
          >
            {item.badge}
          </Badge>
        )}
      </Link>
    );
  };

  return (
    <>
      <div
        className={cn(
          "sidebar fixed inset-y-0 z-50 w-80 border-r-2 border-sidebar-border transform lg:translate-x-0 custom-scrollbar overflow-y-auto",
          getCardStyleClass(),
          shadowClass,
          animationClass,
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
                  borderRadiusClass,
                  animationClass,
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
                  borderRadiusClass,
                  animationClass,
                  "shadow-md hover:shadow-lg hover:scale-105"
                )}
                onClick={() => onOpenChange(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>

          {/* User Info */}
          {user && (
            <div className="p-8 border-b-2 border-sidebar-border">
              <div
                className={cn(
                  "flex items-center space-x-4 rtl:space-x-reverse p-4",
                  "bg-gradient-to-br from-primary/5 to-primary/2 border border-primary/10",
                  borderRadiusClass,
                  shadowClass,
                  animationClass,
                  "hover:shadow-xl"
                )}
              >
                <div className="relative">
                  <Avatar
                    className={cn(
                      "h-16 w-16 ring-2 ring-primary/30 shadow-lg",
                      animationClass,
                      "hover:scale-105"
                    )}
                  >
                    <AvatarFallback
                      className={cn(
                        "text-primary font-semibold text-xl",
                        colorTheme === "blue" &&
                          "bg-gradient-to-br from-blue-500/20 to-blue-600/10",
                        colorTheme === "purple" &&
                          "bg-gradient-to-br from-purple-500/20 to-purple-600/10",
                        colorTheme === "green" &&
                          "bg-gradient-to-br from-green-500/20 to-green-600/10",
                        colorTheme === "orange" &&
                          "bg-gradient-to-br from-orange-500/20 to-orange-600/10",
                        colorTheme === "red" &&
                          "bg-gradient-to-br from-red-500/20 to-red-600/10",
                        colorTheme === "teal" &&
                          "bg-gradient-to-br from-teal-500/20 to-teal-600/10",
                        colorTheme === "pink" &&
                          "bg-gradient-to-br from-pink-500/20 to-pink-600/10",
                        colorTheme === "indigo" &&
                          "bg-gradient-to-br from-indigo-500/20 to-indigo-600/10",
                        colorTheme === "cyan" &&
                          "bg-gradient-to-br from-cyan-500/20 to-cyan-600/10"
                      )}
                    >
                      {/*{ user.firstName.charAt(0) ?? user.username}
                      {user.lastName.charAt(0) ?? ""}*/}
                      {user.username}
                    </AvatarFallback>
                  </Avatar>
                  {/* Online indicator */}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-background shadow-md">
                    <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 rounded-full animate-pulse" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sidebar-foreground font-medium text-lg truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-sidebar-foreground/60 text-sm truncate">
                    {user.adminTypeName}
                  </p>
                  <div className="flex items-center mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 rtl:mr-0 rtl:ml-2 animate-pulse" />
                    <span className="text-xs text-green-600 font-medium">
                      {t("status.online")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav
            className={cn(
              "flex-1 overflow-y-auto",
              getSpacingClass({
                compact: "p-2 space-y-1",
                comfortable: "p-8 space-y-6",
                spacious: "p-12 space-y-8",
                default: "p-6 space-y-4",
              })
            )}
          >
            {navigation.map((item) => renderNavigationItem(item))}
          </nav>
        </div>
      </div>
    </>
  );
}
