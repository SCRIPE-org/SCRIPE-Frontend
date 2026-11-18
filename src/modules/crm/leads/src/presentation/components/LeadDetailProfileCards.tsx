"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { Card } from "@core/ui/card";
import {
  Calendar,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { CustomFieldsSection } from "@core/crud/customFieldsExtension";
import { LeadStatusBadge } from "./LeadStatusBadge";
import { LeadDetailLinkageCards } from "./LeadDetailLinkageCards";
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
  mode?: "all" | "profile" | "linkage";
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
  mode = "all",
}: LeadDetailProfileCardsProps) {
  const { t } = useI18n();

  const showProfile = mode === "all" || mode === "profile";
  const showLinkage = mode === "all" || mode === "linkage";

  return (
    <>
      {showProfile && (
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
            {lead.email ? (
              <a href={`mailto:${lead.email}`} className="font-semibold text-nx-ink hover:text-nx-accent block truncate">
                {lead.email}
              </a>
            ) : (
              <span className="font-semibold text-nx-ink block">—</span>
            )}
          </div>

          <div className="space-y-1">
            <span className="text-nx-ink-3 flex items-center gap-1">
              <Phone className="size-3" /> {t("crmLeads.detail.phoneNumber")}
            </span>
            {lead.phone ? (
              <a href={`tel:${lead.phone}`} className="font-semibold text-nx-ink hover:text-nx-accent font-mono block">
                {lead.phone}
              </a>
            ) : (
              <span className="font-semibold text-nx-ink font-mono block">—</span>
            )}
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

        <div className="rounded-nx-md border border-nx-line bg-nx-raised/40 p-3 space-y-2" data-testid="lead-bant-summary">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold uppercase tracking-wider text-nx-ink-2">{t("crmLeads.detail.bantSummaryTitle")}</span>
            <span className="font-mono text-nx-ink-3">
              {t("crmLeads.detail.ownerLabel")}: <strong className="text-nx-ink">{lead.ownerDisplayName || t("crmLeads.detail.unassignedOwner")}</strong>
            </span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
            <div className="rounded border border-nx-line bg-nx-surface px-2.5 py-1.5">
              <span className="text-[10px] text-nx-ink-3 block">{t("crmLeads.detail.bantBudget")}</span>
              <span className="font-mono font-semibold text-nx-ink">{lead.estimatedValue != null ? `${lead.currency || baseCurrency} ${lead.estimatedValue.toLocaleString()}` : "—"}</span>
            </div>
            <div className="rounded border border-nx-line bg-nx-surface px-2.5 py-1.5">
              <span className="text-[10px] text-nx-ink-3 block">{t("crmLeads.detail.bantAuthority")}</span>
              <span className="font-semibold text-nx-ink truncate block">{lead.fullName || lead.companyName || "—"}</span>
            </div>
            <div className="rounded border border-nx-line bg-nx-surface px-2.5 py-1.5">
              <span className="text-[10px] text-nx-ink-3 block">{t("crmLeads.detail.bantNeed")}</span>
              <span className="font-semibold text-nx-ink truncate block">{lead.leadSourceChannel || lead.source || t("crmLeads.detail.directSource")}</span>
            </div>
            <div className="rounded border border-nx-line bg-nx-surface px-2.5 py-1.5">
              <span className="text-[10px] text-nx-ink-3 block">{t("crmLeads.detail.bantTimeline")}</span>
              <span className={lead.email || lead.phone ? "font-semibold text-success" : "font-semibold text-nx-warning-strong"}>
                {lead.email || lead.phone ? t("crmLeads.detail.readyTag") : t("crmLeads.detail.missingContactTag")}
              </span>
            </div>
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
      )}

      {showLinkage && <LeadDetailLinkageCards lead={lead} />}
    </>
  );
}
