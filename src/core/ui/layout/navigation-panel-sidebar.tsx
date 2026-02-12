"use client";

import type React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, ChevronDown, ChevronLeft } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { useDynamicNavigation } from "@core/ui/navigation/dynamic-navigation";
import { type NavigationItem } from "@core/config/navigation";
import { cn } from "@core/common/utils";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { ScrollArea } from "@core/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@core/ui/collapsible";
import {
  getPanelItemClasses,
  getBorderRadiusClass,
  getAnimationClass,
  getIconClasses,
  getPanelBgClass,
  getPanelHeaderGradient,
  type NavigationStyleConfig,
} from "./navigation-styles";

interface NavigationPanelSidebarProps {
  currentMainItem: string;
  open: boolean;
  onOpenChange: () => void;
  hasChildren: boolean;
  expandedItems: string[];
  toggleExpanded: (itemName: string) => void;
  activeAncestry: string[];
}

export function NavigationPanelSidebar({
  currentMainItem,
  open,
  onOpenChange,
  hasChildren,
  expandedItems,
  toggleExpanded,
  activeAncestry,
}: NavigationPanelSidebarProps) {
  const pathname = usePathname();
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

  // Get the current main navigation item
  const selectedNavItem = navigation.find(
    (item) => item.name === currentMainItem
  );

  // Don't render if no children or not open
  if (!selectedNavItem || !hasChildren || !open) {
    return null;
  }

  // ── Check if item matches current path (for active styling) ──
  const isItemActive = (item: NavigationItem): boolean => {
    if (!item.href) return false;
    if (pathname === item.href) return true;
    if (item.href !== "/" && pathname.startsWith(item.href)) {
      const nextChar = pathname[item.href.length];
      return nextChar === undefined || nextChar === "/";
    }
    return false;
  };

  // ── Check if any descendant is active (for parent active styling) ──
  const hasActiveDescendant = (item: NavigationItem): boolean => {
    if (isItemActive(item)) return true;
    if (item.children) {
      return item.children.some(hasActiveDescendant);
    }
    return false;
  };

  // ── Render navigation item — recursive, unlimited depth ──
  const renderNavigationItem = (item: NavigationItem, level: number = 0) => {
    const isActive = isItemActive(item);
    const hasSubChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.name);
    const displayName = t(item.name) || item.name;
    const indent = level * 16;

    // Parent group with children — collapsible
    if (hasSubChildren) {
      const isParentActive = hasActiveDescendant(item);

      return (
        <Collapsible
          key={item.name}
          open={isExpanded}
          onOpenChange={() => toggleExpanded(item.name)}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full gap-2 h-10 px-3",
                direction === "rtl" ? "justify-end" : "justify-start",
                getBorderRadiusClass(borderRadius),
                getAnimationClass(animationLevel, "panel"),
                isParentActive
                  ? getPanelItemClasses(true, styleConfig)
                  : "hover:bg-accent hover:text-accent-foreground",
              )}
              style={
                direction === "rtl"
                  ? { paddingRight: `${12 + indent}px` }
                  : { paddingLeft: `${12 + indent}px` }
              }
            >
              {/* RTL/LTR layout */}
              {direction === "rtl" ? (
                <>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronLeft className="w-4 h-4" />
                  )}
                  {item.badge && (
                    <Badge variant="secondary" className="mr-auto">
                      {item.badge}
                    </Badge>
                  )}
                  <span className="flex-1 text-right">{displayName}</span>
                  {item.icon ? (
                    <item.icon className={getIconClasses(iconStyle, "sm")} />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </>
              ) : (
                <>
                  {item.icon ? (
                    <item.icon className={getIconClasses(iconStyle, "sm")} />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  )}
                  <span className="flex-1 text-left">{displayName}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto">
                      {item.badge}
                    </Badge>
                  )}
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </>
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1">
            {item.children!.map((child) =>
              renderNavigationItem(child, level + 1)
            )}
          </CollapsibleContent>
        </Collapsible>
      );
    }

    // Leaf item — link
    return (
      <Button
        key={item.name}
        variant="ghost"
        asChild
        className={cn(
          getPanelItemClasses(isActive, styleConfig),
          direction === "rtl" ? "justify-end" : "justify-start",
          getBorderRadiusClass(borderRadius),
          getAnimationClass(animationLevel, "panel"),
          item.disabled && "opacity-50 cursor-not-allowed",
        )}
        style={
          direction === "rtl"
            ? { paddingRight: `${12 + indent}px` }
            : { paddingLeft: `${12 + indent}px` }
        }
        disabled={item.disabled}
      >
        <Link
          href={item.href || "#"}
          className={cn(
            "flex items-center gap-2 w-full",
            direction === "rtl" ? "justify-end" : "justify-start",
          )}
        >
          {direction === "rtl" ? (
            <>
              {item.badge && (
                <Badge
                  variant={isActive ? "secondary" : "outline"}
                  className="mr-auto"
                >
                  {item.badge}
                </Badge>
              )}
              <span className="flex-1 text-right">{displayName}</span>
              {item.icon ? (
                <item.icon className="w-4 h-4" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-primary" />
              )}
            </>
          ) : (
            <>
              {item.icon ? (
                <item.icon className="w-4 h-4" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-primary" />
              )}
              <span className="flex-1 text-left">{displayName}</span>
              {item.badge && (
                <Badge
                  variant={isActive ? "secondary" : "outline"}
                  className="ml-auto"
                >
                  {item.badge}
                </Badge>
              )}
            </>
          )}
        </Link>
      </Button>
    );
  };

  return (
    <div
      className={cn(
        "navigation-panel-sidebar fixed inset-y-0 z-40 w-64 transform transition-all duration-300 ease-in-out sidebar-shadow",
        getPanelBgClass(cardStyle, direction),
        "lg:translate-x-0",
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-border/50">
          <div
            className={cn(
              "flex items-center gap-3",
              direction === "rtl" ? "items-center text-right" : "flex-row",
            )}
          >
            {/* Icon badge */}
            {selectedNavItem.icon && (
              <div
                className={cn(
                  "w-8 h-8 flex items-center justify-center text-white flex-shrink-0",
                  getBorderRadiusClass(borderRadius),
                  getPanelHeaderGradient(colorTheme),
                )}
              >
                <selectedNavItem.icon className="w-4 h-4" />
              </div>
            )}
            <div className={cn(direction === "rtl" && "text-right")}>
              <h3 className="font-semibold text-sm">
                {t(selectedNavItem.name) || selectedNavItem.name}
              </h3>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <ScrollArea className="flex-1 p-2">
          <div className="space-y-1">
            {selectedNavItem.children?.map((item) =>
              renderNavigationItem(item)
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
