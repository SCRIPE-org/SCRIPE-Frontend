/**
 * Promotion Picker
 *
 * Reusable promotion selection UI with promo code input and discount preview.
 * Uses the platform's GenericSelect for consistency with architecture rules.
 * Used in Assign and Change dialogs.
 */
"use client";

import { useMemo } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { GenericSelect } from "@core/crud/components/generic-select";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Loader2, Tag } from "lucide-react";
import type { EditionPromotionData } from "@modules/entitlements/core";

interface PromotionPickerProps {
  isLoading: boolean;
  promotions: EditionPromotionData[];
  selectedPromotionId: string | null;
  onPromotionChange: (id: string | null) => void;
  selectedPromotion: EditionPromotionData | null;
  requiresPromoCode: boolean;
  promoCode: string;
  onPromoCodeChange: (code: string) => void;
}

const NONE_VALUE = "__none__";

/**
 * Presentation UI component rendering the promotion picker.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function PromotionPicker({
  isLoading,
  promotions,
  selectedPromotionId,
  onPromotionChange,
  selectedPromotion,
  requiresPromoCode,
  promoCode,
  onPromoCodeChange,
}: PromotionPickerProps) {
  const { t } = useI18n();

  const options = useMemo(
    () => [
      {
        value: NONE_VALUE,
        label: t("entitlements.promotions.noPromotion") || "No promotion",
      },
      ...promotions.map((promo) => ({
        value: promo.id,
        label: `${promo.name} — ${promo.type === "Percentage" ? `${promo.discountValue}% off` : `$${promo.discountValue} off`}${promo.requiresCode ? " (Code)" : ""}`,
      })),
    ],
    [promotions, t]
  );

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label className="flex items-center gap-1.5">
          <Tag className="h-3.5 w-3.5 text-primary" />
          {t("entitlements.promotions.title") || "Promotion"}
        </Label>

        {isLoading ? (
          <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            {t("common.loading") || "Loading promotions..."}
          </div>
        ) : promotions.length === 0 ? (
          <p className="py-1 text-sm text-muted-foreground">
            {t("entitlements.promotions.noPromotionsAvailable") ||
              "No promotions available for this plan"}
          </p>
        ) : (
          <GenericSelect
            type="single"
            options={options}
            value={selectedPromotionId ?? NONE_VALUE}
            onValueChange={(v: string) => onPromotionChange(v === NONE_VALUE ? null : v)}
            placeholder={t("entitlements.promotions.selectPromotion") || "No promotion"}
          />
        )}
      </div>

      {/* Conditional promo code input */}
      {requiresPromoCode && selectedPromotion && (
        <div className="space-y-2">
          <Label className="text-sm">
            {t("entitlements.promotions.promoCode") || "Promo Code"}
          </Label>
          <Input
            value={promoCode}
            onChange={(e) => onPromoCodeChange(e.target.value.toUpperCase())}
            placeholder={t("entitlements.promotions.enterCode") || "Enter the promo code"}
            className="font-mono uppercase"
          />
        </div>
      )}

      {/* Discount preview */}
      {selectedPromotion && (
        <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 p-2 dark:border-green-800 dark:bg-green-950/30">
          <Tag className="h-4 w-4 text-green-600" />
          <span className="text-sm text-green-700 dark:text-green-400">
            {selectedPromotion.name} —{" "}
            {selectedPromotion.type === "Percentage"
              ? `${selectedPromotion.discountValue}% off`
              : `$${selectedPromotion.discountValue} off`}
            {!selectedPromotion.requiresCode && (
              <span className="ms-1 text-xs opacity-75">(auto-applied)</span>
            )}
          </span>
        </div>
      )}
    </div>
  );
}
