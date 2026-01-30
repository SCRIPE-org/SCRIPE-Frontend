"use client";

import type React from "react";
import { useState, useEffect } from "react";
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

interface NavigationPanelSidebarProps {
  selectedMainItem: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hasChildren: boolean;
}

export function NavigationPanelSidebar({
  selectedMainItem,
  open,
  onOpenChange,
  hasChildren,
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

  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Get the selected main navigation item
  const selectedNavItem = navigation.find(
    (item) => item.name === selectedMainItem
  );

  // Initialize expanded items based on current pathname
  useEffect(() => {
    if (!selectedNavItem?.children) return;

    const autoExpanded: string[] = [];
    const shouldExpandParent = (item: NavigationItem): boolean => {
      if (!item.children) return false;
      return item.children.some((child) => {
        if (child.href) {
          // Check exact match first
          if (pathname === child.href) return true;
          // Check if pathname starts with child href with proper path segment match
          if (child.href !== "/" && pathname.startsWith(child.href)) {
            const nextChar = pathname[child.href.length];
            if (nextChar === undefined || nextChar === "/") {
              return true;
            }
          }
        }
        if (child.children) return shouldExpandParent(child);
        return false;
      });
    };

    const checkItem = (item: NavigationItem) => {
      if (shouldExpandParent(item)) {
        autoExpanded.push(item.name);
      }
      if (item.children) {
        item.children.forEach(checkItem);
      }
    };

    selectedNavItem.children.forEach(checkItem);
    if (autoExpanded.length > 0) {
      setExpandedItems(autoExpanded);
    }
  }, [pathname, selectedNavItem]);

  // Don't render if no children or not open - CHECK AFTER ALL HOOKS
  if (!selectedNavItem || !hasChildren || !open) {
    return null;
  }

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((name) => name !== itemName)
        : [...prev, itemName]
    );
  };

  const getBorderRadiusClass = () => {
    switch (borderRadius) {
      case "none":
        return "rounded-none";
      case "small":
        return "rounded-sm";
      case "large":
        return "rounded-lg";
      case "full":
        return "rounded-full";
      default:
        return "rounded-md";
    }
  };

  const getAnimationClass = () => {
    if (animationLevel === "none") return "";
    if (animationLevel === "minimal") return "transition-colors duration-200";
    if (animationLevel === "moderate") return "transition-all duration-200";
    return "transition-all duration-300 hover:scale-[1.02]";
  };

  const getIconClasses = () => {
    const baseClasses = "w-4 h-4";

    switch (iconStyle) {
      case "filled":
        return cn(baseClasses, "fill-current");
      case "duotone":
        return cn(baseClasses, "fill-current opacity-75");
      case "minimal":
        return cn(baseClasses, "stroke-2");
      default: // "outline"
        return cn(baseClasses, "stroke-current fill-none");
    }
  };

  const getNavigationStyleClasses = (isActive: boolean, level: number = 0) => {
    const baseClasses = "w-full gap-2 h-10 px-3";
    const indent = level * 16;

    if (!isActive) {
      return cn(baseClasses, "hover:bg-accent hover:text-accent-foreground");
    }

    // Active item styling based on navigation style
    switch (navigationStyle) {
      case "pills":
        return cn(
          baseClasses,
          "text-white shadow-sm rounded-full",
          colorTheme === "blue" && "bg-blue-600 hover:bg-blue-700",
          colorTheme === "purple" && "bg-purple-600 hover:bg-purple-700",
          colorTheme === "green" && "bg-green-600 hover:bg-green-700",
          colorTheme === "orange" && "bg-orange-600 hover:bg-orange-700",
          colorTheme === "red" && "bg-red-600 hover:bg-red-700",
          colorTheme === "teal" && "bg-teal-600 hover:bg-teal-700"
        );
      case "underline":
        return cn(
          baseClasses,
          "rounded-none border-b-2",
          colorTheme === "blue" && "border-blue-600 text-blue-600",
          colorTheme === "purple" && "border-purple-600 text-purple-600",
          colorTheme === "green" && "border-green-600 text-green-600",
          colorTheme === "orange" && "border-orange-600 text-orange-600",
          colorTheme === "red" && "border-red-600 text-red-600",
          colorTheme === "teal" && "border-teal-600 text-teal-600"
        );
      case "sidebar":
        return cn(
          baseClasses,
          "rounded-none", // Remove border radius for clean sidebar style
          // Panel sidebar: left border for RTL, right border for LTR (opposite of main sidebar)
          direction === "rtl" ? "border-l-4" : "border-r-4",
          colorTheme === "blue" &&
            "bg-blue-600/20 border-blue-600 text-blue-600",
          colorTheme === "purple" &&
            "bg-purple-600/20 border-purple-600 text-purple-600",
          colorTheme === "green" &&
            "bg-green-600/20 border-green-600 text-green-600",
          colorTheme === "orange" &&
            "bg-orange-600/20 border-orange-600 text-orange-600",
          colorTheme === "red" && "bg-red-600/20 border-red-600 text-red-600",
          colorTheme === "teal" &&
            "bg-teal-600/20 border-teal-600 text-teal-600"
        );
      default: // "default"
        return cn(
          baseClasses,
          "text-white shadow-sm",
          colorTheme === "blue" && "bg-blue-600 hover:bg-blue-700",
          colorTheme === "purple" && "bg-purple-600 hover:bg-purple-700",
          colorTheme === "green" && "bg-green-600 hover:bg-green-700",
          colorTheme === "orange" && "bg-orange-600 hover:bg-orange-700",
          colorTheme === "red" && "bg-red-600 hover:bg-red-700",
          colorTheme === "teal" && "bg-teal-600 hover:bg-teal-700"
        );
    }
  };

  const renderNavigationItem = (item: any, level: number = 0) => {
    // Check if this item is active - exact match or if pathname starts with item href
    // Ensure proper path segment match (next char must be '/' or end of string)
    let isActive = pathname === item.href;
    if (!isActive && item.href && item.href !== "/" && pathname.startsWith(item.href)) {
      // Ensure the next character after the href is either '/' or end of string
      // This prevents partial matches like /system/entryGate matching /system/entryGateVisitor
      const nextChar = pathname[item.href.length];
      isActive = nextChar === undefined || nextChar === "/";
    }
    const hasSubChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.name);
    const displayName = t(item.name) || item.name;
    const indent = level * 16; // 16px per level

    if (hasSubChildren) {
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
                // RTL/LTR alignment
                direction === "rtl" ? "justify-end" : "justify-start",
                getBorderRadiusClass(),
                getAnimationClass(),
                "hover:bg-accent hover:text-accent-foreground",
                // Apply active state styling
                isActive && getNavigationStyleClasses(isActive, level)
              )}
              style={
                direction === "rtl"
                  ? { paddingRight: `${12 + indent}px` }
                  : { paddingLeft: `${12 + indent}px` }
              }
            >
              {/* RTL: Icon on the right, LTR: Icon on the left */}
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
                    <item.icon className={getIconClasses()} />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </>
              ) : (
                <>
                  {item.icon ? (
                    <item.icon className={getIconClasses()} />
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
            {item.children.map((child: any) =>
              renderNavigationItem(child, level + 1)
            )}
          </CollapsibleContent>
        </Collapsible>
      );
    }

    return (
      <Button
        key={item.name}
        variant="ghost"
        asChild
        className={cn(
          getNavigationStyleClasses(isActive, level),
          // RTL/LTR alignment
          direction === "rtl" ? "justify-end" : "justify-start",
          getBorderRadiusClass(),
          getAnimationClass(),
          item.disabled && "opacity-50 cursor-not-allowed"
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
            direction === "rtl" ? "justify-end" : "justify-start"
          )}
        >
          {/* RTL: Icon on the right, LTR: Icon on the left */}
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
        cardStyle === "glass"
          ? "bg-white/5 dark:bg-white/5 backdrop-blur-xl border-white/10 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] dark:shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]"
          : cardStyle === "solid"
          ? "bg-card border-border backdrop-blur-sm"
          : cardStyle === "bordered"
          ? "bg-card border border-border"
          : "bg-card",
        // RTL/LTR positioning and borders
        direction === "rtl" ? "right-24 border-l" : "left-24 border-r",
        "lg:translate-x-0"
      )}
    >
      <div className="flex flex-col h-full ">
        {/* Header - RTL/LTR Layout */}
        <div className="p-4 border-b border-border/50">
          <div
            className={cn(
              "flex items-center gap-3",
              // RTL: Start from right with icon first, LTR: Start from left with icon first
              direction === "rtl" ? "items-center text-right " : "flex-row"
            )}
          >
            {/* Icon - Always appears first in reading direction */}
            {selectedNavItem.icon && (
              <div
                className={cn(
                  "w-8 h-8 flex items-center justify-center text-white flex-shrink-0",
                  getBorderRadiusClass(),
                  colorTheme === "blue" &&
                    "bg-gradient-to-br from-blue-500 to-blue-600",
                  colorTheme === "purple" &&
                    "bg-gradient-to-br from-purple-500 to-purple-600",
                  colorTheme === "green" &&
                    "bg-gradient-to-br from-green-500 to-green-600",
                  colorTheme === "orange" &&
                    "bg-gradient-to-br from-orange-500 to-orange-600",
                  colorTheme === "red" &&
                    "bg-gradient-to-br from-red-500 to-red-600",
                  colorTheme === "teal" &&
                    "bg-gradient-to-br from-teal-500 to-teal-600",
                  colorTheme === "pink" &&
                    "bg-gradient-to-br from-pink-500 to-pink-600",
                  colorTheme === "indigo" &&
                    "bg-gradient-to-br from-indigo-500 to-indigo-600",
                  colorTheme === "cyan" &&
                    "bg-gradient-to-br from-cyan-500 to-cyan-600"
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
            {selectedNavItem.children?.map((item: any) =>
              renderNavigationItem(item)
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
