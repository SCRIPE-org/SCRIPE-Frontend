"use client";

import { useState, useCallback, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@core/ui/collapsible";
import { isNavigationItemActive, type NavigationItem } from "@core/config/navigation";
import { isMatchWithFallback } from "./nav-utils";
import { useDynamicNavigation } from "@core/ui/navigation/dynamic-navigation";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type NavVariant =
  | "default" // Classic / default sidebar style
  | "compact" // Smaller padding, smaller icons
  | "elegant" // Glass-morphism shimmer
  | "modern" // Rail-expand optimized
  | "floating" // Inside floating card
  | "navigation" // VS Code panel sidebar
  | "hud"; // Dock flyout

interface NavRendererProps {
  /** Visual variant — controls padding, icon size, animation */
  variant?: NavVariant;
  /** Called when a leaf nav item is clicked (e.g. close sidebar) */
  onNavigate?: () => void;
  /** Extra class on the <nav> wrapper */
  className?: string;
  /** Disable auto-expand of parents of the active item */
  disableAutoExpand?: boolean;
  /** Custom items — if omitted, uses useDynamicNavigation */
  items?: NavigationItem[];
  /** Maximum visual indent level (deeper items stay capped at this) */
  maxIndentLevel?: number;
}

// ---------------------------------------------------------------------------
// Variant-specific styling
// ---------------------------------------------------------------------------

const variantStyles: Record<
  NavVariant,
  {
    itemPadding: string;
    itemText: string;
    iconSize: string;
    iconWrap: string;
    activeClass: string;
    hoverClass: string;
    chevronSize: string;
    indentPx: number;
    gap: string;
  }
> = {
  default: {
    itemPadding: "px-4 py-3",
    itemText: "text-sm font-medium",
    iconSize: "w-4 h-4",
    iconWrap: "w-8 h-8 rounded-lg",
    activeClass: "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-md",
    hoverClass:
      "text-sidebar-foreground/70 hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:text-primary hover:shadow-sm",
    chevronSize: "w-4 h-4",
    indentPx: 16,
    gap: "gap-3",
  },
  compact: {
    itemPadding: "px-3 py-1.5",
    itemText: "text-xs font-medium",
    iconSize: "w-3.5 h-3.5",
    iconWrap: "w-7 h-7 rounded-md",
    activeClass: "bg-primary/15 text-primary font-semibold",
    hoverClass: "text-sidebar-foreground/70 hover:bg-muted/60 hover:text-foreground",
    chevronSize: "w-3.5 h-3.5",
    indentPx: 12,
    gap: "gap-2",
  },
  elegant: {
    itemPadding: "px-4 py-3",
    itemText: "text-sm font-medium",
    iconSize: "w-4 h-4",
    iconWrap: "w-8 h-8 rounded-lg",
    activeClass:
      "bg-gradient-to-r from-primary/20 to-primary/10 text-primary shadow-inner border border-primary/20",
    hoverClass: "text-sidebar-foreground/70 hover:bg-white/5 hover:text-primary",
    chevronSize: "w-4 h-4",
    indentPx: 16,
    gap: "gap-3",
  },
  modern: {
    itemPadding: "px-3 py-2.5",
    itemText: "text-sm font-medium",
    iconSize: "w-4 h-4",
    iconWrap: "w-8 h-8 rounded-lg",
    activeClass: "bg-primary/15 text-primary font-semibold",
    hoverClass: "text-sidebar-foreground/70 hover:bg-muted/50 hover:text-foreground",
    chevronSize: "w-4 h-4",
    indentPx: 14,
    gap: "gap-3",
  },
  floating: {
    itemPadding: "px-3 py-2",
    itemText: "text-sm font-medium",
    iconSize: "w-4 h-4",
    iconWrap: "w-7 h-7 rounded-md",
    activeClass: "bg-primary/10 text-primary font-semibold",
    hoverClass: "text-foreground/70 hover:bg-muted/50 hover:text-foreground",
    chevronSize: "w-3.5 h-3.5",
    indentPx: 14,
    gap: "gap-2.5",
  },
  navigation: {
    itemPadding: "px-3 py-2",
    itemText: "text-sm font-medium",
    iconSize: "w-4 h-4",
    iconWrap: "w-7 h-7 rounded-md",
    activeClass: "bg-primary/15 text-primary font-semibold",
    hoverClass: "text-sidebar-foreground/70 hover:bg-muted/40 hover:text-foreground",
    chevronSize: "w-3.5 h-3.5",
    indentPx: 14,
    gap: "gap-2.5",
  },
  hud: {
    itemPadding: "px-3 py-2",
    itemText: "text-sm font-medium",
    iconSize: "w-4 h-4",
    iconWrap: "w-7 h-7 rounded-md",
    activeClass: "bg-primary/15 text-primary font-semibold",
    hoverClass: "text-foreground/70 hover:bg-muted/50 hover:text-foreground",
    chevronSize: "w-3.5 h-3.5",
    indentPx: 14,
    gap: "gap-2.5",
  },
};

// ---------------------------------------------------------------------------
// Auto-expand helpers
// ---------------------------------------------------------------------------

function shouldExpandParent(
  item: NavigationItem,
  pathname: string,
  allItems: NavigationItem[]
): boolean {
  if (!item.children) return false;
  return item.children.some((child) => {
    // Exact match first
    if (child.href && pathname === child.href) return true;
    // Prefix fallback for detail/child pages
    if (child.href && isMatchWithFallback(child.href, pathname, allItems)) return true;
    if (child.children) return shouldExpandParent(child, pathname, allItems);
    return false;
  });
}

function collectAutoExpanded(items: NavigationItem[], pathname: string): string[] {
  const result: string[] = [];
  const check = (item: NavigationItem) => {
    if (shouldExpandParent(item, pathname, items)) {
      result.push(item.name);
    }
    item.children?.forEach(check);
  };
  items.forEach(check);
  return result;
}

// ---------------------------------------------------------------------------
// NavRenderer
// ---------------------------------------------------------------------------

/**
 * Shared recursive navigation renderer supporting unlimited depth.
 *
 * Features:
 * - Unlimited nesting (visual indent capped via maxIndentLevel)
 * - RTL-aware indentation (paddingInlineStart)
 * - Text truncation on all items
 * - Auto-expand parents of the active item on mount
 * - ARIA tree roles + keyboard accessible
 * - Per-variant styling via `variant` prop
 */
export function NavRenderer({
  variant = "default",
  onNavigate,
  className,
  disableAutoExpand = false,
  items: externalItems,
  maxIndentLevel = 5,
}: NavRendererProps) {
  const pathname = usePathname();
  const { direction, t } = useI18n();
  const dynamicItems = useDynamicNavigation();
  const items = externalItems ?? dynamicItems;

  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Auto-expand on mount or pathname/items change
  const [prevPathname, setPrevPathname] = useState(pathname);
  const [prevItemsLen, setPrevItemsLen] = useState(items.length);
  if (!disableAutoExpand && (pathname !== prevPathname || items.length !== prevItemsLen)) {
    setPrevPathname(pathname);
    setPrevItemsLen(items.length);
    const autoExpanded = collectAutoExpanded(items, pathname);
    if (autoExpanded.length > 0) {
      setExpandedItems((prevExpandedItems) => {
        const merged = new Set([...prevExpandedItems, ...autoExpanded]);
        const mergedArr = Array.from(merged);
        if (
          mergedArr.length !== prevExpandedItems.length ||
          !mergedArr.every((v, i) => prevExpandedItems[i] === v)
        ) {
          return mergedArr;
        }
        return prevExpandedItems;
      });
    }
  }

  const toggleExpanded = useCallback((name: string) => {
    setExpandedItems((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  }, []);

  const style = variantStyles[variant];

  const renderItem = (item: NavigationItem, level: number): ReactNode => {
    const isActive = isNavigationItemActive(item, pathname, items);
    const isExpanded = expandedItems.includes(item.name);
    const hasChildren = item.children && item.children.length > 0;
    const Icon = item.icon;
    const visualLevel = Math.min(level, maxIndentLevel);
    const indent = visualLevel * style.indentPx;

    const indentStyle: React.CSSProperties = {
      paddingInlineStart: `${16 + indent}px`,
    };

    const iconElement = (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center transition-all duration-300",
          style.iconWrap,
          isActive ? "bg-white/20" : "bg-primary/10 group-hover:bg-primary/20"
        )}
      >
        {Icon ? (
          <Icon
            className={cn(
              style.iconSize,
              "transition-all duration-300 group-hover:scale-110",
              isActive ? "text-white" : "text-primary"
            )}
          />
        ) : (
          <div className={style.iconSize} />
        )}
      </div>
    );

    const badgeElement = item.badge ? (
      <Badge
        variant="secondary"
        className={cn(
          "shrink-0 text-xs",
          isActive ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
        )}
      >
        {item.badge}
      </Badge>
    ) : null;

    // ── Group (has children) ──
    if (hasChildren) {
      return (
        <Collapsible
          key={item.name}
          open={isExpanded}
          onOpenChange={() => toggleExpanded(item.name)}
        >
          <CollapsibleTrigger asChild>
            <div
              role="treeitem"
              aria-expanded={isExpanded}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleExpanded(item.name);
                }
              }}
              className={cn(
                "group flex w-full cursor-pointer items-center justify-between rounded-lg transition-all duration-300",
                style.itemPadding,
                style.itemText,
                item.disabled && "cursor-not-allowed opacity-50",
                isActive ? style.activeClass : style.hoverClass
              )}
              style={indentStyle}
            >
              <div className={cn("flex min-w-0 items-center", style.gap)}>
                {iconElement}
                <span className="break-words leading-snug">{t(item.name) || item.name}</span>
                {badgeElement}
              </div>
              <ChevronDown
                className={cn(
                  style.chevronSize,
                  "shrink-0 transition-transform duration-300",
                  isExpanded && "rotate-180",
                  isActive ? "text-white" : "text-muted-foreground"
                )}
              />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-0.5 space-y-0.5">
            {item.children!.map((child) => renderItem(child, level + 1))}
          </CollapsibleContent>
        </Collapsible>
      );
    }

    // ── Leaf (navigable item) ──
    return (
      <Link
        key={item.name}
        href={item.href || "#"}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "group flex items-center justify-between rounded-lg transition-all duration-300",
          style.itemPadding,
          style.itemText,
          item.disabled && "pointer-events-none cursor-not-allowed opacity-50",
          isActive ? style.activeClass : style.hoverClass
        )}
        style={indentStyle}
        onClick={() => {
          if (!item.disabled) onNavigate?.();
        }}
      >
        <div className={cn("flex min-w-0 items-center", style.gap)}>
          {iconElement}
          <span className="break-words leading-snug">{t(item.name) || item.name}</span>
        </div>
        {badgeElement}
      </Link>
    );
  };

  return (
    <nav
      role="tree"
      aria-label="Navigation"
      dir={direction}
      className={cn("space-y-0.5", className)}
    >
      {items.map((item) => renderItem(item, 0))}
    </nav>
  );
}

export type { NavRendererProps };
