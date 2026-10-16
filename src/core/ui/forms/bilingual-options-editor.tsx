"use client";

import React, { useCallback, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { cn } from "@core/common/utils";
import {
  parseBilingualOptions,
  serializeBilingualOptions,
  type BilingualOptionRow,
} from "./bilingual-options-parser";

export { parseBilingualOptions, serializeBilingualOptions, type BilingualOptionRow };

export interface BilingualOptionsEditorProps {
  value: string;
  valueAr: string;
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

      {rows.length > 5 && (
        <div className="flex items-center justify-between px-1 pb-1 text-xs text-muted-foreground">
          <span className="font-medium">{rows.length} options</span>
          <span className="text-[11px] text-muted-foreground/70">Scroll to view all</span>
        </div>
      )}

      <div
        className={cn(
          "space-y-2",
          rows.length > 5 &&
            "custom-scrollbar max-h-72 overflow-y-auto rounded-md border border-border/40 bg-muted/10 p-2 pe-1"
        )}
      >
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
      </div>

      {!inert && (
        <Button type="button" variant="outline" size="sm" onClick={addRow} className="gap-1">
          <Plus className="h-4 w-4" aria-hidden="true" />
          {addLabel}
        </Button>
      )}
    </div>
  );
}
