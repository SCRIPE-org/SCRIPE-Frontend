"use client";

import type React from "react";
import { useState, useMemo, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Folder,
  FileText,
  Search,
  Menu,
  X,
} from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { useLayoutStyles } from "@core/ui/layout/shared/use-layout-styles";
import { useDynamicNavigation } from "@core/ui/navigation/dynamic-navigation";
import { isNavigationItemActive, type NavigationItem } from "@core/config/navigation";
import { Logo } from "@core/ui/logo";
import { Button } from "@core/ui/button";
import { ScrollArea } from "@core/ui/scroll-area";
import { LanguageSwitcher, ThemeSwitcher } from "@core/ui/layout/common";
import { UserProfileDropdown } from "@core/ui/user-profile-dropdown";
import { Footer } from "@core/ui/layout/shared/footer";
import { UserCard } from "@core/ui/layout/shared/user-card";
import { LogoutButton } from "@core/ui/layout/shared/logout-button";
import { cn } from "@core/common/utils";
import { NotificationBell } from "@core/ui/notification";
import { useBrandedAppName } from "@core/hooks/use-branded-app-name";

interface TreeViewLayoutProps {
  children: React.ReactNode;
}

/** Recursive tree node component */
function TreeNode({
  item,
  level,
  pathname,
  router,
  t,
  direction,
  expandedNodes,
  toggleNode,
  allItems,
}: {
  item: NavigationItem;
  level: number;
  pathname: string;
  router: ReturnType<typeof useRouter>;
  t: (key: string) => string;
  direction: string;
  expandedNodes: Set<string>;
  toggleNode: (name: string) => void;
  allItems: NavigationItem[];
}) {
  const hasChildren = item.children && item.children.length > 0;
  const isActive = isNavigationItemActive(item, pathname, allItems);
  const isExpanded = expandedNodes.has(item.name);
  const Icon = item.icon;
  const isRTL = direction === "rtl";
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <div>
      <button
        onClick={() => {
          if (hasChildren) {
            toggleNode(item.name);
          }
          if (item.href) {
            router.push(item.href);
          }
        }}
        className={cn(
          "group flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors",
          isActive
            ? "bg-primary/10 font-medium text-primary"
            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        )}
        style={{
          paddingInlineStart: `${level * 16 + 8}px`,
        }}
      >
        {/* Expand/collapse chevron or spacer */}
        {hasChildren ? (
          <ChevronIcon
            className={cn(
              "h-3 w-3 shrink-0 transition-transform",
              isExpanded && (isRTL ? "-rotate-90" : "rotate-90")
            )}
          />
        ) : (
          <span className="w-3 shrink-0" />
        )}

        {/* Icon */}
        {Icon ? (
          <Icon className="h-4 w-4 shrink-0" />
        ) : hasChildren ? (
          <Folder className="h-4 w-4 shrink-0 text-amber-500" />
        ) : (
          <FileText className="h-4 w-4 shrink-0" />
        )}

        {/* Label */}
        <span className="truncate">{t(item.name) || item.name}</span>

        {/* Badge */}
        {item.badge && (
          <span className="ms-auto rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-bold text-destructive-foreground">
            {item.badge}
          </span>
        )}
      </button>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {item.children!.map((child) => (
            <TreeNode
              key={child.name}
              item={child}
              level={level + 1}
              pathname={pathname}
              router={router}
              t={t}
              direction={direction}
              expandedNodes={expandedNodes}
              toggleNode={toggleNode}
              allItems={allItems}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Tree View Layout  IDE / file-explorer-style navigation.
 *
 * Structure:
 * - Header bar with logo + actions
 * - Left sidebar with recursive tree (folder icons, expand/collapse)
 * - Full content area
 * - Mobile: sidebar as slide-out drawer
 *
 * Inspired by VS Code, JetBrains, Windows Explorer
 */
export function TreeViewLayout({ children }: TreeViewLayoutProps) {
  const { direction, t } = useI18n();
  const appName = useBrandedAppName();
  const settings = useSettings();
  const styles = useLayoutStyles();
  const pathname = usePathname();
  const router = useRouter();
  const navigation = useDynamicNavigation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Auto-expand nodes that contain the active page
  const autoExpanded = useMemo(() => {
    const expanded = new Set<string>();
    const findPath = (items: NavigationItem[]) => {
      for (const item of items) {
        if (item.children) {
          for (const child of item.children) {
            if (child.href && isNavigationItemActive(child, pathname, navigation)) {
              expanded.add(item.name);
            }
          }
          findPath(item.children);
        }
      }
    };
    findPath(navigation);
    return expanded;
  }, [navigation, pathname]);

  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(autoExpanded);

  const toggleNode = useCallback((name: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }, []);

  // Filter navigation by search
  const filteredNavigation = useMemo(() => {
    if (!searchQuery.trim()) return navigation;
    const query = searchQuery.toLowerCase();
    const filterItems = (items: NavigationItem[]): NavigationItem[] => {
      return items
        .map((item) => {
          const nameMatch = (t(item.name) || item.name).toLowerCase().includes(query);
          const filteredChildren = item.children ? filterItems(item.children) : [];
          if (nameMatch || filteredChildren.length > 0) {
            return {
              ...item,
              children: filteredChildren.length > 0 ? filteredChildren : item.children,
            };
          }
          return null;
        })
        .filter(Boolean) as NavigationItem[];
    };
    return filterItems(navigation);
  }, [navigation, searchQuery, t]);

  const TreeContent = (
    <>
      {/* Search */}
      <div className="border-b border-border p-2">
        <div className="flex items-center gap-2 rounded-md bg-muted/50 px-2 py-1.5">
          <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("common.search") || "Search..."}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
          />
        </div>
      </div>

      {/* Tree */}
      <ScrollArea className="flex-1">
        <div className="py-1">
          {filteredNavigation.map((item) => (
            <TreeNode
              key={item.name}
              item={item}
              level={0}
              pathname={pathname}
              router={router}
              t={t}
              direction={direction}
              expandedNodes={expandedNodes}
              toggleNode={toggleNode}
              allItems={navigation}
            />
          ))}
        </div>
      </ScrollArea>

      {/* User + Logout */}
      <div className="border-t border-border p-2">
        <UserCard size="sm" />
      </div>
      <div className="border-t border-border p-2">
        <LogoutButton />
      </div>
    </>
  );

  return (
    <div
      className={cn("flex min-h-screen flex-col bg-background", styles.getAnimationClass())}
      dir={direction}
    >
      {/*  Header  */}
      <header
        className={cn(
          settings.stickyHeader ? "sticky top-0 z-30" : "relative",
          "glass border-b border-border",
          "flex h-11 items-center justify-between px-4"
        )}
      >
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
          <Logo size="sm" />
          <span className="hidden text-sm font-semibold text-foreground sm:block">
            {appName}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeSwitcher />
          <NotificationBell iconClassName="h-5 w-5" />
          <UserProfileDropdown showName={false} />
        </div>
      </header>

      <div className="flex flex-1">
        {/*  Desktop Tree Sidebar  */}
        <aside
          className={cn("hidden w-64 shrink-0 flex-col lg:flex", "border-e border-border bg-card")}
        >
          {TreeContent}
        </aside>

        {/*  Mobile Drawer  */}
        {mobileOpen && (
          <>
            <div
              className="fixed inset-0 z-30 bg-black/30 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <aside
              className={cn(
                "fixed bottom-0 top-11 z-40 flex w-72 flex-col border-e border-border bg-card lg:hidden",
                direction === "rtl" ? "right-0" : "left-0"
              )}
            >
              {TreeContent}
            </aside>
          </>
        )}

        {/*  Content  */}
        <main className="min-w-0 flex-1 p-6">
          <div style={{ borderRadius: "var(--border-radius)" }}>{children}</div>
        </main>
      </div>

      {settings.showFooter && <Footer />}
    </div>
  );
}
