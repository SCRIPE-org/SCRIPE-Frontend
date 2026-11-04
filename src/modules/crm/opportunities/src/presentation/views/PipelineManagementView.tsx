"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { Card } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Badge } from "@core/ui/badge";
import { Checkbox } from "@core/ui/checkbox";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import {
  AlertCircle,
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  GitBranch,
  Layers,
  RefreshCw,
  Save,
  ShieldCheck,
  Sliders,
} from "lucide-react";
import { cn } from "@core/common/utils";
import {
  useCustomFieldsFormFields,
  decodeCustomFieldName,
} from "@core/crud/customFieldsExtension";
import { CRM_PERMISSIONS, CrmShell, CrmSectionHeader } from "@modules/crm";
import { useOpportunitiesViewModel } from "../viewmodels/useOpportunitiesViewModel";
import {
  CANONICAL_STAGE_KEYS,
  PERMITTED_EXIT_FIELDS,
  EXIT_FIELD_LABELS,
  type StageDraftState,
} from "../components/admin/PipelineAdminDialog";
import type {
  UpdateDefaultPipelineInput,
  UpdatePipelineStageItem,
} from "../../domain/entities/OpportunityEntity";

/**
 * Dedicated Jira-grade Pipeline & Stage Gate Administration View (/crm/pipelines).
 * Replaces the cramped modal experience with a full-width visual workflow configurator.
 */
export function PipelineManagementView() {
  const router = useRouter();
  const { t, language } = useI18n();
  const isRtl = language === "ar";
  const canManagePipeline = usePermission(CRM_PERMISSIONS.PIPELINES_MANAGE);

  const {
    pipeline,
    fetchPipeline,
    handleUpdatePipeline,
    isSubmitting,
    pipelineError,
  } = useOpportunitiesViewModel();

  const { fieldConfigs: opportunityCustomFields } = useCustomFieldsFormFields(
    "crm.opportunity",
    undefined
  );

  const [pipelineNameEn, setPipelineNameEn] = useState("Standard Commercial Pipeline");
  const [pipelineNameAr, setPipelineNameAr] = useState("مسار المبيعات التجاري القياسي");
  const [draftStages, setDraftStages] = useState<StageDraftState[]>([]);
  const [clientValidationError, setClientValidationError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!pipeline?.stages || pipeline.stages.length === 0) {
      setDraftStages([
        {
          stageKey: "default.discovery",
          labelEn: "Discovery",
          labelAr: "استكشاف",
          sortOrder: 1,
          winProbabilityPercent: "10",
          requiredExitFields: [],
        },
        {
          stageKey: "default.qualification",
          labelEn: "Qualification",
          labelAr: "تأهيل",
          sortOrder: 2,
          winProbabilityPercent: "25",
          requiredExitFields: [],
        },
        {
          stageKey: "default.solution_fit",
          labelEn: "Solution Fit",
          labelAr: "ملاءمة الحل",
          sortOrder: 3,
          winProbabilityPercent: "50",
          requiredExitFields: ["solutionFitConfirmed"],
        },
        {
          stageKey: "default.proposal",
          labelEn: "Proposal",
          labelAr: "عرض السعر",
          sortOrder: 4,
          winProbabilityPercent: "75",
          requiredExitFields: ["partyId", "estimatedAmount"],
        },
        {
          stageKey: "default.negotiation",
          labelEn: "Negotiation",
          labelAr: "تفاوض",
          sortOrder: 5,
          winProbabilityPercent: "90",
          requiredExitFields: ["partyId", "targetCloseDate"],
        },
      ]);
      return;
    }

    setPipelineNameEn(pipeline.nameEn || pipeline.name || "Standard Commercial Pipeline");
    setPipelineNameAr(pipeline.nameAr || "مسار المبيعات التجاري القياسي");

    const loaded: StageDraftState[] = CANONICAL_STAGE_KEYS.map((key, defaultIdx) => {
      const existing = pipeline.stages.find((s: any) => s.stageKey === key);
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
  }, [pipeline]);

  const handleFieldChange = (index: number, field: keyof StageDraftState, value: any) => {
    setDraftStages((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    setClientValidationError(null);
    setSaveSuccess(false);
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
    setSaveSuccess(false);
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
    setSaveSuccess(false);
  };

  const validateDraft = (): string | null => {
    const stageKeys = draftStages.map((s) => s.stageKey);
    for (const canonKey of CANONICAL_STAGE_KEYS) {
      if (!stageKeys.includes(canonKey)) {
        return `Missing required canonical stage key: ${canonKey}`;
      }
    }
    for (const stage of draftStages) {
      if (!stage.labelEn || stage.labelEn.trim().length === 0) {
        return `English stage name cannot be empty.`;
      }
    }
    const orders = draftStages.map((s) => Number(s.sortOrder));
    const sortedOrders = [...orders].sort((a, b) => a - b);
    const expected = [1, 2, 3, 4, 5];
    const isContiguousPermutation =
      sortedOrders.length === 5 && sortedOrders.every((val, idx) => val === expected[idx]);
    if (!isContiguousPermutation) {
      return t("crmOpportunities.dialogs.pipelineAdmin.invalidOrderWarning", {
        defaultValue: "Stages must have unique contiguous sort orders from 1 to 5.",
      });
    }
    const proposalStage = draftStages.find((s) => s.stageKey === "default.proposal");
    if (!proposalStage) {
      return "Proposal stage is missing.";
    }
    const preProposalKeys = ["default.discovery", "default.qualification", "default.solution_fit"];
    const hasPreProposalStage = preProposalKeys.some((key) => {
      const stage = draftStages.find((s) => s.stageKey === key);
      return stage && Number(stage.sortOrder) < Number(proposalStage.sortOrder);
    });
    if (!hasPreProposalStage) {
      return t("crmOpportunities.dialogs.pipelineAdmin.preProposalRuleWarning", {
        defaultValue:
          "At least one pre-proposal stage (Discovery, Qualification, or Solution Fit) must precede Proposal.",
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
    setSaveSuccess(false);
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
      nameEn: pipelineNameEn.trim() || "Standard Commercial Pipeline",
      nameAr: pipelineNameAr.trim() || null,
      stages: stageItems,
      expectedRowVersion: pipeline?.rowVersion || "",
    };

    const ok = await handleUpdatePipeline(input);
    if (ok) {
      setSaveSuccess(true);
    }
  };

  const proposalStage = draftStages.find((s) => s.stageKey === "default.proposal");
  const proposalSortOrder = proposalStage ? Number(proposalStage.sortOrder) : 4;

  return (
    <CrmShell activeTab="pipelines" onTabChange={() => {}}>
      <div className="space-y-6" dir={isRtl ? "rtl" : "ltr"}>
        <CrmSectionHeader
          title={t("crmOpportunities.dialogs.pipelineAdmin.title", {
            defaultValue: "Pipeline & Stage Gate Configuration",
          })}
          subtitle={t("crmOpportunities.dialogs.pipelineAdmin.description", {
            defaultValue:
              "Configure commercial pipeline stages, win probabilities, transition gates, and required fields for deals.",
          })}
          badge={`${draftStages.length} Stages`}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => router.push("/crm/opportunities")}
                className="h-8 gap-1.5 text-xs"
              >
                {isRtl ? <ArrowRight className="size-3.5" /> : <ArrowLeft className="size-3.5" />}
                <span>
                  {t("crmOpportunities.pipelinesPage.backToDeals", {
                    defaultValue: "Back to Deals Board",
                  })}
                </span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => router.push("/admin/custom-fields")}
                className="h-8 gap-1.5 text-xs"
              >
                <Sliders className="size-3.5" />
                <span>
                  {t("crmOpportunities.pipelinesPage.customFields", {
                    defaultValue: "Custom Fields",
                  })}
                </span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={fetchPipeline}
                className="h-8 gap-1.5 text-xs"
              >
                <RefreshCw className="size-3.5" />
                <span>{t("crmOpportunities.actions.refresh", { defaultValue: "Refresh" })}</span>
              </Button>
            </div>
          }
        />

        {/* Visual 5-Stage Pipeline Workflow Diagram */}
        <Card className="p-4 bg-nx-surface border border-nx-line rounded-nx-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitBranch className="size-4 text-nx-accent" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-nx-ink">
                {t("crmOpportunities.pipelinesPage.workflowPreview", {
                  defaultValue: "Live 5-Stage Commercial Workflow Sequence",
                })}
              </h3>
            </div>
            <Badge variant="outline" className="text-[11px] border-nx-line bg-nx-raised text-nx-ink-2">
              {isRtl ? pipelineNameAr || pipelineNameEn : pipelineNameEn}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {draftStages.map((stage) => {
              const isGateActive = Number(stage.sortOrder) >= proposalSortOrder;
              return (
                <div
                  key={stage.stageKey}
                  className={cn(
                    "relative rounded-nx-md border p-3 transition-all flex flex-col justify-between gap-2",
                    isGateActive
                      ? "border-nx-accent/40 bg-nx-accent-wash/20"
                      : "border-nx-line bg-nx-ground"
                  )}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="inline-flex size-5 items-center justify-center rounded-full bg-nx-raised border border-nx-line text-[10px] font-mono font-bold text-nx-ink">
                      {stage.sortOrder}
                    </span>
                    {stage.winProbabilityPercent && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] font-mono px-1.5 py-0 bg-nx-surface border-nx-line text-nx-ink-2"
                      >
                        {stage.winProbabilityPercent}% Win
                      </Badge>
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-nx-ink truncate">
                      {isRtl && stage.labelAr ? stage.labelAr : stage.labelEn}
                    </div>
                    <div className="text-[11px] text-nx-ink-3 truncate">
                      {isRtl ? stage.labelEn : stage.labelAr || "—"}
                    </div>
                  </div>
                  <div className="pt-1.5 border-t border-nx-line/60 flex items-center justify-between text-[10px]">
                    {isGateActive ? (
                      <span className="inline-flex items-center gap-1 text-nx-accent font-semibold">
                        <ShieldCheck className="size-3" />
                        Account / Contact Gate
                      </span>
                    ) : (
                      <span className="text-nx-ink-3">Discovery / Pre-Proposal</span>
                    )}
                    <span className="font-mono text-nx-ink-2">
                      {stage.requiredExitFields.length} rules
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {saveSuccess && (
          <Alert className="border-success/40 bg-success/10 text-success">
            <CheckCircle2 className="size-4" />
            <AlertTitle className="text-xs font-bold">
              {t("crmOpportunities.pipelinesPage.savedTitle", {
                defaultValue: "Pipeline Configuration Saved",
              })}
            </AlertTitle>
            <AlertDescription className="text-xs">
              {t("crmOpportunities.pipelinesPage.savedDesc", {
                defaultValue:
                  "Stage labels, ordering, win probabilities, and required stage gate fields have been updated.",
              })}
            </AlertDescription>
          </Alert>
        )}

        {clientValidationError && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle className="text-xs font-bold">Validation Error</AlertTitle>
            <AlertDescription className="text-xs">{clientValidationError}</AlertDescription>
          </Alert>
        )}

        {pipelineError && (
          <Alert variant="destructive">
            <AlertTriangle className="size-4" />
            <AlertTitle className="text-xs font-bold">Pipeline Update Error</AlertTitle>
            <AlertDescription className="text-xs">{pipelineError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          {/* Pipeline Name Header Card */}
          <Card className="p-4 bg-nx-surface border border-nx-line rounded-nx-lg grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-nx-ink">
                {t("crmOpportunities.pipelinesPage.pipelineNameEn", {
                  defaultValue: "Pipeline Name (English)",
                })}
              </Label>
              <Input
                value={pipelineNameEn}
                onChange={(e) => setPipelineNameEn(e.target.value)}
                disabled={!canManagePipeline}
                className="h-9 text-xs"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-nx-ink">
                {t("crmOpportunities.pipelinesPage.pipelineNameAr", {
                  defaultValue: "Pipeline Name (Arabic)",
                })}
              </Label>
              <Input
                value={pipelineNameAr}
                onChange={(e) => setPipelineNameAr(e.target.value)}
                disabled={!canManagePipeline}
                dir="rtl"
                className="h-9 text-xs"
              />
            </div>
          </Card>

          {/* Stage Rows */}
          <div className="space-y-3">
            {draftStages.map((stage, idx) => {
              const isProposalOrLater = Number(stage.sortOrder) >= proposalSortOrder;
              return (
                <Card
                  key={stage.stageKey}
                  data-testid={`pipeline-page-stage-${stage.stageKey}`}
                  className="rounded-nx-lg border border-nx-line bg-nx-surface p-4 space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-nx-line pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-7 items-center justify-center rounded-full bg-nx-raised text-xs font-mono font-bold text-nx-ink border border-nx-line">
                        {stage.sortOrder}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-nx-ink">
                            {isRtl && stage.labelAr ? stage.labelAr : stage.labelEn}
                          </span>
                          {isProposalOrLater && (
                            <Badge
                              variant="outline"
                              className="text-[10px] gap-1 text-nx-accent border-nx-accent/30 bg-nx-accent-wash/30"
                            >
                              <ShieldCheck className="size-3" />
                              {t("crmOpportunities.kanban.proposalGateBadge", {
                                defaultValue: "Account / Contact Required",
                              })}
                            </Badge>
                          )}
                        </div>
                        <span className="text-[11px] text-nx-ink-3 flex items-center gap-1">
                          <Layers className="size-3" />
                          Stage {stage.sortOrder} of 5
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={idx === 0 || !canManagePipeline}
                        onClick={() => handleSwapStageOrder(idx, "up")}
                        className="h-7 px-2 text-xs gap-1"
                      >
                        <ArrowUp className="size-3.5" />
                        <span>Move Up</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={idx === draftStages.length - 1 || !canManagePipeline}
                        onClick={() => handleSwapStageOrder(idx, "down")}
                        className="h-7 px-2 text-xs gap-1"
                      >
                        <ArrowDown className="size-3.5" />
                        <span>Move Down</span>
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    {/* English Name */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs font-medium text-nx-ink-2">
                        {t("crmOpportunities.dialogs.pipelineAdmin.labelEn", {
                          defaultValue: "Stage Name (English)",
                        })}
                      </Label>
                      <Input
                        type="text"
                        value={stage.labelEn}
                        onChange={(e) => handleFieldChange(idx, "labelEn", e.target.value)}
                        disabled={!canManagePipeline}
                        className="h-9 text-xs"
                        required
                      />
                    </div>

                    {/* Arabic Name */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs font-medium text-nx-ink-2">
                        {t("crmOpportunities.dialogs.pipelineAdmin.labelAr", {
                          defaultValue: "Stage Name (Arabic)",
                        })}
                      </Label>
                      <Input
                        type="text"
                        value={stage.labelAr}
                        onChange={(e) => handleFieldChange(idx, "labelAr", e.target.value)}
                        disabled={!canManagePipeline}
                        dir="rtl"
                        className="h-9 text-xs"
                      />
                    </div>

                    {/* Stage Position */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-nx-ink-2">
                        {t("crmOpportunities.dialogs.pipelineAdmin.sortOrder", {
                          defaultValue: "Stage Order (1..5)",
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
                        disabled={!canManagePipeline}
                        className="h-9 text-xs font-mono"
                        required
                      />
                    </div>

                    {/* Win Probability */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-nx-ink-2">
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
                        disabled={!canManagePipeline}
                        placeholder="0 - 100"
                        className="h-9 text-xs font-mono"
                      />
                    </div>

                    {/* Required Exit Fields */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs font-medium text-nx-ink-2">
                        {t("crmOpportunities.dialogs.pipelineAdmin.requiredExitFields", {
                          defaultValue: "Required Fields Before Advancing (Stage Gate)",
                        })}
                      </Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {PERMITTED_EXIT_FIELDS.map((fieldKey) => {
                          const isChecked = stage.requiredExitFields.includes(fieldKey);
                          const friendlyLabel =
                            EXIT_FIELD_LABELS[fieldKey]?.[isRtl ? "ar" : "en"] || fieldKey;
                          return (
                            <Label
                              key={fieldKey}
                              className="flex items-center gap-2 text-xs cursor-pointer select-none rounded-nx-sm border border-nx-line bg-nx-ground px-2.5 py-1.5 hover:border-nx-line-hi"
                            >
                              <Checkbox
                                data-testid={`stage-${stage.stageKey}-exit-field-${fieldKey}`}
                                checked={isChecked}
                                disabled={!canManagePipeline}
                                onCheckedChange={() => handleToggleExitField(idx, fieldKey)}
                              />
                              <span className="text-nx-ink">{friendlyLabel}</span>
                            </Label>
                          );
                        })}
                        {opportunityCustomFields.map((fc) => {
                          const rawKey = decodeCustomFieldName(fc.name) ?? fc.name;
                          const gateKey = `custom:${rawKey}`;
                          const isChecked = stage.requiredExitFields.includes(gateKey);
                          return (
                            <Label
                              key={gateKey}
                              className="flex items-center gap-2 text-xs cursor-pointer select-none rounded-nx-sm border border-nx-line bg-nx-ground px-2.5 py-1.5 hover:border-nx-line-hi"
                            >
                              <Checkbox
                                data-testid={`stage-${stage.stageKey}-exit-field-${gateKey}`}
                                checked={isChecked}
                                disabled={!canManagePipeline}
                                onCheckedChange={() => handleToggleExitField(idx, gateKey)}
                              />
                              <span className="text-nx-ink">
                                {fc.label || rawKey}{" "}
                                <span className="text-[10px] text-nx-ink-3">(Custom)</span>
                              </span>
                            </Label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {canManagePipeline && (
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={fetchPipeline}
                disabled={isSubmitting}
              >
                {t("crmOpportunities.actions.cancel", { defaultValue: "Reset Changes" })}
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2 font-bold">
                <Save className="size-4" />
                {isSubmitting
                  ? t("crmOpportunities.dialogs.pipelineAdmin.saving", {
                      defaultValue: "Saving...",
                    })
                  : t("crmOpportunities.dialogs.pipelineAdmin.save", {
                      defaultValue: "Save Pipeline Configuration",
                    })}
              </Button>
            </div>
          )}
        </form>
      </div>
    </CrmShell>
  );
}
