/**
 * Refund Options
 *
 * Reusable refund type selection with optional custom amount input.
 * Used in Suspend and Cancel dialogs.
 */
"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { RadioGroup, RadioGroupItem } from "@core/ui/radio-group";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { DollarSign } from "lucide-react";

interface RefundOptionsProps {
  refundType: string;
  onRefundTypeChange: (value: string) => void;
  customRefundAmount: string;
  onCustomRefundAmountChange: (value: string) => void;
  /** Prefix for radio button IDs to avoid collisions */
  idPrefix: string;
}

export function RefundOptions({
  refundType,
  onRefundTypeChange,
  customRefundAmount,
  onCustomRefundAmountChange,
  idPrefix,
}: RefundOptionsProps) {
  const { t } = useI18n();

  return (
    <>
      <div className="space-y-2">
        <Label className="flex items-center gap-1.5">
          <DollarSign className="h-3.5 w-3.5 text-primary" />
          {t("entSubscriptions.refundType") || "Refund"}
        </Label>
        <RadioGroup value={refundType} onValueChange={onRefundTypeChange}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="None" id={`${idPrefix}-refund-none`} />
            <Label htmlFor={`${idPrefix}-refund-none`} className="text-sm font-normal">
              {t("entSubscriptions.noRefund") || "No Refund"}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Full" id={`${idPrefix}-refund-full`} />
            <Label htmlFor={`${idPrefix}-refund-full`} className="text-sm font-normal">
              {t("entSubscriptions.fullRefund") || "Full Refund"}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="ProRata" id={`${idPrefix}-refund-prorata`} />
            <Label htmlFor={`${idPrefix}-refund-prorata`} className="text-sm font-normal">
              {t("entSubscriptions.proRataRefund") || "Pro-rata Refund (remaining time)"}
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Custom amount — only visible for ProRata */}
      {refundType === "ProRata" && (
        <div className="space-y-2">
          <Label className="text-sm">
            {t("entSubscriptions.customRefundAmount") ||
              "Custom Amount (optional — leave empty for auto-calculate)"}
          </Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={customRefundAmount}
            onChange={(e) => onCustomRefundAmountChange(e.target.value)}
            placeholder={t("entSubscriptions.customAmountPlaceholder") || "e.g., 50.00"}
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground">
            {t("entSubscriptions.customAmountHint") ||
              "If empty, the system auto-calculates based on remaining subscription time."}
          </p>
        </div>
      )}
    </>
  );
}
