"use client";

import React from "react";
import { User, Mail, Phone, Calendar, Link as LinkIcon, Building2, ArrowUpRight } from "lucide-react";
import type { CrudColumn } from "@core/crud/components/generic-crud-view";
import { LeadStatusBadge } from "./LeadStatusBadge";
import type { CrmLead } from "../../domain/entities/LeadEntity";

export interface BuildLeadsTableColumnsParams {
  t: (key: string, params?: Record<string, any>) => string;
  language: string;
  baseCurrency: string;
  autoConvertToBase: boolean;
  showOriginalCurrencyBadge: boolean;
  convertAmount: (amount: number, from: string, to: string) => number;
  onNavigateLead: (leadId: string) => void;
}

export function buildLeadsTableColumns({
  t,
  language,
  baseCurrency,
  autoConvertToBase,
  showOriginalCurrencyBadge,
  convertAmount,
  onNavigateLead,
}: BuildLeadsTableColumnsParams): CrudColumn<CrmLead>[] {
  return [
    {
      key: "title",
      label: t("crmLeads.table.title"),
      sortable: true,
      render: (_val, lead: CrmLead) => (
        <div
          onClick={() => onNavigateLead(lead.id)}
          data-testid={`lead-row-link-${lead.id}`}
          className="max-w-xs cursor-pointer group"
        >
          <span className="font-semibold text-nx-ink group-hover:text-nx-accent transition-colors line-clamp-1 flex items-center gap-1">
            <span>{lead.title}</span>
            <ArrowUpRight className="size-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </span>
          {lead.notes && <span className="text-[11px] text-nx-ink-3 line-clamp-1 mt-0.5">{lead.notes}</span>}
        </div>
      ),
    },
    {
      key: "fullName",
      label: t("crmLeads.table.contact"),
      sortable: true,
      render: (_val, lead: CrmLead) => (
        <div className="flex items-center gap-1.5">
          <div className="size-5 rounded-full bg-nx-raised border border-nx-line flex items-center justify-center shrink-0">
            <User className="size-3 text-nx-ink-3" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-medium text-nx-ink block">
                {lead.fullName || `${lead.firstName || ""} ${lead.lastName || ""}`.trim() || "—"}
              </span>
              {lead.personPartyId && (
                <span
                  title={t("crmLeads.partyLink.partyLinked")}
                  className="inline-flex items-center size-3.5 rounded-full bg-nx-accent-wash text-nx-accent"
                >
                  <LinkIcon className="size-2 mx-auto" />
                </span>
              )}
            </div>
            {lead.email && (
              <span className="text-[11px] text-nx-ink-3 flex items-center gap-1">
                <Mail className="size-2.5" />
                {lead.email}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "companyName",
      label: t("crmLeads.table.company"),
      sortable: true,
      render: (_val, lead: CrmLead) => (
        <div>
          <div className="flex items-center gap-1">
            <span className="font-medium text-nx-ink-2 truncate max-w-[160px] block">{lead.companyName || "—"}</span>
            {lead.organizationPartyId && (
              <span
                title={t("crmLeads.partyLink.partyLinked")}
                className="inline-flex items-center size-3.5 rounded-full bg-nx-accent-wash text-nx-accent"
              >
                <Building2 className="size-2.5 mx-auto" />
              </span>
            )}
          </div>
          {lead.phone && (
            <span className="text-[11px] text-nx-ink-3 flex items-center gap-1 mt-0.5">
              <Phone className="size-2.5" />
              {lead.phone}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      label: t("crmLeads.table.status"),
      sortable: true,
      render: (_val, lead: CrmLead) => <LeadStatusBadge status={lead.status} />,
    },
    {
      key: "estimatedValue",
      label: t("crmLeads.table.estimatedValue"),
      sortable: true,
      render: (_val, lead: CrmLead) => {
        if (lead.estimatedValue === undefined || lead.estimatedValue === null) {
          return <span className="font-bold text-nx-ink">—</span>;
        }
        const origCurr = (lead.currency || "SAR").toUpperCase();
        const isConverted = autoConvertToBase && origCurr !== baseCurrency;
        const convertedVal = isConverted
          ? Math.round(convertAmount(lead.estimatedValue, origCurr, baseCurrency))
          : lead.estimatedValue;
        return (
          <div className="flex flex-col">
            <span className="font-bold text-nx-ink font-mono">
              {origCurr} {lead.estimatedValue.toLocaleString()}
            </span>
            {isConverted && showOriginalCurrencyBadge && (
              <span className="text-[10px] font-mono text-nx-accent">
                ≈ {baseCurrency} {convertedVal.toLocaleString()}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "source",
      label: t("crmLeads.table.source"),
      render: (_val, lead: CrmLead) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-nx-xs bg-nx-raised border border-nx-line text-[11px] text-nx-ink-2">
          {lead.source || "Direct"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: t("crmLeads.table.date"),
      sortable: true,
      render: (_val, lead: CrmLead) => {
        const formattedDate = lead.createdAt
          ? new Date(lead.createdAt).toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "—";
        return (
          <span className="inline-flex items-center gap-1 text-nx-ink-3">
            <Calendar className="size-2.5" />
            {formattedDate}
          </span>
        );
      },
    },
  ];
}

export function renderLeadsCardGridItemCard(
  lead: CrmLead,
  actions: React.ReactNode,
  baseCurrency: string,
  autoConvertToBase: boolean,
  showOriginalCurrencyBadge: boolean,
  convertAmount: (amount: number, from: string, to: string) => number,
  onNavigateLead: (id: string) => void,
) {
  return (
    <div
      data-testid={`lead-grid-card-${lead.id}`}
      onClick={() => onNavigateLead(lead.id)}
      className="flex flex-col justify-between gap-3 rounded-nx-lg border border-nx-line bg-nx-surface p-4 hover:border-nx-line-hi transition-all text-nx-ink cursor-pointer"
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-bold text-sm text-nx-ink line-clamp-1">{lead.title}</h4>
          <LeadStatusBadge status={lead.status} />
        </div>
        <div className="text-xs text-nx-ink-2 space-y-1">
          <div className="font-medium text-nx-ink-2">{lead.companyName || lead.fullName || "—"}</div>
          {lead.email && (
            <div className="text-nx-ink-3 flex items-center gap-1.5">
              <Mail className="size-3" />
              {lead.email}
            </div>
          )}
        </div>
        {lead.estimatedValue !== undefined && lead.estimatedValue !== null && (
          <div className="text-sm font-bold text-nx-accent font-mono">
            {lead.currency || "SAR"} {lead.estimatedValue.toLocaleString()}
            {autoConvertToBase && (lead.currency || "SAR").toUpperCase() !== baseCurrency && showOriginalCurrencyBadge && (
              <span className="ms-1.5 text-[11px] text-nx-ink-2">
                (≈ {baseCurrency} {Math.round(convertAmount(lead.estimatedValue, lead.currency || "SAR", baseCurrency)).toLocaleString()})
              </span>
            )}
          </div>
        )}
      </div>
      <div className="border-t border-nx-line pt-3 flex flex-wrap items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
        <span className="text-[11px] text-nx-ink-3 shrink-0">{lead.source || "Direct"}</span>
        <div className="flex flex-wrap items-center gap-1.5 [&_div]:flex [&_div]:flex-wrap [&_div]:gap-1.5">{actions}</div>
      </div>
    </div>
  );
}

export function renderLeadsSplitDetailCard(
  lead: CrmLead,
  actions: React.ReactNode,
  t: (key: string, params?: Record<string, any>) => string,
) {
  return (
    <div className="rounded-nx-lg border border-nx-line bg-nx-surface p-5 space-y-5 text-nx-ink">
      <div className="flex items-start justify-between border-b border-nx-line pb-4">
        <div>
          <h3 className="text-lg font-bold text-nx-ink">{lead.title}</h3>
          <p className="text-xs text-nx-ink-3 mt-1">{lead.companyName || lead.fullName || "—"}</p>
        </div>
        <div className="flex items-center gap-2">
          <LeadStatusBadge status={lead.status} />
          {actions}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div className="space-y-1">
          <span className="text-nx-ink-3">
            {t("crmLeads.table.estimatedValue", { defaultValue: "Estimated Commercial Value" })}
          </span>
          <div className="font-bold text-nx-accent text-sm font-mono">
            {lead.estimatedValue !== undefined && lead.estimatedValue !== null
              ? `${lead.currency || "SAR"} ${lead.estimatedValue.toLocaleString()}`
              : "—"}
          </div>
        </div>
        <div className="space-y-1">
          <span className="text-nx-ink-3">{t("crmLeads.table.source")}</span>
          <div className="font-medium text-nx-ink">{lead.source || "Direct"}</div>
        </div>
        <div className="space-y-1">
          <span className="text-nx-ink-3">{t("crmLeads.dialog.emailLabel")}</span>
          <div className="font-medium text-nx-ink truncate">{lead.email || "—"}</div>
        </div>
        <div className="space-y-1">
          <span className="text-nx-ink-3">{t("crmLeads.dialog.phoneLabel")}</span>
          <div className="font-medium text-nx-ink">{lead.phone || "—"}</div>
        </div>
      </div>
      {lead.notes && (
        <div className="rounded-nx-md bg-nx-raised border border-nx-line p-3 text-xs">
          <span className="font-semibold text-nx-ink block mb-1">{t("crmLeads.dialog.notesLabel")}</span>
          <p className="text-nx-ink-2 whitespace-pre-wrap">{lead.notes}</p>
        </div>
      )}
    </div>
  );
}
