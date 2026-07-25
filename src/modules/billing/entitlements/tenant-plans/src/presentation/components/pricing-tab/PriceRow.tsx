/**
 * PriceRow — Editable row in the pricing matrix.
 *
 * Inline editing for amount, original amount, and promotional flag.
 */
"use client";

import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Switch } from "@core/ui/switch";
import { Label } from "@core/ui/label";
import { Trash2 } from "lucide-react";
import type { UpsertTenantPlanPriceRequest } from "../../../domain/entities/TenantPlanRequests";
import { formatAmount } from "../shared-helpers";

interface PriceRowProps {
  price: UpsertTenantPlanPriceRequest;
  currency: string;
  onUpdate: (updates: Partial<UpsertTenantPlanPriceRequest>) => void;
  onRemove: () => void;
  t: (key: string) => string;
}

/**
 * Presentation UI component rendering the price row.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function PriceRow({ price, currency, onUpdate, onRemove, t }: PriceRowProps) {
  const rowId = `price-row-${currency}-${price.billingCycle}`;
  const amountId = `${rowId}-amount`;
  const originalId = `${rowId}-original`;
  const promoId = `${rowId}-promo`;

  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex flex-1 items-center gap-3">
        <Badge variant="outline" className="shrink-0">
          {price.billingCycle}
        </Badge>

        {/* Amount */}
        <div className="flex items-center gap-1.5">
          <Label htmlFor={amountId} className="whitespace-nowrap text-xs text-nx-ink-2">
            {t("entitlements.tenantPlans.amount")}:
          </Label>
          <Input
            id={amountId}
            type="number"
            value={price.amount}
            onChange={(e) => onUpdate({ amount: parseFloat(e.target.value) || 0 })}
            className="h-8 w-28 text-end tabular-nums"
            min={0}
            step={0.01}
          />
        </div>

        {/* Original Amount (strikethrough price) */}
        <div className="flex items-center gap-1.5">
          <Label htmlFor={originalId} className="whitespace-nowrap text-xs text-nx-ink-2">
            {t("entitlements.tenantPlans.originalAmount")}:
          </Label>
          <Input
            id={originalId}
            type="number"
            value={price.originalAmount ?? ""}
            onChange={(e) =>
              onUpdate({
                originalAmount: e.target.value ? parseFloat(e.target.value) : undefined,
              })
            }
            className="h-8 w-28 text-end tabular-nums"
            min={0}
            step={0.01}
            placeholder="—"
          />
        </div>

        {/* Promotional flag */}
        <div className="flex items-center gap-1.5">
          <Label htmlFor={promoId} className="whitespace-nowrap text-xs text-nx-ink-2">
            {t("entitlements.tenantPlans.promo")}
          </Label>
          <Switch
            id={promoId}
            checked={price.isPromotional ?? false}
            onCheckedChange={(checked) => onUpdate({ isPromotional: checked })}
          />
        </div>
      </div>

      {/* Preview + Delete */}
      <div className="flex shrink-0 items-center gap-2">
        <span className="text-lg font-semibold tabular-nums text-success">
          {formatAmount(price.amount, currency)}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-nx-ink-2 hover:text-nx-danger"
          onClick={onRemove}
          aria-label={t("common.remove")}
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
