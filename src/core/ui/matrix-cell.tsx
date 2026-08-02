"use client";

/**
 * MatrixCell — the one reading of a value inside a comparison matrix.
 *
 * Every comparison surface in the product (editions, tenant plans, feature
 * matrices) re-cut this same three-way switch, and each cut disagreed: one
 * centred booleans and end-aligned numbers, another centred both; one drew the
 * "absent" state as a faded cross, another as an em-dash, a third as an empty
 * cell. An empty cell is the worst of the three — a screen reader reads it as
 * silence, so "not included" and "we have no data" became indistinguishable.
 *
 * So: booleans go through the shared indicator, numbers are end-aligned tabular
 * figures (a column of prices that jitters as digits change is the defect the
 * ladder exists to prevent) and absence is an em-dash carrying a real, spoken
 * label. The cell renders the VALUE only — the surrounding `<TableCell>`, its
 * padding and any highlight belong to the table that owns the column.
 *
 * The prop shape is deliberately minimal and stable: consumers hand it a raw
 * value, not a pre-formatted string, so the formatting decision lives here.
 */

import { Check, X } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { resolveIntlLocale } from "@core/common/utils";

export interface MatrixCellProps {
  /** `null` means the row does not apply to this column, not "zero". */
  value: boolean | string | number | null;
}

/**
 * Presentation UI component rendering one comparison-matrix value.
 */
export function MatrixCell({ value }: MatrixCellProps) {
  const { t, language } = useI18n();

  if (value === null) {
    return (
      <span className="text-nx-ink-3">
        <span aria-hidden="true">—</span>
        <span className="sr-only">{t("common.notIncluded")}</span>
      </span>
    );
  }

  // The glyph pair is inlined rather than imported from the editions module: a
  // core primitive that reaches into a feature module inverts the dependency
  // direction and would drag that module into every consumer's bundle. The
  // sr-only label is what actually announces the state — an icon alone reads as
  // nothing, and a `title` never surfaces on touch.
  if (typeof value === "boolean") {
    return (
      <span className="inline-flex items-center justify-center">
        <span className="sr-only">{value ? t("common.included") : t("common.notIncluded")}</span>
        {value ? (
          <Check aria-hidden="true" className="h-4 w-4 text-success" />
        ) : (
          <X aria-hidden="true" className="h-4 w-4 text-nx-ink-3" />
        )}
      </span>
    );
  }

  if (typeof value === "number") {
    return (
      <span className="block text-end text-sm font-semibold tabular-nums text-nx-ink">
        {value.toLocaleString(resolveIntlLocale(language))}
      </span>
    );
  }

  return <span className="text-sm text-nx-ink">{value}</span>;
}
