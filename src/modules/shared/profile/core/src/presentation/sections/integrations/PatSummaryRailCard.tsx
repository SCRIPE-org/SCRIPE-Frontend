"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import type { PatScopeOption } from "../../viewmodels/useIntegrationsFederationViewModel";
import {
  classifyPatScopeAccess,
  formatPatExpiryTargetDate,
  getLocalizedPatScopeName,
} from "../../utils/patScopeTaxonomy";
import { ShieldCheck, ShieldAlert, Network, CalendarDays, X, Lock } from "lucide-react";

/** Props for PatSummaryRailCard. */
export interface PatSummaryRailCardProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  language: string;
  selectedOptions: PatScopeOption[];
  expiresInDays: number;
  cidrCount: number;
  isCreatingToken: boolean;
  onRemoveScope: (code: string) => void;
  onClearAll: () => void;
  onOpenReview: () => void;
}

/**
 * Sticky right-rail live blast-radius summary & selected permissions basket
 * inside the full-page /account/integrations/new PAT Studio.
 */
export function PatSummaryRailCard({
  t,
  language,
  selectedOptions,
  expiresInDays,
  cidrCount,
  isCreatingToken,
  onRemoveScope,
  onClearAll,
  onOpenReview,
}: PatSummaryRailCardProps) {
  const hasSensitive = selectedOptions.some(
    (s) => classifyPatScopeAccess(s.action || s.code) === "sensitive"
  );
  const hasWrite = selectedOptions.some(
    (s) => classifyPatScopeAccess(s.action || s.code) !== "read"
  );

  const groupedByModule = new Map<string, PatScopeOption[]>();
  for (const s of selectedOptions) {
    const list = groupedByModule.get(s.moduleKey) ?? [];
    list.push(s);
    groupedByModule.set(s.moduleKey, list);
  }

  return (
    <Card
      data-testid="pat-summary-rail-card"
      className="border border-nx-line bg-nx-surface lg:sticky lg:top-18"
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold text-nx-ink">
          {t("profile.integrations.summaryRailTitle")}
        </CardTitle>
        <CardDescription className="text-xs text-nx-ink-3">
          {t("profile.integrations.summaryRailDesc")}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="rounded-xl border border-nx-line bg-nx-ground p-3 space-y-2.5">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 text-nx-ink-2">
              {hasSensitive ? (
                <ShieldAlert className="h-3.5 w-3.5 text-destructive shrink-0" aria-hidden="true" />
              ) : hasWrite ? (
                <Lock className="h-3.5 w-3.5 text-warning-strong shrink-0" aria-hidden="true" />
              ) : (
                <ShieldCheck className="h-3.5 w-3.5 text-success shrink-0" aria-hidden="true" />
              )}
              {t("profile.integrations.blastRadiusLabel")}
            </span>
            <Badge
              variant="outline"
              className={
                hasSensitive
                  ? "text-[10px] border-destructive/35 text-destructive"
                  : hasWrite
                    ? "text-[10px] border-warning-strong/35 text-warning-strong"
                    : "text-[10px] border-success/35 text-success"
              }
            >
              {hasSensitive
                ? t("profile.integrations.tierSensitive")
                : hasWrite
                  ? t("profile.integrations.tierWrite")
                  : t("profile.integrations.tierReadOnly")}
            </Badge>
          </div>

          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 text-nx-ink-2">
              <Network className="h-3.5 w-3.5 text-nx-accent shrink-0" aria-hidden="true" />
              {t("profile.integrations.networkPerimeterLabel")}
            </span>
            <span className="text-[11px] font-mono text-nx-ink">
              {cidrCount > 0
                ? t("profile.integrations.cidrPinnedCountBadge", { count: cidrCount })
                : t("profile.integrations.cidrUnrestrictedBadge")}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 text-nx-ink-2">
              <CalendarDays className="h-3.5 w-3.5 text-nx-accent shrink-0" aria-hidden="true" />
              {t("profile.integrations.expiresAt")}
            </span>
            <span className="text-[11px] font-mono text-nx-ink text-end">
              {formatPatExpiryTargetDate(expiresInDays, language)}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-nx-ink">
              {t("profile.integrations.selectedScopesSummaryTitle")} ({selectedOptions.length})
            </span>
            {selectedOptions.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClearAll}
                className="h-6 px-2 text-[11px] text-nx-ink-3"
              >
                {t("profile.integrations.clearSelectedBtn")}
              </Button>
            )}
          </div>

          {selectedOptions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-nx-line bg-nx-ground p-4 text-center">
              <p className="text-xs text-nx-ink-3">
                {t("profile.integrations.selectedBasketEmpty")}
              </p>
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-2.5 pe-1">
              {Array.from(groupedByModule.entries()).map(([modKey, items]) => (
                <div key={modKey} className="space-y-1">
                  <span className="text-[10px] font-semibold text-nx-ink-3 block px-0.5">
                    {modKey} ({items.length})
                  </span>
                  {items.map((item) => (
                    <div
                      key={item.code}
                      className="rounded-lg border border-nx-line bg-nx-ground px-2.5 py-1.5 flex items-center justify-between gap-2"
                    >
                      <span className="text-xs text-nx-ink truncate">
                        {getLocalizedPatScopeName(item, language)}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveScope(item.code)}
                        aria-label={t("profile.integrations.removeScopeAria", {
                          name: getLocalizedPatScopeName(item, language),
                        })}
                        className="h-5 w-5 p-0 shrink-0 text-nx-ink-3 hover:text-destructive"
                      >
                        <X className="h-3 w-3" aria-hidden="true" />
                      </Button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-nx-line flex flex-col gap-2">
          <Button
            type="button"
            data-testid="review-create-pat-btn"
            onClick={onOpenReview}
            disabled={isCreatingToken}
            className="w-full h-9 text-xs font-semibold bg-nx-accent-fill text-nx-on-fill"
          >
            {t("profile.integrations.reviewGenerateBtn")}
          </Button>
          <Button type="button" variant="outline" size="sm" asChild className="w-full h-8 text-xs">
            <Link href="/account/integrations">{t("profile.common.cancel")}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
