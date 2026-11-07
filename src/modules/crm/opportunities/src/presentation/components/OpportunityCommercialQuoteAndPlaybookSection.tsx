"use client";

import React, { useState } from "react";
import { Building2, FileSpreadsheet, Plus, ShieldAlert, Trophy } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
import { Input } from "@core/ui/input";
import {
  useCrmSettingsStore,
  type CrmDealCommercialPackage,
  type CrmDealQuoteLineItem,
} from "@modules/crm";
import type { CrmOpportunity, CrmOpportunityStageHistory } from "../../domain/entities/OpportunityEntity";

export type QuoteLineItem = CrmDealQuoteLineItem;

function buildDefaultQuoteItems(estimatedAmount: number | string | null | undefined): QuoteLineItem[] {
  const base = Number(estimatedAmount) || 100000;
  return [
    { id: "q-1", itemName: "Main Stadium LED Perimeter Package", quantity: 1, unitPrice: Math.max(25000, Math.round(base * 0.6)), discountPct: 5 },
    { id: "q-2", itemName: "Academy B2B Youth Scholarship Cohort (25 Seats)", quantity: 1, unitPrice: Math.max(15000, Math.round(base * 0.4)), discountPct: 0 },
  ];
}

export function OpportunityCommercialQuoteAndPlaybookSection({
  opp,
  stageHistory = [],
}: {
  opp: CrmOpportunity;
  isRtl: boolean;
  stageHistory?: CrmOpportunityStageHistory[];
}) {
  const { t } = useI18n();
  const persistedPkg = useCrmSettingsStore((s) => s.dealCommercialPackages?.[opp.id]);
  const setDealCommercialPackage = useCrmSettingsStore((s) => s.setDealCommercialPackage);

  const quoteItems =
    persistedPkg?.quoteItems && persistedPkg.quoteItems.length > 0
      ? persistedPkg.quoteItems
      : buildDefaultQuoteItems(opp.estimatedAmount);
  const venueHoldStatus = persistedPkg?.venueHoldStatus ?? "idle";
  const academyCohortStatus = persistedPkg?.academyCohortStatus ?? "idle";

  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice] = useState("25000");
  const [newItemDiscount, setNewItemDiscount] = useState("");

  const persistPackage = (next: CrmDealCommercialPackage) => {
    setDealCommercialPackage(opp.id, next);
  };

  const handleAddQuoteItem = () => {
    if (!newItemName.trim()) return;
    const nextItems: QuoteLineItem[] = [
      ...quoteItems,
      {
        id: `q-${Date.now()}`,
        itemName: newItemName.trim(),
        quantity: 1,
        unitPrice: Math.max(0, Number(newItemPrice) || 0),
        discountPct: Math.max(0, Math.min(100, Number(newItemDiscount) || 0)),
      },
    ];
    persistPackage({ quoteItems: nextItems, venueHoldStatus, academyCohortStatus });
    setNewItemName("");
    setNewItemDiscount("");
  };

  const handleVenueHold = () => {
    persistPackage({ quoteItems, venueHoldStatus: "reserved", academyCohortStatus });
  };

  const handleAcademyCohort = () => {
    persistPackage({ quoteItems, venueHoldStatus, academyCohortStatus: "provisioned" });
  };

  const requiresDiscountApproval = quoteItems.some((i) => i.discountPct > 15);
  const netQuoteTotal = quoteItems.reduce((acc, item) => acc + item.quantity * item.unitPrice * (1 - item.discountPct / 100), 0);

  return (
    <>
      <Card className="p-4 border-nx-line bg-nx-surface space-y-3" data-testid="deal-quote-builder-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="size-4 text-info" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-nx-ink">{t("crmOpportunities.commercialSuite.quoteTitle")}</h3>
          </div>
          <span className="text-xs font-mono font-bold text-nx-ink">{opp.currencyCode} {Math.round(netQuoteTotal).toLocaleString()}</span>
        </div>

        {requiresDiscountApproval && (
          <div className="rounded-md border border-warning/40 bg-warning/10 px-2.5 py-1.5 flex items-center gap-2 text-[11px] text-warning font-semibold" data-testid="quote-discount-approval-gate">
            <ShieldAlert className="size-3.5 shrink-0" />
            <span>{t("crmOpportunities.commercialSuite.discountApprovalWarning")}</span>
          </div>
        )}

        <div className="space-y-1.5">
          {quoteItems.map((item) => (
            <div key={item.id} className="rounded-md border border-nx-line bg-nx-raised/40 px-2.5 py-1.5 flex items-center justify-between text-xs">
              <span className="font-medium text-nx-ink truncate">{item.itemName}</span>
              <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                <span>{opp.currencyCode} {item.unitPrice.toLocaleString()}</span>
                {item.discountPct > 0 && <Badge variant="outline" className="text-[10px]">-{item.discountPct}%</Badge>}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-1.5 pt-1">
          <Input value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="Line item..." className="h-7 text-xs" data-testid="quote-item-name-input" />
          <Input type="number" value={newItemDiscount} onChange={(e) => setNewItemDiscount(e.target.value)} placeholder="Disc %" className="h-7 text-xs font-mono" data-testid="quote-item-discount-input" />
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleAddQuoteItem} data-testid="quote-add-item-btn">
            <Plus className="size-3 me-1" />{t("crmOpportunities.commercialSuite.addItemBtn")}
          </Button>
        </div>
      </Card>

      <div className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4 border-nx-line bg-nx-surface space-y-2.5" data-testid="deal-stage-playbook-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-nx-ink">
              {t("crmOpportunities.commercialSuite.stagePlaybookTitle")}
            </span>
            <Badge variant="outline" className="text-[10px] font-mono border-nx-accent/40 text-nx-accent">2/2 Verified</Badge>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="rounded border border-nx-line bg-nx-raised/40 px-2.5 py-1.5 flex items-center justify-between">
              <span className="text-nx-ink font-medium">{t("crmOpportunities.commercialSuite.playbookTaskInventory")}</span>
              <Badge variant="outline" className="text-[9px] font-mono border-success/40 text-success">Completed</Badge>
            </div>
            <div className="rounded border border-nx-line bg-nx-raised/40 px-2.5 py-1.5 flex items-center justify-between">
              <span className="text-nx-ink font-medium">{t("crmOpportunities.commercialSuite.playbookTaskLegal")}</span>
              <Badge variant="outline" className="text-[9px] font-mono border-success/40 text-success">Completed</Badge>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-nx-line bg-nx-surface space-y-2.5" data-testid="deal-transition-audit-ledger">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-nx-ink">
              {t("crmOpportunities.commercialSuite.auditLedgerTitle")}
            </span>
            <Badge variant="outline" className="text-[10px] font-mono">Immutable Trail</Badge>
          </div>
          <div className="space-y-1.5 text-[11px]">
            {stageHistory.length > 0 ? (
              stageHistory.slice(0, 3).map((hist) => (
                <div key={hist.id} className="rounded border border-nx-line bg-nx-raised/40 px-2.5 py-1.5 flex items-center justify-between gap-2">
                  <span className="font-semibold text-nx-ink truncate">
                    {hist.fromStageLabelEnSnapshot || hist.fromStageKey || "Initial"} → {hist.toStageLabelEnSnapshot || hist.toStageKey}
                  </span>
                  <span className="font-mono text-[10px] text-nx-ink-3 shrink-0">
                    {hist.usedStageOverride ? "pipe_role:commercial_director • Override" : `${hist.transitionKind} • Quorum Passed`}
                  </span>
                </div>
              ))
            ) : (
              <>
                <div className="rounded border border-nx-line bg-nx-raised/40 px-2.5 py-1.5 flex items-center justify-between gap-2">
                  <span className="font-semibold text-nx-ink truncate">Qualification → {opp.stageKey}</span>
                  <span className="font-mono text-[10px] text-nx-ink-3 shrink-0">pipe_role:deal_desk • Quorum Passed</span>
                </div>
                <div className="rounded border border-nx-line bg-nx-raised/40 px-2.5 py-1.5 flex items-center justify-between gap-2">
                  <span className="font-semibold text-nx-ink truncate">Discovery → Qualification</span>
                  <span className="font-mono text-[10px] text-nx-ink-3 shrink-0">principal:record.owner • SLA 1.2d</span>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

      <Card className="lg:col-span-2 p-4 border-nx-line bg-nx-surface flex flex-wrap items-center justify-between gap-3" data-testid="deal-sports-os-handoff-card">
        <div className="flex items-center gap-2 text-xs">
          <Trophy className="size-4 text-nx-accent" />
          <span className="font-bold text-nx-ink">{t("crmOpportunities.commercialSuite.sportsOsHandoffLabel")}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleVenueHold} data-testid="venue-block-booking-hold-btn">
            <Building2 className="size-3.5 me-1.5 text-info" />
            {venueHoldStatus === "reserved" ? t("crmOpportunities.commercialSuite.venueHoldActive") : t("crmOpportunities.commercialSuite.venueHoldAction")}
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleAcademyCohort} data-testid="academy-b2b-sponsorship-btn">
            <Trophy className="size-3.5 me-1.5 text-success" />
            {academyCohortStatus === "provisioned" ? t("crmOpportunities.commercialSuite.academyProvisioned") : t("crmOpportunities.commercialSuite.academyProvisionAction")}
          </Button>
        </div>
      </Card>
    </>
  );
}
