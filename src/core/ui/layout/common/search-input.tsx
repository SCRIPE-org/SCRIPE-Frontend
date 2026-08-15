"use client";

import { Search } from "lucide-react";
import { Input } from "@core/ui/input";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import type { InputHTMLAttributes } from "react";

interface HeaderSearchProps extends InputHTMLAttributes<HTMLInputElement> {
  placeholderKey?: string;
  /** Locale key for the field's accessible name. */
  labelKey?: string;
  containerClassName?: string;
  inputClassName?: string;
  iconClassName?: string;
}

/**
 * The header's search field: the Input primitive with a leading glyph.
 *
 * The glyph used to be placed by branching on `direction` (`right-3` in Arabic,
 * `left-3` otherwise) and the field then padded to match — two mirrored code
 * paths for what a single logical property expresses. `start-`/`ps-` resolve
 * against the live writing direction on their own, so the glyph sits on the
 * leading edge in both builds with one rule.
 *
 * A placeholder is a hint that vanishes the moment the user types, so it cannot
 * be the field's name. The name is an explicit label, overridable by a caller
 * that has a visible one to point at.
 */
export function HeaderSearch({
  placeholderKey = "common.search",
  labelKey = "chrome.search.label",
  containerClassName,
  inputClassName,
  iconClassName,
  ...inputProps
}: HeaderSearchProps) {
  const { t } = useI18n();

  return (
    <div className={cn("relative", containerClassName)}>
      <Search
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nx-ink-3",
          iconClassName
        )}
      />
      {/* The focus ring, the hairline ladder and every field state already ship
          with the Input primitive; re-declaring the ring here would override the
          `underlined` style's own inset edge. */}
      <Input
        placeholder={t(placeholderKey)}
        aria-label={t(labelKey)}
        className={cn("ps-9", inputClassName)}
        {...inputProps}
      />
    </div>
  );
}
