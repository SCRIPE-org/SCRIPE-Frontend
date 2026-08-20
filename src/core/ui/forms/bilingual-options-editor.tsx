"use client";

import React, { useCallback, useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { cn } from "@core/common/utils";

/**
 * Repeatable editor for a Select/MultiSelect field's allowed options, with an English and an Arabic
 * label per option.
 *
 * REPLACES A TEXTAREA, AND THAT IS THE POINT
 * ------------------------------------------
 * Options were previously authored as free text, "one option per line". That shape could not express
 * an Arabic label at all, gave no affordance for adding or removing a single option, and silently
 * turned a stray blank line into a dropped option.
 *
 * THE WIRE FORMAT IS UNCHANGED
 * ----------------------------
 * Both halves are still newline-separated strings, POSITIONALLY ALIGNED — entry N of the Arabic list
 * labels entry N of the English one. This component is a view over that format, not a new one: the
 * stored value of a Select is its ENGLISH label (that is what the server's validator matches against),
 * so English stays authoritative and Arabic is presentation layered on top.
 *
 * A row with a blank English label is dropped on serialisation, because an option with no value cannot
 * be selected. A row with a blank Arabic label is KEPT — partial translation is legal, and the option
 * falls back to its English label at render time.
 */
export interface BilingualOptionRow {
  en: string;
  ar: string;
}

export interface BilingualOptionsEditorProps {
  /** Newline-separated English labels. */
  value: string;
  /** Newline-separated Arabic labels, positionally aligned with `value`. */
  valueAr: string;
  /** Receives both halves already serialised, so the caller never re-implements the split. */
  onChange: (next: { en: string; ar: string }) => void;
  disabled?: boolean;
  readOnly?: boolean;
  labelEn: string;
  labelAr: string;
  addLabel: string;
  removeLabel: string;
  emptyHint: string;
  id?: string;
}

/**
 * Splits the two stored strings into aligned rows.
 *
 * Trims and drops empty entries exactly as the SERVER's parser does
 * (`CustomFieldOptionsParser.ParseOptions`) — if this split disagreed with that one, a client could
 * be rejected for submitting precisely what it was shown.
 */
export function parseBilingualOptions(value: string, valueAr: string): BilingualOptionRow[] {
  const en = (value ?? "").split("\n").map((s) => s.trim()).filter((s) => s.length > 0);
  const ar = (valueAr ?? "").split("\n").map((s) => s.trim()).filter((s) => s.length > 0);
  return en.map((label, index) => ({ en: label, ar: ar[index] ?? "" }));
}

/**
 * Serialises rows back to the two aligned strings.
 *
 * A row with no English label is dropped — it cannot be selected, and keeping it would shift every
 * later Arabic label onto the wrong option. Arabic is emitted for the surviving rows only, so the two
 * lists stay the same length and aligned by construction rather than by convention.
 */
export function serializeBilingualOptions(rows: BilingualOptionRow[]): { en: string; ar: string } {
  const kept = rows.filter((row) => row.en.trim().length > 0);
  return {
    en: kept.map((row) => row.en.trim()).join("\n"),
    // Emitted only when at least one translation exists, so a wholly untranslated field stores null
    // rather than a string of empty lines.
    ar: kept.some((row) => row.ar.trim().length > 0)
      ? kept.map((row) => row.ar.trim()).join("\n")
      : "",
  };
}

export function BilingualOptionsEditor({
  value,
  valueAr,
  onChange,
  disabled,
  readOnly,
  labelEn,
  labelAr,
  addLabel,
  removeLabel,
  emptyHint,
  id,
}: BilingualOptionsEditorProps) {
  const rows = useMemo(() => parseBilingualOptions(value, valueAr), [value, valueAr]);

  const commit = useCallback(
    (next: BilingualOptionRow[]) => onChange(serializeBilingualOptions(next)),
    [onChange]
  );

  const updateRow = useCallback(
    (index: number, patch: Partial<BilingualOptionRow>) => {
      // Rebuilt from the parsed rows rather than mutated, so the two stored strings are always
      // re-derived together and cannot drift apart.
      commit(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
    },
    [rows, commit]
  );

  // An empty English box would be dropped by serialisation, so a row being typed into needs to
  // survive. Adding appends a placeholder the user immediately fills; until they do, it is not
  // serialised, which is the correct behaviour for an option with no label.
  const addRow = useCallback(() => commit([...rows, { en: "", ar: "" }]), [rows, commit]);
  const removeRow = useCallback(
    (index: number) => commit(rows.filter((_, i) => i !== index)),
    [rows, commit]
  );

  const inert = disabled || readOnly;
  // A row is always rendered so there is something to type into, even when nothing is stored yet.
  const displayRows = rows.length > 0 ? rows : [{ en: "", ar: "" }];

  return (
    <div className="space-y-2" id={id}>
      {rows.length === 0 && <p className="text-xs text-muted-foreground">{emptyHint}</p>}

      {displayRows.map((row, index) => (
        <div key={index} className="flex items-start gap-2">
          <Input
            value={row.en}
            onChange={(e) => updateRow(index, { en: e.target.value })}
            placeholder={labelEn}
            disabled={inert}
            readOnly={readOnly}
            aria-label={`${labelEn} ${index + 1}`}
            dir="ltr"
            className="flex-1"
          />
          <Input
            value={row.ar}
            onChange={(e) => updateRow(index, { ar: e.target.value })}
            placeholder={labelAr}
            disabled={inert}
            readOnly={readOnly}
            aria-label={`${labelAr} ${index + 1}`}
            // Pinned RTL regardless of the app's direction: this box holds Arabic by definition, so
            // it must read right-to-left even while the surrounding UI is English.
            dir="rtl"
            className="flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeRow(index)}
            disabled={inert || displayRows.length === 1}
            aria-label={`${removeLabel} ${index + 1}`}
            className={cn("shrink-0", inert && "invisible")}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      ))}

      {!inert && (
        <Button type="button" variant="outline" size="sm" onClick={addRow} className="gap-1">
          <Plus className="h-4 w-4" aria-hidden="true" />
          {addLabel}
        </Button>
      )}
    </div>
  );
}
