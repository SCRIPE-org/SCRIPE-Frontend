"use client";

import React, { useState } from "react";
import { CheckCircle2, Play, ShieldAlert, X } from "lucide-react";
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
 * 2D Canvas Live Simulation Sandbox (`SCRIPE-780`) (<155 lines).
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

  const evaluateSimulatedTransition = (tr: CrmWorkflowTransition) => {
    const targetStage = stages.find((s) => s.stageKey === tr.toStageKey);
    const reasons: string[] = [];
    if ((tr.requireVerifiedParty || tr.requiredFields.includes("partyId")) && !verifiedParty) {
      reasons.push("Missing Verified Account/Contact");
    }
    if (!playbookDone) {
      reasons.push("Stage Playbook Tasks Incomplete");
    }
    if (roleLimit !== null && numAmount > roleLimit && (tr.toStageKey.includes("proposal") || tr.toStageKey.includes("negotiation") || tr.toStageKey.includes("won"))) {
      reasons.push(`Exceeds ${activeRole?.nameEn} limit (${roleLimit.toLocaleString()}) -> Escalates to ${activeRole?.backupRoleKey || "pipe_role:commercial_director"}`);
    }
    if (numDiscount > 15 && activeRoleKey === "pipe_role:deal_desk" && tr.toStageKey.includes("negotiation")) {
      reasons.push("Discount > 15% requires Commercial Director or Finance Gatekeeper");
    }
    for (const rule of tr.catalogRules ?? []) {
      if (rule.ruleTypeKey === "restrict.approval_required" || rule.ruleTypeKey === "restrict.roles_permissions") {
        const allowed = (rule.config?.approverRoles || rule.config?.allowedPrincipals || "").split(",").map((s) => s.trim()).filter(Boolean);
        if (allowed.length > 0 && !allowed.includes(activeRoleKey)) {
          reasons.push(`Requires ${allowed.join(" / ")}`);
        }
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
            <Play className="w-2.5 h-2.5" />LIVE SANDBOX
          </Badge>
          <span className="text-xs font-bold text-nx-ink">
            {isAr ? "محاكاة قواعد ومسارات الانتقال الفورية" : "Interactive Workflow Transition Simulator"}
          </span>
        </div>
        <Button type="button" size="icon" variant="ghost" className="h-6 w-6" onClick={onClose} data-testid="close-simulation-sandbox-btn">
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 items-end">
        <div className="space-y-0.5">
          <Label className="text-[10px] text-nx-ink-2">{isAr ? "من المرحلة" : "From Stage"}</Label>
          <Select value={fromStageKey} onValueChange={setFromStageKey}>
            <SelectTrigger className="h-7 text-xs bg-nx-surface" data-testid="sim-from-stage-select"><SelectValue /></SelectTrigger>
            <SelectContent className="z-[10005]">
              {stages.map((s) => <SelectItem key={s.stageKey} value={s.stageKey} className="text-xs">{isAr ? s.labelAr : s.labelEn}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-0.5">
          <Label className="text-[10px] text-nx-ink-2">{isAr ? "قيمة الصفقة" : "Deal Amount"}</Label>
          <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-7 text-xs font-mono bg-nx-surface" data-testid="sim-deal-amount-input" />
        </div>
        <div className="space-y-0.5">
          <Label className="text-[10px] text-nx-ink-2">{isAr ? "نسبة الخصم %" : "Discount %"}</Label>
          <Input type="number" value={discountPct} onChange={(e) => setDiscountPct(e.target.value)} className="h-7 text-xs font-mono bg-nx-surface" data-testid="sim-discount-input" />
        </div>
        <div className="space-y-0.5">
          <Label className="text-[10px] text-nx-ink-2">{isAr ? "دور خط البيع النشط" : "Active Pipeline Role"}</Label>
          <Select value={activeRoleKey} onValueChange={setActiveRoleKey}>
            <SelectTrigger className="h-7 text-xs bg-nx-surface" data-testid="sim-pipeline-role-select"><SelectValue /></SelectTrigger>
            <SelectContent className="z-[10005]">
              {crmRoles.map((r) => <SelectItem key={r.key} value={r.key} className="text-xs">{isAr ? r.nameAr : r.nameEn}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <label className="flex items-center gap-1.5 h-7 px-2 rounded border border-nx-line bg-nx-surface text-xs cursor-pointer">
          <Checkbox checked={verifiedParty} onCheckedChange={(v) => setVerifiedParty(Boolean(v))} data-testid="sim-verified-party-checkbox" />
          <span className="truncate">{isAr ? "عميل موثق" : "Verified Party"}</span>
        </label>
        <label className="flex items-center gap-1.5 h-7 px-2 rounded border border-nx-line bg-nx-surface text-xs cursor-pointer">
          <Checkbox checked={playbookDone} onCheckedChange={(v) => setPlaybookDone(Boolean(v))} data-testid="sim-playbook-completed-checkbox" />
          <span className="truncate">{isAr ? "اكتمال المهام" : "Playbook Done"}</span>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-0.5" data-testid="sim-transition-results">
        {candidateTransitions.map((tr) => {
          const res = evaluateSimulatedTransition(tr);
          return (
            <Button
              key={tr.id}
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onSelectTransition(tr.id)}
              data-testid={res.allowed ? `sim-transition-allowed-${tr.id}` : `sim-transition-blocked-${tr.id}`}
              className={`h-7 px-2.5 text-[11px] gap-1.5 ${
                res.allowed
                  ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                  : "border-rose-500/50 bg-rose-500/15 text-rose-700 dark:text-rose-300"
              }`}
            >
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
