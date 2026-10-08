"use client";

import { useCallback, useMemo } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import {
  OptionSetItemsEditor,
  collectOptionSetItemIssues,
  toOptionSetItemInputs as draftRowsToItemInputs,
  type OptionSetDraftItem,
} from "./OptionSetItemsEditor";
import type { OptionSetItemInput } from "../../domain/interfaces/IOptionSetRepository";

/**
 * Documentation for module export
 */
export interface OptionSetNewDraftSectionProps {
  newDraftRows: OptionSetDraftItem[];
  setNewDraftRows: (rows: OptionSetDraftItem[] | null) => void;
  isCreatingVersion: boolean;
  onCreateVersion: (items: OptionSetItemInput[]) => Promise<string | null>;
  onCreated: (createdId: string) => void;
  headingId: string;
}

/**
 * Documentation for OptionSetNewDraftSection
 */
export function OptionSetNewDraftSection({
  newDraftRows,
  setNewDraftRows,
  isCreatingVersion,
  onCreateVersion,
  onCreated,
  headingId,
}: OptionSetNewDraftSectionProps) {
  const { t } = useI18n();

  const newDraftIssues = useMemo(
    () => collectOptionSetItemIssues(newDraftRows),
    [newDraftRows]
  );

  const handleCreateVersion = useCallback(async () => {
    if (collectOptionSetItemIssues(newDraftRows).length > 0) return;

    const createdId = await onCreateVersion(draftRowsToItemInputs(newDraftRows));
    if (createdId === null) return;

    setNewDraftRows(null);
    onCreated(createdId);
  }, [newDraftRows, onCreateVersion, onCreated, setNewDraftRows]);

  return (
    <div
      className="bg-nx-raised-2/40 flex flex-col gap-3 rounded-nx-md border border-nx-line p-3"
      aria-labelledby={headingId}
      role="group"
    >
      <h3 id={headingId} className="text-sm font-semibold text-nx-ink">
        {t("optionSet.versions.createDraft")}
      </h3>
      <p className="text-xs text-nx-ink-subtle">
        {t("optionSet.versions.newDraftHint")}
      </p>

      <OptionSetItemsEditor
        items={newDraftRows}
        onItemsChange={setNewDraftRows}
        isEditable
        isSaving={isCreatingVersion}
        isDirty={false}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          onClick={handleCreateVersion}
          disabled={isCreatingVersion || newDraftIssues.length > 0}
        >
          {t("optionSet.versions.saveDraft")}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setNewDraftRows(null)}
          disabled={isCreatingVersion}
        >
          {t("common.cancel")}
        </Button>
      </div>
    </div>
  );
}
