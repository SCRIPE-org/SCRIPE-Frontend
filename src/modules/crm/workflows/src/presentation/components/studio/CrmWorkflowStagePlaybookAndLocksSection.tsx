"use client";

import React, { useState } from "react";
import { CheckSquare, Lock, Plus, X } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Checkbox } from "@core/ui/checkbox";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import type { CrmWorkflowStageNode } from "./CrmWorkflowCanvas2D";

/** Props for `CrmWorkflowStagePlaybookAndLocksSection`. */
export interface CrmWorkflowStagePlaybookAndLocksSectionProps {
  isAr: boolean;
  selectedStage: CrmWorkflowStageNode;
  onStageChange?: (updated: CrmWorkflowStageNode) => void;
}

const LOCKABLE_STAGE_FIELDS = [
  { key: "estimatedAmount", labelKey: "crmWorkflows.ruleConfig.lockableFields.estimatedAmount" },
  { key: "currencyCode", labelKey: "crmWorkflows.ruleConfig.lockableFields.currencyCode" },
  { key: "targetCloseDate", labelKey: "crmWorkflows.ruleConfig.lockableFields.targetCloseDate" },
  { key: "dealType", labelKey: "crmWorkflows.ruleConfig.lockableFields.dealType" },
];

const DEFAULT_PLAYBOOK_KEYS_BY_STAGE: Record<string, string[]> = {
  "default.discovery": [
    "crmWorkflows.ruleConfig.defaultPlaybook.discoveryBant",
    "crmWorkflows.ruleConfig.defaultPlaybook.discoveryDecisionMaker",
  ],
  "default.qualification": [
    "crmWorkflows.ruleConfig.defaultPlaybook.qualificationKyc",
    "crmWorkflows.ruleConfig.defaultPlaybook.qualificationPitch",
  ],
  "default.solution_fit": [
    "crmWorkflows.ruleConfig.defaultPlaybook.solutionFitInventory",
    "crmWorkflows.ruleConfig.defaultPlaybook.solutionFitCapacity",
  ],
  "default.proposal": [
    "crmWorkflows.ruleConfig.defaultPlaybook.proposalQuote",
    "crmWorkflows.ruleConfig.defaultPlaybook.proposalDeck",
  ],
  "default.negotiation": [
    "crmWorkflows.ruleConfig.defaultPlaybook.negotiationLegal",
    "crmWorkflows.ruleConfig.defaultPlaybook.negotiationFinance",
  ],
};

/**
 * Stage Node Inspector v4 (`SCRIPE-779`):
 * 1) Stage Playbook Auto-Tasks Checklist (`stage-inspector-playbook-section`)
 * 2) SAP-Style Stage Field-Locking Matrix (`stage-inspector-field-locking`)
 */
export function CrmWorkflowStagePlaybookAndLocksSection({
  selectedStage,
  onStageChange,
}: CrmWorkflowStagePlaybookAndLocksSectionProps) {
  const { t } = useI18n();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const rawTasks = selectedStage.properties?.playbookTasks;
  const tasks = rawTasks !== undefined
    ? rawTasks.split(";").map((s) => s.trim()).filter(Boolean)
    : (DEFAULT_PLAYBOOK_KEYS_BY_STAGE[selectedStage.stageKey] ?? ["crmWorkflows.ruleConfig.defaultPlaybook.defaultReadiness"]).map((k) => t(k));

  const rawLocks = selectedStage.properties?.lockedFields;
  const lockedFields = rawLocks !== undefined
    ? rawLocks.split(",").map((s) => s.trim()).filter(Boolean)
    : (selectedStage.stageKey.includes("negotiation") || selectedStage.category === "done"
        ? ["estimatedAmount", "currencyCode"]
        : []);

  const updateStageProp = (propKey: string, propVal: string) => {
    if (!onStageChange) return;
    onStageChange({
      ...selectedStage,
      properties: { ...(selectedStage.properties ?? {}), [propKey]: propVal },
    });
  };

  const handleAddTask = () => {
    const clean = newTaskTitle.trim();
    if (!clean) return;
    updateStageProp("playbookTasks", [...tasks, clean].join(";"));
    setNewTaskTitle("");
  };

  const handleRemoveTask = (task: string) => {
    updateStageProp("playbookTasks", tasks.filter((t) => t !== task).join(";"));
  };

  const toggleLockedField = (fieldKey: string) => {
    const next = lockedFields.includes(fieldKey)
      ? lockedFields.filter((f) => f !== fieldKey)
      : [...lockedFields, fieldKey];
    updateStageProp("lockedFields", next.join(","));
  };

  return (
    <>
      <div className="rounded-md border border-nx-line bg-nx-raised/30 p-3 space-y-2" data-testid="stage-inspector-playbook-section">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-nx-ink inline-flex items-center gap-1.5">
            <CheckSquare className="w-3.5 h-3.5 text-success" />
            {t("crmWorkflows.ruleConfig.stagePlaybookAutoTasksTitle")}
          </span>
          <Badge variant="outline" className="text-[9px] font-mono">{tasks.length} {t("crmWorkflows.ruleConfig.tasksSuffix")}</Badge>
        </div>
        <div className="space-y-1">
          {tasks.map((task) => (
            <div key={task} className="flex items-center justify-between gap-1.5 rounded border border-nx-line bg-nx-surface px-2 py-1 text-[11px]">
              <span className="truncate text-nx-ink font-medium">{task}</span>
              <div className="flex items-center gap-1 shrink-0">
                <Badge variant="secondary" className="text-[9px] px-1 py-0">{t("crmWorkflows.ruleConfig.mandatoryBadge")}</Badge>
                {onStageChange && (
                  <Button type="button" size="icon" variant="ghost" className="h-4 w-4 text-destructive" onClick={() => handleRemoveTask(task)} aria-label={`${t("crmWorkflows.ruleConfig.removeTaskLabel")}: ${task}`}>
                    <X className="w-2.5 h-2.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        {onStageChange && (
          <div className="flex items-center gap-1.5 pt-1">
            <Input value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} placeholder={t("crmWorkflows.ruleConfig.addPlaybookTaskPlaceholder")} className="h-7 text-xs" data-testid="stage-playbook-add-input" />
            <Button type="button" size="sm" variant="outline" className="h-7 px-2 text-xs shrink-0" onClick={handleAddTask} data-testid="stage-playbook-add-btn" aria-label={t("crmWorkflows.ruleConfig.addTaskLabel")}>
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-md border border-nx-line bg-nx-raised/30 p-3 space-y-2" data-testid="stage-inspector-field-locking">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-nx-ink inline-flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-nx-warning-strong" />
            {t("crmWorkflows.ruleConfig.sapFieldLockingTitle")}
          </span>
          <Badge variant="outline" className="text-[9px] font-mono">pipe_role:finance_gatekeeper</Badge>
        </div>
        <div className="space-y-1.5">
          {LOCKABLE_STAGE_FIELDS.map((lf) => (
            <div key={lf.key} className="flex items-center justify-between text-xs" data-testid={`stage-lock-field-${lf.key}`}>
              <div className="flex items-center gap-2">
                <Checkbox id={`lock-${lf.key}`} checked={lockedFields.includes(lf.key)} onCheckedChange={() => toggleLockedField(lf.key)} />
                <Label htmlFor={`lock-${lf.key}`} className="text-xs cursor-pointer text-nx-ink">{t(lf.labelKey)}</Label>
              </div>
              <Badge variant={lockedFields.includes(lf.key) ? "secondary" : "outline"} className="text-[9px] font-mono">
                {lockedFields.includes(lf.key) ? t("crmWorkflows.ruleConfig.lockedReadOnlyBadge") : t("crmWorkflows.ruleConfig.editableBadge")}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
