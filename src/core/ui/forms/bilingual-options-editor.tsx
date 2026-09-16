"use client";

import React, { useCallback, useState } from "react";
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
  const rawAr = (valueAr ?? "").split("\n").map((s) => s.trim());
  const filteredAr = rawAr.filter((s) => s.length > 0);

  if (en.length === 0) {
    if (filteredAr.length > 0) {
      return filteredAr.map((ar) => ({ en: "", ar }));
    }
    return [];
  }

  // If rawAr has the same length as en, preserve empty lines (handles untranslated middle options like "صغير\n\nكبير")
  if (rawAr.length === en.length) {
    return en.map((label, index) => ({ en: label, ar: rawAr[index] ?? "" }));
  }

  // If filtered non-empty Arabic matches en's length (e.g. extra blank lines in valueAr)
  if (filteredAr.length === en.length) {
    return en.map((label, index) => ({ en: label, ar: filteredAr[index] ?? "" }));
  }

  const arSource = rawAr.length >= en.length ? rawAr : filteredAr;
  return en.map((label, index) => ({ en: label, ar: arSource[index] ?? "" }));
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

interface InternalOptionRow {
  id: string;
  en: string;
  ar: string;
}

let rowSequence = 0;
function createInternalRow(en = "", ar = ""): InternalOptionRow {
  rowSequence += 1;
  return {
    id: `bilingual-option-row-${rowSequence}`,
    en,
    ar,
  };
}

function parseToInternalRows(value: string, valueAr: string): InternalOptionRow[] {
  const parsed = parseBilingualOptions(value, valueAr);
  if (parsed.length === 0) {
    return [createInternalRow("", "")];
  }
  return parsed.map((row) => createInternalRow(row.en, row.ar));
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
  const [state, setState] = useState(() => ({
    value,
    valueAr,
    rows: parseToInternalRows(value, valueAr),
    lastEmitted: null as { en: string; ar: string } | null,
  }));

  const currentEn = value ?? "";
  const currentAr = valueAr ?? "";

  // Synchronize internal rows during render when value / valueAr change externally
  if (value !== state.value || valueAr !== state.valueAr) {
    const isMatchingLastEmitted =
      state.lastEmitted !== null &&
      state.lastEmitted.en === currentEn &&
      state.lastEmitted.ar === currentAr;

    setState({
      value,
      valueAr,
      rows: isMatchingLastEmitted ? state.rows : parseToInternalRows(currentEn, currentAr),
      lastEmitted: state.lastEmitted,
    });
  }

  const { rows } = state;

  const commit = useCallback(
    (nextRows: InternalOptionRow[]) => {
      const serialized = serializeBilingualOptions(nextRows);
      setState((prev) => ({
        ...prev,
        rows: nextRows,
        lastEmitted: serialized,
      }));
      onChange(serialized);
    },
    [onChange]
  );

  const updateRow = useCallback(
    (rowId: string, patch: Partial<BilingualOptionRow>) => {
      const next = rows.map((row) => (row.id === rowId ? { ...row, ...patch } : row));
      commit(next);
    },
    [rows, commit]
  );

  const addRow = useCallback(() => {
    commit([...rows, createInternalRow("", "")]);
  }, [rows, commit]);

  const removeRow = useCallback(
    (rowId: string) => {
      const remaining = rows.filter((row) => row.id !== rowId);
      const next = remaining.length === 0 ? [createInternalRow("", "")] : remaining;
      commit(next);
    },
    [rows, commit]
  );

  const inert = disabled || readOnly;
  const hasStoredOptions = rows.some((row) => row.en.trim().length > 0 || row.ar.trim().length > 0);

  return (
    <div className="space-y-2" id={id}>
      {!hasStoredOptions && emptyHint ? (
        <p className="text-xs text-muted-foreground">{emptyHint}</p>
      ) : null}

      {rows.map((row, index) => (
        <div key={row.id} className="flex items-start gap-2">
          <Input
            value={row.en}
            onChange={(e) => updateRow(row.id, { en: e.target.value })}
            placeholder={labelEn}
            disabled={inert}
            readOnly={readOnly}
            aria-label={`${labelEn} ${index + 1}`}
            dir="ltr"
            className="flex-1"
          />
          <Input
            value={row.ar}
            onChange={(e) => updateRow(row.id, { ar: e.target.value })}
            placeholder={labelAr}
            disabled={inert}
            readOnly={readOnly}
            aria-label={`${labelAr} ${index + 1}`}
            dir="rtl"
            className="flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeRow(row.id)}
            disabled={inert || rows.length === 1}
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
