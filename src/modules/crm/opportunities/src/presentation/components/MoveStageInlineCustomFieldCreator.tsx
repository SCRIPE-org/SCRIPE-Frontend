"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import type { CrmCustomFieldDefinition, CrmCustomFieldValueType } from "@modules/crm";

interface MoveStageInlineCustomFieldCreatorProps {
  targetStageKey: string;
  onAddCrmCustomField?: (field: Omit<CrmCustomFieldDefinition, "id" | "createdAtIso">) => void;
  onRefetchOppCustomFields: () => void;
  disabled?: boolean;
  t: (key: string, params?: Record<string, unknown>) => string;
}

const VALUE_TYPES: CrmCustomFieldValueType[] = [
  "Text",
  "Number",
  "Currency",
  "Date",
  "Select",
  "Boolean",
];

/** Inline custom exit-gate field creator scoped to the selected pipeline stage in MoveStageDialog. */
export function MoveStageInlineCustomFieldCreator({
  targetStageKey,
  onAddCrmCustomField,
  onRefetchOppCustomFields,
  disabled,
  t,
}: MoveStageInlineCustomFieldCreatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [fieldKey, setFieldKey] = useState("");
  const [valueType, setValueType] = useState<CrmCustomFieldValueType>("Text");

  if (!onAddCrmCustomField) return null;

  const handleSave = () => {
    const trimmedLabel = label.trim();
    if (!trimmedLabel) return;
    const normalizedKey =
      fieldKey.trim() ||
      trimmedLabel
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
    if (!normalizedKey) return;

    onAddCrmCustomField({
      entityTypeKey: "crm.opportunity",
      key: normalizedKey,
      labelEn: trimmedLabel,
      labelAr: trimmedLabel,
      valueType,
      isRequired: true,
      defaultStageGateKey: targetStageKey || undefined,
    });
    onRefetchOppCustomFields();
    setLabel("");
    setFieldKey("");
    setValueType("Text");
    setIsOpen(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-xs text-nx-accent"
          onClick={() => setIsOpen((v) => !v)}
          disabled={disabled}
          data-testid="move-stage-add-cf-toggle-btn"
        >
          <Plus className="size-3.5 me-1" />
          {t("crmOpportunities.dialogs.stage.addFieldBtn")}
        </Button>
      </div>
      {isOpen && (
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 rounded-nx-md border border-dashed border-nx-line-hi bg-nx-raised/40 p-2.5">
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={t("crmOpportunities.dialogs.stage.fieldLabelPlaceholder")}
            className="h-8 text-xs sm:col-span-4"
            data-testid="move-stage-cf-label-input"
            disabled={disabled}
          />
          <Input
            value={fieldKey}
            onChange={(e) => setFieldKey(e.target.value)}
            placeholder={t("crmOpportunities.dialogs.stage.fieldKeyOptionalPlaceholder")}
            className="h-8 text-xs font-mono sm:col-span-4"
            data-testid="move-stage-cf-key-input"
            disabled={disabled}
          />
          <Select value={valueType} onValueChange={(v) => setValueType(v as CrmCustomFieldValueType)} disabled={disabled}>
            <SelectTrigger className="h-8 text-xs sm:col-span-2" data-testid="move-stage-cf-type-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VALUE_TYPES.map((vt) => (
                <SelectItem key={vt} value={vt} className="text-xs">
                  {vt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="h-8 text-xs sm:col-span-2"
            onClick={handleSave}
            disabled={disabled || !label.trim()}
            data-testid="move-stage-cf-save-btn"
          >
            {t("crmOpportunities.dialogs.stage.addBtn")}
          </Button>
        </div>
      )}
    </div>
  );
}
