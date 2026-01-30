"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { X, ChevronDown } from "lucide-react";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Avatar, AvatarFallback } from "@core/ui/avatar";
import { Card, CardContent } from "@core/ui/card";
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
  const pathname = usePathname();
  const { t, direction } = useI18n();
  const { user } = useAuth();
  const { cardStyle, animationLevel, buttonStyle, spacingSize } = useSettings();
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

  const getCardStyleClass = () => {
    switch (cardStyle) {
      case "glass":
        return "bg-background/95 backdrop-blur-xl border-0";
      case "solid":
        return "bg-background border border-border";
      case "bordered":
        return "bg-background border-2 border-border";
      case "elevated":
        return "bg-background border border-border shadow-2xl";
      default:
        return "bg-background/95 backdrop-blur-xl border-0";
    }
  };

  const getAnimationClass = () => {
    if (animationLevel === "none") return "";
    if (animationLevel === "minimal") return "transition-colors duration-200";
    if (animationLevel === "moderate") return "transition-all duration-300";
    return "transition-all duration-500";
  };

  const getButtonStyleClass = () => {
    switch (buttonStyle) {
      case "rounded":
        return "rounded-full";
      case "sharp":
        return "rounded-none";
      case "modern":
        return "rounded-3xl";
      default:
        return "rounded-xl";
    }
  };

  const getSpacingClass = () => {
    switch (spacingSize) {
      case "compact":
        return "space-y-1 p-3";
      case "comfortable":
        return "space-y-3 p-5";
      case "spacious":
        return "space-y-4 p-6";
      default:
        return "space-y-2 p-4";
    }
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
                "group flex items-center justify-between w-full px-4 py-3 text-sm font-medium cursor-pointer",
                getButtonStyleClass(),
                getAnimationClass(),
                item.disabled && "opacity-50 cursor-not-allowed",
                isActive
                  ? "bg-gradient-to-r from-primary/20 to-primary/10 text-primary shadow-md"
                  : "bg-background/60 text-foreground/80 hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:text-primary hover:shadow-sm"
              )}
              style={{ paddingLeft: `${16 + indent}px` }}
            >
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div
                  className={cn(
                    "flex items-center justify-center rounded-lg",
                    getAnimationClass(),
                    level === 0
                      ? "w-8 h-8 bg-primary/10"
                      : "w-6 h-6 bg-primary/5"
                  )}
                >
                  {Icon ? (
                    <Icon
                      className={cn(
                        level === 0 ? "h-4 w-4" : "h-3 w-3",
                        "text-primary"
                      )}
                    />
                  ) : (
                    <div
                      className={cn(
                        "rounded-full bg-primary",
                        level === 0 ? "w-2 h-2" : "w-1.5 h-1.5"
                      )}
                    />
                  )}
                </div>
                <span>{item.name}</span>
                {item.badge && (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-primary/10 text-primary border-0"
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>
              <ChevronDown
                className={cn(
                  "w-4 h-4",
                  getAnimationClass(),
                  isExpanded && "rotate-180"
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
          "group flex items-center justify-between px-4 py-3 text-sm font-medium",
          getButtonStyleClass(),
          getAnimationClass(),
          item.disabled && "opacity-50 cursor-not-allowed pointer-events-none",
          isActive
            ? "bg-gradient-to-r from-primary/20 to-primary/10 text-primary shadow-md"
            : "bg-background/60 text-foreground/80 hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:text-primary hover:shadow-sm"
        )}
        style={{ paddingLeft: `${16 + indent}px` }}
        onClick={() => !item.disabled && collapsible && onOpenChange(false)}
      >
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div
            className={cn(
              "flex items-center justify-center rounded-lg",
              getAnimationClass(),
              level === 0 ? "w-8 h-8 bg-primary/10" : "w-6 h-6 bg-primary/5"
            )}
          >
            {Icon ? (
              <Icon
                className={cn(
                  level === 0 ? "h-4 w-4" : "h-3 w-3",
                  "text-primary"
                )}
              />
            ) : (
              <div
                className={cn(
                  "rounded-full bg-primary",
                  level === 0 ? "w-2 h-2" : "w-1.5 h-1.5"
                )}
              />
            )}
          </div>
          <span>{item.name}</span>
        </div>
        {item.badge && (
          <Badge
            variant="secondary"
            className="text-xs bg-primary/10 text-primary border-0"
          >
            {item.badge}
          </Badge>
        )}
      </Link>
    );
  };

  return (
    <Card
      className={cn(
        "fixed z-40 w-80 max-h-[calc(100vh-8rem)] sidebar-shadow",
        getCardStyleClass(),
        getAnimationClass(),
        // Responsive positioning
        "top-24 left-4 right-4 sm:left-8 sm:right-auto sm:w-80",
        // Show/hide animation
        open ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0",
        // Always visible on large screens
        "lg:translate-y-0 lg:opacity-100",
        // RTL support
        direction === "rtl" && "sm:left-auto sm:right-8"
      )}
    >
      <CardContent className="p-0">
        <div className="flex flex-col h-full max-h-[calc(100vh-8rem)]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/20">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div
                className={cn(
                  "w-10 h-10 bg-primary flex items-center justify-center shadow-lg",
                  getButtonStyleClass()
                )}
              >
                <Logo size="sm" className="text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">
                  {t("app.title")}
                </h1>
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
                className={cn(
                  "lg:hidden h-8 w-8 hover:bg-primary/10",
                  "shadow-sm hover:shadow-md hover:scale-105",
                  getButtonStyleClass(),
                  getAnimationClass()
                )}
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* User Info */}
          {user && (
            <div className="p-6 border-b border-border/50">
              <div
                className={cn(
                  "flex items-center rounded-2xl",
                  getAnimationClass(),
                  "bg-gradient-to-br from-primary/5 to-primary/2 border border-primary/10",
                  "shadow-sm hover:shadow-md",
                  spacingSize === "compact"
                    ? "space-x-3 rtl:space-x-reverse p-3"
                    : spacingSize === "comfortable"
                    ? "space-x-5 rtl:space-x-reverse p-5"
                    : spacingSize === "spacious"
                    ? "space-x-6 rtl:space-x-reverse p-6"
                    : "space-x-4 rtl:space-x-reverse p-4"
                )}
              >
                <div className="relative">
                  <Avatar
                    className={cn(
                      "ring-2 ring-primary/20 shadow-lg hover:scale-105",
                      getAnimationClass(),
                      spacingSize === "compact"
                        ? "h-10 w-10"
                        : spacingSize === "spacious"
                        ? "h-14 w-14"
                        : "h-12 w-12"
                    )}
                  >
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                      {/*{ user.firstName.charAt(0) ?? user.username}
                      {user.lastName.charAt(0) ?? ""}*/}
                      {user.username}
                    </AvatarFallback>
                  </Avatar>
                  {/* Online indicator */}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background shadow-md">
                    <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 rounded-full animate-pulse" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
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
          <div className="flex-1 overflow-y-auto">
            <nav className={getSpacingClass()}>
              {navigation.map((item) => renderNavigationItem(item))}
            </nav>
          </div>

          {/* Footer - Version only */}
          <div className="p-4 border-t border-border/50">
            <div className="text-xs text-muted-foreground text-center">
              {t("app.version")} • {t("app.floatingDesign")}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
