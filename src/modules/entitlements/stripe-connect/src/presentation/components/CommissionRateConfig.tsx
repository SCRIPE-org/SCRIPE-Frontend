/**
 * CommissionRateConfig
 * Dialog for setting or clearing a per-tenant commission rate override.
 * Shows the 3-level resolution hierarchy clearly.
 */
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Badge } from "@core/ui/badge";
import { Info, X } from "lucide-react";
import type { ConnectAccountListItem } from "../../domain/entities/ConnectAccount";

type RateTarget = ConnectAccountListItem & { commissionRate?: number };

interface CommissionRateConfigProps {
  account: RateTarget | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (tenantId: string, rate: number | null) => void;
  isSaving: boolean;
  t: (key: string) => string;
}

export function CommissionRateConfig({
  account,
  isOpen,
  onClose,
  onSave,
  isSaving,
  t,
}: CommissionRateConfigProps) {
  const [rateInput, setRateInput] = useState(
    account?.commissionRate != null
      ? (account.commissionRate * 100).toFixed(2)
      : ""
  );
  const [validationError, setValidationError] = useState("");

  if (!account) return null;

  const handleSave = () => {
    setValidationError("");
    if (rateInput === "" || rateInput === null) {
      onSave(account.tenantId, null);
      return;
    }
    const parsed = parseFloat(rateInput);
    if (isNaN(parsed) || parsed < 0 || parsed > 50) {
      setValidationError("Rate must be between 0% and 50%.");
      return;
    }
    onSave(account.tenantId, parsed / 100);
  };

  const handleClear = () => {
    setRateInput("");
    setValidationError("");
    onSave(account.tenantId, null);
  };

  const effectiveRatePercent =
    account.effectiveCommissionRate != null
      ? (account.effectiveCommissionRate * 100).toFixed(2)
      : "—";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{t("entitlements.stripeConnect.commissionRateOverride")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Effective rate display */}
          <div className="rounded-md border bg-muted/30 p-3 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Info className="h-4 w-4 text-muted-foreground" />
              {t("entitlements.stripeConnect.effectiveRate")}: {effectiveRatePercent}%
            </div>
            <p className="text-xs text-muted-foreground">
              {t("entitlements.stripeConnect.effectiveRateDesc")}
            </p>
            {/* Resolution chain badges */}
            <div className="flex flex-wrap gap-1 mt-1">
              {(["tenantOverride", "editionRate", "globalDefault"] as const).map((level) => (
                <Badge key={level} variant="outline" className="text-xs font-normal">
                  {t(`entitlements.stripeConnect.rateLevel.${level}`)}
                </Badge>
              ))}
            </div>
          </div>

          {/* Rate input */}
          <div className="space-y-1.5">
            <Label htmlFor="commission-rate">
              {t("entitlements.stripeConnect.commissionRateOverride")} (%)
            </Label>
            <div className="flex gap-2">
              <Input
                id="commission-rate"
                type="number"
                min={0}
                max={50}
                step={0.01}
                placeholder="e.g. 10.00"
                value={rateInput}
                onChange={(e) => {
                  setRateInput(e.target.value);
                  setValidationError("");
                }}
              />
              {rateInput !== "" && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setRateInput("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("entitlements.stripeConnect.commissionRateDesc")}
            </p>
            {validationError && (
              <p className="text-xs text-destructive">{validationError}</p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          {account.commissionRate != null && (
            <Button
              type="button"
              variant="outline"
              onClick={handleClear}
              disabled={isSaving}
              className="text-destructive hover:text-destructive"
            >
              {t("entitlements.stripeConnect.commissionRateCleared")}
            </Button>
          )}
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSaving}>
            {t("common.cancel") || "Cancel"}
          </Button>
          <Button type="button" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (t("common.saving") || "Saving...") : (t("common.save") || "Save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
