"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { X, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Avatar, AvatarFallback } from "@core/ui/avatar";
import { useI18n } from "@core/providers/i18n-provider";
import { useAuth } from "@core/providers/auth-provider";
import { cn } from "@core/common/utils";
import { useSettings } from "@core/providers/settings-provider";
import { useLayoutStyles } from "./use-layout-styles";
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
import { Logo } from "@core/ui/logo";

interface CompactSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collapsible?: boolean;
}

export function CompactSidebar({
  open,
  onOpenChange,
  collapsible = true,
}: CompactSidebarProps) {
  const pathname = usePathname();
  const { t, direction } = useI18n();
  const { user } = useAuth();
  const { spacingSize } = useSettings();

  const {
    getSidebarStyleClass,
    getAnimationClass,
    getButtonStyleClass,
    getSpacingClass,
  } = useLayoutStyles();
  const sidebarStyleClass = getSidebarStyleClass({
    compact: "w-56",
    floating: "w-64 m-2 rounded-2xl shadow-2xl",
    minimal: "w-60 border-r-0 shadow-lg",
    default: "w-64",
  });
  const animationClass = getAnimationClass();
  const buttonStyleClass = getButtonStyleClass({ modern: "rounded-2xl" });
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
                "group flex items-center justify-between w-full px-3 py-2 text-sm font-medium cursor-pointer",
                buttonStyleClass,
                animationClass,
                item.disabled && "opacity-50 cursor-not-allowed",
                isActive
                  ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-md"
                  : "text-foreground/80 hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:text-primary hover:shadow-sm"
              )}
              style={{ paddingLeft: `${12 + indent}px` }}
            >
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div
                  className={cn(
                    "flex items-center justify-center rounded-lg",
                    animationClass,
                    "w-8 h-8",
                    isActive
                      ? "bg-white/20"
                      : "bg-primary/10 group-hover:bg-primary/20"
                  )}
                >
                  {Icon ? (
                    <Icon
                      className={cn(
                        "w-4 h-4 flex-shrink-0 group-hover:scale-110",
                        animationClass,
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
                <span className="truncate">{item.name}</span>
                {item.badge && (
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs h-5 px-2",
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
                  "w-4 h-4",
                  animationClass,
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
          "group flex items-center justify-between px-3 py-2 text-sm font-medium",
          buttonStyleClass,
          animationClass,
          item.disabled && "opacity-50 cursor-not-allowed pointer-events-none",
          isActive
            ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-md"
            : "text-foreground/80 hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:text-primary hover:shadow-sm"
        )}
        style={{ paddingLeft: `${12 + indent}px` }}
        onClick={() => !item.disabled && collapsible && onOpenChange(false)}
      >
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div
            className={cn(
              "flex items-center justify-center rounded-lg",
              animationClass,
              "w-8 h-8",
              isActive
                ? "bg-white/20"
                : "bg-primary/10 group-hover:bg-primary/20"
            )}
          >
            {Icon ? (
              <Icon
                className={cn(
                  "w-4 h-4 flex-shrink-0 group-hover:scale-110",
                  animationClass,
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
          <span className="truncate">{item.name}</span>
        </div>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {item.badge && (
            <Badge
              variant="secondary"
              className={cn(
                "text-xs h-5 px-2",
                isActive
                  ? "bg-white/20 text-white"
                  : "bg-primary/10 text-primary"
              )}
            >
              {item.badge}
            </Badge>
          )}
          {level === 0 && (
            <ChevronRight
              className={cn(
                "w-3 h-3 opacity-0 group-hover:opacity-100",
                animationClass,
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
          "fixed inset-y-0 z-40 bg-gradient-to-b from-background via-background/98 to-background border-r border-border/80 transform lg:translate-x-0 overflow-y-auto sidebar-shadow",
          "backdrop-blur-sm",
          sidebarStyleClass,
          animationClass,
          direction === "rtl" ? "right-0" : "left-0",
          open
            ? "translate-x-0"
            : direction === "rtl"
            ? "translate-x-full"
            : "-translate-x-full",
          "mt-16"
        )}
      >
        <div className="flex flex-col h-full ">
          {/* User Info */}
          {user && (
            <div className="p-4 border-b border-border/80">
              <div
                className={cn(
                  "flex items-center rounded-xl",
                  animationClass,
                  "bg-gradient-to-br from-primary/5 to-primary/2 border border-primary/10",
                  "shadow-sm hover:shadow-md",
                  spacingSize === "compact"
                    ? "space-x-2 rtl:space-x-reverse p-2"
                    : spacingSize === "comfortable"
                    ? "space-x-4 rtl:space-x-reverse p-4"
                    : spacingSize === "spacious"
                    ? "space-x-5 rtl:space-x-reverse p-5"
                    : "space-x-3 rtl:space-x-reverse p-3"
                )}
              >
                <div className="relative">
                  <Avatar
                    className={cn(
                      "ring-1 ring-primary/20 shadow-md hover:scale-105",
                      animationClass,
                      spacingSize === "compact"
                        ? "h-8 w-8"
                        : spacingSize === "spacious"
                        ? "h-12 w-12"
                        : "h-10 w-10"
                    )}
                  >
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-sm font-semibold">
                      {/*{ user.firstName.charAt(0) ?? user.username}
                      {user.lastName.charAt(0) ?? ""}*/}
                      {user.username}
                    </AvatarFallback>
                  </Avatar>
                  {/* Online indicator */}
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background shadow-sm">
                    <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 rounded-full animate-pulse" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.adminTypeName}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav
            className={cn(
              "flex-1 overflow-y-auto",
              getSpacingClass({
                compact: "space-y-1 p-2",
                comfortable: "space-y-3 p-4",
                spacious: "space-y-4 p-6",
                default: "space-y-2 p-3",
              })
            )}
          >
            {navigation.map((item) => renderNavigationItem(item))}
          </nav>

          {/* Footer - Version only */}
          <div className="p-3 border-t border-border/80">
            <div className="text-xs text-muted-foreground text-center">
              {t("app.version")}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
