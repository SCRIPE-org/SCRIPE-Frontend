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

export function PriceRow({ price, currency, onUpdate, onRemove, t }: PriceRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex flex-1 items-center gap-3">
        <Badge variant="outline" className="shrink-0">
          {price.billingCycle}
        </Badge>

        {/* Amount */}
        <div className="flex items-center gap-1.5">
          <Label className="whitespace-nowrap text-xs text-muted-foreground">
            {t("entitlements.tenantPlans.amount") || "Amount"}:
          </Label>
          <Input
            type="number"
            value={price.amount}
            onChange={(e) => onUpdate({ amount: parseFloat(e.target.value) || 0 })}
            className="h-8 w-28 text-right tabular-nums"
            min={0}
            step={0.01}
          />
        </div>

        {/* Original Amount (strikethrough price) */}
        <div className="flex items-center gap-1.5">
          <Label className="whitespace-nowrap text-xs text-muted-foreground">
            {t("entitlements.tenantPlans.originalAmount") || "Original"}:
          </Label>
          <Input
            type="number"
            value={price.originalAmount ?? ""}
            onChange={(e) =>
              onUpdate({
                originalAmount: e.target.value ? parseFloat(e.target.value) : undefined,
              })
            }
            className="h-8 w-28 text-right tabular-nums"
            min={0}
            step={0.01}
            placeholder="—"
          />
        </div>

        {/* Promotional flag */}
        <div className="flex items-center gap-1.5">
          <Label className="whitespace-nowrap text-xs text-muted-foreground">
            {t("entitlements.tenantPlans.promo") || "Promo"}
          </Label>
          <Switch
            checked={price.isPromotional ?? false}
            onCheckedChange={(checked) => onUpdate({ isPromotional: checked })}
          />
        </div>
      </div>

      {/* Preview + Delete */}
      <div className="flex shrink-0 items-center gap-2">
        <span className="text-lg font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
          {formatAmount(price.amount, currency)}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
          title={t("common.remove") || "Remove"}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
