"use client";

import type React from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { useDynamicNavigation } from "@core/ui/navigation/dynamic-navigation";
import { cn } from "@core/common/utils";
import { Button } from "@core/ui/button";
import { ScrollArea } from "@core/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@core/ui/tooltip";
import { Logo } from "@core/ui/logo";
import { useSettings } from "@core/providers/settings-provider";
import type { NavigationItem } from "@core/config/navigation";
import {
  getMainItemClasses,
  getBorderRadiusClass,
  getAnimationClass,
  getIconClasses,
  getSidebarBgClass,
  getIndicatorColor,
  type NavigationStyleConfig,
} from "./navigation-styles";

interface NavigationMainSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeMainItem: string;
  selectedMainItem: string | null;
  onItemClick: (item: NavigationItem) => void;
  isMobile: boolean;
}

export function NavigationMainSidebar({
  open,
  onOpenChange,
  activeMainItem,
  selectedMainItem,
  onItemClick,
  isMobile,
}: NavigationMainSidebarProps) {
  const { direction, t } = useI18n();
  const navigation = useDynamicNavigation();
  const {
    colorTheme,
    cardStyle,
    animationLevel,
    borderRadius,
    navigationStyle,
    iconStyle,
  } = useSettings();

  const styleConfig: NavigationStyleConfig = {
    colorTheme,
    animationLevel,
    borderRadius,
    navigationStyle,
    iconStyle,
    cardStyle,
    direction,
  };

  // ── Click handler ──
  const handleItemClick = (item: NavigationItem) => {
    onItemClick(item);
    // Close mobile sidebar when navigating to a leaf page
    const hasChildren = !!(item.children && item.children.length > 0);
    if (!hasChildren && item.href && isMobile) {
      onOpenChange(false);
    }
  };

  // ── Render a single navigation item (desktop icon button) ──
  const renderNavigationItem = (item: NavigationItem) => {
    const hasChildren = !!(item.children && item.children.length > 0);
    const hasHref = !!item.href;
    const displayName = t(item.name) || item.name;

    // Determine active/selected state
    const isSelected = item.name === selectedMainItem;
    const isActive = item.name === activeMainItem;
    const isCurrentlyFocused = isSelected || (isActive && selectedMainItem === null);

    // Opacity: if user selected another item, dim this one (still active but not focused)
    let itemOpacity = "opacity-100";
    let itemIsHighlighted = false;

    if (isSelected) {
      itemIsHighlighted = true;
    } else if (isActive && selectedMainItem !== null) {
      itemIsHighlighted = true;
      itemOpacity = "opacity-60";
    }

    return (
      <TooltipProvider key={item.name}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                getMainItemClasses(isCurrentlyFocused, styleConfig),
                getBorderRadiusClass(borderRadius),
                getAnimationClass(animationLevel, "main"),
                item.disabled && "opacity-50 cursor-not-allowed",
                itemOpacity,
              )}
              onClick={() => handleItemClick(item)}
              disabled={item.disabled}
            >
              {item.icon ? (
                <item.icon className={getIconClasses(iconStyle)} />
              ) : (
                <div className="w-3 h-3 rounded-full bg-white" />
              )}

              {/* Active indicator bar — only for non-sidebar navigation styles */}
              {itemIsHighlighted && navigationStyle !== "sidebar" && (
                <div
                  className={cn(
                    "absolute w-1 h-8 rounded-full",
                    direction === "rtl" ? "left-0" : "right-0",
                    getIndicatorColor(colorTheme),
                  )}
                />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent
            side={direction === "rtl" ? "left" : "right"}
            className="bg-popover border-border"
          >
            <div className="flex flex-col gap-1">
              <span className="font-medium">{displayName}</span>
              {hasChildren && (
                <span className="text-xs text-muted-foreground">
                  {t("layout.click_to_expand") || "Click to expand"}
                </span>
              )}
              {!hasChildren && hasHref && (
                <span className="text-xs text-muted-foreground">
                  {t("layout.click_to_navigate") || "Click to navigate"}
                </span>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "navigation-main-sidebar fixed inset-y-0 z-50 w-24 transform transition-all duration-300 ease-in-out hidden lg:flex flex-col",
          getSidebarBgClass(cardStyle, direction),
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b border-border/50">
          <Logo size="sm" />
        </div>

        {/* Navigation Items */}
        <ScrollArea className="flex-1 py-4">
          <div className="flex flex-col items-center space-y-2 px-2">
            {navigation.map(renderNavigationItem)}
          </div>
        </ScrollArea>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "navigation-main-sidebar fixed inset-y-0 z-50 w-64 transform transition-all duration-300 ease-in-out lg:hidden",
          getSidebarBgClass(cardStyle, direction),
          open
            ? "translate-x-0"
            : direction === "rtl"
              ? "translate-x-full"
              : "-translate-x-full",
        )}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border/50">
          <Logo size="sm" />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="hover:bg-accent hover:text-accent-foreground"
          >
            ×
          </Button>
        </div>

        {/* Mobile Navigation Items */}
        <ScrollArea className="flex-1 py-4">
          <div className="space-y-1 px-3">
            {navigation.map((item) => {
              const hasChildren = !!(item.children && item.children.length > 0);
              const displayName = t(item.name) || item.name;

              const isSelected = item.name === selectedMainItem;
              const isActive = item.name === activeMainItem;
              const isCurrentlyFocused = isSelected || (isActive && selectedMainItem === null);

              let itemOpacity = "opacity-100";
              if (isActive && selectedMainItem !== null && !isSelected) {
                itemOpacity = "opacity-60";
              }

              return (
                <Button
                  key={item.name}
                  variant="ghost"
                  className={cn(
                    getMainItemClasses(isCurrentlyFocused, styleConfig, true),
                    getBorderRadiusClass(borderRadius),
                    getAnimationClass(animationLevel, "main"),
                    item.disabled && "opacity-50 cursor-not-allowed",
                    itemOpacity,
                  )}
                  onClick={() => handleItemClick(item)}
                  disabled={item.disabled}
                >
                  {item.icon ? (
                    <item.icon className={getIconClasses(iconStyle)} />
                  ) : (
                    <div className="w-3 h-3 rounded-full bg-white" />
                  )}
                  <span className="flex-1">{displayName}</span>
                </Button>
              );
            })}
          </div>
        </ScrollArea>
      </aside>
    </>
  );
}
