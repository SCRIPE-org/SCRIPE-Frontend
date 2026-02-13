"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, ChevronDown, ChevronLeft } from "lucide-react";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@core/ui/collapsible";
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
  const pathname = usePathname();
  const navigation = useDynamicNavigation();
  const {
    colorTheme,
    cardStyle,
    animationLevel,
    borderRadius,
    navigationStyle,
    iconStyle,
  } = useSettings();

  // ── Mobile collapsible tree state ──
  const [mobileExpandedItems, setMobileExpandedItems] = useState<string[]>([]);

  const toggleMobileExpanded = (name: string) => {
    setMobileExpandedItems((prev) =>
      prev.includes(name)
        ? prev.filter((n) => n !== name)
        : [...prev, name]
    );
  };

  const styleConfig: NavigationStyleConfig = {
    colorTheme,
    animationLevel,
    borderRadius,
    navigationStyle,
    iconStyle,
    cardStyle,
    direction,
  };

  const isRTL = direction === "rtl";
  const CollapsedChevron = isRTL ? ChevronLeft : ChevronRight;

  // ── Click handler ──
  const handleItemClick = (item: NavigationItem) => {
    onItemClick(item);
    // Close mobile sidebar when navigating to a leaf page
    const hasChildren = !!(item.children && item.children.length > 0);
    if (!hasChildren && item.href && isMobile) {
      onOpenChange(false);
    }
  };

  // ── Helper: check if item or descendant is active ──
  const isItemActive = (item: NavigationItem): boolean => {
    if (!item.href) return false;
    if (pathname === item.href) return true;
    if (item.href !== "/" && pathname.startsWith(item.href)) {
      const nextChar = pathname[item.href.length];
      return nextChar === undefined || nextChar === "/";
    }
    return false;
  };

  const hasActiveDescendant = (item: NavigationItem): boolean => {
    if (isItemActive(item)) return true;
    if (item.children) {
      return item.children.some((child) => hasActiveDescendant(child));
    }
    return false;
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

  // ── Mobile: recursive nav item renderer ──
  const renderMobileNavItem = (item: NavigationItem, level: number = 0) => {
    const hasChildren = !!(item.children && item.children.length > 0);
    const displayName = t(item.name) || item.name;
    const isExpanded = mobileExpandedItems.includes(item.name);
    const active = isItemActive(item);
    const hasActivChild = hasActiveDescendant(item);
    const indent = level * 12;

    const indentStyle = isRTL
      ? { paddingRight: `${12 + indent}px` }
      : { paddingLeft: `${12 + indent}px` };

    // ── Parent item with children: collapsible ──
    if (hasChildren) {
      return (
        <Collapsible
          key={item.name}
          open={isExpanded}
          onOpenChange={() => toggleMobileExpanded(item.name)}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 h-10",
                isRTL && "flex-row-reverse",
                hasActivChild
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-sidebar-foreground/80 hover:bg-accent hover:text-accent-foreground",
                getBorderRadiusClass(borderRadius),
              )}
              style={indentStyle}
            >
              {item.icon ? (
                <item.icon className="w-4 h-4 flex-shrink-0" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
              )}
              <span className="flex-1 text-sm truncate text-start">{displayName}</span>
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 opacity-60 flex-shrink-0" />
              ) : (
                <CollapsedChevron className="w-3.5 h-3.5 opacity-60 flex-shrink-0" />
              )}
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div
              className="relative"
              style={
                isRTL
                  ? { marginRight: `${20 + indent}px` }
                  : { marginLeft: `${20 + indent}px` }
              }
            >
              <div
                className={cn(
                  "absolute top-0 bottom-0 w-px bg-border/60",
                  isRTL ? "right-0" : "left-0",
                )}
              />
              <div className="space-y-0.5 py-1">
                {item.children!.map((child) =>
                  renderMobileNavItem(child, level + 1)
                )}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      );
    }

    // ── Leaf item: link ──
    return (
      <Button
        key={item.name}
        variant="ghost"
        asChild
        className={cn(
          "w-full justify-start gap-3 h-9",
          isRTL && "flex-row-reverse",
          active
            ? "bg-primary text-primary-foreground font-medium shadow-sm"
            : "text-sidebar-foreground/70 hover:bg-accent hover:text-accent-foreground",
          getBorderRadiusClass(borderRadius),
          item.disabled && "opacity-50 cursor-not-allowed",
        )}
        style={indentStyle}
        disabled={item.disabled}
      >
        <Link
          href={item.href || "#"}
          onClick={() => onOpenChange(false)}
          className={cn(
            "flex items-center w-full gap-3",
            isRTL && "flex-row-reverse",
          )}
        >
          {item.icon ? (
            <item.icon className="w-4 h-4 flex-shrink-0" />
          ) : (
            <div
              className={cn(
                "rounded-full flex-shrink-0",
                active ? "w-2 h-2 bg-current" : "w-1.5 h-1.5 bg-muted-foreground/50",
              )}
            />
          )}
          <span className="text-sm truncate">{displayName}</span>
        </Link>
      </Button>
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

      {/* Mobile Sidebar — Full tree with collapsible children */}
      <aside
        className={cn(
          "navigation-main-sidebar fixed inset-y-0 z-50 w-72 transform transition-all duration-300 ease-in-out lg:hidden",
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

        {/* Mobile Navigation — Recursive collapsible tree */}
        <ScrollArea className="flex-1 py-3">
          <div className="space-y-0.5 px-2">
            {navigation.map((item) => renderMobileNavItem(item))}
          </div>
        </ScrollArea>
      </aside>
    </>
  );
}
