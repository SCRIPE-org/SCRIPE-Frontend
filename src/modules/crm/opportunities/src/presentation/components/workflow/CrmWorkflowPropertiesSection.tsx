"use client";

import React from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";

export interface CrmWorkflowPropertiesSectionProps {
  t: (k: string) => string;
  properties: Record<string, string>;
  showForm: boolean;
  onToggleForm: () => void;
  propKey: string;
  onPropKeyChange: (val: string) => void;
  propVal: string;
  onPropValChange: (val: string) => void;
  onSaveProperty: () => void;
  onRemoveProperty: (key: string) => void;
  testIdPrefix: "stage" | "transition";
}

/**
 * Reusable Key-Value Properties editor component for Statuses and Transitions.
 */
export function CrmWorkflowPropertiesSection({
  t,
  properties,
  showForm,
  onToggleForm,
  propKey,
  onPropKeyChange,
  propVal,
  onPropValChange,
  onSaveProperty,
  onRemoveProperty,
  testIdPrefix,
}: CrmWorkflowPropertiesSectionProps) {
  const entries = Object.entries(properties);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-nx-ink">
          {t("crmOpportunities.pipelinesPage.propertiesHeader")} ({entries.length})
        </span>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 px-1.5 text-[10px]"
          onClick={onToggleForm}
          data-testid={`inspector-${testIdPrefix}-add-property-btn`}
        >
          <Plus className="w-3 h-3 me-1" />
          {t("crmOpportunities.pipelinesPage.addBtn")}
        </Button>
      </div>
      {entries.map(([pk, pv]) => (
        <div
          key={pk}
          className="flex items-center justify-between rounded border border-nx-line bg-nx-surface px-2 py-1 text-[10px] font-mono"
        >
          <span className="truncate">
            {pk}: {pv}
          </span>
          <Button
            size="icon"
            variant="ghost"
            className="h-4 w-4 text-destructive"
            onClick={() => onRemoveProperty(pk)}
          >
            <X className="w-2.5 h-2.5" />
          </Button>
        </div>
      ))}
      {showForm && (
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          <Input
            value={propKey}
            onChange={(e) => onPropKeyChange(e.target.value)}
            placeholder={t("crmOpportunities.pipelinesPage.propertyKeyPlaceholder")}
            className="h-7 text-xs font-mono"
            data-testid={`${testIdPrefix}-prop-key-input`}
          />
          <div className="flex items-center gap-1">
            <Input
              value={propVal}
              onChange={(e) => onPropValChange(e.target.value)}
              placeholder={t("crmOpportunities.pipelinesPage.propertyValuePlaceholder")}
              className="h-7 text-xs font-mono"
              data-testid={`${testIdPrefix}-prop-val-input`}
            />
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-[10px]"
              data-testid={`${testIdPrefix}-prop-save-btn`}
              onClick={onSaveProperty}
            >
              +
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
