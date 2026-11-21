"use client";

/**
 * HubSearch — Workspace search bar at the top of the Hub page.
 *
 * Composes `@core/ui/input` and `@core/ui/button` with `/` focus shortcut
 * and an accessible Clear button when a query is present.
 */

import React, { useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";

interface HubSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function HubSearch({ value, onChange }: HubSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useI18n();
  const hasValue = value.trim().length > 0;

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA" &&
        !(document.activeElement as HTMLElement | null)?.isContentEditable
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div className="relative my-2">
      <Search
        size={18}
        strokeWidth={1.75}
        aria-hidden="true"
        className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-nx-ink-3"
      />
      <Input
        id="hub-search-input"
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("workspaceHub.search.placeholder")}
        aria-label={t("workspaceHub.search.placeholder")}
        className="h-14 rounded-nx-lg pe-28 ps-11 text-base"
      />
      {hasValue ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => {
            onChange("");
            inputRef.current?.focus();
          }}
          aria-label={t("workspaceHub.search.clear")}
          className="absolute end-3 top-1/2 h-8 w-8 -translate-y-1/2 text-nx-ink-3 hover:text-nx-ink"
        >
          <X size={16} aria-hidden="true" />
        </Button>
      ) : (
        <div className="pointer-events-none absolute end-4 top-1/2 inline-flex -translate-y-1/2 items-center gap-1.5 text-nx-ink-3">
          <kbd className="rounded-nx-sm border border-nx-line bg-nx-raised px-2 py-0.5 text-[11px] font-semibold text-nx-ink-2">
            /
          </kbd>
          <span className="text-xs">{t("workspaceHub.search.focusHint")}</span>
        </div>
      )}
    </div>
  );
}
