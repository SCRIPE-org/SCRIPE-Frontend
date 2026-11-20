"use client";

import { Button } from "@core/ui/button";
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Link as LinkIcon,
  UserCheck,
  XCircle,
} from "lucide-react";
import type { CrmLead } from "../../domain/entities/LeadEntity";

interface LeadDetailActionsBarProps {
  lead: CrmLead;
  isRtl: boolean;
  isTerminal: boolean;
  canUpdateLead: boolean;
  canAssignOwner: boolean;
  canQualifyLead: boolean;
  canCreateOpp: boolean;
  onBack: () => void;
  onOpenEdit: () => void;
  onOpenAssignOwner: () => void;
  onOpenLinkParty: () => void;
  onOpenQualify: (decision: "Qualified" | "Disqualified") => void;
  onOpenConvert: () => void;
  t: (key: string) => string;
}

/** Header navigation and contextual action buttons for LeadDetailView. */
export function LeadDetailActionsBar({
  lead,
  isRtl,
  isTerminal,
  canUpdateLead,
  canAssignOwner,
  canQualifyLead,
  canCreateOpp,
  onBack,
  onOpenEdit,
  onOpenAssignOwner,
  onOpenLinkParty,
  onOpenQualify,
  onOpenConvert,
  t,
}: LeadDetailActionsBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="h-8 text-xs text-nx-ink-2 gap-1 border border-nx-line bg-nx-surface hover:bg-nx-raised"
      >
        {isRtl ? <ChevronRight className="size-3.5" /> : <ChevronLeft className="size-3.5" />}
        <span>{t("crmLeads.detail.backToLeads")}</span>
      </Button>

      <div className="flex flex-wrap items-center gap-2">
        {canUpdateLead && !isTerminal && (
          <Button type="button" variant="outline" size="sm" data-testid="lead-detail-edit-btn" onClick={onOpenEdit} className="h-8 text-xs gap-1.5 border-nx-line bg-nx-surface text-nx-ink hover:bg-nx-raised">
            <Edit2 className="size-3.5 text-nx-accent" />
            <span>{t("crmLeads.detail.editLeadBtn")}</span>
          </Button>
        )}
        {canAssignOwner && !isTerminal && (
          <Button type="button" variant="outline" size="sm" data-testid="lead-detail-assign-owner-btn" onClick={onOpenAssignOwner} className="h-8 text-xs gap-1.5 border-nx-line bg-nx-surface text-nx-ink hover:bg-nx-raised">
            <UserCheck className="size-3.5 text-nx-accent" />
            <span>{t("crmLeads.detail.assignOwnerBtn")}</span>
          </Button>
        )}
        {canQualifyLead && !isTerminal && (
          <Button type="button" variant="ghost" size="sm" data-testid="lead-detail-link-party-btn" onClick={onOpenLinkParty} className="h-8 text-xs gap-1.5 text-nx-ink-2 hover:text-nx-ink">
            <LinkIcon className="size-3.5" />
            <span>{t("crmLeads.detail.linkPartyBtn")}</span>
          </Button>
        )}
        {canQualifyLead && lead.status !== "Converted" && (
          <>
            <Button type="button" variant={lead.status !== "Qualified" ? "default" : "outline"} size="sm" data-testid="lead-detail-qualify-btn" onClick={() => onOpenQualify("Qualified")} className="h-8 text-xs gap-1.5">
              <CheckCircle2 className="size-3.5" />
              <span>{t("crmLeads.detail.qualifyLeadBtn")}</span>
            </Button>
            <Button type="button" variant="ghost" size="sm" data-testid="lead-detail-disqualify-btn" onClick={() => onOpenQualify("Disqualified")} className="h-8 text-xs gap-1.5 text-destructive hover:bg-destructive/10">
              <XCircle className="size-3.5" />
              <span>{t("crmLeads.detail.disqualifyBtn")}</span>
            </Button>
          </>
        )}
        {canQualifyLead && canCreateOpp && !lead.convertedOpportunityId && (
          <Button type="button" size="sm" variant={lead.status === "Qualified" ? "default" : "outline"} data-testid="lead-detail-convert-btn" onClick={onOpenConvert} className="h-8 text-xs font-bold gap-1.5">
            <ArrowUpRight className="size-3.5" />
            <span>{t("crmLeads.detail.convertBtn")}</span>
          </Button>
        )}
      </div>
    </div>
  );
}
