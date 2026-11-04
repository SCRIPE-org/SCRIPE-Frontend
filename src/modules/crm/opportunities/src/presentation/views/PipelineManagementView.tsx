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
  Lock,
  Maximize2,
  Play,
  RefreshCw,
  RotateCcw,
  Save,
  ShieldCheck,
  Sliders,
  Sparkles,
  Workflow,
  XCircle,
  Zap,
  ZoomIn,
  ZoomOut,
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

type WorkflowEntityMode = "deals" | "leads";
type InspectorTabId = "properties" | "validators" | "conditions" | "postFunctions";

interface LeadWorkflowNode {
  key: string;
  order: number;
  labelEn: string;
  labelAr: string;
  category: "active" | "terminal";
  requiredPermission: string;
  validators: string[];
  postFunctions: string[];
}

const LEAD_WORKFLOW_NODES: LeadWorkflowNode[] = [
  {
    key: "lead.new",
    order: 1,
    labelEn: "New Intake",
    labelAr: "عميل محتمل جديد",
    category: "active",
    requiredPermission: "crm.leads.create",
    validators: ["Title or Contact Name", "Tenant Scope Context"],
    postFunctions: [
      "Assign caller or target OwnerUserId / OwnerTeamId",
      "Initialize RowVersion concurrency token",
      "Persist crm.lead Custom Fields",
    ],
  },
  {
    key: "lead.working",
    order: 2,
    labelEn: "Working (In Progress)",
    labelAr: "قيد المتابعة",
    category: "active",
    requiredPermission: "crm.leads.update",
    validators: ["Active non-terminal lead status", "Valid ExpectedRowVersion"],
    postFunctions: [
      "Transition status New ↔ Working",
      "Append SalesActivity interaction timeline entry",
      "Support WorkManagement follow-up task delegation",
    ],
  },
  {
    key: "lead.qualified",
    order: 3,
    labelEn: "Qualified",
    labelAr: "مؤهل تجارياً",
    category: "active",
    requiredPermission: "crm.leads.qualify",
    validators: ["Qualification Decision = Qualified", "Optional Party Linkage (Org / Person)"],
    postFunctions: [
      "Record QualificationNotes & decision snapshot",
      "Emit Qualified activity on Lead timeline",
      "Unlock Convert to Deal action",
    ],
  },
  {
    key: "lead.converted",
    order: 4,
    labelEn: "Converted to Deal",
    labelAr: "تم التحويل لفرصة",
    category: "terminal",
    requiredPermission: "crm.leads.qualify + crm.opportunities.create",
    validators: [
      "Opportunity Title & Estimated Value",
      "Target Stage (PD-1 Party Gate if Proposal+)",
    ],
    postFunctions: [
      "Create CrmOpportunity in Default Commercial Pipeline",
      "Link or create CrmAccountPartyRef / CrmContactPartyRef",
      "Lock Lead in terminal Converted state",
    ],
  },
  {
    key: "lead.disqualified",
    order: 5,
    labelEn: "Disqualified",
    labelAr: "مستبعد",
    category: "terminal",
    requiredPermission: "crm.leads.qualify",
    validators: ["Disqualification Reason Code", "Disqualification Notes"],
    postFunctions: [
      "Record DisqualificationReasonCode",
      "Transition Lead to Disqualified (reversible to Working if re-engaged)",
    ],
  },
];

/**
 * Jira-Grade Interactive Workflow Canvas & Stage Gate Configurator (/crm/pipelines).
 * Supports interactive node/transition inspection, Validators (Exit Gates), Conditions (PBAC),
 * Post-Functions, and full Stage Matrix editing.
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
  const [validationBanner, setValidationBanner] = useState<string | null>(null);

  // Jira Workflow Canvas state
  const [workflowMode, setWorkflowMode] = useState<WorkflowEntityMode>("deals");
  const [selectedNodeKey, setSelectedNodeKey] = useState<string>("default.discovery");
  const [selectedLeadNodeKey, setSelectedLeadNodeKey] = useState<string>("lead.new");
  const [inspectorTab, setInspectorTab] = useState<InspectorTabId>("validators");
  const [zoomPercent, setZoomPercent] = useState<number>(100);

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
    setValidationBanner(null);
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
    setValidationBanner(null);
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
    setValidationBanner(null);
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

  const handleRunWorkflowValidation = () => {
    const err = validateDraft();
    if (err) {
      setClientValidationError(err);
      setValidationBanner(null);
    } else {
      setClientValidationError(null);
      const totalRules = draftStages.reduce((acc, s) => acc + s.requiredExitFields.length, 0);
      setValidationBanner(
        `Workflow verified: 5 canonical active stages, 2 terminal outcomes, PD-1 Party Verification gate intact, and ${totalRules} exit validators configured.`
      );
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(false);
    setValidationBanner(null);
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

  const selectedStageIdx = draftStages.findIndex((s) => s.stageKey === selectedNodeKey);
  const selectedStage = selectedStageIdx >= 0 ? draftStages[selectedStageIdx] : draftStages[0];
  const activeStageIdx = selectedStageIdx >= 0 ? selectedStageIdx : 0;

  const selectedLeadNode =
    LEAD_WORKFLOW_NODES.find((n) => n.key === selectedLeadNodeKey) ?? LEAD_WORKFLOW_NODES[0];

  return (
    <CrmShell activeTab="pipelines" onTabChange={() => {}}>
      <div className="space-y-6" dir={isRtl ? "rtl" : "ltr"}>
        <CrmSectionHeader
          title={t("crmOpportunities.dialogs.pipelineAdmin.title", {
            defaultValue: "Jira-Style Workflow Canvas & Stage Gate Engine",
          })}
          subtitle={t("crmOpportunities.dialogs.pipelineAdmin.description", {
            defaultValue:
              "Interactive state-machine workflow designer: click any stage node or transition connector to configure exit validators, PBAC conditions, and post-functions.",
          })}
          badge={`${draftStages.length} Active + 2 Terminal`}
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

        {validationBanner && (
          <Alert className="border-nx-accent/40 bg-nx-accent-wash/20 text-nx-ink">
            <Sparkles className="size-4 text-nx-accent" />
            <AlertTitle className="text-xs font-bold text-nx-accent">
              Workflow State Machine Verified
            </AlertTitle>
            <AlertDescription className="text-xs text-nx-ink-2">
              {validationBanner}
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

        {/* =====================================================================
            JIRA-STYLE INTERACTIVE WORKFLOW CANVAS + RIGHT-SIDE INSPECTOR
           ===================================================================== */}
        <Card
          data-testid="jira-workflow-canvas-card"
          className="rounded-nx-lg border border-nx-line bg-nx-surface overflow-hidden"
        >
          {/* Canvas Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-nx-line bg-nx-raised/60 px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 pe-2 border-e border-nx-line">
                <Workflow className="size-4 text-nx-accent" />
                <span className="text-xs font-bold uppercase tracking-wider text-nx-ink">
                  Workflow Canvas
                </span>
              </div>

              {/* Switcher: Deals Workflow vs Leads Qualification Workflow */}
              <div className="inline-flex items-center rounded-nx-md border border-nx-line bg-nx-ground p-0.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  data-testid="workflow-switch-deals"
                  onClick={() => setWorkflowMode("deals")}
                  className={cn(
                    "h-7 px-2.5 text-xs rounded-nx-sm transition-all",
                    workflowMode === "deals"
                      ? "bg-nx-surface text-nx-accent font-bold border border-nx-line"
                      : "text-nx-ink-2 hover:text-nx-ink"
                  )}
                >
                  Deals Pipeline (5 + 2 Stages)
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  data-testid="workflow-switch-leads"
                  onClick={() => setWorkflowMode("leads")}
                  className={cn(
                    "h-7 px-2.5 text-xs rounded-nx-sm transition-all",
                    workflowMode === "leads"
                      ? "bg-nx-surface text-nx-accent font-bold border border-nx-line"
                      : "text-nx-ink-2 hover:text-nx-ink"
                  )}
                >
                  Leads Qualification (3 + 2 Statuses)
                </Button>
              </div>
            </div>

            {/* Canvas Zoom & Validate Controls */}
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                data-testid="canvas-zoom-out"
                onClick={() => setZoomPercent((z) => Math.max(80, z - 10))}
                className="h-7 px-2 text-xs"
                title="Zoom Out"
              >
                <ZoomOut className="size-3.5" />
              </Button>
              <Badge
                variant="outline"
                className="font-mono text-[11px] border-nx-line bg-nx-ground text-nx-ink px-2 py-0.5"
              >
                {zoomPercent}%
              </Badge>
              <Button
                type="button"
                variant="outline"
                size="sm"
                data-testid="canvas-zoom-in"
                onClick={() => setZoomPercent((z) => Math.min(120, z + 10))}
                className="h-7 px-2 text-xs"
                title="Zoom In"
              >
                <ZoomIn className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                data-testid="canvas-zoom-reset"
                onClick={() => setZoomPercent(100)}
                className="h-7 px-2 text-xs gap-1"
                title="Fit View"
              >
                <Maximize2 className="size-3" />
                <span className="hidden sm:inline">Fit</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                data-testid="canvas-validate-rules"
                onClick={handleRunWorkflowValidation}
                className="h-7 px-2.5 text-xs gap-1 border-nx-accent/40 bg-nx-accent-wash/20 text-nx-accent hover:bg-nx-accent-wash/40 font-semibold"
              >
                <ShieldCheck className="size-3.5" />
                <span>Validate Workflow</span>
              </Button>
            </div>
          </div>

          {/* Split Layout: Interactive Diagram Canvas (Left 7 cols) + Jira Rule Inspector (Right 5 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* LEFT: Interactive Node & Edge Diagram Surface */}
            <div
              className="lg:col-span-7 p-5 bg-nx-ground border-b lg:border-b-0 lg:border-e border-nx-line flex flex-col justify-between gap-4 overflow-x-auto"
              style={{
                backgroundImage:
                  "radial-gradient(circle, var(--nx-line) 1px, transparent 1px)",
                backgroundSize: "18px 18px",
              }}
            >
              {workflowMode === "deals" ? (
                <div
                  className="space-y-4 transition-transform origin-top-left"
                  style={{ transform: `scale(${zoomPercent / 100})` }}
                >
                  {/* Top Flow Legend & Intake Start Node */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-2 rounded-full border border-nx-line bg-nx-surface px-3 py-1 text-[11px] font-semibold text-nx-ink">
                      <Play className="size-3 text-nx-accent" />
                      <span>Start: Direct Create (D2=B) or Lead Conversion</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-nx-ink-3">
                      <span className="inline-flex items-center gap-1">
                        <span className="size-2 rounded-full bg-info" /> Pre-Proposal
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <span className="size-2 rounded-full bg-nx-accent" /> PD-1 Party Gate
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <span className="size-2 rounded-full bg-success" /> Terminal
                      </span>
                    </div>
                  </div>

                  {/* Active 5 Stages Flow with Clickable Nodes & Transition Connectors */}
                  <div className="space-y-2.5">
                    {draftStages.map((stage, idx) => {
                      const isSelected = selectedNodeKey === stage.stageKey;
                      const isGateActive = Number(stage.sortOrder) >= proposalSortOrder;
                      const nextStage = idx < draftStages.length - 1 ? draftStages[idx + 1] : null;

                      return (
                        <div key={stage.stageKey} className="space-y-2">
                          <div
                            role="button"
                            tabIndex={0}
                            data-testid={`canvas-node-${stage.stageKey}`}
                            onClick={() => setSelectedNodeKey(stage.stageKey)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setSelectedNodeKey(stage.stageKey);
                              }
                            }}
                            className={cn(
                              "w-full text-start rounded-nx-md border p-3.5 transition-all cursor-pointer bg-nx-surface",
                              isSelected
                                ? "border-nx-accent ring-2 ring-nx-accent/30 bg-nx-raised"
                                : "border-nx-line hover:border-nx-line-hi"
                            )}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <span
                                  className={cn(
                                    "inline-flex size-6 items-center justify-center rounded-full text-xs font-mono font-bold border",
                                    isSelected
                                      ? "bg-nx-accent text-nx-on-fill border-nx-accent"
                                      : "bg-nx-raised text-nx-ink border-nx-line"
                                  )}
                                >
                                  {stage.sortOrder}
                                </span>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-nx-ink">
                                      {isRtl && stage.labelAr ? stage.labelAr : stage.labelEn}
                                    </span>
                                    <span className="text-[11px] text-nx-ink-3 font-mono">
                                      ({stage.stageKey})
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-nx-ink-3">
                                    {isRtl ? stage.labelEn : stage.labelAr || "—"}
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-1.5">
                                {isGateActive && (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] gap-1 border-nx-accent/40 bg-nx-accent-wash/30 text-nx-accent"
                                  >
                                    <ShieldCheck className="size-3" />
                                    PD-1 Party Gate
                                  </Badge>
                                )}
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] font-mono bg-nx-raised border-nx-line text-nx-ink-2"
                                >
                                  {stage.winProbabilityPercent || "0"}% Win
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className="text-[10px] font-mono border-nx-line bg-nx-ground text-nx-ink"
                                >
                                  {stage.requiredExitFields.length} Exit Validators
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {/* Transition Edge Connector to Next Stage */}
                          {nextStage && (
                            <div className="flex items-center gap-2 ps-6">
                              <div className="h-5 w-0.5 bg-nx-line" />
                              <Button
                                type="button"
                                variant="ghost"
                                data-testid={`canvas-transition-${stage.stageKey}`}
                                onClick={() => {
                                  setSelectedNodeKey(stage.stageKey);
                                  setInspectorTab("validators");
                                }}
                                className="h-auto inline-flex items-center gap-1.5 rounded-full border border-nx-line bg-nx-surface px-2.5 py-0.5 text-[10px] font-mono text-nx-ink-2 hover:border-nx-accent hover:text-nx-accent transition-colors"
                              >
                                <ArrowDown className="size-3 text-nx-accent" />
                                <span>
                                  Transition to {nextStage.labelEn} •{" "}
                                  {stage.requiredExitFields.length} gate(s) • crm.opportunities.stage
                                </span>
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Terminal Outcomes Row (Won / Lost) & Global Override Transitions */}
                  <div className="pt-2 border-t border-nx-line space-y-2.5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-nx-ink-3">
                      Terminal Resolution Nodes & Global Transitions
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div
                        role="button"
                        tabIndex={0}
                        data-testid="canvas-node-terminal-won"
                        onClick={() => {
                          setSelectedNodeKey("default.negotiation");
                          setInspectorTab("conditions");
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelectedNodeKey("default.negotiation");
                            setInspectorTab("conditions");
                          }
                        }}
                        className="cursor-pointer rounded-nx-md border border-success/40 bg-success/10 p-2.5 space-y-1 transition-colors hover:border-success"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-success flex items-center gap-1">
                            <CheckCircle2 className="size-3.5" />
                            Closed Won
                          </span>
                          <Badge
                            variant="outline"
                            className="text-[10px] font-mono border-success/40 text-success"
                          >
                            100%
                          </Badge>
                        </div>
                        <p className="text-[10px] text-nx-ink-2">
                          Gate: crm.opportunities.close + HQ Outcome / Tenant Handoff
                        </p>
                      </div>

                      <div
                        role="button"
                        tabIndex={0}
                        data-testid="canvas-node-terminal-lost"
                        onClick={() => {
                          setSelectedNodeKey("default.negotiation");
                          setInspectorTab("conditions");
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelectedNodeKey("default.negotiation");
                            setInspectorTab("conditions");
                          }
                        }}
                        className="cursor-pointer rounded-nx-md border border-destructive/40 bg-destructive/10 p-2.5 space-y-1 transition-colors hover:border-destructive"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-destructive flex items-center gap-1">
                            <XCircle className="size-3.5" />
                            Closed Lost
                          </span>
                          <Badge
                            variant="outline"
                            className="text-[10px] font-mono border-destructive/40 text-destructive"
                          >
                            0%
                          </Badge>
                        </div>
                        <p className="text-[10px] text-nx-ink-2">
                          Gate: crm.opportunities.close + Mandatory LossReasonCode
                        </p>
                      </div>

                      <div
                        role="button"
                        tabIndex={0}
                        data-testid="canvas-node-override-reopen"
                        onClick={() => {
                          setInspectorTab("conditions");
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setInspectorTab("conditions");
                          }
                        }}
                        className="cursor-pointer rounded-nx-md border border-nx-line bg-nx-surface p-2.5 space-y-1 transition-colors hover:border-nx-accent"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-nx-ink flex items-center gap-1">
                            <RotateCcw className="size-3.5 text-nx-accent" />
                            Rollback / Reopen
                          </span>
                          <Badge
                            variant="outline"
                            className="text-[10px] font-mono border-nx-line text-nx-ink-2"
                          >
                            PD-3
                          </Badge>
                        </div>
                        <p className="text-[10px] text-nx-ink-2">
                          Override: crm.opportunities.stage.override • Reopen: crm.opportunities.reopen
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* LEADS QUALIFICATION WORKFLOW DIAGRAM */
                <div
                  className="space-y-3 transition-transform origin-top-left"
                  style={{ transform: `scale(${zoomPercent / 100})` }}
                >
                  <div className="text-xs font-bold text-nx-ink flex items-center gap-2">
                    <GitBranch className="size-4 text-nx-accent" />
                    <span>Lead Qualification & Dual-Conversion State Machine (D2=B)</span>
                  </div>
                  <div className="space-y-2.5">
                    {LEAD_WORKFLOW_NODES.map((node) => {
                      const isSelected = selectedLeadNodeKey === node.key;
                      return (
                        <div
                          key={node.key}
                          role="button"
                          tabIndex={0}
                          data-testid={`canvas-lead-node-${node.key}`}
                          onClick={() => setSelectedLeadNodeKey(node.key)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setSelectedLeadNodeKey(node.key);
                            }
                          }}
                          className={cn(
                            "rounded-nx-md border p-3 transition-all cursor-pointer bg-nx-surface",
                            isSelected
                              ? "border-nx-accent ring-2 ring-nx-accent/30 bg-nx-raised"
                              : "border-nx-line hover:border-nx-line-hi"
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex size-5 items-center justify-center rounded-full bg-nx-raised border border-nx-line text-[10px] font-mono font-bold text-nx-ink">
                                {node.order}
                              </span>
                              <span className="text-xs font-bold text-nx-ink">
                                {isRtl ? node.labelAr : node.labelEn}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[10px] font-mono",
                                  node.category === "terminal"
                                    ? "border-success/40 text-success"
                                    : "border-nx-line text-nx-ink-2"
                                )}
                              >
                                {node.category === "terminal" ? "Terminal" : "Active State"}
                              </Badge>
                              <Badge
                                variant="secondary"
                                className="text-[10px] font-mono bg-nx-raised text-nx-ink-2"
                              >
                                {node.validators.length} Validators
                              </Badge>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT: Jira Workflow Inspector & Rule Builder Panel */}
            <div
              data-testid="workflow-inspector-panel"
              className="lg:col-span-5 p-5 bg-nx-surface flex flex-col justify-between space-y-4"
            >
              {workflowMode === "deals" && selectedStage ? (
                <div className="space-y-4">
                  {/* Selected Node Header */}
                  <div className="flex items-start justify-between gap-2 border-b border-nx-line pb-3">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-nx-accent font-semibold block">
                        Selected Workflow Stage Node
                      </span>
                      <h3 className="text-base font-bold text-nx-ink">
                        {selectedStage.sortOrder}.{" "}
                        {isRtl && selectedStage.labelAr
                          ? selectedStage.labelAr
                          : selectedStage.labelEn}
                      </h3>
                      <span className="text-[11px] font-mono text-nx-ink-3">
                        Key: {selectedStage.stageKey}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={activeStageIdx === 0 || !canManagePipeline}
                        onClick={() => handleSwapStageOrder(activeStageIdx, "up")}
                        className="h-7 px-2 text-xs"
                        title="Move Stage Earlier"
                      >
                        <ArrowUp className="size-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={
                          activeStageIdx === draftStages.length - 1 || !canManagePipeline
                        }
                        onClick={() => handleSwapStageOrder(activeStageIdx, "down")}
                        className="h-7 px-2 text-xs"
                        title="Move Stage Later"
                      >
                        <ArrowDown className="size-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Inspector Sub-Tabs (Properties | Validators | Conditions | Post-Functions) */}
                  <div className="grid grid-cols-4 gap-1 rounded-nx-md border border-nx-line bg-nx-ground p-1">
                    {(
                      [
                        { id: "validators", label: "Validators" },
                        { id: "properties", label: "Properties" },
                        { id: "conditions", label: "Conditions" },
                        { id: "postFunctions", label: "Post-Funcs" },
                      ] as const
                    ).map((tab) => (
                      <Button
                        key={tab.id}
                        type="button"
                        variant="ghost"
                        size="sm"
                        data-testid={`inspector-tab-${tab.id}`}
                        onClick={() => setInspectorTab(tab.id)}
                        className={cn(
                          "h-7 px-2 text-[11px] rounded-nx-sm",
                          inspectorTab === tab.id
                            ? "bg-nx-surface text-nx-accent font-bold border border-nx-line"
                            : "text-nx-ink-2 hover:text-nx-ink"
                        )}
                      >
                        {tab.label}
                      </Button>
                    ))}
                  </div>

                  {/* Tab 1: Transition Validators (Required Exit Gate Fields + Custom Fields) */}
                  {inspectorTab === "validators" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold text-nx-ink">
                          Required Exit Gate Fields (Before Advancing)
                        </Label>
                        <Badge
                          variant="outline"
                          className="text-[10px] font-mono border-nx-line text-nx-ink-2"
                        >
                          {selectedStage.requiredExitFields.length} Active
                        </Badge>
                      </div>
                      <p className="text-[11px] text-nx-ink-3">
                        Deals cannot exit{" "}
                        <strong>{selectedStage.labelEn}</strong> to a subsequent stage unless
                        all checked fields below are populated on the deal or supplied in the
                        Move Stage modal.
                      </p>
                      <div className="space-y-1.5 max-h-60 overflow-y-auto pe-1">
                        {PERMITTED_EXIT_FIELDS.map((fieldKey) => {
                          const isChecked =
                            selectedStage.requiredExitFields.includes(fieldKey);
                          const friendlyLabel =
                            EXIT_FIELD_LABELS[fieldKey]?.[isRtl ? "ar" : "en"] || fieldKey;
                          return (
                            <Label
                              key={fieldKey}
                              className="flex items-center justify-between gap-2 text-xs cursor-pointer select-none rounded-nx-sm border border-nx-line bg-nx-ground px-3 py-2 hover:border-nx-line-hi"
                            >
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  data-testid={`inspector-${selectedStage.stageKey}-exit-field-${fieldKey}`}
                                  checked={isChecked}
                                  disabled={!canManagePipeline}
                                  onCheckedChange={() =>
                                    handleToggleExitField(activeStageIdx, fieldKey)
                                  }
                                />
                                <span className="text-nx-ink font-medium">{friendlyLabel}</span>
                              </div>
                              <span className="text-[10px] font-mono text-nx-ink-3">
                                {fieldKey}
                              </span>
                            </Label>
                          );
                        })}

                        {opportunityCustomFields.map((fc) => {
                          const rawKey = decodeCustomFieldName(fc.name) ?? fc.name;
                          const gateKey = `custom:${rawKey}`;
                          const isChecked =
                            selectedStage.requiredExitFields.includes(gateKey);
                          return (
                            <Label
                              key={gateKey}
                              className="flex items-center justify-between gap-2 text-xs cursor-pointer select-none rounded-nx-sm border border-nx-line bg-nx-ground px-3 py-2 hover:border-nx-line-hi"
                            >
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  data-testid={`inspector-${selectedStage.stageKey}-exit-field-${gateKey}`}
                                  checked={isChecked}
                                  disabled={!canManagePipeline}
                                  onCheckedChange={() =>
                                    handleToggleExitField(activeStageIdx, gateKey)
                                  }
                                />
                                <span className="text-nx-ink font-medium">
                                  {fc.label || rawKey}
                                </span>
                              </div>
                              <Badge
                                variant="outline"
                                className="text-[9px] font-mono border-nx-accent/30 text-nx-accent"
                              >
                                Custom Field
                              </Badge>
                            </Label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Tab 2: Stage Properties */}
                  {inspectorTab === "properties" && (
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-nx-ink-2">
                          Stage Name (English)
                        </Label>
                        <Input
                          type="text"
                          value={selectedStage.labelEn}
                          onChange={(e) =>
                            handleFieldChange(activeStageIdx, "labelEn", e.target.value)
                          }
                          disabled={!canManagePipeline}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-nx-ink-2">
                          Stage Name (Arabic)
                        </Label>
                        <Input
                          type="text"
                          dir="rtl"
                          value={selectedStage.labelAr}
                          onChange={(e) =>
                            handleFieldChange(activeStageIdx, "labelAr", e.target.value)
                          }
                          disabled={!canManagePipeline}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-nx-ink-2">
                            Sort Order (1..5)
                          </Label>
                          <Input
                            type="number"
                            min={1}
                            max={5}
                            value={selectedStage.sortOrder}
                            onChange={(e) =>
                              handleFieldChange(
                                activeStageIdx,
                                "sortOrder",
                                parseInt(e.target.value, 10) || 1
                              )
                            }
                            disabled={!canManagePipeline}
                            className="h-8 text-xs font-mono"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-nx-ink-2">
                            Win Probability (%)
                          </Label>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            value={selectedStage.winProbabilityPercent}
                            onChange={(e) =>
                              handleFieldChange(
                                activeStageIdx,
                                "winProbabilityPercent",
                                e.target.value
                              )
                            }
                            disabled={!canManagePipeline}
                            className="h-8 text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab 3: Transition Conditions (PBAC & Domain Gates) */}
                  {inspectorTab === "conditions" && (
                    <div className="space-y-2.5 text-xs">
                      <div className="rounded-nx-md border border-nx-line bg-nx-ground p-3 space-y-1">
                        <div className="font-bold text-nx-ink flex items-center gap-1.5">
                          <Lock className="size-3.5 text-nx-accent" />
                          <span>Forward Stage Transition Gate</span>
                        </div>
                        <p className="text-[11px] text-nx-ink-2">
                          Requires permission{" "}
                          <code className="font-mono text-nx-accent">crm.opportunities.stage</code>{" "}
                          and D4 record visibility (Owner, Team, or active Manager Grant).
                        </p>
                      </div>
                      <div className="rounded-nx-md border border-nx-line bg-nx-ground p-3 space-y-1">
                        <div className="font-bold text-nx-ink flex items-center gap-1.5">
                          <ShieldCheck className="size-3.5 text-nx-accent" />
                          <span>PD-1 Party Verification Condition</span>
                        </div>
                        <p className="text-[11px] text-nx-ink-2">
                          {Number(selectedStage.sortOrder) >= proposalSortOrder
                            ? "ENFORCED on this stage: Deal must be linked to a verified PartyKernel Organization or Person before entering this stage."
                            : "Pre-Proposal stage: Deals can enter this stage before Party verification."}
                        </p>
                      </div>
                      <div className="rounded-nx-md border border-nx-line bg-nx-ground p-3 space-y-1">
                        <div className="font-bold text-nx-ink flex items-center gap-1.5">
                          <RotateCcw className="size-3.5 text-warning" />
                          <span>Backward / Skip Override Condition</span>
                        </div>
                        <p className="text-[11px] text-nx-ink-2">
                          Requires manager permission{" "}
                          <code className="font-mono text-nx-accent">
                            crm.opportunities.stage.override
                          </code>{" "}
                          and mandatory override reason.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Tab 4: Post-Functions */}
                  {inspectorTab === "postFunctions" && (
                    <div className="space-y-2 text-xs">
                      {[
                        "Append immutable CrmOpportunityStageHistory audit record with actor & timestamp",
                        "Emit StageMoved event onto CrmSalesActivity append-only timeline",
                        "Snapshot stageLabelEnSnapshot, stageLabelArSnapshot & pipelineVersionSnapshot",
                        "Persist inline gate fields (PartyId, EstimatedAmount, TargetCloseDate, CustomFields)",
                        "Rotate RowVersion concurrency token to prevent lost updates",
                      ].map((fn, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 rounded-nx-sm border border-nx-line bg-nx-ground p-2.5"
                        >
                          <Zap className="size-3.5 text-nx-accent shrink-0 mt-0.5" />
                          <span className="text-[11px] text-nx-ink-2">{fn}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Lead Node Inspector */
                <div className="space-y-4">
                  <div className="border-b border-nx-line pb-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-nx-accent font-semibold block">
                      Lead Qualification Status Node
                    </span>
                    <h3 className="text-base font-bold text-nx-ink">
                      {selectedLeadNode.order}.{" "}
                      {isRtl ? selectedLeadNode.labelAr : selectedLeadNode.labelEn}
                    </h3>
                    <span className="text-[11px] font-mono text-nx-ink-3">
                      Permission Gate: {selectedLeadNode.requiredPermission}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-nx-ink">
                      Enforced Validators
                    </Label>
                    {selectedLeadNode.validators.map((v, idx) => (
                      <div
                        key={idx}
                        className="rounded-nx-sm border border-nx-line bg-nx-ground px-3 py-2 text-xs text-nx-ink-2 flex items-center gap-2"
                      >
                        <ShieldCheck className="size-3.5 text-nx-accent shrink-0" />
                        <span>{v}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-nx-ink">
                      Automated Post-Functions
                    </Label>
                    {selectedLeadNode.postFunctions.map((pf, idx) => (
                      <div
                        key={idx}
                        className="rounded-nx-sm border border-nx-line bg-nx-ground px-3 py-2 text-xs text-nx-ink-2 flex items-center gap-2"
                      >
                        <Zap className="size-3.5 text-nx-accent shrink-0" />
                        <span>{pf}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-nx-line flex items-center justify-between text-[11px] text-nx-ink-3">
                <span>Click any node on the canvas to inspect its rules</span>
                <Badge variant="outline" className="font-mono text-[10px] border-nx-line">
                  v{pipeline?.version ?? 1}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* =====================================================================
            FULL STAGE & GATE MATRIX FORM (ALL 5 STAGES SIDE-BY-SIDE / STACKED)
           ===================================================================== */}
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
