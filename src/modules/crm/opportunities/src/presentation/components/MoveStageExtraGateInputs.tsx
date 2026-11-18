"use client";

import React from "react";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import { Checkbox } from "@core/ui/checkbox";
import { encodeCustomFieldName } from "@core/crud/customFieldsExtension";
import { CrmEntitySearchSelect, type CrmCustomFieldDefinition } from "@modules/crm";

interface MoveStageExtraGateInputsProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  isRtl: boolean;
  needsContactIdInput: boolean;
  selectedContactId: string;
  initialContactLabel?: string | null;
  onContactChange: (id: string) => void;
  needsAccountIdInput: boolean;
  selectedAccountId: string;
  initialAccountLabel?: string | null;
  onAccountChange: (id: string) => void;
  needsOwnerUserIdInput: boolean;
  selectedOwnerUserId: string;
  initialOwnerLabel?: string | null;
  onOwnerChange: (id: string) => void;
  needsDiscountPercentInput: boolean;
  discountPercent: string;
  onDiscountPercentChange: (val: string) => void;
  needsNextStepInput: boolean;
  nextStepSummary: string;
  onNextStepSummaryChange: (val: string) => void;
  requiredCustomFieldKeys: string[];
  storeCustomFields: CrmCustomFieldDefinition[];
  customFieldValues: Record<string, unknown>;
  onCustomFieldChange: (key: string, val: unknown) => void;
}

/** Renders extended CRM stage gate inputs (Contact, Account, Owner, Discount, Next Step, Custom Fields). */
export function MoveStageExtraGateInputs(p: MoveStageExtraGateInputsProps) {
  const { t, isRtl } = p;
  return (
    <>
      {p.needsContactIdInput && (
        <div className="space-y-1 sm:col-span-2">
          <Label className="text-xs">{t("crmOpportunities.dialogs.stage.contactGateLabel")} <span className="text-destructive">*</span></Label>
          <CrmEntitySearchSelect entityKind="contact" value={p.selectedContactId} initialLabel={p.initialContactLabel || undefined} onChange={p.onContactChange} accountId={p.selectedAccountId || undefined} enableQuickCreate quickCreateDefaultKind="contact" />
        </div>
      )}
      {p.needsAccountIdInput && (
        <div className="space-y-1 sm:col-span-2">
          <Label className="text-xs">{t("crmOpportunities.dialogs.stage.accountGateLabel")} <span className="text-destructive">*</span></Label>
          <CrmEntitySearchSelect entityKind="account" value={p.selectedAccountId} initialLabel={p.initialAccountLabel || undefined} onChange={p.onAccountChange} enableQuickCreate quickCreateDefaultKind="account" />
        </div>
      )}
      {p.needsOwnerUserIdInput && (
        <div className="space-y-1 sm:col-span-2">
          <Label className="text-xs">{t("crmOpportunities.dialogs.stage.ownerGateLabel")} <span className="text-destructive">*</span></Label>
          <CrmEntitySearchSelect entityKind="user" value={p.selectedOwnerUserId} initialLabel={p.initialOwnerLabel || undefined} onChange={p.onOwnerChange} />
        </div>
      )}
      {p.needsDiscountPercentInput && (
        <div className="space-y-1">
          <Label htmlFor="stage-gate-discount" className="text-xs">{t("crmOpportunities.dialogs.stage.discountGateLabel")} <span className="text-destructive">*</span></Label>
          <Input id="stage-gate-discount" type="number" min="0" max="100" step="0.1" value={p.discountPercent} onChange={(e) => p.onDiscountPercentChange(e.target.value)} className="h-8 text-xs font-mono" />
        </div>
      )}
      {p.needsNextStepInput && (
        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor="stage-gate-next-step" className="text-xs">{t("crmOpportunities.dialogs.stage.nextStepGateLabel")} <span className="text-destructive">*</span></Label>
          <Textarea id="stage-gate-next-step" rows={2} value={p.nextStepSummary} onChange={(e) => p.onNextStepSummaryChange(e.target.value)} placeholder={t("crmOpportunities.dialogs.stage.nextStepPlaceholder")} className="text-xs" />
        </div>
      )}
      {p.requiredCustomFieldKeys.map((cfKey) => {
        const def = p.storeCustomFields.find((f) => f.key === cfKey);
        const encodedKey = encodeCustomFieldName(cfKey);
        const label = def ? (isRtl && def.labelAr ? def.labelAr : def.labelEn) : cfKey;
        const vType = def?.valueType ?? "Text";
        const currentVal = p.customFieldValues[encodedKey] ?? p.customFieldValues[cfKey] ?? "";
        if (vType === "Boolean") {
          return (
            <div key={cfKey} className="flex items-center gap-2 sm:col-span-2 pt-1" data-testid={`move-stage-gate-cf-${cfKey}`}>
              <Checkbox id={`stage-gate-cf-${cfKey}`} checked={Boolean(currentVal)} onCheckedChange={(checked) => { p.onCustomFieldChange(encodedKey, Boolean(checked)); p.onCustomFieldChange(cfKey, Boolean(checked)); }} />
              <Label htmlFor={`stage-gate-cf-${cfKey}`} className="text-xs font-medium text-nx-ink cursor-pointer">{label} <span className="text-destructive">*</span></Label>
            </div>
          );
        }
        return (
          <div key={cfKey} className="space-y-1 sm:col-span-2" data-testid={`move-stage-gate-cf-${cfKey}`}>
            <Label htmlFor={`stage-gate-cf-${cfKey}`} className="text-xs">{label} <span className="text-destructive">*</span></Label>
            <Input
              id={`stage-gate-cf-${cfKey}`}
              type={vType === "Number" || vType === "Currency" ? "number" : vType === "Date" ? "date" : "text"}
              value={String(currentVal)}
              onChange={(e) => { p.onCustomFieldChange(encodedKey, e.target.value); p.onCustomFieldChange(cfKey, e.target.value); }}
              className="h-8 text-xs"
              data-testid={`move-stage-gate-cf-input-${cfKey}`}
            />
          </div>
        );
      })}
    </>
  );
}
