"use client";

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
  getPanelParentClasses,
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

  const selectedNavItem = navigation.find(
    (item) => item.name === currentMainItem
  );

  if (!selectedNavItem || !hasChildren || !open) {
    return null;
  }

  // ── Helpers ──
  const isRTL = direction === "rtl";
  const CollapsedChevron = isRTL ? ChevronLeft : ChevronRight;

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
    if (item.children) {
      return item.children.some((child) => {
        if (isItemActive(child)) return true;
        return hasActiveDescendant(child);
      });
    }
    return false;
  };

  // ── Render item — single JSX order: [icon] [text] [badge] [chevron] ──
  // RTL mirroring is handled entirely by flex-row-reverse on the container.
  const renderNavigationItem = (item: NavigationItem, level: number = 0) => {
    const isActive = isItemActive(item);
    const hasSubChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.name);
    const displayName = t(item.name) || item.name;
    const indent = level * 12;

    const indentStyle = isRTL
      ? { paddingRight: `${12 + indent}px` }
      : { paddingLeft: `${12 + indent}px` };

    // ── Parent group (collapsible) ──
    if (hasSubChildren) {
      const isParentOfActive = hasActiveDescendant(item);
      const parentBaseClasses = "w-full gap-2 h-10 px-3";
      const parentColorClasses = isParentOfActive
        ? getPanelParentClasses(styleConfig)
        : cn(parentBaseClasses, "hover:bg-accent hover:text-accent-foreground");

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
                parentColorClasses,
                "!justify-start !gap-0",
                isRTL && "flex-row-reverse",
                getBorderRadiusClass(borderRadius),
                getAnimationClass(animationLevel, "panel"),
              )}
              style={indentStyle}
            >
              {/* Icon + Text grouped tightly */}
              <span className={cn(
                "flex items-center gap-3 flex-1 min-w-0",
                isRTL && "flex-row-reverse",
              )}>
                {item.icon ? (
                  <item.icon className={cn(getIconClasses(iconStyle, "sm"), "flex-shrink-0")} />
                ) : level > 0 ? (
                  <div className="w-1.5 h-1.5 rounded-full bg-current opacity-40 flex-shrink-0" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                )}
                <span className="text-sm truncate">{displayName}</span>
              </span>

              {/* Badge */}
              {item.badge && (
                <Badge variant="secondary" className="text-[10px] h-5 ml-1">
                  {item.badge}
                </Badge>
              )}

              {/* Chevron */}
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 opacity-60 flex-shrink-0 ml-1" />
              ) : (
                <CollapsedChevron className="w-3.5 h-3.5 opacity-60 flex-shrink-0 ml-1" />
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
                  renderNavigationItem(child, level + 1)
                )}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      );
    }

    // ── Leaf item (link) ──
    return (
      <Button
        key={item.name}
        variant="ghost"
        asChild
        className={cn(
          getPanelItemClasses(isActive, styleConfig),
          "!justify-start",
          isRTL && "flex-row-reverse",
          getBorderRadiusClass(borderRadius),
          getAnimationClass(animationLevel, "panel"),
          item.disabled && "opacity-50 cursor-not-allowed",
          level > 0 && "text-sm",
        )}
        style={indentStyle}
        disabled={item.disabled}
      >
        <Link
          href={item.href || "#"}
          className={cn(
            "flex items-center w-full !gap-0",
            isRTL && "flex-row-reverse",
          )}
        >
          {/* Icon + Text grouped tightly */}
          <span className={cn(
            "flex items-center gap-1.5 flex-1 min-w-0",
            isRTL && "flex-row-reverse",
          )}>
            {item.icon ? (
              <item.icon className="w-4 h-4 flex-shrink-0" />
            ) : (
              <div
                className={cn(
                  "rounded-full flex-shrink-0",
                  isActive
                    ? "w-2 h-2 bg-current"
                    : "w-1.5 h-1.5 bg-muted-foreground/50",
                )}
              />
            )}
            <span className="truncate">{displayName}</span>
          </span>

          {/* Badge */}
          {item.badge && (
            <Badge
              variant={isActive ? "secondary" : "outline"}
              className="text-[10px] h-5 ml-1"
            >
              {item.badge}
            </Badge>
          )}
        </Link>
      </Button>
    );
  };

  // ── Panel sidebar shell ──
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
            )}
          >
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
            <div className={cn(isRTL && "text-right")}>
              <h3 className="font-semibold text-sm">
                {t(selectedNavItem.name) || selectedNavItem.name}
              </h3>
              {selectedNavItem.children && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selectedNavItem.children.length} {t("layout.items") || "items"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <ScrollArea className="flex-1 px-2 py-3">
          <div className="space-y-0.5">
            {selectedNavItem.children?.map((item) =>
              renderNavigationItem(item)
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
