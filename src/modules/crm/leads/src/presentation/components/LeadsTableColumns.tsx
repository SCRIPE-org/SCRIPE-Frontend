"use client";

import React from "react";
import { User, Mail, Phone, Calendar, Link as LinkIcon, Building2, ArrowUpRight } from "lucide-react";
import type { CrudColumn } from "@core/crud/components/generic-crud-view";
import { Button } from "@core/ui/button";
import { LeadStatusBadge } from "./LeadStatusBadge";
import {
  formatLeadSourceLabel,
  renderLeadsCardGridItemCard,
  renderLeadsSplitDetailCard,
} from "./LeadCardRenderers";
import type { CrmLead } from "../../domain/entities/LeadEntity";

/** Re-exported card-grid and split-detail renderers for CRM Leads views. */
export { renderLeadsCardGridItemCard, renderLeadsSplitDetailCard };

/** Parameters for building CRM Leads table columns. */
export interface BuildLeadsTableColumnsParams {
  t: (key: string, params?: Record<string, string | number>) => string;
  language: string;
  baseCurrency: string;
  autoConvertToBase: boolean;
  showOriginalCurrencyBadge: boolean;
  convertAmount: (amount: number, from: string, to: string) => number;
  onNavigateLead: (leadId: string) => void;
}

/** Builds column definitions for the CRM Leads `GenericCrudView` table. */
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
        <Button
          type="button"
          variant="ghost"
          onClick={() => onNavigateLead(lead.id)}
          data-testid={`lead-row-link-${lead.id}`}
          className="h-auto w-full p-0 max-w-xs flex flex-col items-start justify-start text-start whitespace-normal hover:bg-transparent group"
        >
          <span className="font-semibold text-nx-ink group-hover:text-nx-accent transition-colors line-clamp-1 flex items-center gap-1">
            <span>{lead.title}</span>
            <ArrowUpRight className="size-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </span>
          {lead.notes && <span className="text-[11px] font-normal text-nx-ink-3 line-clamp-1 mt-0.5">{lead.notes}</span>}
        </Button>
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
            <span className="font-bold text-nx-ink font-mono tabular-nums">
              {origCurr} {lead.estimatedValue.toLocaleString()}
            </span>
            {isConverted && showOriginalCurrencyBadge && (
              <span className="text-[10px] font-mono tabular-nums text-nx-accent">
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
        <span className="inline-flex items-center px-2 py-0.5 rounded-nx-sm bg-nx-raised border border-nx-line text-[11px] text-nx-ink-2">
          {formatLeadSourceLabel(lead.source, t)}
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
