"use client";

import React from "react";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { cn } from "@core/common/utils";
import { CRM_CURRENCY_OPTIONS } from "@modules/crm";
import type { DealKind } from "../../domain/entities/LeadEntity";

export interface ConvertLeadFormFieldsProps {
  t: (key: string, params?: Record<string, any>) => string;
  title: string;
  onTitleChange: (val: string) => void;
  amount: number;
  onAmountChange: (val: number) => void;
  currency: string;
  onCurrencyChange: (val: string) => void;
  baseCurrency: string;
  conversionPreview: { isDifferent?: boolean; formattedConverted: string };
  closeDate: string;
  onCloseDateChange: (val: string) => void;
  targetStageKey: string;
  onTargetStageKeyChange: (val: string) => void;
  conversionStageOptions: Array<{ key: string; label: string; requiresParty: boolean }>;
  dealKind: DealKind;
  onDealKindChange: (val: DealKind) => void;
  dealKinds: Array<{ key: DealKind; label: string }>;
  rationale: string;
  onRationaleChange: (val: string) => void;
}

export function ConvertLeadFormFields({
  t,
  title,
  onTitleChange,
  amount,
  onAmountChange,
  currency,
  onCurrencyChange,
  baseCurrency,
  conversionPreview,
  closeDate,
  onCloseDateChange,
  targetStageKey,
  onTargetStageKeyChange,
  conversionStageOptions,
  dealKind,
  onDealKindChange,
  dealKinds,
  rationale,
  onRationaleChange,
}: ConvertLeadFormFieldsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
      <div className="sm:col-span-2 space-y-1.5">
        <Label htmlFor="opp-title" className="text-xs font-semibold text-nx-ink">
          {t("crmLeads.conversion.titleLabel")} *
        </Label>
        <Input
          id="opp-title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder={t("crmLeads.conversion.titlePlaceholder")}
          className="h-9 text-xs border-nx-line bg-nx-ground text-nx-ink"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="opp-amount" className="text-xs font-semibold text-nx-ink">
          {t("crmLeads.conversion.amountLabel")} ({currency}) *
        </Label>
        <div className="flex items-center gap-1.5">
          <Select value={currency} onValueChange={onCurrencyChange}>
            <SelectTrigger aria-label="Currency" className="h-9 w-24 text-xs border-nx-line bg-nx-ground text-nx-ink shrink-0 font-mono">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CRM_CURRENCY_OPTIONS.map((curr) => (
                <SelectItem key={curr.code} value={curr.code}>
                  {curr.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            id="opp-amount"
            type="number"
            min="0.01"
            step="any"
            value={amount || ""}
            onChange={(e) => onAmountChange(Number(e.target.value))}
            placeholder={t("crmLeads.conversion.amountPlaceholder")}
            className="h-9 text-xs border-nx-line bg-nx-ground text-nx-ink flex-1 font-mono"
            required
          />
        </div>
        {conversionPreview.isDifferent && amount > 0 && (
          <div
            data-testid="convert-lead-conversion-preview"
            className="text-[11px] font-mono tabular-nums text-nx-accent bg-nx-accent-wash border border-nx-accent/30 rounded-nx-sm px-2 py-1"
          >
            ≈ {conversionPreview.formattedConverted} ({t("crmLeads.conversion.baseCurrencyLabel")} {baseCurrency})
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="opp-close-date" className="text-xs font-semibold text-nx-ink">
          {t("crmLeads.conversion.closeDateLabel")}
        </Label>
        <Input
          id="opp-close-date"
          type="date"
          value={closeDate}
          onChange={(e) => onCloseDateChange(e.target.value)}
          className="h-9 text-xs border-nx-line bg-nx-ground text-nx-ink"
        />
      </div>

      <div className="sm:col-span-2 space-y-1.5">
        <Label htmlFor="opp-target-stage" className="text-xs font-semibold text-nx-ink">
          {t("crmLeads.conversion.initialStageLabel")}
        </Label>
        <Select value={targetStageKey} onValueChange={onTargetStageKeyChange}>
          <SelectTrigger id="opp-target-stage" className="h-9 text-xs border-nx-line bg-nx-ground text-nx-ink">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {conversionStageOptions.map((stg) => (
              <SelectItem key={stg.key} value={stg.key}>
                {stg.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="sm:col-span-2 space-y-1.5">
        <Label className="text-xs font-semibold text-nx-ink">{t("crmLeads.conversion.dealKindLabel")}</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {dealKinds.map((dk) => {
            const isSelected = dealKind === dk.key;
            return (
              <Button
                key={dk.key}
                type="button"
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => onDealKindChange(dk.key)}
                className={cn(
                  "h-8 px-2 text-xs font-medium rounded-nx-md border",
                  isSelected
                    ? "border-nx-accent/40 bg-nx-accent-wash text-nx-accent font-semibold"
                    : "border-nx-line bg-nx-surface text-nx-ink hover:bg-nx-raised",
                )}
              >
                {dk.label}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="sm:col-span-2 space-y-1.5">
        <Label htmlFor="opp-rationale" className="text-xs font-semibold text-nx-ink">
          {t("crmLeads.conversion.rationaleLabel")}
        </Label>
        <Textarea
          id="opp-rationale"
          rows={2}
          value={rationale}
          onChange={(e) => onRationaleChange(e.target.value)}
          placeholder={t("crmLeads.conversion.rationalePlaceholder")}
          className="text-xs border-nx-line bg-nx-ground text-nx-ink resize-none"
        />
      </div>
    </div>
  );
}
