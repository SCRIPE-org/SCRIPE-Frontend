"use client";

import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import type { PatScopeOption } from "../../viewmodels/useIntegrationsFederationViewModel";
import {
  classifyPatScopeAccess,
  formatPatExpiryTargetDate,
  getLocalizedPatScopeName,
} from "../../utils/patScopeTaxonomy";
import { Loader2, ShieldCheck } from "lucide-react";

/** Props for PatReviewGenerateModal. */
export interface PatReviewGenerateModalProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  language: string;
  open: boolean;
  tokenName: string;
  description: string;
  ownerScopeLabel: string;
  expiresInDays: number;
  cidrs: string[];
  selectedOptions: PatScopeOption[];
  isCreatingToken: boolean;
  submitError: string | null;
  onOpenChange: (open: boolean) => void;
  onConfirmGenerate: () => void;
}

/**
 * GitHub-inspired pre-generation security review confirmation dialog summarizing token
 * ownership, expiration, IP perimeter, and grouped bilingual scopes prior to Sudo minting.
 */
export function PatReviewGenerateModal({
  t,
  language,
  open,
  tokenName,
  description,
  ownerScopeLabel,
  expiresInDays,
  cidrs,
  selectedOptions,
  isCreatingToken,
  submitError,
  onOpenChange,
  onConfirmGenerate,
}: PatReviewGenerateModalProps) {
  const grouped = new Map<string, PatScopeOption[]>();
  for (const s of selectedOptions) {
    const list = grouped.get(s.moduleKey) ?? [];
    list.push(s);
    grouped.set(s.moduleKey, list);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="pat-review-generate-modal"
        className="sm:max-w-[560px] max-h-[88vh] overflow-y-auto bg-nx-surface border-nx-line p-6"
      >
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-nx-ink flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-nx-accent shrink-0" aria-hidden="true" />
            <span>{t("profile.integrations.reviewDialogTitle")}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-nx-ink-2">
            {t("profile.integrations.reviewDialogSubtitle", {
              name: tokenName,
              owner: ownerScopeLabel,
              date: formatPatExpiryTargetDate(expiresInDays, language),
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-1">
          {description.trim() && (
            <div className="rounded-lg border border-nx-line bg-nx-ground px-3 py-2 text-xs text-nx-ink-2">
              {description.trim()}
            </div>
          )}

          <div className="rounded-lg border border-nx-line bg-nx-ground px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-nx-ink-2">
              {t("profile.integrations.networkPerimeterLabel")}:
            </span>
            <span className="font-mono text-nx-ink" dir="ltr">
              {cidrs.length > 0 ? cidrs.join(", ") : t("profile.integrations.cidrUnrestrictedBadge")}
            </span>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pe-1">
            {Array.from(grouped.entries()).map(([modKey, items]) => (
              <div
                key={modKey}
                className="rounded-xl border border-nx-line bg-nx-ground overflow-hidden"
              >
                <div className="px-3.5 py-2 border-b border-nx-line bg-nx-raised flex items-center justify-between">
                  <span className="text-xs font-semibold text-nx-ink">
                    {t("profile.integrations.reviewGroupHeader", {
                      module: modKey,
                      count: items.length,
                    })}
                  </span>
                </div>
                <div className="divide-y divide-nx-line">
                  {items.map((item) => {
                    const tier = classifyPatScopeAccess(item.action || item.code);
                    const tierLabel =
                      tier === "read"
                        ? t("profile.integrations.tierReadOnly")
                        : tier === "sensitive"
                          ? t("profile.integrations.tierSensitive")
                          : t("profile.integrations.tierWrite");
                    return (
                      <div
                        key={item.code}
                        className="px-3.5 py-2 flex items-center justify-between gap-2 text-xs"
                      >
                        <span className="text-nx-ink font-medium truncate">
                          {getLocalizedPatScopeName(item, language)}
                        </span>
                        <Badge variant="outline" className="text-[10px] shrink-0">
                          {tierLabel}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {submitError && <p className="text-xs text-destructive font-medium">{submitError}</p>}
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isCreatingToken}
            className="text-xs"
          >
            {t("profile.common.cancel")}
          </Button>
          <Button
            type="button"
            size="sm"
            data-testid="confirm-create-pat-btn"
            onClick={onConfirmGenerate}
            disabled={isCreatingToken}
            className="text-xs font-semibold bg-nx-accent-fill text-nx-on-fill gap-1.5"
          >
            {isCreatingToken && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
            <span>{t("profile.integrations.mintTokenBtn")}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
