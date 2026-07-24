"use client";

import React from "react";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface ResponsiveTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

/**
 * ResponsiveTabs — a wrapping segmented tab strip.
 *
 * This was a row of <Button>s: no tablist role, no aria-selected, no roving
 * tabindex, no arrow-key movement — a screen reader heard a list of buttons and
 * a keyboard user had to Tab through every one of them. It also carried the two
 * things the system has otherwise removed everywhere: hover:scale-105 /
 * active:scale-95 transform noise, and a drop shadow on the selected tab, which
 * does not float. Both are gone; the strip now speaks the same language as the
 * Tabs primitive's "pill" variant — a raised track, the selected tab a surface
 * step behind an inset hairline, light collecting only on the live one.
 *
 * The tabs own no panels here (callers render their own content), so aria stops
 * at role/aria-selected rather than claiming an aria-controls relationship that
 * does not exist.
 */
export function ResponsiveTabs({ tabs, activeTab, onTabChange, className }: ResponsiveTabsProps) {
  const { direction } = useI18n();
  const tabRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});

  const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);
  // Nothing selected yet? The first tab is the single tab stop, so the strip is
  // always reachable with exactly one Tab press.
  const rovingId = activeIndex >= 0 ? activeTab : tabs[0]?.id;

  const move = (nextIndex: number) => {
    const next = tabs[(nextIndex + tabs.length) % tabs.length];
    if (!next) return;
    onTabChange(next.id);
    tabRefs.current[next.id]?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    // In RTL the physical arrows swap meaning: ArrowLeft advances.
    const forward = direction === "rtl" ? "ArrowLeft" : "ArrowRight";
    const backward = direction === "rtl" ? "ArrowRight" : "ArrowLeft";

    switch (event.key) {
      case forward:
        event.preventDefault();
        move(index + 1);
        break;
      case backward:
        event.preventDefault();
        move(index - 1);
        break;
      case "Home":
        event.preventDefault();
        move(0);
        break;
      case "End":
        event.preventDefault();
        move(tabs.length - 1);
        break;
      default:
        break;
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        role="tablist"
        aria-orientation="horizontal"
        className="flex flex-wrap gap-1 rounded-nx-control bg-nx-raised p-1"
      >
        {tabs.map((tab, index) => {
          const isActive = tab.id === activeTab;

          return (
            <button
              key={tab.id}
              ref={(node) => {
                tabRefs.current[tab.id] = node;
              }}
              type="button"
              role="tab"
              aria-selected={isActive}
              tabIndex={tab.id === rovingId ? 0 : -1}
              onClick={() => onTabChange(tab.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={cn(
                "relative inline-flex min-h-8 select-none items-center gap-2 rounded-nx-sm px-3 py-1.5 text-sm font-medium tabular-nums",
                "transition-[color,background-color,box-shadow] duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                "focus-visible:outline-none focus-visible:shadow-nx-focus focus-visible:z-raised",
                "[&_svg]:pointer-events-none [&_svg]:shrink-0",
                isActive
                  ? "bg-nx-surface text-nx-ink shadow-[inset_0_0_0_1px_var(--nx-line-hi)]"
                  : "text-nx-ink-2 hover:bg-nx-hover hover:text-nx-ink"
              )}
            >
              {tab.icon}
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
