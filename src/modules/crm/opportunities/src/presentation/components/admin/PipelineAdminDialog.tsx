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
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Badge } from "@core/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import { Checkbox } from "@core/ui/checkbox";
import { AlertCircle, AlertTriangle, ShieldCheck, Settings } from "lucide-react";
import type {
  PipelineDefinition,
  UpdateDefaultPipelineInput,
  UpdatePipelineStageItem,
} from "../../domain/entities/OpportunityEntity";

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

export const PERMITTED_EXIT_FIELDS = [
  "estimatedAmount",
  "targetCloseDate",
  "partyId",
  "primaryContactRole",
  "solutionFitConfirmed",
] as const;

interface StageDraftState {
  stageKey: string;
  labelEn: string;
  labelAr: string;
  sortOrder: number;
  winProbabilityPercent: string;
  requiredExitFields: string[];
  expectedRowVersion?: string | null;
}

/**
 * Tenant Administrator Dialog for configuring the SCRIPE CRM Default Pipeline.
 * Enforces exact-5 canonical stage keys, contiguous 1..5 ordering permutation,
 * pre-proposal reachability gate, permitted exit field allowlist, and RowVersion concurrency.
 */
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

  // Initialize form drafts whenever open or pipeline changes
  useEffect(() => {
    if (!pipeline?.stages || pipeline.stages.length === 0) {
      // Default initial 5 canonical stages
      const defaults: StageDraftState[] = [
        {
          stageKey: "default.discovery",
          labelEn: "Discovery",
          labelAr: "استكشاف",
          sortOrder: 1,
          winProbabilityPercent: "",
          requiredExitFields: [],
        },
        {
          stageKey: "default.qualification",
          labelEn: "Qualification",
          labelAr: "تأهيل",
          sortOrder: 2,
          winProbabilityPercent: "",
          requiredExitFields: [],
        },
        {
          stageKey: "default.solution_fit",
          labelEn: "Solution Fit",
          labelAr: "ملاءمة الحل",
          sortOrder: 3,
          winProbabilityPercent: "",
          requiredExitFields: [],
        },
        {
          stageKey: "default.proposal",
          labelEn: "Proposal",
          labelAr: "عرض السعر",
          sortOrder: 4,
          winProbabilityPercent: "",
          requiredExitFields: ["partyId"],
        },
        {
          stageKey: "default.negotiation",
          labelEn: "Negotiation",
          labelAr: "تفاوض",
          sortOrder: 5,
          winProbabilityPercent: "",
          requiredExitFields: ["partyId"],
        },
      ];
      setDraftStages(defaults);
      return;
    }

    const loaded: StageDraftState[] = CANONICAL_STAGE_KEYS.map((key, defaultIdx) => {
      const existing = pipeline.stages.find((s) => s.stageKey === key);
      return {
        stageKey: key,
        labelEn: existing?.labelEn || `Stage ${defaultIdx + 1}`,
        labelAr: existing?.labelAr || "",
        sortOrder: existing?.sortOrder ?? defaultIdx + 1,
        winProbabilityPercent:
          existing?.winProbabilityPercent !== undefined && existing?.winProbabilityPercent !== null
            ? String(existing.winProbabilityPercent)
            : existing?.probabilityPercent !== undefined && existing?.probabilityPercent !== null
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

  const handleFieldChange = (
    index: number,
    field: keyof StageDraftState,
    value: any
  ) => {
    setDraftStages((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
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
        requiredExitFields: exists
          ? current.filter((k) => k !== fieldKey)
          : [...current, fieldKey],
      };
      return next;
    });
    setClientValidationError(null);
  };

  const validateDraft = (): string | null => {
    // 1. Check all canonical keys present
    const stageKeys = draftStages.map((s) => s.stageKey);
    for (const canonKey of CANONICAL_STAGE_KEYS) {
      if (!stageKeys.includes(canonKey)) {
        return `Missing required canonical stage key: ${canonKey}`;
      }
    }

    // 2. Check blank English labels
    for (const stage of draftStages) {
      if (!stage.labelEn || stage.labelEn.trim().length === 0) {
        return `English label for ${stage.stageKey} cannot be empty.`;
      }
    }

    // 3. Check contiguous permutation 1..5
    const orders = draftStages.map((s) => Number(s.sortOrder));
    const sortedOrders = [...orders].sort((a, b) => a - b);
    const expected = [1, 2, 3, 4, 5];
    const isContiguousPermutation =
      sortedOrders.length === 5 &&
      sortedOrders.every((val, idx) => val === expected[idx]);

    if (!isContiguousPermutation) {
      return t("crmOpportunities.dialogs.pipelineAdmin.invalidOrderWarning", {
        defaultValue: "Stages must have unique contiguous sort orders from 1 to 5.",
      });
    }

    // 4. Pre-proposal reachability: Discovery, Qualification, Solution Fit < Proposal
    const proposalStage = draftStages.find((s) => s.stageKey === "default.proposal");
    if (!proposalStage) {
      return "Proposal stage is missing.";
    }
    const preProposalKeys = ["default.discovery", "default.qualification", "default.solution_fit"];
    for (const key of preProposalKeys) {
      const preStage = draftStages.find((s) => s.stageKey === key);
      if (preStage && Number(preStage.sortOrder) >= Number(proposalStage.sortOrder)) {
        return t("crmOpportunities.dialogs.pipelineAdmin.preProposalRuleWarning", {
          defaultValue:
            "Pre-proposal stages (Discovery, Qualification, Solution Fit) must precede Proposal.",
        });
      }
    }

    // 5. Probability limits (0..100)
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
      winProbabilityPercent:
        s.winProbabilityPercent.trim() !== "" ? Number(s.winProbabilityPercent) : null,
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
    if (success) {
      onOpenChange(false);
    }
  };

  const isPartyReorderError =
    submitError &&
    (submitError.includes("CRM_OPPORTUNITY_PARTY_REQUIRED_ON_REORDER") ||
      submitError.toLowerCase().includes("party required on reorder"));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="pipeline-admin-dialog"
        className="max-w-3xl max-h-[90vh] overflow-y-auto"
        dir={isRtl ? "rtl" : "ltr"}
      >
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-nx-md bg-nx-raised border border-nx-line">
              <Settings className="size-4 text-nx-ink" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-nx-ink">
                {t("crmOpportunities.dialogs.pipelineAdmin.title", {
                  defaultValue: "Default Pipeline Administration",
                })}
              </DialogTitle>
              <DialogDescription className="text-xs text-nx-ink-2">
                {t("crmOpportunities.dialogs.pipelineAdmin.description", {
                  defaultValue:
                    "Configure stage names, ordering, win probabilities, and exit criteria for the tenant default pipeline.",
                })}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Validation or Concurrency Error Notice */}
        {clientValidationError && (
          <Alert variant="destructive" className="py-2.5">
            <AlertCircle className="size-4 shrink-0" />
            <AlertTitle className="text-xs font-bold">Validation Error</AlertTitle>
            <AlertDescription className="text-xs">{clientValidationError}</AlertDescription>
          </Alert>
        )}

        {submitError && (
          <Alert variant="destructive" className="py-2.5">
            <AlertTriangle className="size-4 shrink-0" />
            <AlertTitle className="text-xs font-bold">
              {isPartyReorderError ? "Reorder Blocked: Unlinked Deals Gate" : "Pipeline Update Error"}
            </AlertTitle>
            <AlertDescription className="text-xs">
              {isPartyReorderError
                ? t("crmOpportunities.dialogs.pipelineAdmin.partyReorderWarning", {
                    defaultValue:
                      "Cannot advance stage order while open unlinked deals reside on this stage without a verified Party (PD-1 Policy). Link deals to Parties or move them backward before saving.",
                  })
                : submitError}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSave} className="space-y-4 pt-1">
          <div className="space-y-3">
            {draftStages.map((stage, idx) => {
              const isProposalOrLater =
                stage.stageKey === "default.proposal" ||
                stage.stageKey === "default.negotiation";

              return (
                <div
                  key={stage.stageKey}
                  data-testid={`stage-config-row-${stage.stageKey}`}
                  className="rounded-nx-lg border border-nx-line bg-nx-ground p-3 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-nx-line pb-2">
                    <div className="flex items-center gap-2">
                      <span className="flex size-6 items-center justify-center rounded-full bg-nx-raised text-xs font-mono font-bold text-nx-ink border border-nx-line">
                        {stage.sortOrder}
                      </span>
                      <span className="text-xs font-mono font-semibold text-nx-ink">
                        {stage.stageKey}
                      </span>
                      {isProposalOrLater && (
                        <Badge
                          variant="outline"
                          className="text-[10px] gap-1 text-nx-accent border-nx-accent/30"
                        >
                          <ShieldCheck className="size-3" />
                          Party Required (PD-1)
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                    {/* English Label */}
                    <div className="space-y-1 sm:col-span-2">
                      <Label className="text-[11px] font-medium text-nx-ink-2">
                        {t("crmOpportunities.dialogs.pipelineAdmin.labelEn", {
                          defaultValue: "English Label",
                        })}
                      </Label>
                      <Input
                        type="text"
                        value={stage.labelEn}
                        onChange={(e) => handleFieldChange(idx, "labelEn", e.target.value)}
                        placeholder="Stage label (EN)"
                        className="h-8 text-xs"
                        required
                      />
                    </div>

                    {/* Arabic Label */}
                    <div className="space-y-1 sm:col-span-2">
                      <Label className="text-[11px] font-medium text-nx-ink-2">
                        {t("crmOpportunities.dialogs.pipelineAdmin.labelAr", {
                          defaultValue: "Arabic Label",
                        })}
                      </Label>
                      <Input
                        type="text"
                        value={stage.labelAr}
                        onChange={(e) => handleFieldChange(idx, "labelAr", e.target.value)}
                        placeholder="مسمى المرحلة (عربي)"
                        dir="rtl"
                        className="h-8 text-xs"
                      />
                    </div>

                    {/* Sort Order */}
                    <div className="space-y-1">
                      <Label className="text-[11px] font-medium text-nx-ink-2">
                        {t("crmOpportunities.dialogs.pipelineAdmin.sortOrder", {
                          defaultValue: "Sort Order (1..5)",
                        })}
                      </Label>
                      <Input
                        type="number"
                        min={1}
                        max={5}
                        value={stage.sortOrder}
                        onChange={(e) =>
                          handleFieldChange(idx, "sortOrder", parseInt(e.target.value, 10) || 1)
                        }
                        className="h-8 text-xs font-mono"
                        required
                      />
                    </div>

                    {/* Win Probability */}
                    <div className="space-y-1">
                      <Label className="text-[11px] font-medium text-nx-ink-2">
                        {t("crmOpportunities.dialogs.pipelineAdmin.winProbability", {
                          defaultValue: "Win Probability (%)",
                        })}
                      </Label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={stage.winProbabilityPercent}
                        onChange={(e) =>
                          handleFieldChange(idx, "winProbabilityPercent", e.target.value)
                        }
                        placeholder="Optional"
                        className="h-8 text-xs font-mono"
                      />
                    </div>

                    {/* Required Exit Fields */}
                    <div className="space-y-1 sm:col-span-2">
                      <Label className="text-[11px] font-medium text-nx-ink-2">
                        {t("crmOpportunities.dialogs.pipelineAdmin.requiredExitFields", {
                          defaultValue: "Required Exit Fields",
                        })}
                      </Label>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {PERMITTED_EXIT_FIELDS.map((fieldKey) => {
                          const isChecked = stage.requiredExitFields.includes(fieldKey);
                          return (
                            <label
                              key={fieldKey}
                              className="flex items-center gap-1.5 text-[11px] font-mono cursor-pointer select-none"
                            >
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={() => handleToggleExitField(idx, fieldKey)}
                              />
                              <span className="text-nx-ink-2">{fieldKey}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t("crmOpportunities.actions.cancel", { defaultValue: "Cancel" })}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="gap-2 font-bold"
            >
              {isSubmitting
                ? t("crmOpportunities.dialogs.pipelineAdmin.saving", {
                    defaultValue: "Saving...",
                  })
                : t("crmOpportunities.dialogs.pipelineAdmin.save", {
                    defaultValue: "Save Pipeline",
                  })}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
