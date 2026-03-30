"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, ChevronDown, ChevronLeft, X } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useDynamicNavigation } from "@core/ui/navigation/dynamic-navigation";
import { cn } from "@core/common/utils";
import { Button } from "@core/ui/button";
import { ScrollArea } from "@core/ui/scroll-area";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@core/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@core/ui/collapsible";
import { Logo } from "@core/ui/logo";
import { useSettings } from "@core/providers/settings-provider";
import type { NavigationItem } from "@core/config/navigation";
import { isExactMatch, hasActiveChild } from "./nav-utils";
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
  const { colorTheme, cardStyle, animationLevel, borderRadius, navigationStyle, iconStyle } =
    useSettings();

  // ── Mobile collapsible tree state ──
  const [mobileExpandedItems, setMobileExpandedItems] = useState<string[]>([]);
  const mobileScrollRef = useRef<HTMLDivElement>(null);

  const toggleMobileExpanded = (name: string) => {
    setMobileExpandedItems((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  // ── Auto-scroll to active item when mobile sidebar opens ──
  useEffect(() => {
    if (!open || !isMobile || !mobileScrollRef.current) return;

    const timer = setTimeout(() => {
      const activeEl = mobileScrollRef.current?.querySelector("[data-active='true']");
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [open, isMobile]);

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
    const itemHasChildren = !!(item.children && item.children.length > 0);
    if (!itemHasChildren && item.href && isMobile) {
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
      <Tooltip key={item.name}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              getMainItemClasses(isCurrentlyFocused, styleConfig),
              getBorderRadiusClass(borderRadius),
              getAnimationClass(animationLevel, "main"),
              item.disabled && "cursor-not-allowed opacity-50",
              itemOpacity
            )}
            onClick={() => handleItemClick(item)}
            disabled={item.disabled}
          >
            {item.icon ? (
              <item.icon className={getIconClasses(iconStyle)} />
            ) : (
              <div className="h-3 w-3 rounded-full bg-white" />
            )}

            {/* Active indicator bar — only for non-sidebar navigation styles */}
            {itemIsHighlighted && navigationStyle !== "sidebar" && (
              <div
                className={cn(
                  "absolute h-8 w-1 rounded-full",
                  direction === "rtl" ? "left-0" : "right-0",
                  getIndicatorColor(colorTheme)
                )}
              />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent
          side={direction === "rtl" ? "left" : "right"}
          className="border-border bg-popover"
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
    );
  };

  // ── Mobile: recursive nav item renderer ──
  const renderMobileNavItem = (item: NavigationItem, level: number = 0) => {
    const itemHasChildren = !!(item.children && item.children.length > 0);
    const displayName = t(item.name) || item.name;
    const isExpanded = mobileExpandedItems.includes(item.name);
    const active = isExactMatch(item.href, pathname);
    const hasActivChild = itemHasChildren ? hasActiveChild(item, pathname) : false;
    const indent = level * 12;

    const indentStyle = isRTL
      ? { paddingRight: `${12 + indent}px` }
      : { paddingLeft: `${12 + indent}px` };

    // ── Parent item with children: collapsible ──
    if (itemHasChildren) {
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
                "h-10 w-full justify-start gap-3",
                isRTL && "flex-row-reverse",
                hasActivChild
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-sidebar-foreground/80 hover:bg-accent hover:text-accent-foreground",
                getBorderRadiusClass(borderRadius)
              )}
              style={indentStyle}
            >
              {item.icon ? (
                <item.icon className="h-4 w-4 flex-shrink-0" />
              ) : (
                <div className="h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
              )}
              <span className="flex-1 truncate text-start text-sm">{displayName}</span>
              {isExpanded ? (
                <ChevronDown className="h-3.5 w-3.5 flex-shrink-0 opacity-60" />
              ) : (
                <CollapsedChevron className="h-3.5 w-3.5 flex-shrink-0 opacity-60" />
              )}
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div
              className="relative"
              style={
                isRTL ? { marginRight: `${20 + indent}px` } : { marginLeft: `${20 + indent}px` }
              }
            >
              <div
                className={cn(
                  "absolute bottom-0 top-0 w-px bg-border/60",
                  isRTL ? "right-0" : "left-0"
                )}
              />
              <div className="space-y-0.5 py-1">
                {item.children!.map((child) => renderMobileNavItem(child, level + 1))}
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
          "h-9 w-full justify-start gap-3",
          isRTL && "flex-row-reverse",
          active
            ? "bg-primary font-medium text-primary-foreground shadow-sm"
            : "text-sidebar-foreground/70 hover:bg-accent hover:text-accent-foreground",
          getBorderRadiusClass(borderRadius),
          item.disabled && "cursor-not-allowed opacity-50"
        )}
        style={indentStyle}
        disabled={item.disabled}
      >
        <Link
          href={item.href || "#"}
          onClick={() => onOpenChange(false)}
          className={cn("flex w-full items-center gap-3", isRTL && "flex-row-reverse")}
          data-active={active ? "true" : undefined}
        >
          {item.icon ? (
            <item.icon className="h-4 w-4 flex-shrink-0" />
          ) : (
            <div
              className={cn(
                "flex-shrink-0 rounded-full",
                active ? "h-2 w-2 bg-current" : "h-1.5 w-1.5 bg-muted-foreground/50"
              )}
            />
          )}
          <span className="truncate text-sm">{displayName}</span>
        </Link>
      </Button>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "navigation-main-sidebar fixed inset-y-0 z-50 hidden w-24 transform flex-col transition-all duration-300 ease-in-out lg:flex",
          getSidebarBgClass(cardStyle, direction)
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-center border-b border-border/50">
          <Logo size="sm" />
        </div>

        {/* Navigation Items — single TooltipProvider for all */}
        <TooltipProvider delayDuration={300}>
          <ScrollArea className="flex-1 py-4">
            <div className="flex flex-col items-center space-y-2 px-2">
              {navigation.map(renderNavigationItem)}
            </div>
          </ScrollArea>
        </TooltipProvider>
      </aside>

      {/* Mobile Sidebar — Full tree with collapsible children */}
      <aside
        className={cn(
          "navigation-main-sidebar fixed inset-y-0 z-50 w-72 transform transition-all duration-300 ease-in-out lg:hidden",
          getSidebarBgClass(cardStyle, direction),
          open ? "translate-x-0" : direction === "rtl" ? "translate-x-full" : "-translate-x-full"
        )}
      >
        {/* Mobile Header */}
        <div className="flex h-16 items-center justify-between border-b border-border/50 px-4">
          <Logo size="sm" />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="hover:bg-accent hover:text-accent-foreground"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile Navigation — Recursive collapsible tree */}
        <ScrollArea className="flex-1 py-3" ref={mobileScrollRef}>
          <div className="space-y-0.5 px-2">
            {navigation.map((item) => renderMobileNavItem(item))}
          </div>
        </ScrollArea>
      </aside>
    </>
  );
}
