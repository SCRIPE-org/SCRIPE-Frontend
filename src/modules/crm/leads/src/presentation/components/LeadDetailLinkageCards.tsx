"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Card } from "@core/ui/card";
import { ArrowUpRight, Building2, ShieldCheck } from "lucide-react";
import type { CrmLead } from "../../domain/entities/LeadEntity";

interface LeadDetailLinkageCardsProps {
  lead: CrmLead;
}

/** Displays PartyKernel organization/contact verification linkage and Deal conversion status cards. */
export function LeadDetailLinkageCards({ lead }: LeadDetailLinkageCardsProps) {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-4 border-nx-line bg-nx-surface space-y-3" data-testid="lead-party-link-card">
        <div className="flex items-center justify-between border-b border-nx-line pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="size-4 text-nx-accent" />
            <h2 className="text-sm font-bold text-nx-ink">{t("crmLeads.detail.verifiedLinkageTitle")}</h2>
          </div>
          {lead.organizationPartyId || lead.personPartyId ? (
            <Badge variant="outline" className="border-success/40 bg-success/10 text-success text-[10px] gap-1">
              <ShieldCheck className="size-3" /> {t("crmLeads.detail.accountLinkedBadge")}
            </Badge>
          ) : (
            <Badge variant="outline" className="border-nx-line text-nx-ink-3 text-[10px]">
              {t("crmLeads.detail.unlinkedPreConversionBadge")}
            </Badge>
          )}
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between rounded-nx-md border border-nx-line bg-nx-ground p-3">
            <div>
              <span className="text-nx-ink-3 block text-[11px]">{t("crmLeads.detail.companyOrgLabel")}</span>
              <span className="font-semibold text-nx-ink">{lead.companyName || t("crmLeads.detail.noOrgName")}</span>
            </div>
            <Badge variant="outline" className="font-mono text-[10px] border-nx-line">
              {lead.organizationPartyId ? t("crmLeads.detail.linkedBadge") : t("crmLeads.detail.pendingBadge")}
            </Badge>
          </div>

          <div className="flex items-center justify-between rounded-nx-md border border-nx-line bg-nx-ground p-3">
            <div>
              <span className="text-nx-ink-3 block text-[11px]">{t("crmLeads.detail.individualContactLabel")}</span>
              <span className="font-semibold text-nx-ink">{lead.fullName || t("crmLeads.detail.noContactName")}</span>
            </div>
            <Badge variant="outline" className="font-mono text-[10px] border-nx-line">
              {lead.personPartyId ? t("crmLeads.detail.linkedBadge") : t("crmLeads.detail.pendingBadge")}
            </Badge>
          </div>
        </div>
      </Card>

      <Card className="p-4 border-nx-line bg-nx-surface space-y-3">
        <div className="flex items-center justify-between border-b border-nx-line pb-3">
          <div className="flex items-center gap-2">
            <ArrowUpRight className="size-4 text-nx-accent" />
            <h2 className="text-sm font-bold text-nx-ink">{t("crmLeads.detail.conversionStatusTitle")}</h2>
          </div>
        </div>

        {lead.convertedOpportunityId ? (
          <div className="p-4 rounded-nx-md border border-success/30 bg-success/10 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-success block">{t("crmLeads.detail.convertedActiveOppTitle")}</span>
              <span className="text-[11px] text-nx-ink-2">{t("crmLeads.detail.convertedActiveOppDesc")}</span>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => router.push(`/crm/opportunities/${lead.convertedOpportunityId}`)}
              className="h-8 text-xs gap-1"
            >
              <span>{t("crmLeads.detail.openDealBtn")}</span>
              <ArrowUpRight className="size-3.5" />
            </Button>
          </div>
        ) : (
          <div className="p-4 rounded-nx-md border border-nx-line bg-nx-ground flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-nx-ink block">{t("crmLeads.detail.readyForConversionTitle")}</span>
              <span className="text-[11px] text-nx-ink-3">{t("crmLeads.detail.readyForConversionDesc")}</span>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono border-nx-line shrink-0">
              {lead.status === "Qualified" ? t("crmLeads.status.qualified") : t("crmLeads.status.new")}
            </Badge>
          </div>
        )}
      </Card>
    </div>
  );
}
