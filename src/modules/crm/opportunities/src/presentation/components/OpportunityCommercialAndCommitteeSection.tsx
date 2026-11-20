"use client";

import React, { useState } from "react";
import { AlertCircle, Clock, Lock, Plus, Trash2, Users } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { Alert, AlertDescription } from "@core/ui/alert";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
import { Checkbox } from "@core/ui/checkbox";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import {
  CrmEntitySearchSelect,
} from "@modules/crm/shared";
import {
  useCrmWorkflowGovernanceQuery,
  useCrmWorkflowsStore,
} from "@modules/crm/workflows";
import type { CrmOpportunity, CrmOpportunityStageHistory, DealContactRole } from "../../domain/entities/OpportunityEntity";
import {
  OpportunityCommercialQuoteAndPlaybookSection,
  type QuoteLineItem,
} from "./OpportunityCommercialQuoteAndPlaybookSection";

/** Re-exported quote line-item type for commercial package callers. */
export type { QuoteLineItem };

type StakeholderRoleType = DealContactRole["stakeholderRole"];

/** Renders the commercial quote builder, stage playbook, and buying committee stakeholder matrix. */
export function OpportunityCommercialAndCommitteeSection({
  opp,
  isRtl,
  stageHistory = [],
  contactRoles = [],
  onAddContactRole,
  onRemoveContactRole,
  submitError,
}: {
  opp: CrmOpportunity;
  isRtl: boolean;
  stageHistory?: CrmOpportunityStageHistory[];
  contactRoles?: DealContactRole[];
  onLookupParties?: (q?: string) => Promise<Array<unknown>>;
  onAddContactRole?: (input: {
    contactPartyId: string;
    contactName: string;
    stakeholderRole: StakeholderRoleType;
    isPrimary: boolean;
    influenceNotes?: string;
  }) => Promise<void>;
  onRemoveContactRole?: (roleId: string) => Promise<void>;
  submitError?: string | null;
}) {
  const { t } = useI18n();
  const activeDealWorkflow = useCrmWorkflowsStore((s) => s.getActiveWorkflow("deal"));
  const activeStage = activeDealWorkflow?.stages.find((s) => s.stageKey === opp.stageKey);
  const rawLockedFields =
    (activeStage as { properties?: Record<string, string> })?.properties?.lockedFields ??
    (opp.stageKey.includes("negotiation") || opp.status === "Won" ? "estimatedAmount,currencyCode" : "");
  const lockedFields = rawLockedFields ? rawLockedFields.split(",").map((s) => s.trim()).filter(Boolean) : [];

  const { buyingCommitteeRoles, addBuyingCommitteeRole } = useCrmWorkflowGovernanceQuery();
  const [contactId, setContactId] = useState("");
  const [contactDisplayName, setContactDisplayName] = useState("");
  const [stakeholderRole, setStakeholderRole] = useState<StakeholderRoleType>("DecisionMaker");
  const [isPrimary, setIsPrimary] = useState(true);
  const [notes, setNotes] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showInlineCommitteeCreator, setShowInlineCommitteeCreator] = useState(false);
  const [newRoleLabelEn, setNewRoleLabelEn] = useState("");
  const [newRoleLabelAr, setNewRoleLabelAr] = useState("");

  const enteredMs = opp.enteredStageAtUtc ? new Date(opp.enteredStageAtUtc).getTime() : Date.now() - 86400000 * 2;
  const dwellDays = Math.max(0, Math.floor((Date.now() - enteredMs) / 86400000));
  const slaDays = activeStage?.slaDays ?? 7;
  const isSlaBreached = dwellDays > slaDays;

  const handleAddContactRole = async () => {
    const targetPartyId = contactId.trim();
    if (!targetPartyId) {
      setValidationError(t("crmOpportunities.commercialSuite.selectContactRequiredError"));
      return;
    }
    setValidationError(null);
    const contactName =
      contactDisplayName.trim() ||
      opp.primaryContactName ||
      opp.partyDisplayName ||
      t("crmOpportunities.commercialSuite.primaryAccountStakeholder");
    if (onAddContactRole) {
      await onAddContactRole({
        contactPartyId: targetPartyId,
        contactName,
        stakeholderRole,
        isPrimary,
        influenceNotes: notes.trim() || undefined,
      });
      setContactId("");
      setContactDisplayName("");
      setNotes("");
    }
  };

  return (
    <div className="space-y-4" dir={isRtl ? "rtl" : "ltr"}>
      <Card className="p-3.5 border-nx-line bg-nx-surface flex flex-wrap items-center justify-between gap-3" data-testid="deal-dwell-time-ribbon">
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <Clock className="size-4 text-info" />
          <span className="font-bold text-nx-ink">{t("crmOpportunities.commercialSuite.dwellTimeLabel")}</span>
          <span className="font-mono font-semibold text-nx-ink">
            {dwellDays}{t("crmOpportunities.commercialSuite.daysUnit")} / {slaDays}{t("crmOpportunities.commercialSuite.daysUnit")} {t("crmOpportunities.commercialSuite.slaLabel")}
          </span>
          {lockedFields.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded border border-warning-strong/40 bg-warning/10 px-2 py-0.5 text-[10px] font-mono text-nx-warning-strong" data-testid="deal-stage-locked-fields-badge">
              <Lock className="size-3" />
              {t("crmOpportunities.commercialSuite.lockedFieldsLabel")} {lockedFields.join(", ")}
            </span>
          )}
        </div>
        <Badge variant="outline" className={isSlaBreached ? "border-destructive/40 bg-destructive/10 text-destructive text-[10px]" : "border-success/40 bg-success/10 text-success text-[10px]"}>
          {isSlaBreached ? t("crmOpportunities.commercialSuite.slaWarning") : t("crmOpportunities.commercialSuite.slaOnTrack")}
        </Badge>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4 border-nx-line bg-nx-surface space-y-3" data-testid="deal-buying-committee-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-nx-accent" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-nx-ink">{t("crmOpportunities.commercialSuite.buyingCommitteeTitle")}</h3>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono">
              {contactRoles.length} {t("crmOpportunities.commercialSuite.stakeholdersCount")}
            </Badge>
          </div>

          {(validationError || submitError) && (
            <Alert variant="destructive" className="text-xs">
              <AlertCircle className="size-3.5" />
              <AlertDescription>{validationError || submitError}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <CrmEntitySearchSelect
              data-testid="committee-party-select"
              entityKind="contact"
              valueMode="partyId"
              value={contactId}
              initialLabel={contactDisplayName || undefined}
              onChange={(val, item) => {
                setContactId(val);
                setContactDisplayName(item ? (isRtl && item.labelAr ? item.labelAr : item.label) : "");
                if (validationError) setValidationError(null);
              }}
              placeholder={t("crmOpportunities.commercialSuite.selectContactPlaceholder")}
              enableQuickCreate
              quickCreateDefaultKind="contact"
              allowClear
            />
            <Select value={stakeholderRole} onValueChange={(v) => setStakeholderRole(v as StakeholderRoleType)}>
              <SelectTrigger className="h-9 text-xs w-full" data-testid="committee-role-select"><SelectValue /></SelectTrigger>
              <SelectContent>
                {buyingCommitteeRoles.map((r) => (
                  <SelectItem key={r.key} value={r.key} className="text-xs">{isRtl && r.labelAr ? r.labelAr : r.labelEn}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t("crmOpportunities.commercialSuite.influenceNotesPlaceholder")}
            className="h-8 text-xs"
            data-testid="committee-notes-input"
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Checkbox id="committee-primary" checked={isPrimary} onCheckedChange={(v) => setIsPrimary(Boolean(v))} />
              <Label htmlFor="committee-primary" className="text-xs cursor-pointer text-nx-ink-2">{t("crmOpportunities.commercialSuite.primaryCommitteeContactLabel")}</Label>
            </div>
            <div className="flex items-center gap-1.5">
              <Button type="button" size="sm" variant="ghost" className="h-7 px-2 text-[10px]" onClick={() => setShowInlineCommitteeCreator((v) => !v)} data-testid="deal-inline-create-committee-role-btn">
                <Plus className="size-2.5 me-1" />{t("crmOpportunities.commercialSuite.newStakeholderRoleBtn")}
              </Button>
              <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs" onClick={handleAddContactRole} data-testid="committee-add-role-btn">
                <Plus className="size-3.5 me-1" />{t("crmOpportunities.commercialSuite.addRoleBtn")}
              </Button>
            </div>
          </div>
          {showInlineCommitteeCreator && (
            <div className="grid grid-cols-3 gap-1.5 rounded border border-nx-line bg-nx-raised/40 p-2" data-testid="deal-inline-committee-role-form">
              <Input value={newRoleLabelEn} onChange={(e) => setNewRoleLabelEn(e.target.value)} placeholder={t("crmOpportunities.commercialSuite.roleTitleEnPlaceholder")} className="h-7 text-xs" data-testid="deal-inline-committee-role-en" />
              <Input dir="rtl" value={newRoleLabelAr} onChange={(e) => setNewRoleLabelAr(e.target.value)} placeholder={t("crmOpportunities.commercialSuite.roleTitleArPlaceholder")} className="h-7 text-xs" data-testid="deal-inline-committee-role-ar" />
              <Button
                type="button"
                size="sm"
                className="h-7 text-xs"
                onClick={() => {
                  const en = newRoleLabelEn.trim();
                  if (!en) return;
                  const key = en.replace(/[^a-zA-Z0-9]/g, "") || `CustomRole${Date.now()}`;
                  addBuyingCommitteeRole({ key, labelEn: en, labelAr: newRoleLabelAr.trim() || en });
                  setStakeholderRole(key as StakeholderRoleType);
                  setNewRoleLabelEn("");
                  setNewRoleLabelAr("");
                  setShowInlineCommitteeCreator(false);
                }}
                data-testid="deal-save-inline-committee-role-btn"
              >
                {t("crmOpportunities.commercialSuite.saveRoleBtn")}
              </Button>
            </div>
          )}

          <div className="space-y-1.5">
            {contactRoles.map((r, idx) => {
              const roleExt = r as DealContactRole & { role?: string; contactDisplayName?: string };
              const roleLabel = r.stakeholderRole || roleExt.role || "DecisionMaker";
              const displayLabel = r.contactName || roleExt.contactDisplayName || opp.partyDisplayName || t("crmOpportunities.commercialSuite.primaryAccountStakeholder");
              const rowKey = r.id || `${r.contactPartyId || "contact"}-${roleLabel}-${idx}`;
              return (
                <div key={rowKey} className="rounded-md border border-nx-line bg-nx-raised/40 px-3 py-1.5 flex items-start justify-between gap-2 text-xs" data-testid={`committee-role-row-${roleLabel}`}>
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-semibold text-nx-ink truncate">{displayLabel}</span>
                      <Badge variant="outline" className="text-[10px] font-mono">{roleLabel}</Badge>
                      {r.isPrimary && <Badge variant="secondary" className="text-[10px]">{t("crmOpportunities.commercialSuite.primaryBadge")}</Badge>}
                    </div>
                    {(r.jobTitle || r.contactEmail || r.influenceNotes) && (
                      <div className="text-[11px] text-nx-ink-3 truncate">
                        {[r.jobTitle, r.contactEmail, r.influenceNotes].filter(Boolean).join(" · ")}
                      </div>
                    )}
                  </div>
                  <Button type="button" size="icon" variant="ghost" className="h-6 w-6 shrink-0 text-destructive" onClick={() => void onRemoveContactRole?.(r.id)} aria-label={t("crmOpportunities.commercialSuite.removeStakeholderRoleLabel")}>
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>

        <OpportunityCommercialQuoteAndPlaybookSection opp={opp} isRtl={isRtl} stageHistory={stageHistory} mode="quote" />
      </div>
    </div>
  );
}
