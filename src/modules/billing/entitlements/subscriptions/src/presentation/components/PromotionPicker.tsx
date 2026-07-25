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
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { Tag } from "lucide-react";
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
        label: t("entitlements.promotions.noPromotion"),
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
          <Tag className="h-3.5 w-3.5 text-nx-accent" aria-hidden="true" />
          {t("entitlements.promotions.title")}
        </Label>

        {isLoading ? (
          <div className="flex items-center gap-2 py-2 text-sm text-nx-ink-2">
            <LoadingSpinner size="inline" />
            {t("common.loading")}
          </div>
        ) : promotions.length === 0 ? (
          <p className="py-1 text-sm text-nx-ink-2">
            {t("entitlements.promotions.noPromotionsAvailable")}
          </p>
        ) : (
          <GenericSelect
            type="single"
            options={options}
            value={selectedPromotionId ?? NONE_VALUE}
            onValueChange={(v: string) => onPromotionChange(v === NONE_VALUE ? null : v)}
            placeholder={t("entitlements.promotions.selectPromotion")}
          />
        )}
      </div>

      {/* Conditional promo code input */}
      {requiresPromoCode && selectedPromotion && (
        <div className="space-y-2">
          <Label className="text-sm">{t("entitlements.promotions.promoCode")}</Label>
          <Input
            value={promoCode}
            onChange={(e) => onPromoCodeChange(e.target.value.toUpperCase())}
            placeholder={t("entitlements.promotions.enterCode")}
            className="font-mono uppercase"
          />
        </div>
      )}

      {/* Discount preview */}
      {selectedPromotion && (
        <div className="flex items-center gap-2 rounded-nx-md border border-success/30 bg-success/10 p-2">
          <Tag className="h-4 w-4 text-success" aria-hidden="true" />
          <span className="text-sm text-success">
            {selectedPromotion.name} —{" "}
            {selectedPromotion.type === "Percentage"
              ? `${selectedPromotion.discountValue}% off`
              : `$${selectedPromotion.discountValue} off`}
            {!selectedPromotion.requiresCode && (
              <span className="ms-1 text-xs text-nx-ink-3">
                ({t("entitlements.promotions.autoApplied")})
              </span>
            )}
          </span>
        </div>
      )}
    </div>
  );
}
