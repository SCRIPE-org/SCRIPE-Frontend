/**
 * Types and helper functions for OptionSetItemsEditor.
 */

import type {
  OptionSetItem,
  OptionSetItemWritableStatus,
} from "../../domain/entities/OptionSetItem";

/** Client-side row counter for rowId. */
let rowSequence = 0;

/**
 * One row of the working list.
 */
export interface OptionSetDraftItem {
  /** Client-only React identity. */
  rowId: string;
  /** The server's item id, or null for a row that exists only in this editing session. */
  id: string | null;
  key: string;
  labelEn: string;
  labelAr: string | null;
  color: string | null;
  iconKey: string | null;
  /** Derived from array position on every commit; the admin never types it. */
  sortOrder: number;
  /** `Deleted` is excluded at the type level. */
  status: OptionSetItemWritableStatus;
}

/**
 * A blank row for the Add button.
 */
export function newOptionSetDraftItem(): OptionSetDraftItem {
  rowSequence += 1;
  return {
    rowId: `option-set-row-${rowSequence}`,
    id: null,
    key: "",
    labelEn: "",
    labelAr: null,
    color: null,
    iconKey: null,
    sortOrder: 0,
    status: "Active",
  };
}

/**
 * Builds the working list from a loaded version's items.
 */
export function toOptionSetDraftItems(items: readonly OptionSetItem[]): OptionSetDraftItem[] {
  return items.map((item, index) => {
    rowSequence += 1;
    return {
      rowId: `option-set-row-${rowSequence}`,
      id: item.id,
      key: item.key,
      labelEn: item.labelEn,
      labelAr: item.labelAr,
      color: item.color,
      iconKey: item.iconKey,
      sortOrder: index,
      status: item.writableStatus,
    };
  });
}

/** The text columns this table edits. Used to keep per-field handling exhaustive. */
export type EditableTextField = "key" | "labelEn" | "labelAr" | "color" | "iconKey";

/** The three columns whose meaning a header cannot carry, mapped to the sentence that carries it. */
export const OPTION_SET_ITEM_HINT_KEYS = {
  key: "optionSet.items.fields.keyHint",
  color: "optionSet.items.fields.colorHint",
  iconKey: "optionSet.items.fields.iconKeyHint",
} as const;

/** The subset of columns that carry a standing hint. */
export type HintedTextField = keyof typeof OPTION_SET_ITEM_HINT_KEYS;

export function isHintedTextField(field: EditableTextField): field is HintedTextField {
  return field in OPTION_SET_ITEM_HINT_KEYS;
}

/**
 * Applies one text edit to one row.
 */
export function withTextField(
  row: OptionSetDraftItem,
  field: EditableTextField,
  raw: string
): OptionSetDraftItem {
  switch (field) {
    case "key":
      return { ...row, key: raw };
    case "labelEn":
      return { ...row, labelEn: raw };
    case "labelAr":
      return { ...row, labelAr: raw.length === 0 ? null : raw };
    case "color":
      return { ...row, color: raw.length === 0 ? null : raw };
    case "iconKey":
      return { ...row, iconKey: raw.length === 0 ? null : raw };
  }
}
