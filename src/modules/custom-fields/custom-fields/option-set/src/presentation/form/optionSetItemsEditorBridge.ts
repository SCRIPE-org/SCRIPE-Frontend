/**
 * Bridge between controlled OptionSetItemsEditor and useOptionSetVersionEditor hook.
 *
 * Translates full-replace table commits into fine-grained hook operations.
 */

import type { OptionSetDraftItem } from "../components/OptionSetItemsEditor";
import type {
  OptionSetItemDraft,
  OptionSetItemDraftChanges,
} from "../viewmodels/useOptionSetVersionEditor";

/**
 * One mutation the options table asked for.
 */
export type OptionSetTableCommit =
  | { kind: "add" }
  | { kind: "remove"; rowId: string }
  | { kind: "move"; rowId: string; beforeRowId: string }
  | { kind: "update"; rowId: string; changes: OptionSetItemDraftChanges }
  | { kind: "none" };

/**
 * The fields that differ between one table row and one working-copy row, or null when none do.
 */
export function diffDraftFields(
  current: OptionSetItemDraft,
  next: OptionSetDraftItem
): OptionSetItemDraftChanges | null {
  const changes: OptionSetItemDraftChanges = {};

  if (next.key !== current.key) changes.key = next.key;
  if (next.labelEn !== current.labelEn) changes.labelEn = next.labelEn;
  if ((next.labelAr ?? "") !== current.labelAr) changes.labelAr = next.labelAr ?? "";
  if ((next.color ?? "") !== current.color) changes.color = next.color ?? "";
  if ((next.iconKey ?? "") !== current.iconKey) changes.iconKey = next.iconKey ?? "";
  if (next.status !== current.status) changes.status = next.status;

  return Object.keys(changes).length > 0 ? changes : null;
}

/**
 * Names the single operation that turned `current` into `next`.
 */
export function diffTableCommit(
  current: readonly OptionSetItemDraft[],
  next: readonly OptionSetDraftItem[]
): OptionSetTableCommit {
  if (next.length > current.length) return { kind: "add" };

  if (next.length < current.length) {
    const survivors = new Set(next.map((row) => row.rowId));
    const dropped = current.find((row) => !survivors.has(row.rowId));
    return dropped ? { kind: "remove", rowId: dropped.rowId } : { kind: "none" };
  }

  const movedIndex = next.findIndex((row, index) => row.rowId !== current[index].rowId);
  if (movedIndex >= 0) {
    return {
      kind: "move",
      rowId: next[movedIndex].rowId,
      beforeRowId: current[movedIndex].rowId,
    };
  }

  for (let index = 0; index < next.length; index += 1) {
    const changes = diffDraftFields(current[index], next[index]);
    if (changes) return { kind: "update", rowId: next[index].rowId, changes };
  }

  return { kind: "none" };
}

/**
 * Working-copy rows -> table rows.
 */
export function toTableRows(rows: readonly OptionSetItemDraft[]): OptionSetDraftItem[] {
  return rows.map((row, index) => ({
    rowId: row.rowId,
    id: row.id,
    key: row.key,
    labelEn: row.labelEn,
    labelAr: row.labelAr.length > 0 ? row.labelAr : null,
    color: row.color.length > 0 ? row.color : null,
    iconKey: row.iconKey.length > 0 ? row.iconKey : null,
    sortOrder: index,
    status: row.status,
  }));
}
