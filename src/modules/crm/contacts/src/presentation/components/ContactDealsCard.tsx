"use client";

import { Card } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Briefcase, Calendar } from "lucide-react";
import type { CrmContactOpportunityItem } from "../../domain/entities/ContactEntity";

interface ContactDealsCardProps {
  readonly opportunities?: CrmContactOpportunityItem[];
  readonly jobTitleSnapshot?: string;
  readonly language: string;
  readonly t: (key: string) => string;
  readonly onSelectOpportunity: (id: string) => void;
  readonly onViewAllOpportunities?: () => void;
}

/** Card listing opportunities associated with a CRM Contact and influenced pipeline total. */
export function ContactDealsCard({
  opportunities = [],
  jobTitleSnapshot,
  language,
  t,
  onSelectOpportunity,
  onViewAllOpportunities,
}: ContactDealsCardProps) {
  const isAr = language === "ar";
  const influencedTotal = opportunities.reduce(
    (sum, o) => sum + (Number(o.estimatedAmount) || 0),
    0
  );
  const currency = opportunities[0]?.currencyCode || "SAR";

  return (
    <Card
      className="rounded-nx-lg border border-nx-line bg-nx-surface p-4 space-y-3"
      data-testid="contact-buying-committee-rollup-card"
    >
      <div className="flex items-center justify-between border-b border-nx-line pb-3">
        <div className="flex items-center gap-2">
          <Briefcase className="size-4 text-nx-accent" />
          <h2 className="text-sm font-bold text-nx-ink">{t("crmContacts.detail.dealsTitle")}</h2>
        </div>
        <Badge variant="outline" className="border-nx-line text-nx-ink-3 font-mono text-[11px]">
          {Number(opportunities.length).toLocaleString(isAr ? "ar-SA" : "en-US")}
        </Badge>
      </div>

      <div
        className="rounded-nx-md border border-nx-line bg-nx-raised/40 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs"
        data-testid="contact-buying-committee-summary"
      >
        <div className="flex items-center gap-2">
          <span className="text-nx-ink-3">{t("crmContacts.detail.buyingCommitteeRoleLabel")}:</span>
          <Badge variant="outline" className="text-[10px] font-mono bg-nx-surface">
            {jobTitleSnapshot || t("crmContacts.detail.defaultBuyingRole")}
          </Badge>
        </div>
        <div className="font-mono text-xs font-bold text-nx-ink">
          {t("crmContacts.detail.influencedPipelineValueLabel")}:{" "}
          {influencedTotal.toLocaleString(isAr ? "ar-SA" : "en-US")} {currency}
        </div>
      </div>

      {opportunities.length === 0 ? (
        <div className="py-6 text-center space-y-2.5">
          <p className="text-xs text-nx-ink-3">{t("crmContacts.detail.noDeals")}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => (onViewAllOpportunities ? onViewAllOpportunities() : onSelectOpportunity(""))}
            className="h-7 text-xs gap-1.5 border-nx-line hover:border-nx-accent"
          >
            <Briefcase className="size-3 text-nx-accent" />
            <span>{t("crmContacts.detail.viewDealsBtn")}</span>
          </Button>
        </div>
      ) : (
        <div className="divide-y divide-nx-line">
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              className="py-2.5 flex items-center justify-between gap-3 hover:bg-nx-raised/30 px-1 rounded-nx-md cursor-pointer transition-colors"
              onClick={() => onSelectOpportunity(opp.id)}
            >
              <div>
                <span className="text-xs font-semibold text-nx-ink block hover:text-nx-accent">{opp.title}</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Badge variant="outline" className="border-nx-line bg-nx-raised text-[10px] py-0 px-1.5 text-nx-ink-2">
                    {isAr && opp.stageLabelAr ? opp.stageLabelAr : opp.stageLabelEn}
                  </Badge>
                  <span className="text-[10px] text-nx-ink-3 uppercase font-medium">{t(`crmContacts.statuses.${opp.status}`)}</span>
                </div>
              </div>
              <div className="text-end">
                <span className="text-xs font-bold text-nx-ink font-mono block">
                  {opp.estimatedAmount != null
                    ? `${opp.estimatedAmount.toLocaleString(isAr ? "ar-SA" : "en-US")} ${opp.currencyCode}`
                    : "••••••"}
                </span>
                {opp.targetCloseDate && new Date(opp.targetCloseDate).getFullYear() > 1900 && (
                  <span className="text-[10px] text-nx-ink-3 flex items-center gap-1 justify-end mt-0.5">
                    <Calendar className="size-2.5" />
                    {new Date(opp.targetCloseDate).toLocaleDateString(isAr ? "ar-SA" : "en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
