"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { ChevronRight, Search, X } from "lucide-react";
import type { SearchableItem } from "@core/navigation/search";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { DynamicIcon } from "@core/ui/layout/shared";

/** Props for {@link HubTypeAheadBar}. */
export interface HubTypeAheadBarProps {
  /** Whether the type-ahead input bar is currently open/visible. */
  isOpen: boolean;
  /** Opens or closes the type-ahead bar. */
  onOpenChange: (open: boolean) => void;
  /** Current search query string. */
  value: string;
  /** Updates the current search query string. */
  onChange: (value: string) => void;
  /** Up to 6 deep Quick Jump page results matching `value`. */
  quickJumpItems: SearchableItem[];
  /** Launches the selected Quick Jump page item. */
  onSelectQuickJump: (item: SearchableItem) => void;
}

/**
 * Odoo-inspired Type-Anywhere Live Search bar for `/hub`. Stays hidden at rest
 * with a quiet desktop shortcut hint, opens & focuses when typing any printable key,
 * `/`, or `Cmd/Ctrl+K`, filters workspace squircles live, and renders up to 6
 * keyboard-navigable Quick Jump pages with `<bdi dir="ltr">` route isolation.
 */
export function HubTypeAheadBar({
  isOpen,
  onOpenChange,
  value,
  onChange,
  quickJumpItems,
  onSelectQuickJump,
}: HubTypeAheadBarProps) {
  const { t, direction } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();
  const [rawActiveIndex, setRawActiveIndex] = useState(0);

  const visible = isOpen || value.length > 0;
  const activeIndex =
    quickJumpItems.length === 0 ? -1 : Math.min(rawActiveIndex, quickJumpItems.length - 1);

  useEffect(() => {
    if (!visible) return;
    const el = inputRef.current;
    if (!el) return;
    el.focus();
    const len = el.value.length;
    try {
      el.setSelectionRange(len, len);
    } catch {
      /* ignore inputs without selection support */
    }
  }, [visible]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;

      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (visible) {
          onChange("");
          setRawActiveIndex(0);
          onOpenChange(false);
        } else {
          onOpenChange(true);
        }
        return;
      }

      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const active = document.activeElement as HTMLElement | null;
      const tag = active?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || active?.isContentEditable) {
        return;
      }

      if (
        document.querySelector(
          '[role="dialog"], [role="alertdialog"], [role="menu"], [data-state="open"][data-radix-popper-content-wrapper]'
        )
      ) {
        return;
      }

      if (e.key === "/") {
        e.preventDefault();
        onOpenChange(true);
        return;
      }

      if (e.key.length === 1 && /\S/.test(e.key) && !e.repeat) {
        e.preventDefault();
        onOpenChange(true);
        onChange(value ? `${value}${e.key}` : e.key);
        setRawActiveIndex(0);
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, [visible, value, onOpenChange, onChange]);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      e.nativeEvent.stopPropagation();
      onChange("");
      onOpenChange(false);
      setRawActiveIndex(0);
      return;
    }

    if (quickJumpItems.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setRawActiveIndex((prev) => (prev + 1) % quickJumpItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setRawActiveIndex((prev) => (prev - 1 + quickJumpItems.length) % quickJumpItems.length);
    } else if (e.key === "Enter" && activeIndex >= 0 && quickJumpItems[activeIndex]) {
      e.preventDefault();
      onSelectQuickJump(quickJumpItems[activeIndex]);
    }
  };

  if (!visible) return null;

  const activeDescendantId =
    activeIndex >= 0 && quickJumpItems[activeIndex]
      ? `${listboxId}-opt-${quickJumpItems[activeIndex].id}`
      : undefined;

  return (
    <div
      dir={direction}
      data-testid="hub-typeahead-bar"
      className="mx-auto mb-8 w-full max-w-[520px] duration-nx-micro ease-nx-enter animate-in fade-in"
    >
      <div className="relative">
        <Search
          size={16}
          aria-hidden="true"
          className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-nx-ink-3"
        />
        <Input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={quickJumpItems.length > 0}
          aria-controls={quickJumpItems.length > 0 ? listboxId : undefined}
          aria-activedescendant={activeDescendantId}
          data-testid="hub-typeahead-input"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setRawActiveIndex(0);
          }}
          onKeyDown={handleInputKeyDown}
          placeholder={t("workspaceHub.launchpad.typeaheadPlaceholder")}
          aria-label={t("workspaceHub.launchpad.typeaheadPlaceholder")}
          className="h-11 rounded-nx-lg border-nx-line-hi bg-nx-surface pe-11 ps-10 text-sm text-nx-ink"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => {
            if (value) {
              onChange("");
              setRawActiveIndex(0);
              inputRef.current?.focus();
            } else {
              onOpenChange(false);
            }
          }}
          aria-label={t("workspaceHub.search.clear")}
          className="absolute end-1.5 top-1/2 h-8 w-8 -translate-y-1/2 text-nx-ink-3 hover:text-nx-ink"
        >
          <X size={15} aria-hidden="true" />
        </Button>
      </div>

      {value.trim().length > 0 && quickJumpItems.length > 0 && (
        <div
          id={listboxId}
          role="listbox"
          aria-label={t("workspaceHub.launchpad.quickJumpTitle")}
          data-testid="hub-quick-jump-list"
          className="mt-2 overflow-hidden rounded-nx-lg border border-nx-line bg-nx-surface p-1.5 shadow-nx-popover"
        >
          <p className="px-2.5 pb-1.5 pt-1 text-xs font-medium text-nx-ink-3">
            {t("workspaceHub.launchpad.quickJumpTitle")}
          </p>
          <ul className="space-y-0.5">
            {quickJumpItems.map((item, idx) => {
              const isHighlighted = idx === activeIndex;
              return (
                <li key={item.id}>
                  <Button
                    id={`${listboxId}-opt-${item.id}`}
                    type="button"
                    role="option"
                    aria-selected={isHighlighted}
                    variant="ghost"
                    onClick={() => onSelectQuickJump(item)}
                    className={cn(
                      "flex h-auto w-full items-center justify-between gap-3 rounded-nx-md px-2.5 py-2 text-start font-normal",
                      isHighlighted
                        ? "bg-nx-raised text-nx-ink"
                        : "text-nx-ink-2 hover:bg-nx-raised/70 hover:text-nx-ink"
                    )}
                  >
                    <span className="flex min-w-0 flex-1 items-center gap-2.5">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-nx-sm border border-nx-line bg-nx-ground text-nx-ink-2">
                        <DynamicIcon name={item.iconName} size={14} />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-xs font-medium text-nx-ink">
                        <span className="text-nx-ink-3">
                          <bdi>{item.groupName}</bdi>
                          {" / "}
                        </span>
                        {item.titleSegments.map((seg, segIdx) => (
                          <React.Fragment key={`${item.id}-seg-${segIdx}`}>
                            {segIdx > 0 && (
                              <span className="mx-1 text-nx-ink-3" aria-hidden="true">
                                /
                              </span>
                            )}
                            <bdi>{seg}</bdi>
                          </React.Fragment>
                        ))}
                      </span>
                    </span>

                    <span className="flex shrink-0 items-center gap-1.5">
                      <span className="hidden max-w-[160px] truncate font-mono text-[11px] text-nx-ink-3 sm:inline">
                        <bdi dir="ltr">{item.href}</bdi>
                      </span>
                      <ChevronRight
                        className="h-3.5 w-3.5 text-nx-ink-3 rtl:rotate-180"
                        aria-hidden="true"
                      />
                    </span>
                  </Button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
