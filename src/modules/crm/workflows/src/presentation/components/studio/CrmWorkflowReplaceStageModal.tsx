"use client";

import React from "react";
import { Button } from "@core/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { Label } from "@core/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@core/ui/select";
import type { CrmWorkflowStageNode } from "./CrmWorkflowCanvas2D";

/** Props for `CrmWorkflowReplaceStageModal`. */
export interface CrmWorkflowReplaceStageModalProps {
  t: (k: string) => string;
  isAr: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  retiringStage: CrmWorkflowStageNode;
  candidateStages: CrmWorkflowStageNode[];
  replacementTargetKey: string;
  onTargetKeyChange: (stageKey: string) => void;
  onConfirmReplace: () => void;
}

/**
 * Pure declarative Dialog component for Safe Delete & Status Replacement Migration (Jira parity).
 */
export function CrmWorkflowReplaceStageModal({
  t,
  isAr,
  open,
  onOpenChange,
  retiringStage,
  candidateStages,
  replacementTargetKey,
  onTargetKeyChange,
  onConfirmReplace,
}: CrmWorkflowReplaceStageModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-testid="replace-status-migration-modal">
        <DialogHeader>
          <DialogTitle>
            {t("crmWorkflows.pipelinesPage.replaceModalTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("crmWorkflows.pipelinesPage.replaceModalDesc")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="rounded-md border border-nx-line bg-nx-raised p-2.5 text-xs">
            <span className="text-nx-ink-2 block">
              {t("crmWorkflows.pipelinesPage.retiringStatusLabel")}
            </span>
            <span className="font-bold text-nx-ink">
              {isAr ? retiringStage.labelAr : retiringStage.labelEn}
            </span>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">
              {t("crmWorkflows.pipelinesPage.replacementStatusLabel")}
            </Label>
            <Select value={replacementTargetKey} onValueChange={onTargetKeyChange}>
              <SelectTrigger className="h-9 text-xs" data-testid="replace-status-target-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {candidateStages.map((s) => (
                  <SelectItem key={s.stageKey} value={s.stageKey} className="text-xs">
                    {isAr ? s.labelAr : s.labelEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("crmWorkflows.pipelinesPage.cancelBtn")}
          </Button>
          <Button data-testid="replace-status-confirm-btn" onClick={onConfirmReplace}>
            {t("crmWorkflows.pipelinesPage.replaceAndRemoveBtn")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
