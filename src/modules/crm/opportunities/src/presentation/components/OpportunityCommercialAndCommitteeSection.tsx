"use client";

import React, { useEffect, useState } from "react";
import { Clock, Lock, Plus, Trash2, Users } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
import { Checkbox } from "@core/ui/checkbox";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { DEFAULT_BUYING_COMMITTEE_ROLES, useCrmSettingsStore, useCrmWorkflowsStore } from "@modules/crm";
import type { CrmOpportunity, CrmOpportunityStageHistory, DealContactRoleDto } from "../../domain/entities/OpportunityEntity";
import {
  OpportunityCommercialQuoteAndPlaybookSection,
  type QuoteLineItem,
} from "./OpportunityCommercialQuoteAndPlaybookSection";

export type { QuoteLineItem };

type StakeholderRoleType = DealContactRoleDto["stakeholderRole"];

export function OpportunityCommercialAndCommitteeSection({
  opp,
  isRtl,
  stageHistory = [],
  contactRoles = [],
  onLookupParties,
  onAddContactRole,
  onRemoveContactRole,
}: {
  opp: CrmOpportunity;
  isRtl: boolean;
  stageHistory?: CrmOpportunityStageHistory[];
  contactRoles?: DealContactRoleDto[];
  onLookupParties?: (q?: string) => Promise<Array<any>>;
  onAddContactRole?: (input: {
    contactPartyId: string;
    contactName: string;
    stakeholderRole: StakeholderRoleType;
    isPrimary: boolean;
    influenceNotes?: string;
  }) => Promise<void>;
  onRemoveContactRole?: (roleId: string) => Promise<void>;
}) {
  const { t } = useI18n();
  const activeDealWorkflow = useCrmWorkflowsStore((s) => s.getActiveWorkflow("deal"));
  const activeStage = activeDealWorkflow?.stages.find((s) => s.stageKey === opp.stageKey);
  const rawLockedFields =
    (activeStage as { properties?: Record<string, string> })?.properties?.lockedFields ??
    (opp.stageKey.includes("negotiation") || opp.status === "Won" ? "estimatedAmount,currencyCode" : "");
  const lockedFields = rawLockedFields ? rawLockedFields.split(",").map((s) => s.trim()).filter(Boolean) : [];

  const buyingCommitteeRoles = useCrmSettingsStore((s) => s.buyingCommitteeRoles ?? DEFAULT_BUYING_COMMITTEE_ROLES);
  const addBuyingCommitteeRole = useCrmSettingsStore((s) => s.addBuyingCommitteeRole);
  const [contactId, setContactId] = useState("");
  const [stakeholderRole, setStakeholderRole] = useState<StakeholderRoleType>("DecisionMaker");
  const [isPrimary, setIsPrimary] = useState(true);
  const [notes, setNotes] = useState("");
  const [partyOptions, setPartyOptions] = useState<Array<{ id: string; displayName: string }>>([]);
  const [showInlineCommitteeCreator, setShowInlineCommitteeCreator] = useState(false);
  const [newRoleLabelEn, setNewRoleLabelEn] = useState("");
  const [newRoleLabelAr, setNewRoleLabelAr] = useState("");

  useEffect(() => {
    if (onLookupParties) {
      onLookupParties("").then((opts) => {
        setPartyOptions((opts || []).map((o: any) => ({ id: o.id || o.partyId, displayName: o.displayName || o.label })));
      }).catch(() => undefined);
    }
  }, [opp.id, onLookupParties]);

  const enteredMs = opp.enteredStageAtUtc ? new Date(opp.enteredStageAtUtc).getTime() : Date.now() - 86400000 * 2;
  const dwellDays = Math.max(0, Math.floor((Date.now() - enteredMs) / 86400000));
  const slaDays = activeStage?.slaDays ?? 7;
  const isSlaBreached = dwellDays > slaDays;

  const handleAddContactRole = async () => {
    const targetPartyId = contactId.trim() || opp.partyId || "22222222-2222-2222-2222-222222222211";
    const matchedParty = partyOptions.find((p) => p.id === targetPartyId);
    const contactName = matchedParty?.displayName || (opp as any).partyDisplayName || t("crmOpportunities.commercialSuite.primaryAccountStakeholder");
    if (onAddContactRole) {
      await onAddContactRole({
        contactPartyId: targetPartyId,
        contactName,
        stakeholderRole,
        isPrimary,
        influenceNotes: notes.trim() || undefined,
      });
      setNotes("");
    }
  };

  return (
    <div className="space-y-4" dir={isRtl ? "rtl" : "ltr"}>
      <Card className="p-3.5 border-nx-line bg-nx-surface flex flex-wrap items-center justify-between gap-3" data-testid="deal-dwell-time-ribbon">
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <Clock className="size-4 text-info" />
          <span className="font-bold text-nx-ink">{t("crmOpportunities.commercialSuite.dwellTimeLabel")}</span>
          <span className="font-mono font-semibold text-nx-ink">{dwellDays}d / {slaDays}d SLA</span>
          {lockedFields.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded border border-warning/40 bg-warning/10 px-2 py-0.5 text-[10px] font-mono text-warning" data-testid="deal-stage-locked-fields-badge">
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
            <Badge variant="outline" className="text-[10px] font-mono">{contactRoles.length} stakeholders</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Select
              value={contactId && (contactId === opp.partyId || partyOptions.some((p) => p.id === contactId)) ? contactId : "default"}
              onValueChange={(v) => setContactId(v === "default" ? "" : v)}
            >
              <SelectTrigger className="h-8 text-xs w-full" data-testid="committee-party-select">
                <SelectValue placeholder={t("crmOpportunities.commercialSuite.selectContactPlaceholder", { defaultValue: "Select Contact / Stakeholder..." })} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default" className="text-xs">
                  {t("crmOpportunities.commercialSuite.selectContactPlaceholder", { defaultValue: "Select Contact / Stakeholder..." })}
                </SelectItem>
                {opp.partyId && !partyOptions.some((p) => p.id === opp.partyId) && (
                  <SelectItem value={opp.partyId} className="text-xs">
                    {(opp as any).partyDisplayName || t("crmOpportunities.commercialSuite.primaryAccountStakeholder")}
                  </SelectItem>
                )}
                {partyOptions.filter((p) => p.id && p.id !== opp.partyId).map((p, idx) => (
                  <SelectItem key={`${p.id}-${idx}`} value={p.id} className="text-xs">{p.displayName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={stakeholderRole} onValueChange={(v) => setStakeholderRole(v as StakeholderRoleType)}>
              <SelectTrigger className="h-8 text-xs w-full" data-testid="committee-role-select"><SelectValue /></SelectTrigger>
              <SelectContent>
                {buyingCommitteeRoles.map((r) => (
                  <SelectItem key={r.key} value={r.key} className="text-xs">{isRtl ? r.labelAr : r.labelEn}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
                  addBuyingCommitteeRole({ key, labelEn: en, labelAr: newRoleLabelAr.trim() || en, isSystem: false });
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
              const roleLabel = r.stakeholderRole || (r as any).role || "DecisionMaker";
              const displayLabel = r.contactName || (r as any).contactDisplayName || (opp as any).partyDisplayName || t("crmOpportunities.commercialSuite.primaryAccountStakeholder");
              const rowKey = r.id || `${r.contactPartyId || "contact"}-${roleLabel}-${idx}`;
              return (
                <div key={rowKey} className="rounded-md border border-nx-line bg-nx-raised/40 px-3 py-1.5 flex items-center justify-between text-xs" data-testid={`committee-role-row-${roleLabel}`}>
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-semibold text-nx-ink truncate">{displayLabel}</span>
                    <Badge variant="outline" className="text-[10px] font-mono">{roleLabel}</Badge>
                    {r.isPrimary && <Badge variant="secondary" className="text-[10px]">{t("crmOpportunities.commercialSuite.primaryBadge")}</Badge>}
                  </div>
                  <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => void onRemoveContactRole?.(r.id)}>
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>

        <OpportunityCommercialQuoteAndPlaybookSection opp={opp} isRtl={isRtl} stageHistory={stageHistory} />
      </div>
    </div>
  );
}
