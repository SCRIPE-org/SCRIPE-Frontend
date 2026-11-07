"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Card } from "@core/ui/card";
import {
  ArrowUpRight,
  Building2,
  Calendar,
  Mail,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";
import { CustomFieldsSection } from "@core/crud/customFieldsExtension";
import { LeadStatusBadge } from "./LeadStatusBadge";
import type { CrmLead } from "../../domain/entities/LeadEntity";

interface LeadDetailProfileCardsProps {
  lead: CrmLead;
  baseCurrency: string;
  autoConvertToBase: boolean;
  convertAmount: (amount: number, from: string, to: string) => number;
  leadCustomFieldConfigs: any[];
  isLeadCfLoading: boolean;
  refetchLeadCustomFields: () => Promise<any>;
  editCustomFields: Record<string, unknown>;
  onCustomFieldChange: (key: string, value: unknown) => void;
  canQualifyLead: boolean;
  canCreateOpp: boolean;
  onOpenConvert: () => void;
}

export function LeadDetailProfileCards({
  lead,
  baseCurrency,
  autoConvertToBase,
  convertAmount,
  leadCustomFieldConfigs,
  isLeadCfLoading,
  refetchLeadCustomFields,
  editCustomFields,
  onCustomFieldChange,
  canQualifyLead,
  canCreateOpp,
  onOpenConvert,
}: LeadDetailProfileCardsProps) {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <>
      <Card className="p-5 border-nx-line bg-nx-surface space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-nx-line pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-nx-ink font-heading">{lead.title}</h1>
              <LeadStatusBadge status={lead.status} />
              <Badge variant="outline" className="border-nx-line bg-nx-raised text-nx-ink-2 text-[11px]">
                {lead.source || t("crmLeads.detail.directSource")}
              </Badge>
            </div>
            <p className="text-xs text-nx-ink-3">
              {lead.companyName || t("crmLeads.detail.unlinkedOrganization")} •{" "}
              {lead.fullName || `${lead.firstName || ""} ${lead.lastName || ""}`.trim() || "—"}
            </p>
          </div>

          <div className="text-end">
            <span className="text-[11px] text-nx-ink-3 block uppercase font-semibold">
              {t("crmLeads.detail.estimatedCommercialValue")}
            </span>
            <span className="text-xl font-bold text-nx-accent font-mono block">
              {lead.estimatedValue != null
                ? `${lead.currency || baseCurrency} ${lead.estimatedValue.toLocaleString()}`
                : "—"}
            </span>
            {autoConvertToBase &&
              lead.estimatedValue != null &&
              (lead.currency || baseCurrency).toUpperCase() !== baseCurrency.toUpperCase() && (
                <span className="text-[11px] font-mono text-nx-ink-2 block">
                  ≈ {baseCurrency}{" "}
                  {convertAmount(lead.estimatedValue, lead.currency || baseCurrency, baseCurrency).toLocaleString()}
                </span>
              )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-nx-ink-3 flex items-center gap-1">
              <User className="size-3" /> {t("crmLeads.detail.contactPerson")}
            </span>
            <span className="font-semibold text-nx-ink block">
              {lead.fullName || `${lead.firstName || ""} ${lead.lastName || ""}`.trim() || "—"}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-nx-ink-3 flex items-center gap-1">
              <Mail className="size-3" /> {t("crmLeads.detail.emailAddress")}
            </span>
            <span className="font-semibold text-nx-ink block">{lead.email || "—"}</span>
          </div>

          <div className="space-y-1">
            <span className="text-nx-ink-3 flex items-center gap-1">
              <Phone className="size-3" /> {t("crmLeads.detail.phoneNumber")}
            </span>
            <span className="font-semibold text-nx-ink font-mono block">{lead.phone || "—"}</span>
          </div>

          <div className="space-y-1">
            <span className="text-nx-ink-3 flex items-center gap-1">
              <Calendar className="size-3" /> {t("crmLeads.detail.intakeDate")}
            </span>
            <span className="font-semibold text-nx-ink block">
              {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "—"}
            </span>
          </div>
        </div>

        {lead.notes && (
          <div className="pt-3 border-t border-nx-line">
            <span className="text-[11px] font-semibold text-nx-ink-3 uppercase block mb-1">
              {t("crmLeads.detail.qualificationNotes")}
            </span>
            <p className="text-xs text-nx-ink-2 bg-nx-raised/40 p-3 rounded-nx-md border border-nx-line">
              {lead.notes}
            </p>
          </div>
        )}

        <div className="pt-2 border-t border-nx-line">
          <CustomFieldsSection
            entityTypeKey="crm.lead"
            entityDisplayName={t("crmLeads.title")}
            configs={leadCustomFieldConfigs}
            isLoading={isLeadCfLoading}
            onFieldCreated={() => void refetchLeadCustomFields()}
            values={editCustomFields}
            onChange={onCustomFieldChange}
            isViewMode={true}
          />
        </div>
      </Card>

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
              {canQualifyLead && canCreateOpp && (
                <Button type="button" size="sm" onClick={onOpenConvert} className="h-8 text-xs font-bold gap-1 shrink-0">
                  <ArrowUpRight className="size-3.5" />
                  <span>{t("crmLeads.detail.convertNowBtn")}</span>
                </Button>
              )}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
