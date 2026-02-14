"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search, ArrowRight, Clock, Command, CornerDownLeft } from "lucide-react";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import {
      getFlatNavigationItems,
      type NavigationItem,
} from "@core/config/navigation";
import { useDynamicNavigation } from "@core/ui/navigation/dynamic-navigation";

interface CommandPaletteProps {
      open: boolean;
      onOpenChange: (open: boolean) => void;
}

const MAX_RECENT = 5;
const STORAGE_KEY = "command-palette-recent";

function getRecent(): string[] {
      try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      } catch {
            return [];
      }
}

function addRecent(href: string) {
      try {
            const recent = getRecent().filter((h) => h !== href);
            recent.unshift(href);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
      } catch {
            // ignore
      }
}

/**
 * Shared Command Palette (⌘K / Ctrl+K).
 *
 * Features:
 * - Fuzzy search across all navigation items (flattened)
 * - Recent pages section
 * - Full keyboard navigation (↑ ↓ Enter Esc)
 * - RTL-aware
 * - Used by Command and HUD layouts, optionally available in all
 */
export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
      const router = useRouter();
      const pathname = usePathname();
      const { t, direction } = useI18n();
      const dynamicItems = useDynamicNavigation();
      const inputRef = useRef<HTMLInputElement>(null);
      const listRef = useRef<HTMLDivElement>(null);

      const [query, setQuery] = useState("");
      const [selectedIndex, setSelectedIndex] = useState(0);

      // Flatten nav tree
      const flatItems = useMemo(() => {
            const items = getFlatNavigationItems(dynamicItems);
            return items.filter((item) => item.href);
      }, [dynamicItems]);

      // Recent items
      const recentItems = useMemo(() => {
            if (typeof window === "undefined") return [];
            const recent = getRecent();
            return recent
                  .map((href) => flatItems.find((item) => item.href === href))
                  .filter(Boolean) as NavigationItem[];
      }, [flatItems, open]); // eslint-disable-line react-hooks/exhaustive-deps

      // Fuzzy search
      const filteredItems = useMemo(() => {
            if (!query.trim()) return flatItems;
            const q = query.toLowerCase();
            return flatItems.filter((item) => {
                  const name = item.name.toLowerCase();
                  const href = (item.href || "").toLowerCase();
                  return name.includes(q) || href.includes(q);
            });
      }, [flatItems, query]);

      const displayItems = query.trim() ? filteredItems : flatItems;

      // Reset state when opened
      useEffect(() => {
            if (open) {
                  setQuery("");
                  setSelectedIndex(0);
                  setTimeout(() => inputRef.current?.focus(), 50);
            }
      }, [open]);

      // Global ⌘K / Ctrl+K listener
      useEffect(() => {
            const handler = (e: KeyboardEvent) => {
                  if ((e.metaKey || e.ctrlKey) && e.code === "KeyK") {
                        e.preventDefault();
                        onOpenChange(!open);
                  }
                  if (e.key === "Escape" && open) {
                        e.preventDefault();
                        onOpenChange(false);
                  }
            };
            window.addEventListener("keydown", handler);
            return () => window.removeEventListener("keydown", handler);
      }, [open, onOpenChange]);

      const navigate = useCallback(
            (item: NavigationItem) => {
                  if (!item.href || item.disabled) return;
                  addRecent(item.href);
                  router.push(item.href);
                  onOpenChange(false);
            },
            [router, onOpenChange]
      );

      // Keyboard nav inside palette
      const handleKeyDown = (e: React.KeyboardEvent) => {
            if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setSelectedIndex((i) => Math.min(i + 1, displayItems.length - 1));
            } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setSelectedIndex((i) => Math.max(i - 1, 0));
            } else if (e.key === "Enter") {
                  e.preventDefault();
                  const item = displayItems[selectedIndex];
                  if (item) navigate(item);
            }
      };

      // Scroll selected into view
      useEffect(() => {
            const list = listRef.current;
            if (!list) return;
            const selected = list.children[selectedIndex] as HTMLElement | undefined;
            selected?.scrollIntoView({ block: "nearest" });
      }, [selectedIndex]);

      if (!open) return null;

      return (
            <>
                  {/* Backdrop */}
                  <div
                        className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
                        onClick={() => onOpenChange(false)}
                  />

                  {/* Palette */}
                  <div
                        dir={direction}
                        className={cn(
                              "fixed z-[61] top-[20%] left-1/2 -translate-x-1/2 w-full max-w-[560px]",
                              "bg-popover border border-border rounded-xl shadow-2xl overflow-hidden",
                              "animate-in fade-in slide-in-from-top-4 duration-200"
                        )}
                  >
                        {/* Search input */}
                        <div className="flex items-center px-4 border-b border-border">
                              <Search className="w-5 h-5 text-muted-foreground shrink-0" />
                              <input
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => {
                                          setQuery(e.target.value);
                                          setSelectedIndex(0);
                                    }}
                                    onKeyDown={handleKeyDown}
                                    placeholder={t("common.search") || "Search pages…"}
                                    className="flex-1 px-3 py-4 bg-transparent text-foreground outline-none placeholder:text-muted-foreground text-sm"
                              />
                              <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs font-mono">
                                    Esc
                              </kbd>
                        </div>

                        {/* Results */}
                        <div
                              ref={listRef}
                              className="max-h-[320px] overflow-y-auto p-2"
                        >
                              {/* Recent section (when no search) */}
                              {!query.trim() && recentItems.length > 0 && (
                                    <>
                                          <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                                <Clock className="w-3 h-3" />
                                                {t("common.recent") || "Recent"}
                                          </div>
                                          {recentItems.map((item) => {
                                                const Icon = item.icon;
                                                return (
                                                      <button
                                                            key={`recent-${item.href}`}
                                                            onClick={() => navigate(item)}
                                                            className={cn(
                                                                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm",
                                                                  "text-foreground/80 hover:bg-muted/80 transition-colors",
                                                                  item.href === pathname && "text-primary font-medium"
                                                            )}
                                                      >
                                                            {Icon && <Icon className="w-4 h-4 text-muted-foreground shrink-0" />}
                                                            <span className="truncate">{item.name}</span>
                                                            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/50 ms-auto shrink-0" />
                                                      </button>
                                                );
                                          })}
                                          <div className="h-px bg-border my-1.5" />
                                    </>
                              )}

                              {/* All / filtered items */}
                              {displayItems.length === 0 ? (
                                    <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                                          {t("common.noResults") || "No pages found"}
                                    </div>
                              ) : (
                                    displayItems.map((item, idx) => {
                                          const Icon = item.icon;
                                          const isSelected = idx === selectedIndex;
                                          return (
                                                <button
                                                      key={item.href}
                                                      onClick={() => navigate(item)}
                                                      onMouseEnter={() => setSelectedIndex(idx)}
                                                      className={cn(
                                                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                                                            isSelected
                                                                  ? "bg-primary/10 text-primary"
                                                                  : "text-foreground/80 hover:bg-muted/60",
                                                            item.href === pathname && "font-medium"
                                                      )}
                                                >
                                                      {Icon && (
                                                            <Icon
                                                                  className={cn(
                                                                        "w-4 h-4 shrink-0",
                                                                        isSelected ? "text-primary" : "text-muted-foreground"
                                                                  )}
                                                            />
                                                      )}
                                                      <span className="truncate">{item.name}</span>
                                                      {isSelected && (
                                                            <CornerDownLeft className="w-3.5 h-3.5 text-muted-foreground/50 ms-auto shrink-0" />
                                                      )}
                                                </button>
                                          );
                                    })
                              )}
                        </div>

                        {/* Footer hints */}
                        <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/30 text-xs text-muted-foreground">
                              <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1">
                                          <kbd className="px-1.5 py-0.5 bg-muted rounded font-mono">↑↓</kbd>
                                          {t("common.navigate") || "Navigate"}
                                    </span>
                                    <span className="flex items-center gap-1">
                                          <kbd className="px-1.5 py-0.5 bg-muted rounded font-mono">↵</kbd>
                                          {t("common.open") || "Open"}
                                    </span>
                              </div>
                              <span className="flex items-center gap-1">
                                    <Command className="w-3 h-3" />K
                              </span>
                        </div>
                  </div>
            </>
      );
}
