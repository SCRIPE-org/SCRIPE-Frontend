"use client";

import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { CRM_CURRENCY_OPTIONS } from "@modules/crm";
import type { CreateOpportunityInput } from "../../domain/entities/OpportunityEntity";

interface CreateOpportunityTitleAmountFieldsProps {
  t: (key: string) => string;
  formData: CreateOpportunityInput;
  defaultDealCurrency: string;
  errors: Record<string, string>;
  onChangeFormData: (updater: (prev: CreateOpportunityInput) => CreateOpportunityInput) => void;
}

/** Title, estimated amount, and deal currency inputs for CreateOpportunityDialog. */
export function CreateOpportunityTitleAmountFields({
  t,
  formData,
  defaultDealCurrency,
  errors,
  onChangeFormData,
}: CreateOpportunityTitleAmountFieldsProps) {
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="opp-title">
          {t("crmOpportunities.dialogs.create.titleLabel")} <span className="text-destructive">*</span>
        </Label>
        <Input
          id="opp-title"
          placeholder={t("crmOpportunities.dialogs.create.titlePlaceholder")}
          value={formData.title}
          onChange={(e) => onChangeFormData((prev) => ({ ...prev, title: e.target.value }))}
          aria-invalid={Boolean(errors.title)}
        />
        {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="opp-amount">
            {t("crmOpportunities.dialogs.create.amountLabel")} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="opp-amount"
            type="number"
            min="0"
            step="any"
            placeholder={t("crmOpportunities.dialogs.create.amountPlaceholder")}
            value={formData.estimatedAmount || ""}
            onChange={(e) =>
              onChangeFormData((prev) => ({ ...prev, estimatedAmount: parseFloat(e.target.value) || 0 }))
            }
            aria-invalid={Boolean(errors.estimatedAmount)}
          />
          {errors.estimatedAmount && <p className="text-xs text-destructive">{errors.estimatedAmount}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="opp-currency">{t("crmOpportunities.dialogs.create.currencyLabel")}</Label>
          <Select
            value={formData.currencyCode || defaultDealCurrency || "SAR"}
            onValueChange={(val) => onChangeFormData((prev) => ({ ...prev, currencyCode: val }))}
          >
            <SelectTrigger id="opp-currency" data-testid="create-opp-currency-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CRM_CURRENCY_OPTIONS.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.code} — {c.name} ({c.symbol})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
}
