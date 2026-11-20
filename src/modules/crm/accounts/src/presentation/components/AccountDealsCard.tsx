"use client";

import { Card } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Briefcase, Calendar } from "lucide-react";
import type { CrmAccountOpportunityItem } from "../../domain/entities/AccountEntity";

interface AccountDealsCardProps {
  readonly opportunities?: CrmAccountOpportunityItem[];
  readonly autoConvertToBase: boolean;
  readonly baseCurrency: string;
  readonly convertAmount: (amount: number, from: string, to: string) => number;
  readonly language: string;
  readonly t: (key: string) => string;
  readonly onSelectOpportunity: (id: string) => void;
  readonly onViewAllOpportunities?: () => void;
}

/** Card listing linked opportunities and currency-converted pipeline value for an Account. */
export function AccountDealsCard({
  opportunities = [],
  autoConvertToBase,
  baseCurrency,
  convertAmount,
  language,
  t,
  onSelectOpportunity,
  onViewAllOpportunities,
}: AccountDealsCardProps) {
  const isAr = language === "ar";

  return (
    <Card className="rounded-nx-lg border border-nx-line bg-nx-surface overflow-hidden space-y-3 p-4">
      <div className="flex items-center justify-between border-b border-nx-line pb-3">
        <div className="flex items-center gap-2">
          <Briefcase className="size-4 text-nx-accent" />
          <h2 className="text-sm font-bold text-nx-ink">{t("crmAccounts.detail.dealsTitle")}</h2>
        </div>
        <Badge variant="outline" className="border-nx-line text-nx-ink-3 font-mono text-[11px]">
          {Number(opportunities.length).toLocaleString(isAr ? "ar-SA" : "en-US")}
        </Badge>
      </div>

      {opportunities.length === 0 ? (
        <div className="py-6 text-center space-y-2.5">
          <p className="text-xs text-nx-ink-3">{t("crmAccounts.detail.noDeals")}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => (onViewAllOpportunities ? onViewAllOpportunities() : onSelectOpportunity(""))}
            className="h-7 text-xs gap-1.5 border-nx-line hover:border-nx-accent"
          >
            <Briefcase className="size-3 text-nx-accent" />
            <span>{t("crmAccounts.detail.viewOpportunitiesBtn")}</span>
          </Button>
        </div>
      ) : (
        <div className="divide-y divide-nx-line">
          {opportunities.map((opp) => (
            <div key={opp.id} className="py-1 first:pt-0 last:pb-0">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onSelectOpportunity(opp.id)}
                className="group h-auto w-full justify-between gap-3 whitespace-normal rounded-nx-md px-1 py-2 text-start font-normal text-nx-ink hover:bg-nx-raised/30 hover:text-nx-ink"
              >
                <span className="block min-w-0">
                  <span className="block text-xs font-semibold text-nx-ink group-hover:text-nx-accent">
                    {opp.title}
                  </span>
                  <span className="mt-0.5 flex items-center gap-1.5">
                    <Badge
                      variant="outline"
                      className="border-nx-line bg-nx-raised py-0 px-1.5 text-[10px] text-nx-ink-2"
                    >
                      {isAr && opp.stageLabelAr ? opp.stageLabelAr : opp.stageLabelEn}
                    </Badge>
                    <span className="text-[10px] font-medium uppercase text-nx-ink-3">
                      {t(`crmAccounts.statuses.${opp.status}`)}
                    </span>
                  </span>
                </span>
                <span className="block shrink-0 text-end">
                  <span className="block font-mono text-xs font-bold text-nx-ink">
                    {opp.estimatedAmount != null
                      ? `${opp.estimatedAmount.toLocaleString(isAr ? "ar-SA" : "en-US")} ${opp.currencyCode}`
                      : "••••••"}
                  </span>
                  {autoConvertToBase &&
                    opp.estimatedAmount != null &&
                    opp.currencyCode.toUpperCase() !== baseCurrency.toUpperCase() && (
                      <span className="block font-mono text-[10px] text-nx-accent">
                        ≈ {baseCurrency}{" "}
                        {convertAmount(opp.estimatedAmount, opp.currencyCode, baseCurrency).toLocaleString(
                          isAr ? "ar-SA" : "en-US"
                        )}
                      </span>
                    )}
                  {opp.targetCloseDate && new Date(opp.targetCloseDate).getFullYear() > 1900 && (
                    <span className="mt-0.5 flex items-center justify-end gap-1 text-[10px] text-nx-ink-3">
                      <Calendar className="size-2.5" aria-hidden="true" />
                      {new Date(opp.targetCloseDate).toLocaleDateString(isAr ? "ar-SA" : "en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  )}
                </span>
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
