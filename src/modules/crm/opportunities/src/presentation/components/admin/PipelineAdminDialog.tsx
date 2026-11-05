"use client";

import React, { useState, useEffect } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import { AlertCircle, AlertTriangle, Settings } from "lucide-react";
import type {
  PipelineDefinition,
  UpdateDefaultPipelineInput,
  UpdatePipelineStageItem,
} from "../../../domain/entities/OpportunityEntity";
import {
  PipelineAdminStageRow,
  PERMITTED_EXIT_FIELDS,
  EXIT_FIELD_LABELS,
  type StageDraftState,
} from "./PipelineAdminStageRow";

export { PERMITTED_EXIT_FIELDS, EXIT_FIELD_LABELS, type StageDraftState };

export interface PipelineAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pipeline: PipelineDefinition | null;
  onSubmit: (input: UpdateDefaultPipelineInput) => Promise<boolean>;
  isSubmitting?: boolean;
  submitError?: string | null;
}

export const CANONICAL_STAGE_KEYS = [
  "default.discovery",
  "default.qualification",
  "default.solution_fit",
  "default.proposal",
  "default.negotiation",
] as const;

export function PipelineAdminDialog({
  open,
  onOpenChange,
  pipeline,
  onSubmit,
  isSubmitting = false,
  submitError,
}: PipelineAdminDialogProps) {
  const { t, language } = useI18n();
  const isRtl = language === "ar";
  const [draftStages, setDraftStages] = useState<StageDraftState[]>([]);
  const [clientValidationError, setClientValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!pipeline?.stages || pipeline.stages.length === 0) {
      setDraftStages([
        { stageKey: "default.discovery", labelEn: "Discovery", labelAr: "استكشاف", sortOrder: 1, winProbabilityPercent: "10", requiredExitFields: [] },
        { stageKey: "default.qualification", labelEn: "Qualification", labelAr: "تأهيل", sortOrder: 2, winProbabilityPercent: "25", requiredExitFields: [] },
        { stageKey: "default.solution_fit", labelEn: "Solution Fit", labelAr: "ملاءمة الحل", sortOrder: 3, winProbabilityPercent: "50", requiredExitFields: [] },
        { stageKey: "default.proposal", labelEn: "Proposal", labelAr: "عرض السعر", sortOrder: 4, winProbabilityPercent: "75", requiredExitFields: ["partyId"] },
        { stageKey: "default.negotiation", labelEn: "Negotiation", labelAr: "تفاوض", sortOrder: 5, winProbabilityPercent: "90", requiredExitFields: ["partyId"] },
      ]);
      return;
    }
    const loaded: StageDraftState[] = CANONICAL_STAGE_KEYS.map((key, defaultIdx) => {
      const existing = pipeline.stages.find((s: any) => s.stageKey === key);
      return {
        stageKey: key,
        labelEn: existing?.labelEn || `Stage ${defaultIdx + 1}`,
        labelAr: existing?.labelAr || "",
        sortOrder: existing?.sortOrder ?? defaultIdx + 1,
        winProbabilityPercent:
          existing?.winProbabilityPercent != null
            ? String(existing.winProbabilityPercent)
            : existing?.probabilityPercent != null
              ? String(existing.probabilityPercent)
              : "",
        requiredExitFields: existing?.requiredExitFields ? [...existing.requiredExitFields] : [],
        expectedRowVersion: existing?.rowVersion ?? null,
      };
    });
    loaded.sort((a, b) => a.sortOrder - b.sortOrder);
    setDraftStages(loaded);
    setClientValidationError(null);
  }, [pipeline, open]);

  const handleFieldChange = (index: number, field: keyof StageDraftState, value: any) => {
    setDraftStages((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    setClientValidationError(null);
  };

  const handleSwapStageOrder = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= draftStages.length) return;
    setDraftStages((prev) => {
      const next = [...prev];
      const currentOrder = next[index].sortOrder;
      const neighborOrder = next[targetIdx].sortOrder;
      next[index] = { ...next[index], sortOrder: neighborOrder };
      next[targetIdx] = { ...next[targetIdx], sortOrder: currentOrder };
      next.sort((a, b) => a.sortOrder - b.sortOrder);
      return next;
    });
    setClientValidationError(null);
  };

  const handleToggleExitField = (index: number, fieldKey: string) => {
    setDraftStages((prev) => {
      const next = [...prev];
      const current = next[index].requiredExitFields;
      const exists = current.includes(fieldKey);
      next[index] = {
        ...next[index],
        requiredExitFields: exists ? current.filter((k) => k !== fieldKey) : [...current, fieldKey],
      };
      return next;
    });
    setClientValidationError(null);
  };

  const validateDraft = (): string | null => {
    const stageKeys = draftStages.map((s) => s.stageKey);
    for (const canonKey of CANONICAL_STAGE_KEYS) {
      if (!stageKeys.includes(canonKey)) return `Missing required canonical stage key: ${canonKey}`;
    }
    for (const stage of draftStages) {
      if (!stage.labelEn || stage.labelEn.trim().length === 0) {
        return `English label for ${stage.stageKey} cannot be empty.`;
      }
    }
    const sortedOrders = draftStages.map((s) => Number(s.sortOrder)).sort((a, b) => a - b);
    const isContiguous = sortedOrders.length === 5 && sortedOrders.every((val, idx) => val === idx + 1);
    if (!isContiguous) {
      return t("crmOpportunities.dialogs.pipelineAdmin.invalidOrderWarning", {
        defaultValue: "Stages must have unique contiguous sort orders from 1 to 5.",
      });
    }
    const proposalStage = draftStages.find((s) => s.stageKey === "default.proposal");
    if (!proposalStage) return "Proposal stage is missing.";
    const preProposalKeys = ["default.discovery", "default.qualification", "default.solution_fit"];
    const hasPreProposalStage = preProposalKeys.some((key) => {
      const stage = draftStages.find((s) => s.stageKey === key);
      return stage && Number(stage.sortOrder) < Number(proposalStage.sortOrder);
    });
    if (!hasPreProposalStage) {
      return t("crmOpportunities.dialogs.pipelineAdmin.preProposalRuleWarning", {
        defaultValue: "At least one pre-proposal stage (Discovery, Qualification, or Solution Fit) must precede Proposal.",
      });
    }
    for (const stage of draftStages) {
      if (stage.winProbabilityPercent.trim() !== "") {
        const num = Number(stage.winProbabilityPercent);
        if (isNaN(num) || num < 0 || num > 100) {
          return `Win probability for ${stage.labelEn} must be between 0 and 100%.`;
        }
      }
    }
    return null;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateDraft();
    if (error) {
      setClientValidationError(error);
      return;
    }
    const stageItems: UpdatePipelineStageItem[] = draftStages.map((s) => ({
      stageKey: s.stageKey,
      labelEn: s.labelEn.trim(),
      labelAr: s.labelAr.trim() || null,
      sortOrder: Number(s.sortOrder),
      winProbabilityPercent: s.winProbabilityPercent.trim() !== "" ? Number(s.winProbabilityPercent) : null,
      requiredExitFields: s.requiredExitFields,
      expectedRowVersion: s.expectedRowVersion ?? null,
    }));
    const input: UpdateDefaultPipelineInput = {
      nameEn: pipeline?.nameEn || pipeline?.name || "Standard Commercial Pipeline",
      nameAr: pipeline?.nameAr ?? null,
      stages: stageItems,
      expectedRowVersion: pipeline?.rowVersion || "",
    };
    const success = await onSubmit(input);
    if (success) onOpenChange(false);
  };

  const isPartyReorderError =
    submitError &&
    (submitError.includes("CRM_OPPORTUNITY_PARTY_REQUIRED_ON_REORDER") ||
      submitError.toLowerCase().includes("party required on reorder"));
  const proposalStage = draftStages.find((s) => s.stageKey === "default.proposal");
  const proposalSortOrder = proposalStage ? Number(proposalStage.sortOrder) : 4;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="pipeline-admin-dialog" className="max-w-3xl max-h-[90vh] overflow-y-auto" dir={isRtl ? "rtl" : "ltr"}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-nx-md bg-nx-raised border border-nx-line">
              <Settings className="size-4 text-nx-ink" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-nx-ink">
                {t("crmOpportunities.dialogs.pipelineAdmin.title", { defaultValue: "Default Pipeline Administration" })}
              </DialogTitle>
              <DialogDescription className="text-xs text-nx-ink-2">
                {t("crmOpportunities.dialogs.pipelineAdmin.description", {
                  defaultValue: "Configure stage names, ordering, win probabilities, and exit criteria for the tenant default pipeline.",
                })}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {clientValidationError && (
          <Alert variant="destructive" className="py-2.5">
            <AlertCircle className="size-4 shrink-0" />
            <AlertTitle className="text-xs font-bold">
              {t("crmOpportunities.pipelineAdmin.validationErrorTitle", { defaultValue: "Pipeline Validation Error" })}
            </AlertTitle>
            <AlertDescription className="text-xs">{clientValidationError}</AlertDescription>
          </Alert>
        )}

        {submitError && (
          <Alert variant="destructive" className="py-2.5">
            <AlertTriangle className="size-4 shrink-0" />
            <AlertTitle className="text-xs font-bold">
              {isPartyReorderError
                ? t("crmOpportunities.pipelineAdmin.reorderBlockedTitle", { defaultValue: "Reorder Blocked: Unlinked Deals Gate" })
                : t("crmOpportunities.pipelineAdmin.updateErrorTitle", { defaultValue: "Pipeline Update Error" })}
            </AlertTitle>
            <AlertDescription className="text-xs">
              {isPartyReorderError
                ? t("crmOpportunities.dialogs.pipelineAdmin.partyReorderWarning", {
                    defaultValue:
                      "Cannot advance stage order while open unlinked deals reside on this stage without a verified Account or Contact. Link deals to an Account/Contact or move them backward before saving.",
                  })
                : submitError}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSave} className="space-y-4 pt-1">
          <div className="space-y-3">
            {draftStages.map((stage, idx) => (
              <PipelineAdminStageRow
                key={stage.stageKey}
                t={t}
                isRtl={isRtl}
                stage={stage}
                idx={idx}
                totalCount={draftStages.length}
                isProposalOrLater={Number(stage.sortOrder) >= proposalSortOrder}
                onFieldChange={handleFieldChange}
                onSwapStageOrder={handleSwapStageOrder}
                onToggleExitField={handleToggleExitField}
              />
            ))}
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              {t("crmOpportunities.actions.cancel", { defaultValue: "Cancel" })}
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting} className="gap-2 font-bold">
              {isSubmitting
                ? t("crmOpportunities.dialogs.pipelineAdmin.saving", { defaultValue: "Saving..." })
                : t("crmOpportunities.dialogs.pipelineAdmin.save", { defaultValue: "Save Pipeline" })}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
