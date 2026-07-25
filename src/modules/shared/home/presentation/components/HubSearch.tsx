"use client";

/**
 * HubSearch — The big search bar at the top of the Hub page.
 *
 * Composes the shared Input primitive (rest/hover/focus already designed
 * there) with a leading glyph and a trailing "/" hint; the "/" key focuses it
 * from anywhere outside a text field.
 */

import React, { useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { Input } from "@core/ui/input";

interface HubSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function HubSearch({ value, onChange }: HubSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useI18n();

  // "/" keyboard shortcut to focus
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
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
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("workspaceHub.search.placeholder")}
        aria-label={t("workspaceHub.search.placeholder")}
        className="h-14 rounded-nx-lg ps-11 pe-24 text-base"
      />
      <div className="pointer-events-none absolute end-4 top-1/2 inline-flex -translate-y-1/2 items-center gap-1.5 text-nx-ink-3">
        <kbd className="rounded-nx-sm border border-nx-line bg-nx-raised px-2 py-0.5 text-[11px] font-semibold text-nx-ink-2">
          /
        </kbd>
        <span className="text-xs">{t("workspaceHub.search.focusHint")}</span>
      </div>
    </div>
  );
}
