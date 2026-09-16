import type { OptionSetItem, OptionSetItemWritableStatus } from "../../domain/entities/OptionSetItem";

/**
 * One row of the working copy.
 */
export interface OptionSetItemDraft {
  rowId: string;
  id: string | null;
  key: string;
  labelEn: string;
  labelAr: string;
  color: string;
  iconKey: string;
  status: OptionSetItemWritableStatus;
}

export type OptionSetItemDraftChanges = Partial<Omit<OptionSetItemDraft, "rowId" | "id">>;

let rowIdSequence = 0;
export function nextRowId(): string {
  rowIdSequence += 1;
  return `option-row-${rowIdSequence}`;
}

export function createEmptyOptionSetItemDraft(): OptionSetItemDraft {
  return {
    rowId: nextRowId(),
    id: null,
    key: "",
    labelEn: "",
    labelAr: "",
    color: "",
    iconKey: "",
    status: "Active",
  };
}

export function toOptionSetItemDraft(item: OptionSetItem): OptionSetItemDraft {
  return {
    rowId: nextRowId(),
    id: item.id,
    key: item.key,
    labelEn: item.labelEn,
    labelAr: item.labelAr ?? "",
    color: item.color ?? "",
    iconKey: item.iconKey ?? "",
    status: item.writableStatus,
  };
}
