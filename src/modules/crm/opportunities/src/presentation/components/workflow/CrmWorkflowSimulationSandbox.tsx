"use client";

import React, { useState } from "react";
import { CheckCircle2, Play, ShieldAlert, X } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Checkbox } from "@core/ui/checkbox";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { DEFAULT_CRM_SCOPED_ROLES, useCrmSettingsStore } from "@modules/crm";
import type { CrmWorkflowStageNode, CrmWorkflowTransition } from "./CrmWorkflowCanvas2D";

export interface CrmWorkflowSimulationSandboxProps {
  isAr: boolean;
  stages: CrmWorkflowStageNode[];
  transitions: CrmWorkflowTransition[];
  selectedStageKey: string | null;
  onSelectTransition: (id: string) => void;
  onClose: () => void;
}

/**
 * 2D Canvas Live Simulation Sandbox (`SCRIPE-780`) (<185 lines).
 * Simulates deal/lead state against active transitions and highlights Allowed (Emerald) vs Blocked (Rose) paths.
 */
export function CrmWorkflowSimulationSandbox({
  isAr,
  stages,
  transitions,
  selectedStageKey,
  onSelectTransition,
  onClose,
}: CrmWorkflowSimulationSandboxProps) {
  const { t } = useI18n();
  const crmRoles = useCrmSettingsStore((s) => s.crmRoles ?? DEFAULT_CRM_SCOPED_ROLES);
  const [fromStageKey, setFromStageKey] = useState(selectedStageKey || stages[0]?.stageKey || "default.discovery");
  const [amount, setAmount] = useState("320000");
  const [discountPct, setDiscountPct] = useState("18");
  const [activeRoleKey, setActiveRoleKey] = useState("pipe_role:deal_desk");
  const [verifiedParty, setVerifiedParty] = useState(true);
  const [playbookDone, setPlaybookDone] = useState(true);

  const candidateTransitions = transitions.filter(
    (tr) => tr.fromStageKey === fromStageKey || tr.fromStageKey === "*" || tr.fromStageKeys?.includes(fromStageKey) || tr.fromStageKeys?.includes("*"),
  );

  const numAmount = Number(amount) || 0;
  const numDiscount = Number(discountPct) || 0;
  const activeRole = crmRoles.find((r) => r.key === activeRoleKey);
  const roleLimit = activeRole?.maxApprovalThresholdAmount ?? null;

  const evalFieldCond = (fKey: string, op: string, valStr: string): boolean => {
    const actual = fKey === "discountPercent" ? numDiscount : numAmount;
    const expected = Number(valStr) || 0;
    if (op === "greater_or_equal") return actual >= expected;
    if (op === "greater_than") return actual > expected;
    if (op === "less_or_equal") return actual <= expected;
    if (op === "less_than") return actual < expected;
    if (op === "not_empty") return actual > 0;
    return String(actual) === valStr;
  };

  const evaluateSimulatedTransition = (tr: CrmWorkflowTransition) => {
    const targetStage = stages.find((s) => s.stageKey === tr.toStageKey);
    const reasons: string[] = [];
    if ((tr.requireVerifiedParty || tr.requiredFields.includes("partyId")) && !verifiedParty) {
      reasons.push(t("crmOpportunities.workflowSandbox.reasonMissingParty"));
    }
    if (!playbookDone) {
      reasons.push(t("crmOpportunities.workflowSandbox.reasonPlaybookIncomplete"));
    }
    if (roleLimit !== null && numAmount > roleLimit && (tr.toStageKey.includes("proposal") || tr.toStageKey.includes("negotiation") || tr.toStageKey.includes("won"))) {
      reasons.push(`Exceeds ${activeRole?.nameEn} limit (${roleLimit.toLocaleString()}) -> Escalates to ${activeRole?.backupRoleKey || "pipe_role:commercial_director"}`);
    }
    if (numDiscount > 15 && activeRoleKey === "pipe_role:deal_desk" && tr.toStageKey.includes("negotiation")) {
      reasons.push(t("crmOpportunities.workflowSandbox.reasonDiscountGate"));
    }
    for (const rule of tr.catalogRules ?? []) {
      const rk = rule.ruleTypeKey;
      const cfg = rule.config ?? {};
      if (rk === "restrict.approval_required" || rk === "restrict.roles_permissions") {
        const allowed = (cfg.approverRoles || cfg.allowedPrincipals || "").split(",").map((s) => s.trim()).filter(Boolean);
        if (allowed.length > 0 && !allowed.includes(activeRoleKey)) reasons.push(`Requires ${allowed.join(" / ")}`);
      } else if (rk === "restrict.approval_matrix") {
        const t2Min = Number(cfg.tier2MinAmount || 500000);
        const t1Min = Number(cfg.tier1MinAmount || 100000);
        const reqRoles = (numAmount >= t2Min ? cfg.tier2Roles : numAmount >= t1Min ? cfg.tier1Roles : "")?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];
        if (reqRoles.length > 0 && !reqRoles.includes(activeRoleKey)) reasons.push(`Matrix tier requires ${reqRoles.join(" + ")}`);
      } else if (rk === "restrict.field_value" || rk === "validate.multi_condition") {
        let passed = true;
        if (cfg.conditionsJson) {
          try {
            const conds = JSON.parse(cfg.conditionsJson) as Array<{ fieldKey: string; operator: string; value: string }>;
            if (Array.isArray(conds) && conds.length > 0) {
              const join = (cfg.conditionJoin || "AND").toUpperCase();
              passed = join === "OR"
                ? conds.some((c) => evalFieldCond(c.fieldKey, c.operator, c.value))
                : conds.every((c) => evalFieldCond(c.fieldKey, c.operator, c.value));
            }
          } catch { /* fallback */ }
        } else if (cfg.fieldKey) {
          passed = evalFieldCond(cfg.fieldKey, cfg.operator || "greater_or_equal", cfg.expectedValue || cfg.value || "0");
        }
        if (!passed) reasons.push(`${t("crmOpportunities.workflowSandbox.reasonConditionFailed")} (${cfg.fieldKey || "multi-condition"})`);
      } else if (rk === "validate.stage_playbook_completed" && !playbookDone) {
        reasons.push(t("crmOpportunities.workflowSandbox.reasonPlaybookIncomplete"));
      } else if (rk === "validate.verified_party" && !verifiedParty) {
        reasons.push(t("crmOpportunities.workflowSandbox.reasonMissingParty"));
      } else if (rk === "validate.financial_forecast" && numAmount <= 0) {
        reasons.push(t("crmOpportunities.workflowSandbox.reasonAmountPositive"));
      }
    }
    return {
      allowed: reasons.length === 0,
      targetLabel: targetStage ? (isAr ? targetStage.labelAr : targetStage.labelEn) : tr.toStageKey,
      reasons,
    };
  };

  return (
    <div
      className="px-4 py-2.5 border-b border-nx-line bg-nx-raised/90 backdrop-blur-sm space-y-2 z-20"
      data-testid="workflow-simulation-sandbox"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="default" className="text-[10px] font-mono gap-1">
            <Play className="w-2.5 h-2.5" />{t("crmOpportunities.workflowSandbox.liveBadge")}
          </Badge>
          <span className="text-xs font-bold text-nx-ink">
            {t("crmOpportunities.workflowSandbox.title")}
          </span>
        </div>
        <Button type="button" size="icon" variant="ghost" className="h-6 w-6" onClick={onClose} data-testid="close-simulation-sandbox-btn">
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 items-end">
        <div className="space-y-0.5">
          <Label className="text-[10px] text-nx-ink-2">{t("crmOpportunities.workflowSandbox.fromStageLabel")}</Label>
          <Select value={fromStageKey} onValueChange={setFromStageKey}>
            <SelectTrigger className="h-7 text-xs bg-nx-surface" data-testid="sim-from-stage-select"><SelectValue /></SelectTrigger>
            <SelectContent className="z-[10005]">
              {stages.map((s) => <SelectItem key={s.stageKey} value={s.stageKey} className="text-xs">{isAr ? s.labelAr : s.labelEn}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-0.5">
          <Label className="text-[10px] text-nx-ink-2">{t("crmOpportunities.workflowSandbox.dealAmountLabel")}</Label>
          <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-7 text-xs font-mono bg-nx-surface" data-testid="sim-deal-amount-input" />
        </div>
        <div className="space-y-0.5">
          <Label className="text-[10px] text-nx-ink-2">{t("crmOpportunities.workflowSandbox.discountPctLabel")}</Label>
          <Input type="number" value={discountPct} onChange={(e) => setDiscountPct(e.target.value)} className="h-7 text-xs font-mono bg-nx-surface" data-testid="sim-discount-input" />
        </div>
        <div className="space-y-0.5">
          <Label className="text-[10px] text-nx-ink-2">{t("crmOpportunities.workflowSandbox.activePipelineRoleLabel")}</Label>
          <Select value={activeRoleKey} onValueChange={setActiveRoleKey}>
            <SelectTrigger className="h-7 text-xs bg-nx-surface" data-testid="sim-pipeline-role-select"><SelectValue /></SelectTrigger>
            <SelectContent className="z-[10005]">
              {crmRoles.map((r) => <SelectItem key={r.key} value={r.key} className="text-xs">{isAr ? r.nameAr : r.nameEn}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Label className="flex items-center gap-1.5 h-7 px-2 rounded border border-nx-line bg-nx-surface text-xs cursor-pointer">
          <Checkbox checked={verifiedParty} onCheckedChange={(v) => setVerifiedParty(Boolean(v))} data-testid="sim-verified-party-checkbox" />
          <span className="truncate text-nx-ink">{t("crmOpportunities.workflowSandbox.verifiedPartyLabel")}</span>
        </Label>
        <Label className="flex items-center gap-1.5 h-7 px-2 rounded border border-nx-line bg-nx-surface text-xs cursor-pointer">
          <Checkbox checked={playbookDone} onCheckedChange={(v) => setPlaybookDone(Boolean(v))} data-testid="sim-playbook-completed-checkbox" />
          <span className="truncate text-nx-ink">{t("crmOpportunities.workflowSandbox.playbookDoneLabel")}</span>
        </Label>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-0.5" data-testid="sim-transition-results">
        {candidateTransitions.map((tr) => {
          const res = evaluateSimulatedTransition(tr);
          return (
            <Button key={tr.id} type="button" size="sm" variant="outline" onClick={() => onSelectTransition(tr.id)} data-testid={res.allowed ? `sim-transition-allowed-${tr.id}` : `sim-transition-blocked-${tr.id}`} className={`h-7 px-2.5 text-[11px] gap-1.5 ${res.allowed ? "border-success/50 bg-success/15 text-success" : "border-destructive/50 bg-destructive/15 text-destructive"}`}>
              {res.allowed ? <CheckCircle2 className="w-3 h-3 shrink-0" /> : <ShieldAlert className="w-3 h-3 shrink-0" />}
              <span className="font-bold">{isAr ? tr.nameAr : tr.nameEn} → {res.targetLabel}</span>
              {!res.allowed && <span className="text-[10px] opacity-90">({res.reasons[0]})</span>}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
