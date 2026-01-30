"use client";

import type React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { useDynamicNavigation } from "@/components/navigation/dynamic-navigation";
import { isNavigationItemActive } from "@/config/navigation";
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

interface NavigationMainSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeItem: string;
  selectedItem: string | null;
  onItemSelect: (itemName: string) => void;
}

export function NavigationMainSidebar({
  open,
  onOpenChange,
  activeItem,
  selectedItem,
  onItemSelect,
}: NavigationMainSidebarProps) {
  const router = useRouter();
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
    return "transition-all duration-300 hover:scale-105";
  };

  const getIconClasses = () => {
    const baseClasses = "w-6 h-6";
    
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

  const getNavigationStyleClasses = (isActive: boolean, isMobile = false) => {
    const baseClasses = isMobile ? "w-full justify-start gap-3 h-12" : "w-14 h-14 relative group";
    
    if (!isActive) {
      return cn(baseClasses, "hover:bg-accent hover:text-accent-foreground");
    }

    // Active item styling based on navigation style
    switch (navigationStyle) {
      case "pills":
        return cn(
          baseClasses,
          "text-white shadow-lg",
          isMobile ? "rounded-full" : "rounded-full",
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
          // For desktop main sidebar: right border for LTR, left border for RTL
          // For mobile: left border for LTR, right border for RTL
          isMobile 
            ? (direction === "rtl" ? "border-r-4" : "border-l-4")
            : (direction === "rtl" ? "border-l-4" : "border-r-4"),
          colorTheme === "blue" && "bg-blue-600/20 border-blue-600 text-blue-600",
          colorTheme === "purple" && "bg-purple-600/20 border-purple-600 text-purple-600",
          colorTheme === "green" && "bg-green-600/20 border-green-600 text-green-600",
          colorTheme === "orange" && "bg-orange-600/20 border-orange-600 text-orange-600",
          colorTheme === "red" && "bg-red-600/20 border-red-600 text-red-600",
          colorTheme === "teal" && "bg-teal-600/20 border-teal-600 text-teal-600"
        );
      default: // "default"
        return cn(
          baseClasses,
          "text-white shadow-lg",
          colorTheme === "blue" && "bg-blue-600 hover:bg-blue-700",
          colorTheme === "purple" && "bg-purple-600 hover:bg-purple-700",
          colorTheme === "green" && "bg-green-600 hover:bg-green-700",
          colorTheme === "orange" && "bg-orange-600 hover:bg-orange-700",
          colorTheme === "red" && "bg-red-600 hover:bg-red-700",
          colorTheme === "teal" && "bg-teal-600 hover:bg-teal-700"
        );
    }
  };

  const handleItemClick = (item: any) => {
    const hasChildren = item.children && item.children.length > 0;
    const isCurrentlyActive = item.name === activeItem;

    if (hasChildren) {
      // If clicking on the active item, clear selection and return to default state
      if (isCurrentlyActive) {
        onItemSelect(""); // Clear selection by passing empty string
      } else {
        // Item has children - show panel sidebar
        onItemSelect(item.name);
      }
    } else if (item.href) {
      // Item has no children but has href - navigate directly
      // Clear selection when navigating
      onItemSelect("");
      router.push(item.href);
      // Close mobile sidebar after navigation
      if (window.innerWidth < 1024) {
        onOpenChange(false);
      }
    } else {
      // Item has no children and no href - clear selection
      onItemSelect("");
    }
  };

  const renderNavigationItem = (item: any) => {
    const hasChildren = item.children && item.children.length > 0;
    const hasHref = !!item.href;
    const displayName = t(item.name) || item.name;

    // Check if item is selected (user clicked) or active (URL-based)
    const isSelected = item.name === selectedItem;
    const isActive = item.name === activeItem;
    const isCurrentlyFocused = isSelected || (isActive && selectedItem === null);
    
    // Apply primary highlight if selected, secondary if active (but not selected)
    let itemIsHighlighted = false;
    let itemOpacity = "opacity-100";
    
    if (isSelected) {
      // User clicked this item - primary highlight
      itemIsHighlighted = true;
    } else if (isActive && selectedItem !== null) {
      // This is the active item but user clicked another - secondary highlight (with opacity)
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
                getNavigationStyleClasses(isCurrentlyFocused),
                getBorderRadiusClass(),
                getAnimationClass(),
                item.disabled && "opacity-50 cursor-not-allowed",
                itemOpacity
              )}
              onClick={() => handleItemClick(item)}
              disabled={item.disabled}
            >
              {item.icon ? (
                <item.icon className={getIconClasses()} />
              ) : (
                <div className="w-3 h-3 rounded-full bg-white" />
              )}

              {/* Active indicator - only show for non-sidebar navigation styles */}
              {itemIsHighlighted && navigationStyle !== "sidebar" && (
                <div
                  className={cn(
                    "absolute w-1 h-8 rounded-full",
                    direction === "rtl" ? "left-0" : "right-0",
                    colorTheme === "blue" && "bg-blue-300",
                    colorTheme === "purple" && "bg-purple-300",
                    colorTheme === "green" && "bg-green-300",
                    colorTheme === "orange" && "bg-orange-300",
                    colorTheme === "red" && "bg-red-300",
                    colorTheme === "teal" && "bg-teal-300"
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
          cardStyle === "glass"
            ? "bg-white/5 dark:bg-white/5 backdrop-blur-xl border-white/10 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] dark:shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]"
            : cardStyle === "solid"
            ? "bg-card border-border backdrop-blur-sm"
            : cardStyle === "bordered"
            ? "bg-card border border-border"
            : "bg-card",
          direction === "rtl" ? "right-0 border-l" : "left-0 border-r"
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
          cardStyle === "glass"
            ? "bg-white/5 dark:bg-white/5 backdrop-blur-xl border-white/10 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] dark:shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]"
            : cardStyle === "solid"
            ? "bg-card border-border backdrop-blur-sm"
            : cardStyle === "bordered"
            ? "bg-card border border-border"
            : "bg-card",
          direction === "rtl" ? "right-0 border-l" : "left-0 border-r",
          open
            ? "translate-x-0"
            : direction === "rtl"
            ? "translate-x-full"
            : "-translate-x-full"
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
              const hasChildren = item.children && item.children.length > 0;
              const hasHref = !!item.href;
              const displayName = t(item.name) || item.name;

              // Check if item is selected (user clicked) or active (URL-based)
              const isSelected = item.name === selectedItem;
              const isActive = item.name === activeItem;
              const isCurrentlyFocused = isSelected || (isActive && selectedItem === null);
              
              // Apply primary highlight if selected, secondary if active (but not selected)
              let itemOpacity = "opacity-100";
              
              if (isSelected) {
                // User clicked this item - primary highlight
                itemOpacity = "opacity-100";
              } else if (isActive && selectedItem !== null) {
                // This is the active item but user clicked another - secondary highlight (with opacity)
                itemOpacity = "opacity-60";
              }

              return (
                <Button
                  key={item.name}
                  variant="ghost"
                  className={cn(
                    getNavigationStyleClasses(isCurrentlyFocused, true),
                    getBorderRadiusClass(),
                    getAnimationClass(),
                    item.disabled && "opacity-50 cursor-not-allowed",
                    itemOpacity
                  )}
                  onClick={() => handleItemClick(item)}
                  disabled={item.disabled}
                >
                  {item.icon ? (
                    <item.icon className={getIconClasses()} />
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
