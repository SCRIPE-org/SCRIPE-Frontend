"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Mail, Phone, Link as LinkIcon, ChevronLeft, ChevronRight, ArrowUpRight, UserCheck } from "lucide-react";
import { cn } from "@core/common/utils";
import type { CrmWorkflowDefinition } from "@modules/crm";
import { LeadStatusBadge } from "./LeadStatusBadge";
import type { CrmLead, LeadStatus } from "../../domain/entities/LeadEntity";

/**
 * Maps a lead workflow stage key and English label fallback to canonical LeadStatus enum value.
 */
export function stageToLeadStatusValue(stageKey: string, labelEn: string): LeadStatus {
  if (stageKey === "lead.new") return "New";
  if (stageKey === "lead.working") return "Working";
  if (stageKey === "lead.qualified") return "Qualified";
  if (stageKey === "lead.converted") return "Converted";
  if (stageKey === "lead.disqualified") return "Disqualified";
  return (labelEn || stageKey.replace(/^lead\./, "")) as LeadStatus;
}

interface LeadsKanbanCardItemProps {
  lead: CrmLead;
  activeLeadWorkflow: CrmWorkflowDefinition;
  baseCurrency: string;
  autoConvertToBase: boolean;
  showOriginalCurrencyBadge: boolean;
  convertAmount: (amount: number, from: string, to: string) => number;
  onOpenLinkParty: (lead: CrmLead) => void;
  onOpenConvert: (lead: CrmLead) => void;
  onOpenAssignOwner?: (lead: CrmLead) => void;
  onUpdateLeadStatus: (lead: CrmLead, targetStatus: string) => void;
}

/**
 * Compact matte Kanban card for CRM leads with single-line FX conversion pill,
 * isolated pointer-down interactive actions, click-to-call/email, and stage steppers.
 */
export function LeadsKanbanCardItem({
  lead,
  activeLeadWorkflow,
  baseCurrency,
  autoConvertToBase,
  showOriginalCurrencyBadge,
  convertAmount,
  onOpenLinkParty,
  onOpenConvert,
  onOpenAssignOwner,
  onUpdateLeadStatus,
}: LeadsKanbanCardItemProps) {
  const router = useRouter();
  const { t, language } = useI18n();
  const isRtl = language === "ar";

  const activeOrder: LeadStatus[] =
    activeLeadWorkflow.id === "wf-lead-default"
      ? ["New", "Working", "Qualified", "Converted"]
      : [...activeLeadWorkflow.stages]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((stg) => stageToLeadStatusValue(stg.stageKey, stg.labelEn));
  const currentIdx = activeOrder.indexOf(lead.status);
  const prevStage =
    lead.status === "Disqualified"
      ? "Working"
      : currentIdx > 0
        ? activeOrder[currentIdx - 1]
        : undefined;
  const nextStage =
    currentIdx >= 0 && currentIdx < activeOrder.length - 1
      ? activeOrder[currentIdx + 1]
      : undefined;

  return (
    <div
      data-testid={`lead-kanban-card-${lead.id}`}
      onClick={() => router.push(`/crm/leads/${lead.id}`)}
      className="space-y-2.5 rounded-nx-md border border-nx-line bg-nx-raised p-3 hover:border-nx-line-hi transition-all text-nx-ink overflow-hidden cursor-pointer shadow-none"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium text-nx-ink-2 truncate">
          {lead.companyName || lead.fullName || "—"}
        </span>
        <LeadStatusBadge status={lead.status} />
      </div>
      <div className="font-bold text-xs text-nx-ink hover:text-nx-accent line-clamp-2 leading-snug">
        {lead.title}
      </div>
      {lead.estimatedValue !== undefined && lead.estimatedValue !== null && (
        <div
          data-testid={`lead-card-fx-${lead.id}`}
          className="rounded-md bg-nx-surface/80 border border-nx-line/60 px-2.5 py-1.5 text-xs font-bold text-nx-ink font-mono"
        >
          <div className="flex items-center justify-between gap-2">
            <span>
              {lead.currency || "SAR"} {lead.estimatedValue.toLocaleString()}
            </span>
            {autoConvertToBase && (lead.currency || "SAR").toUpperCase() !== baseCurrency.toUpperCase() && showOriginalCurrencyBadge && (
              <span className="text-[10px] font-semibold text-nx-ink-2 shrink-0">
                ≈ {baseCurrency} {Math.round(convertAmount(lead.estimatedValue, lead.currency || "SAR", baseCurrency)).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      )}
      {(lead.email || lead.phone || lead.ownerDisplayName) && (
        <div
          className="flex flex-wrap items-center justify-between gap-1.5 text-[11px] text-nx-ink-3"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2 min-w-0">
            {lead.email && (
              <a
                href={`mailto:${lead.email}`}
                title={t("crmLeads.actions.sendEmail")}
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 hover:text-nx-accent truncate max-w-36"
              >
                <Mail className="size-2.5 shrink-0" />
                <span className="truncate">{lead.email}</span>
              </a>
            )}
            {lead.phone && (
              <a
                href={`tel:${lead.phone}`}
                title={t("crmLeads.actions.callPhone")}
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 hover:text-nx-accent shrink-0 font-mono"
              >
                <Phone className="size-2.5 shrink-0" />
                <span>{lead.phone}</span>
              </a>
            )}
          </div>
          {lead.ownerDisplayName && (
            <span className="rounded bg-nx-surface border border-nx-line px-1.5 py-0 text-[9px] font-medium text-nx-ink-2 truncate max-w-24">
              {lead.ownerDisplayName}
            </span>
          )}
        </div>
      )}
      <div
        className="pt-2 border-t border-nx-line/50 flex items-center justify-between gap-1.5"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="flex flex-wrap items-center gap-1" onPointerDown={(e) => e.stopPropagation()}>
          {onOpenAssignOwner && lead.status !== "Converted" && lead.status !== "Disqualified" && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-6 px-1.5 text-[10px] border-nx-line bg-nx-surface text-nx-ink-2 hover:text-nx-ink gap-1"
              title={t("crmLeads.actions.assignOwner")}
              aria-label={t("crmLeads.actions.assignOwner")}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onOpenAssignOwner(lead);
              }}
            >
              <UserCheck className="size-2.5" />
            </Button>
          )}
          {lead.status !== "Converted" && lead.status !== "Disqualified" && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-6 px-1.5 text-[10px] border-nx-line bg-nx-surface text-nx-ink-2 hover:text-nx-ink gap-1"
              title={t("crmLeads.actions.linkParty")}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onOpenLinkParty(lead);
              }}
            >
              <LinkIcon className="size-2.5" />
              <span>{t("crmLeads.actions.linkParty")}</span>
            </Button>
          )}
          {(lead.status === "Qualified" || lead.status === "New" || lead.status === "Working") &&
            !lead.convertedOpportunityId && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-6 px-1.5 text-[10px] border-nx-line bg-nx-surface text-nx-ink hover:border-nx-line-hi gap-1 font-medium"
                title={t("crmLeads.actions.convert")}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenConvert(lead);
                }}
              >
                <ArrowUpRight className="size-2.5" />
                <span>{t("crmLeads.actions.convert")}</span>
              </Button>
            )}
        </div>
        {(prevStage || nextStage) && (
          <div className="flex items-center gap-0.5 shrink-0 ms-auto" onPointerDown={(e) => e.stopPropagation()}>
            {prevStage && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-6 text-nx-ink-3 hover:text-nx-ink hover:bg-nx-surface"
                aria-label={t("crmLeads.actions.moveBackTo", { stage: prevStage, defaultValue: `Move back to ${prevStage}` })}
                title={t("crmLeads.actions.moveBackTo", { stage: prevStage, defaultValue: `Move back to ${prevStage}` })}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateLeadStatus(lead, prevStage);
                }}
              >
                <ChevronLeft className={cn("size-3.5", isRtl && "rotate-180")} />
              </Button>
            )}
            {nextStage && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-6 text-nx-ink-3 hover:text-nx-ink hover:bg-nx-surface"
                aria-label={t("crmLeads.actions.advanceTo", { stage: nextStage, defaultValue: `Advance to ${nextStage}` })}
                title={t("crmLeads.actions.advanceTo", { stage: nextStage, defaultValue: `Advance to ${nextStage}` })}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  if (nextStage === "Converted") {
                    onOpenConvert(lead);
                  } else {
                    onUpdateLeadStatus(lead, nextStage);
                  }
                }}
              >
                <ChevronRight className={cn("size-3.5", isRtl && "rotate-180")} />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
