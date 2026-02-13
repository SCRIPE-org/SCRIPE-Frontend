"use client";

import { X, Search } from "lucide-react";
import { useState, useMemo } from "react";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import { Logo } from "@core/ui/logo";
import { NavRenderer } from "@core/ui/layout/shared/nav-renderer";
import { UserCard } from "@core/ui/layout/shared/user-card";
import { LogoutButton } from "@core/ui/layout/shared/logout-button";
import { useDynamicNavigation } from "@core/ui/navigation/dynamic-navigation";

interface ClassicSidebarProps {
      open: boolean;
      onOpenChange: (open: boolean) => void;
      collapsible: boolean;
}

/**
 * Classic Sidebar — Notion/Jira inspired.
 *
 * Features:
 * - Wide sidebar (w-72) with clear section hierarchy
 * - Quick search input that filters nav items live
 * - Left border accent on active items (via NavRenderer "default" variant)
 * - Section dividers with subtle spacing
 * - UserCard at top, LogoutButton + version at bottom
 */
export function ClassicSidebar({
      open,
      onOpenChange,
      collapsible,
}: ClassicSidebarProps) {
      const { t, direction } = useI18n();
      const [searchQuery, setSearchQuery] = useState("");
      const allItems = useDynamicNavigation();

      // Filter nav items by search query (recursive)
      const filteredItems = useMemo(() => {
            if (!searchQuery.trim()) return allItems;
            const q = searchQuery.toLowerCase();
            const filterItems = (items: typeof allItems): typeof allItems =>
                  items
                        .map((item) => {
                              const nameMatch = item.name.toLowerCase().includes(q);
                              const filteredChildren = item.children
                                    ? filterItems(item.children)
                                    : [];
                              if (nameMatch || filteredChildren.length > 0) {
                                    return { ...item, children: filteredChildren.length > 0 ? filteredChildren : item.children };
                              }
                              return null;
                        })
                        .filter(Boolean) as typeof allItems;
            return filterItems(allItems);
      }, [allItems, searchQuery]);

      return (
            <>
                  {/* Sidebar panel */}
                  <aside
                        className={cn(
                              "fixed top-0 bottom-0 z-50 flex flex-col w-72",
                              "bg-sidebar border-sidebar-border",
                              direction === "rtl"
                                    ? "right-0 border-l"
                                    : "left-0 border-r",
                              "transition-transform duration-300 ease-in-out",
                              // Mobile: slide in/out
                              !open && (direction === "rtl"
                                    ? "translate-x-full lg:translate-x-0"
                                    : "-translate-x-full lg:translate-x-0"),
                              open && "translate-x-0"
                        )}
                  >
                        {/* ── Logo Header ── */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-sidebar-border/50">
                              <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shadow-sm">
                                          <Logo size="sm" className="text-primary-foreground" />
                                    </div>
                                    <div>
                                          <h1 className="text-sm font-bold text-sidebar-foreground leading-tight">
                                                {t("app.title")}
                                          </h1>
                                          <p className="text-[10px] text-sidebar-foreground/50 leading-tight">
                                                {t("app.version")}
                                          </p>
                                    </div>
                              </div>

                              {/* Close button — mobile only */}
                              <Button
                                    variant="ghost"
                                    size="icon"
                                    className="lg:hidden text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-lg h-8 w-8"
                                    onClick={() => onOpenChange(false)}
                              >
                                    <X className="w-4 h-4" />
                              </Button>
                        </div>

                        {/* ── User Card ── */}
                        <div className="px-4 py-3 border-b border-sidebar-border/30">
                              <UserCard size="md" />
                        </div>

                        {/* ── Quick Search ── */}
                        <div className="px-4 py-3">
                              <div className="relative">
                                    <Search className={cn(
                                          "absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-sidebar-foreground/40",
                                          direction === "rtl" ? "right-3" : "left-3"
                                    )} />
                                    <Input
                                          type="text"
                                          placeholder={t("common.search") || "Search..."}
                                          value={searchQuery}
                                          onChange={(e) => setSearchQuery(e.target.value)}
                                          className={cn(
                                                "h-8 text-xs bg-sidebar-accent/50 border-sidebar-border/30",
                                                "placeholder:text-sidebar-foreground/30 text-sidebar-foreground",
                                                "focus:bg-sidebar-accent focus:border-primary/30 rounded-lg",
                                                direction === "rtl" ? "pr-9 pl-3" : "pl-9 pr-3"
                                          )}
                                    />
                              </div>
                        </div>

                        {/* ── Navigation ── */}
                        <div className="flex-1 px-3 pb-3 overflow-y-auto scrollbar-thin">
                              <NavRenderer
                                    variant="default"
                                    items={filteredItems}
                                    onNavigate={() => {
                                          if (window.innerWidth < 1024) onOpenChange(false);
                                    }}
                              />
                        </div>

                        {/* ── Footer ── */}
                        <div className="px-3 py-3 border-t border-sidebar-border/30">
                              <LogoutButton />
                        </div>
                  </aside>
            </>
      );
}
