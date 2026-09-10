"use client";

import * as React from "react";
import { Code } from "lucide-react";
import { Button } from "@core/ui/button";
import { useI18n } from "@core/providers/i18n-provider";
import type { CustomField } from "../../domain/entities/CustomField";
import type { FieldVisibilityRuleAdmin } from "../../domain/entities/FieldInsight";
import { useFieldVisibilityRuleEditorState } from "./useFieldVisibilityRuleEditorState";
import { FieldVisibilityRuleFormFields } from "./FieldVisibilityRuleFormFields";

export interface FieldVisibilityRuleEditorProps {
  editingRule: FieldVisibilityRuleAdmin | null;
  siblingFields: readonly CustomField[];
  isSiblingFieldsLoading: boolean;
  isBusy: boolean;
  onCancel: () => void;
  onSave: (expressionJson: string, priority: number) => Promise<boolean>;
}

/**
 * Editor dialog component for creating and updating field visibility rules.
 * Allows switching between intuitive operator controls and advanced JSON definitions.
 */
export function FieldVisibilityRuleEditor({
  editingRule,
  siblingFields,
  isSiblingFieldsLoading,
  isBusy,
  onCancel,
  onSave,
}: FieldVisibilityRuleEditorProps): React.ReactElement {
  const { t } = useI18n();

  const {
    selectedOperandKey,
    setSelectedOperandKey,
    selectedOperator,
    setSelectedOperator,
    valueInput,
    setValueInput,
    priorityInput,
    setPriorityInput,
    isAdvancedJson,
    setIsAdvancedJson,
    rawJsonInput,
    setRawJsonInput,
    formError,
    getOperatorLabel,
    handleSave,
  } = useFieldVisibilityRuleEditorState({
    editingRule,
    siblingFields,
    onSave,
  });

  return (
    <div className="space-y-4 rounded-lg border border-primary/30 bg-primary/5 p-4">
      <div className="flex items-center justify-between border-b border-primary/20 pb-2">
        <h4 className="text-sm font-semibold text-nx-ink">
          {editingRule
            ? t("customField.visibilityRules.editRuleTitle")
            : t("customField.visibilityRules.addRuleTitle")}
        </h4>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-nx-ink-3"
          onClick={() => setIsAdvancedJson(!isAdvancedJson)}
        >
          <Code className="me-1 h-3 w-3" />
          {isAdvancedJson
            ? t("customField.visibilityRules.formMode")
            : t("customField.visibilityRules.advancedJson")}
        </Button>
      </div>

      {formError && (
        <div className="rounded-md bg-destructive/10 p-2.5 text-xs text-destructive">
          {formError}
        </div>
      )}

      <FieldVisibilityRuleFormFields
        isAdvancedJson={isAdvancedJson}
        rawJsonInput={rawJsonInput}
        onRawJsonChange={setRawJsonInput}
        isBusy={isBusy}
        isSiblingFieldsLoading={isSiblingFieldsLoading}
        siblingFields={siblingFields}
        selectedOperandKey={selectedOperandKey}
        onOperandChange={setSelectedOperandKey}
        selectedOperator={selectedOperator}
        onOperatorChange={setSelectedOperator}
        getOperatorLabel={getOperatorLabel}
        valueInput={valueInput}
        onValueChange={setValueInput}
        priorityInput={priorityInput}
        onPriorityChange={setPriorityInput}
      />

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={isBusy}
        >
          {t("common.cancel")}
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={handleSave}
          disabled={isBusy}
        >
          {editingRule ? t("common.save") : t("customField.visibilityRules.saveRule")}
        </Button>
      </div>
    </div>
  );
}
