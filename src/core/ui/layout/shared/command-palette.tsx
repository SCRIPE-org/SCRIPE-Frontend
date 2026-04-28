"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search, ArrowRight, Clock, Command, CornerDownLeft } from "lucide-react";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { getFlatNavigationItems, type NavigationItem } from "@core/config/navigation";
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

  // Recent items — re-read localStorage each time the palette opens
  const [recentItems, setRecentItems] = useState<NavigationItem[]>([]);
  const [prevOpenSync, setPrevOpenSync] = useState(open);
  const [prevFlatItems, setPrevFlatItems] = useState(flatItems);

  if (open !== prevOpenSync || flatItems !== prevFlatItems) {
    setPrevOpenSync(open);
    setPrevFlatItems(flatItems);
    if (open) {
      const recent = getRecent();
      const items = recent
        .map((href) => flatItems.find((item) => item.href === href))
        .filter(Boolean) as NavigationItem[];
      setRecentItems(items);
    }
  }

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

  // Reset state when opened (render-time, no setState in effect)
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      // Transitioning from closed to open — reset
      setQuery("");
      setSelectedIndex(0);
    }
  }

  // Focus input when opened
  useEffect(() => {
    if (open) {
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
        className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm duration-150 animate-in fade-in"
        onClick={() => onOpenChange(false)}
      />

      {/* Palette */}
      <div
        dir={direction}
        className={cn(
          "fixed left-1/2 top-[20%] z-[61] w-full max-w-[560px] -translate-x-1/2",
          "overflow-hidden rounded-xl border border-border bg-popover shadow-2xl",
          "duration-200 animate-in fade-in slide-in-from-top-4"
        )}
      >
        {/* Search input */}
        <div className="flex items-center border-b border-border px-4">
          <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
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
            className="flex-1 bg-transparent px-3 py-4 text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden items-center gap-1 rounded bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground sm:inline-flex">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[320px] overflow-y-auto p-2">
          {/* Recent section (when no search) */}
          {!query.trim() && recentItems.length > 0 && (
            <>
              <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                <Clock className="h-3 w-3" />
                {t("common.recent") || "Recent"}
              </div>
              {recentItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={`recent-${item.href}`}
                    onClick={() => navigate(item)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm",
                      "text-foreground/80 transition-colors hover:bg-muted/80",
                      item.href === pathname && "font-medium text-primary"
                    )}
                  >
                    {Icon && <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />}
                    <span className="truncate">{item.name}</span>
                    <ArrowRight className="ms-auto h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                  </button>
                );
              })}
              <div className="my-1.5 h-px bg-border" />
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
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                    isSelected
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/80 hover:bg-muted/60",
                    item.href === pathname && "font-medium"
                  )}
                >
                  {Icon && (
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isSelected ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                  )}
                  <span className="truncate">{item.name}</span>
                  {isSelected && (
                    <CornerDownLeft className="ms-auto h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer hints */}
        <div className="flex items-center justify-between border-t border-border bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">↑↓</kbd>
              {t("common.navigate") || "Navigate"}
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">↵</kbd>
              {t("common.open") || "Open"}
            </span>
          </div>
          <span className="flex items-center gap-1">
            <Command className="h-3 w-3" />K
          </span>
        </div>
      </div>
    </>
  );
}
