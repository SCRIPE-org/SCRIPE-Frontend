"use client";

import { useCallback, useId, useMemo } from "react";
import { Button } from "@core/ui/button";
import { EmptyState } from "@core/ui/empty-state";
import { Alert, AlertDescription } from "@core/ui/alert";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@core/ui/table";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { ListOrdered, Plus } from "lucide-react";
import {
  collectOptionSetItemIssues,
  optionSetItemIssueMessageKey,
} from "../form/optionSetItemRules";
import { OptionSetItemRow } from "./OptionSetItemRow";
import {
  OPTION_SET_ITEM_HINT_KEYS,
  newOptionSetDraftItem,
  withTextField,
  type EditableTextField,
  type HintedTextField,
  type OptionSetDraftItem,
} from "./optionSetItemEditorTypes";
import type { OptionSetItemWritableStatus } from "../../domain/entities/OptionSetItem";

/* ── The rules and types re-exports ──────────────────────────────────────────────────────── */

export {
  OPTION_SET_ITEM_COLOR_MAX_LENGTH,
  OPTION_SET_ITEM_ICON_KEY_MAX_LENGTH,
  OPTION_SET_ITEM_KEY_MAX_LENGTH,
  OPTION_SET_ITEM_LABEL_MAX_LENGTH,
  collectOptionSetItemIssues,
  optionSetItemIssueMessageKey,
  toOptionSetItemInputs,
  type OptionSetItemIssue,
  type OptionSetItemIssueCode,
} from "../form/optionSetItemRules";

export {
  newOptionSetDraftItem,
  toOptionSetDraftItems,
  type OptionSetDraftItem,
} from "./optionSetItemEditorTypes";

/**
 * Documentation for module export
 */
export interface OptionSetItemsEditorProps {
  items: readonly OptionSetDraftItem[];
  onItemsChange: (items: OptionSetDraftItem[]) => void;
  isEditable: boolean;
  readOnlyNote?: string | null;
  isSaving?: boolean;
  isDirty?: boolean;
  className?: string;
}

/**
 * The draft-version option table.
 */
export function OptionSetItemsEditor({
  items,
  onItemsChange,
  isEditable,
  readOnlyNote,
  isSaving = false,
  isDirty = false,
  className,
}: OptionSetItemsEditorProps) {
  const { t } = useI18n();
  const baseId = useId();
  const headingId = `${baseId}-heading`;
  const deactivateNoteId = `${baseId}-deactivate-note`;
  const reactivateNoteId = `${baseId}-reactivate-note`;
  const hintId = (field: HintedTextField) => `${baseId}-${field}-hint`;

  const issues = useMemo(() => collectOptionSetItemIssues(items), [items]);

  const commitRows = useCallback(
    (rows: OptionSetDraftItem[]) => {
      onItemsChange(rows.map((row, index) => ({ ...row, sortOrder: index })));
    },
    [onItemsChange]
  );

  const addRow = useCallback(() => {
    commitRows([...items, newOptionSetDraftItem()]);
  }, [commitRows, items]);

  const removeRow = useCallback(
    (rowId: string) => {
      commitRows(items.filter((row) => row.rowId !== rowId));
    },
    [commitRows, items]
  );

  const moveRow = useCallback(
    (index: number, delta: -1 | 1) => {
      const target = index + delta;
      if (target < 0 || target >= items.length) return;

      const next = [...items];
      const moved = next[index];
      next[index] = next[target];
      next[target] = moved;
      commitRows(next);
    },
    [commitRows, items]
  );

  const setTextField = useCallback(
    (rowId: string, field: EditableTextField, raw: string) => {
      commitRows(items.map((row) => (row.rowId === rowId ? withTextField(row, field, raw) : row)));
    },
    [commitRows, items]
  );

  const setStatus = useCallback(
    (rowId: string, status: OptionSetItemWritableStatus) => {
      commitRows(items.map((row) => (row.rowId === rowId ? { ...row, status } : row)));
    },
    [commitRows, items]
  );

  const messagesByRow = useMemo(() => {
    const map = new Map<string, Partial<Record<EditableTextField, string>>>();

    const put = (rowId: string, field: EditableTextField, message: string) => {
      const existing = map.get(rowId) ?? {};
      if (existing[field] === undefined) {
        existing[field] = message;
        map.set(rowId, existing);
      }
    };

    for (const issue of issues) {
      if (issue.rowId === null || issue.field === null) continue;
      put(issue.rowId, issue.field, t(optionSetItemIssueMessageKey(issue.code), issue.params));
    }

    return map;
  }, [issues, t]);

  const hasAtLeastOneIssue = issues.some((issue) => issue.code === "atLeastOne");
  const hasPersistedRow = items.some((row) => row.id !== null);
  const isMutable = isEditable && !isSaving;

  const addButton = (
    <Button type="button" size="sm" variant="secondary" onClick={addRow} disabled={!isMutable}>
      <Plus className="me-1.5 h-3.5 w-3.5" aria-hidden="true" />
      {t("optionSet.items.add")}
    </Button>
  );

  return (
    <section aria-labelledby={headingId} className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-col gap-1">
        <h3 id={headingId} className="text-sm font-semibold text-nx-ink">
          {t("optionSet.items.title")}
        </h3>
        <p className="text-xs text-nx-ink-2">{t("optionSet.items.description")}</p>
      </div>

      {!isEditable && readOnlyNote ? (
        <Alert>
          <AlertDescription>{readOnlyNote}</AlertDescription>
        </Alert>
      ) : null}

      {isEditable && isDirty ? (
        <p className="text-xs text-nx-ink-2">{t("optionSet.items.unsavedChanges")}</p>
      ) : null}

      {items.length === 0 ? (
        <>
          <EmptyState
            icon={ListOrdered}
            title={t("optionSet.items.noItems.title")}
            description={t("optionSet.items.noItems.description")}
            size="sm"
            bare
            action={isEditable ? addButton : undefined}
          />
          {isEditable && hasAtLeastOneIssue ? (
            <p className="text-sm text-destructive">{t("optionSet.items.validation.atLeastOne")}</p>
          ) : null}
        </>
      ) : (
        <>
          <div className="rounded-nx-md border border-nx-line">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">{t("optionSet.items.fields.sortOrder")}</TableHead>
                  <TableHead>{t("optionSet.items.fields.key")}</TableHead>
                  <TableHead>{t("optionSet.items.fields.labelEn")}</TableHead>
                  <TableHead>{t("optionSet.items.fields.labelAr")}</TableHead>
                  <TableHead>{t("optionSet.items.fields.color")}</TableHead>
                  <TableHead>{t("optionSet.items.fields.iconKey")}</TableHead>
                  <TableHead>{t("optionSet.items.fields.status")}</TableHead>
                  <TableHead className="text-end">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((row, index) => (
                  <OptionSetItemRow
                    key={row.rowId}
                    row={row}
                    index={index}
                    totalCount={items.length}
                    isEditable={isEditable}
                    isMutable={isMutable}
                    baseId={baseId}
                    messages={messagesByRow.get(row.rowId)}
                    onTextFieldChange={setTextField}
                    onStatusChange={setStatus}
                    onMoveRow={moveRow}
                    onRemoveRow={removeRow}
                    deactivateNoteId={deactivateNoteId}
                    reactivateNoteId={reactivateNoteId}
                    hintId={hintId}
                  />
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isEditable ? addButton : null}
            <span className="text-xs text-nx-ink-3">
              {t("optionSet.items.count", { count: items.length })}
            </span>
          </div>

          {isEditable ? (
            <div className="flex flex-col gap-1.5 text-xs text-nx-ink-3">
              {(Object.entries(OPTION_SET_ITEM_HINT_KEYS) as [HintedTextField, string][]).map(
                ([field, messageKey]) => (
                  <p key={field} id={hintId(field)}>
                    {t(messageKey)}
                  </p>
                )
              )}
            </div>
          ) : null}
        </>
      )}

      {isEditable ? (
        <div className="flex flex-col gap-1.5 text-xs text-nx-ink-3">
          <p id={deactivateNoteId}>{t("optionSet.items.deactivateDescription")}</p>
          <p id={reactivateNoteId}>{t("optionSet.items.reactivateDescription")}</p>
          {hasPersistedRow ? <p>{t("optionSet.items.deleteUnavailable")}</p> : null}
        </div>
      ) : null}
    </section>
  );
}
