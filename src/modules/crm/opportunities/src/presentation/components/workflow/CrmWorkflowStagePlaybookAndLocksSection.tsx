"use client";

import React, { useState } from "react";
import { CheckSquare, Lock, Plus, X } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Checkbox } from "@core/ui/checkbox";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import type { CrmWorkflowStageNode } from "./CrmWorkflowCanvas2D";

export interface CrmWorkflowStagePlaybookAndLocksSectionProps {
  isAr: boolean;
  selectedStage: CrmWorkflowStageNode;
  onStageChange?: (updated: CrmWorkflowStageNode) => void;
}

const LOCKABLE_STAGE_FIELDS = [
  { key: "estimatedAmount", labelEn: "Estimated Deal Amount", labelAr: "القيمة التقديرية للصفقة" },
  { key: "currencyCode", labelEn: "Deal Currency & FX Rate", labelAr: "عملة الصفقة وسعر الصرف" },
  { key: "targetCloseDate", labelEn: "Target Close Date", labelAr: "تاريخ الإغلاق المستهدف" },
  { key: "dealType", labelEn: "Commercial Deal Type", labelAr: "نوع الصفقة التجارية" },
];

const DEFAULT_PLAYBOOK_BY_STAGE: Record<string, string[]> = {
  "default.discovery": ["Confirm BANT Budget & Sponsor Objectives", "Identify Primary Decision Maker"],
  "default.qualification": ["Validate Commercial Credit & KYC", "Schedule Technical Pitch / Tour"],
  "default.solution_fit": ["Verify Stadium LED & Hospitality Inventory", "Confirm Academy B2B Cohort Capacity"],
  "default.proposal": ["Generate Multi-Currency Commercial Quote", "Attach Sponsorship Deliverables Deck"],
  "default.negotiation": ["Obtain Legal Redline Sign-off", "Confirm Finance Payment Schedule"],
};

/**
 * Stage Node Inspector v4 (`SCRIPE-779`):
 * 1) Stage Playbook Auto-Tasks Checklist (`stage-inspector-playbook-section`)
 * 2) SAP-Style Stage Field-Locking Matrix (`stage-inspector-field-locking`)
 */
export function CrmWorkflowStagePlaybookAndLocksSection({
  isAr,
  selectedStage,
  onStageChange,
}: CrmWorkflowStagePlaybookAndLocksSectionProps) {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const rawTasks = selectedStage.properties?.playbookTasks;
  const tasks = rawTasks !== undefined
    ? rawTasks.split(";").map((s) => s.trim()).filter(Boolean)
    : (DEFAULT_PLAYBOOK_BY_STAGE[selectedStage.stageKey] ?? ["Verify Stage Gate Readiness"]);

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
            {isAr ? "مهام دليل المرحلة التلقائية (Stage Playbook)" : "Stage Playbook Auto-Tasks"}
          </span>
          <Badge variant="outline" className="text-[9px] font-mono">{tasks.length} tasks</Badge>
        </div>
        <div className="space-y-1">
          {tasks.map((task) => (
            <div key={task} className="flex items-center justify-between gap-1.5 rounded border border-nx-line bg-nx-surface px-2 py-1 text-[11px]">
              <span className="truncate text-nx-ink font-medium">{task}</span>
              <div className="flex items-center gap-1 shrink-0">
                <Badge variant="secondary" className="text-[9px] px-1 py-0">Mandatory</Badge>
                {onStageChange && (
                  <Button type="button" size="icon" variant="ghost" className="h-4 w-4 text-destructive" onClick={() => handleRemoveTask(task)}>
                    <X className="w-2.5 h-2.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        {onStageChange && (
          <div className="flex items-center gap-1.5 pt-1">
            <Input value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} placeholder={isAr ? "إضافة مهمة تلقائية للمرحلة..." : "Add stage playbook task..."} className="h-7 text-xs" data-testid="stage-playbook-add-input" />
            <Button type="button" size="sm" variant="outline" className="h-7 px-2 text-xs shrink-0" onClick={handleAddTask} data-testid="stage-playbook-add-btn">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-md border border-nx-line bg-nx-raised/30 p-3 space-y-2" data-testid="stage-inspector-field-locking">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-nx-ink inline-flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-warning" />
            {isAr ? "قفل الحقول في المرحلة (SAP Field-Locking)" : "SAP Stage Field-Locking Matrix"}
          </span>
          <Badge variant="outline" className="text-[9px] font-mono">pipe_role:finance_gatekeeper</Badge>
        </div>
        <div className="space-y-1.5">
          {LOCKABLE_STAGE_FIELDS.map((lf) => (
            <div key={lf.key} className="flex items-center justify-between text-xs" data-testid={`stage-lock-field-${lf.key}`}>
              <div className="flex items-center gap-2">
                <Checkbox id={`lock-${lf.key}`} checked={lockedFields.includes(lf.key)} onCheckedChange={() => toggleLockedField(lf.key)} />
                <Label htmlFor={`lock-${lf.key}`} className="text-xs cursor-pointer text-nx-ink">{isAr ? lf.labelAr : lf.labelEn}</Label>
              </div>
              <Badge variant={lockedFields.includes(lf.key) ? "secondary" : "outline"} className="text-[9px] font-mono">
                {lockedFields.includes(lf.key) ? "Locked (Read-Only)" : "Editable"}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
