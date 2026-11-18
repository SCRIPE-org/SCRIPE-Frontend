"use client";

import React from "react";
import { Mail } from "lucide-react";
import { Button } from "@core/ui/button";
import { LeadStatusBadge } from "./LeadStatusBadge";
import type { CrmLead } from "../../domain/entities/LeadEntity";

export function formatLeadSourceLabel(src: string | undefined | null, t: (k: string) => string): string {
  if (!src) return t("crmLeads.sources.direct");
  const norm = src.toLowerCase().replace(/[\s\-_]/g, "");
  if (norm === "inbound") return t("crmLeads.sources.inbound");
  if (norm === "website") return t("crmLeads.sources.website");
  if (norm === "referral") return t("crmLeads.sources.referral");
  if (norm === "directoutreach") return t("crmLeads.sources.directOutreach");
  if (norm === "event" || norm === "conference") return t("crmLeads.sources.event");
  if (norm === "direct") return t("crmLeads.sources.direct");
  return src;
}

export function renderLeadsCardGridItemCard(
  lead: CrmLead,
  actions: React.ReactNode,
  baseCurrency: string,
  autoConvertToBase: boolean,
  showOriginalCurrencyBadge: boolean,
  convertAmount: (amount: number, from: string, to: string) => number,
  onNavigateLead: (id: string) => void,
  t: (key: string, params?: Record<string, any>) => string,
) {
  return (
    <div
      data-testid={`lead-grid-card-${lead.id}`}
      className="flex flex-col justify-between gap-3 rounded-nx-lg border border-nx-line bg-nx-surface p-4 hover:border-nx-line-hi transition-all text-nx-ink"
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="min-w-0 flex-1 leading-none">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onNavigateLead(lead.id)}
              className="h-auto p-0 font-bold text-sm text-nx-ink hover:text-nx-accent hover:bg-transparent justify-start text-start whitespace-normal line-clamp-1"
            >
              {lead.title}
            </Button>
          </h4>
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
      <div className="border-t border-nx-line pt-3 flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] text-nx-ink-3 shrink-0">{formatLeadSourceLabel(lead.source, t)}</span>
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
          <div className="font-medium text-nx-ink">{formatLeadSourceLabel(lead.source, t)}</div>
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
