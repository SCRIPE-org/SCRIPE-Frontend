"use client";

import React from "react";
import { Plus, Trash2, X } from "lucide-react";
import { Button } from "@core/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@core/ui/dialog";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";

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
 * Reusable Key-Value Properties editor & dedicated modal for Statuses and Transitions (Jira Screenshot 5 parity, <160 lines).
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
  const modalTitle = testIdPrefix === "transition" ? t("crmOpportunities.pipelinesPage.transitionPropertiesModalTitle") : t("crmOpportunities.pipelinesPage.statusPropertiesModalTitle");

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
          data-testid={`${testIdPrefix}-prop-row-${pk}`}
        >
          <span className="truncate">{pk}: {pv}</span>
          <Button size="icon" variant="ghost" className="h-4 w-4 text-destructive" onClick={() => onRemoveProperty(pk)}>
            <X className="w-2.5 h-2.5" />
          </Button>
        </div>
      ))}

      <Dialog open={showForm} onOpenChange={onToggleForm}>
        <DialogContent className="max-w-lg z-[10003]" data-testid={`${testIdPrefix}-properties-modal`}>
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">{modalTitle}</DialogTitle>
            <DialogDescription className="text-xs">
              {t("crmOpportunities.pipelinesPage.propertiesModalDesc")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {entries.length > 0 && (
              <div className="space-y-1.5">
                {entries.map(([pk, pv]) => (
                  <div key={pk} className="grid grid-cols-12 items-center gap-2 rounded border border-nx-line bg-nx-raised/40 px-2.5 py-1.5 text-xs font-mono">
                    <span className="col-span-5 truncate font-semibold text-nx-ink">{pk}</span>
                    <span className="col-span-6 truncate text-nx-ink-2">{pv}</span>
                    <Button size="icon" variant="ghost" className="col-span-1 h-6 w-6 text-destructive" onClick={() => onRemoveProperty(pk)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2 pt-1">
              <h4 className="text-xs font-semibold text-nx-ink">{t("crmOpportunities.pipelinesPage.addNewProperty")}</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">{t("crmOpportunities.pipelinesPage.propertyKeyLabel")}</Label>
                <Input
                  value={propKey}
                  onChange={(e) => onPropKeyChange(e.target.value)}
                  placeholder={t("crmOpportunities.pipelinesPage.propertyKeyPlaceholder")}
                  className="h-8 text-xs font-mono"
                  data-testid={`${testIdPrefix}-prop-key-input`}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">{t("crmOpportunities.pipelinesPage.propertyValLabel")}</Label>
                <Input
                  value={propVal}
                  onChange={(e) => onPropValChange(e.target.value)}
                  placeholder={t("crmOpportunities.pipelinesPage.propertyValuePlaceholder")}
                  className="h-8 text-xs font-mono"
                  data-testid={`${testIdPrefix}-prop-val-input`}
                />
              </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button size="sm" variant="outline" onClick={onToggleForm}>{t("crmOpportunities.pipelinesPage.discardBtn")}</Button>
            <Button
              size="sm"
              data-testid={`${testIdPrefix}-prop-save-btn`}
              onClick={onSaveProperty}
            >
              {t("crmOpportunities.pipelinesPage.savePropertyBtn")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

