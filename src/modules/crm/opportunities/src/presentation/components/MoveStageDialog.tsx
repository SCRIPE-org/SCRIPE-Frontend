"use client";

import { useState, useEffect } from "react";
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
import { Textarea } from "@core/ui/textarea";
import { Alert, AlertDescription } from "@core/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { Checkbox } from "@core/ui/checkbox";
import { AlertCircle, Building2, ShieldAlert } from "lucide-react";
import {
  CustomFieldsSection,
  encodeCustomFieldName,
  useCustomFieldsFormFields,
} from "@core/crud/customFieldsExtension";
import type {
  CrmOpportunity,
  MoveOpportunityStageInput,
  PipelineDefinition,
} from "../../domain/entities/OpportunityEntity";

export interface MoveStagePartyOption {
  partyId: string;
  accountId?: string;
  label: string;
  subtitle?: string;
}

export interface MoveStageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunity: CrmOpportunity | null;
  initialTargetStageKey?: string;
  pipeline?: PipelineDefinition | null;
  onSubmit: (input: MoveOpportunityStageInput) => Promise<boolean>;
  onLookupParties?: (search?: string) => Promise<MoveStagePartyOption[]>;
  isSubmitting?: boolean;
  submitError?: string | null;
}

const CANONICAL_ACTIVE_STAGES = [
  { key: "default.discovery", order: 1, labelEn: "Discovery", labelAr: "استكشاف" },
  { key: "default.qualification", order: 2, labelEn: "Qualification", labelAr: "تأهيل" },
  { key: "default.solution_fit", order: 3, labelEn: "Solution Fit", labelAr: "ملاءمة الحل" },
  {
    key: "default.proposal",
    order: 4,
    labelEn: "Proposal",
    labelAr: "عرض السعر",
    partyRequired: true,
  },
  {
    key: "default.negotiation",
    order: 5,
    labelEn: "Negotiation",
    labelAr: "تفاوض",
    partyRequired: true,
  },
];

/**
 * Interactive Stage Gate & Transition Dialog.
 * Allows advancing or rolling back an opportunity's stage while completing any required
 * stage gate fields (Account/Contact link, Estimated Amount, Target Close Date, Primary Contact Role, Solution Fit, Custom Fields, or Override Reason).
 */
export function MoveStageDialog({
  open,
  onOpenChange,
  opportunity,
  initialTargetStageKey,
  pipeline,
  onSubmit,
  onLookupParties,
  isSubmitting = false,
  submitError,
}: MoveStageDialogProps) {
  const { t, language } = useI18n();
  const isRtl = language === "ar";

  const [targetStageKey, setTargetStageKey] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [selectedPartyId, setSelectedPartyId] = useState<string>("");
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [estimatedAmount, setEstimatedAmount] = useState<string>("");
  const [targetCloseDate, setTargetCloseDate] = useState<string>("");
  const [primaryContactRole, setPrimaryContactRole] = useState<string>("");
  const [solutionFitConfirmed, setSolutionFitConfirmed] = useState<boolean>(false);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, unknown>>({});
  const [partyOptions, setPartyOptions] = useState<MoveStagePartyOption[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  const activeOppId = open && opportunity ? opportunity.id : undefined;
  const {
    fieldConfigs: oppCustomFieldConfigs,
    isLoading: isOppCfLoading,
    refetch: refetchOppCustomFields,
  } = useCustomFieldsFormFields(
    activeOppId ? "crm.opportunity" : undefined,
    activeOppId
  );

  useEffect(() => {
    if (oppCustomFieldConfigs.length > 0) {
      setCustomFieldValues((prev) => {
        const next: Record<string, unknown> = { ...prev };
        for (const fc of oppCustomFieldConfigs) {
          if (
            next[fc.name] === undefined &&
            fc.defaultValue !== undefined &&
            fc.defaultValue !== null
          ) {
            next[fc.name] = fc.defaultValue;
          }
        }
        return next;
      });
    }
  }, [oppCustomFieldConfigs]);

  const effectiveStages =
    pipeline?.stages && pipeline.stages.length > 0
      ? [...pipeline.stages]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((s) => ({
            key: s.stageKey,
            order: s.sortOrder,
            labelEn: s.labelEn,
            labelAr: s.labelAr || s.labelEn,
            partyRequired:
              s.requiresVerifiedParty ||
              s.stageKey === "default.proposal" ||
              s.stageKey === "default.negotiation",
            requiredExitFields: s.requiredExitFields ?? [],
          }))
      : CANONICAL_ACTIVE_STAGES.map((s) => ({ ...s, requiredExitFields: [] as string[] }));

  useEffect(() => {
    if (opportunity && open) {
      if (initialTargetStageKey) {
        setTargetStageKey(initialTargetStageKey);
      } else {
        const currentIndex = effectiveStages.findIndex((s) => s.key === opportunity.stageKey);
        const nextStage =
          effectiveStages[currentIndex + 1] ??
          effectiveStages[currentIndex] ??
          effectiveStages[0];
        setTargetStageKey(nextStage.key);
      }
      setReason("");
      setSelectedPartyId(opportunity.partyId || "");
      setSelectedAccountId(opportunity.accountId || "");
      setEstimatedAmount(
        opportunity.estimatedAmount != null ? String(opportunity.estimatedAmount) : ""
      );
      setTargetCloseDate(
        opportunity.targetCloseDate ? opportunity.targetCloseDate.slice(0, 10) : ""
      );
      setPrimaryContactRole(opportunity.primaryContactRole || "");
      setSolutionFitConfirmed(Boolean(opportunity.solutionFitConfirmed));
      setCustomFieldValues({});
      setValidationError(null);
    }
  }, [opportunity, open, initialTargetStageKey]);

  useEffect(() => {
    if (!open || !onLookupParties) return;
    let cancelled = false;
    async function loadParties() {
      try {
        const opts = await onLookupParties!();
        if (!cancelled) {
          setPartyOptions(opts);
        }
      } catch {
        // Ignore in test environments
      }
    }
    loadParties();
    return () => {
      cancelled = true;
    };
  }, [open, onLookupParties]);

  if (!opportunity) return null;

  const currentStageIndex = effectiveStages.findIndex((s) => s.key === opportunity.stageKey);
  const targetStageIndex = effectiveStages.findIndex((s) => s.key === targetStageKey);
  const currentStageConfig = effectiveStages[currentStageIndex];
  const targetStageConfig = effectiveStages[targetStageIndex];

  const isForward = targetStageIndex > currentStageIndex;
  const isAdjacentForward = targetStageIndex === currentStageIndex + 1;
  const isTargetProposalOrLater =
    targetStageConfig?.partyRequired ||
    targetStageKey === "default.proposal" ||
    targetStageKey === "default.negotiation";

  const exitFields = isForward ? (currentStageConfig?.requiredExitFields ?? []) : [];
  const needsPartyInput =
    (isTargetProposalOrLater || exitFields.includes("partyId")) && !opportunity.partyId;
  const effectivePartyId = opportunity.partyId || selectedPartyId;
  const lacksParty =
    (isTargetProposalOrLater || exitFields.includes("partyId")) && !effectivePartyId;

  const needsAmountInput = exitFields.includes("estimatedAmount");
  const needsCloseDateInput = exitFields.includes("targetCloseDate");
  const needsContactRoleInput = exitFields.includes("primaryContactRole");
  const needsSolutionFitInput = exitFields.includes("solutionFitConfirmed");
  const requiredCustomFieldKeys = exitFields
    .filter((f) => f.startsWith("custom:"))
    .map((f) => f.slice("custom:".length));

  const handlePartyChange = (val: string) => {
    setSelectedPartyId(val);
    const match = partyOptions.find((o) => o.partyId === val);
    setSelectedAccountId(match?.accountId || "");
    setValidationError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (lacksParty) {
      setValidationError(t("crmOpportunities.dialogs.stage.partyNotice"));
      return;
    }

    if (needsAmountInput && (!estimatedAmount || Number(estimatedAmount) <= 0)) {
      setValidationError("Estimated Deal Value (> 0) is required to exit the current stage.");
      return;
    }

    if (needsCloseDateInput && !targetCloseDate) {
      setValidationError("Target Close Date is required to exit the current stage.");
      return;
    }

    if (needsContactRoleInput && !primaryContactRole) {
      setValidationError("Primary Contact Role is required to exit the current stage.");
      return;
    }

    if (needsSolutionFitInput && !solutionFitConfirmed) {
      setValidationError("Solution Fit Confirmed check is required to exit the current stage.");
      return;
    }

    for (const cfKey of requiredCustomFieldKeys) {
      const encodedName = encodeCustomFieldName(cfKey);
      const val = customFieldValues[encodedName] ?? customFieldValues[cfKey];
      if (val === undefined || val === null || String(val).trim() === "") {
        setValidationError(`Required stage gate custom field '${cfKey}' must be completed before advancing.`);
        return;
      }
    }

    if (!isAdjacentForward) {
      if (!reason.trim() || reason.trim().length < 5) {
        setValidationError(
          "A stage transition comment/reason of at least 5 characters is required when moving backward or skipping stages."
        );
        return;
      }
    }

    const trimmedNote = reason.trim() || undefined;

    const payload: MoveOpportunityStageInput = {
      opportunityId: opportunity.id,
      targetStageKey,
      reason: trimmedNote,
      stageTransitionNote: trimmedNote,
      expectedRowVersion: opportunity.rowVersion,
      partyId: !opportunity.partyId && selectedPartyId ? selectedPartyId : undefined,
      accountId: !opportunity.accountId && selectedAccountId ? selectedAccountId : undefined,
      estimatedAmount:
        estimatedAmount !== "" && Number(estimatedAmount) !== opportunity.estimatedAmount
          ? Number(estimatedAmount)
          : undefined,
      targetCloseDate: targetCloseDate
        ? new Date(targetCloseDate).toISOString()
        : undefined,
      primaryContactRole: primaryContactRole || undefined,
      solutionFitConfirmed: needsSolutionFitInput || solutionFitConfirmed ? solutionFitConfirmed : undefined,
      customFieldValues: Object.keys(customFieldValues).length > 0 ? customFieldValues : undefined,
    };

    const success = await onSubmit(payload);
    if (success) {
      onOpenChange(false);
      setReason("");
      setValidationError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" dir={isRtl ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle>{t("crmOpportunities.dialogs.stage.title")}</DialogTitle>
          <DialogDescription>
            {t("crmOpportunities.dialogs.stage.description")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {(submitError || validationError) && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>{submitError || validationError}</AlertDescription>
            </Alert>
          )}

          <div className="rounded-nx-md border border-nx-line bg-nx-surface p-3 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-nx-ink-3">{t("crmOpportunities.table.deal")}:</span>
              <span className="font-semibold text-nx-ink">{opportunity.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-nx-ink-3">
                {t("crmOpportunities.dialogs.stage.currentStage")}:
              </span>
              <span className="font-medium text-nx-ink">
                {isRtl && opportunity.stageLabelArSnapshot
                  ? opportunity.stageLabelArSnapshot
                  : opportunity.stageLabelEnSnapshot || opportunity.stageKey}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-nx-ink-3">{t("crmOpportunities.table.party")}:</span>
              <span
                className={
                  effectivePartyId
                    ? "text-success font-medium"
                    : "text-warning font-medium"
                }
              >
                {effectivePartyId
                  ? t("crmOpportunities.kanban.partyVerified", {
                      defaultValue: "Verified Account / Contact Linked",
                    })
                  : t("crmOpportunities.kanban.partyUnlinked", {
                      defaultValue: "Not Linked Yet",
                    })}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="target-stage">
              {t("crmOpportunities.dialogs.stage.targetStageLabel")}
            </Label>
            <Select value={targetStageKey} onValueChange={setTargetStageKey}>
              <SelectTrigger id="target-stage">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {effectiveStages.map((s) => (
                  <SelectItem key={s.key} value={s.key}>
                    {isRtl && s.labelAr ? s.labelAr : s.labelEn}{" "}
                    {s.partyRequired ? "• (Account/Contact Required)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Inline Account / Contact Linking Gate when moving to Proposal/Negotiation */}
          {needsPartyInput && (
            <div className="space-y-2 rounded-nx-md border border-nx-accent/30 bg-nx-accent-wash/30 p-3">
              <Label className="text-xs font-semibold text-nx-ink flex items-center gap-1.5">
                <Building2 className="size-3.5 text-nx-accent" />
                <span>
                  {t("crmOpportunities.dialogs.create.partyIdLabel", {
                    defaultValue: "Link Account or Contact",
                  })}{" "}
                  <span className="text-destructive">*</span>
                </span>
              </Label>
              <p className="text-[11px] text-nx-ink-2">
                {t("crmOpportunities.dialogs.stage.partyNotice")}
              </p>
              <Select value={selectedPartyId} onValueChange={handlePartyChange}>
                <SelectTrigger className="h-9 text-xs bg-nx-surface border-nx-line">
                  <SelectValue
                    placeholder={t("crmOpportunities.dialogs.create.partyIdPlaceholder", {
                      defaultValue: "Select an Account or Contact...",
                    })}
                  />
                </SelectTrigger>
                <SelectContent>
                  {partyOptions.map((opt) => (
                    <SelectItem key={opt.partyId} value={opt.partyId}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Stage Gate Exit Fields if required or missing */}
          {(needsAmountInput ||
            needsCloseDateInput ||
            needsContactRoleInput ||
            needsSolutionFitInput) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-nx-md border border-nx-line bg-nx-raised/40 p-3">
              {needsAmountInput && (
                <div className="space-y-1">
                  <Label htmlFor="stage-gate-amount" className="text-xs">
                    {t("crmOpportunities.dialogs.create.amountLabel")} ({opportunity.currencyCode}){" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="stage-gate-amount"
                    type="number"
                    min="0.01"
                    step="any"
                    value={estimatedAmount}
                    onChange={(e) => setEstimatedAmount(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              )}
              {needsCloseDateInput && (
                <div className="space-y-1">
                  <Label htmlFor="stage-gate-close-date" className="text-xs">
                    {t("crmOpportunities.dialogs.create.closeDateLabel")}{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="stage-gate-close-date"
                    type="date"
                    value={targetCloseDate}
                    onChange={(e) => setTargetCloseDate(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              )}
              {needsContactRoleInput && (
                <div className="space-y-1 sm:col-span-2">
                  <Label htmlFor="stage-gate-contact-role" className="text-xs">
                    {t("crmOpportunities.pipelineAdmin.exitFields.primaryContactRole", {
                      defaultValue: "Primary Contact Role",
                    })}{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Select value={primaryContactRole} onValueChange={setPrimaryContactRole}>
                    <SelectTrigger id="stage-gate-contact-role" className="h-8 text-xs bg-nx-surface">
                      <SelectValue placeholder="Select stakeholder role..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Decision Maker">Decision Maker</SelectItem>
                      <SelectItem value="Executive Sponsor">Executive Sponsor</SelectItem>
                      <SelectItem value="Technical Evaluator">Technical Evaluator</SelectItem>
                      <SelectItem value="Procurement / Commercial">Procurement / Commercial</SelectItem>
                      <SelectItem value="Champion">Champion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              {needsSolutionFitInput && (
                <div className="flex items-center gap-2 sm:col-span-2 pt-1">
                  <Checkbox
                    id="stage-gate-solution-fit"
                    checked={solutionFitConfirmed}
                    onCheckedChange={(checked) => setSolutionFitConfirmed(Boolean(checked))}
                  />
                  <Label
                    htmlFor="stage-gate-solution-fit"
                    className="text-xs font-medium text-nx-ink cursor-pointer"
                  >
                    {t("crmOpportunities.pipelineAdmin.exitFields.solutionFitConfirmed", {
                      defaultValue: "Solution Fit Confirmed",
                    })}{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                </div>
              )}
            </div>
          )}

          {/* Opportunity Custom Fields during Stage Transition */}
          <CustomFieldsSection
            entityTypeKey="crm.opportunity"
            entityDisplayName={t("crmOpportunities.title") || "Commercial Opportunity"}
            configs={oppCustomFieldConfigs}
            isLoading={isOppCfLoading}
            onFieldCreated={() => void refetchOppCustomFields()}
            values={customFieldValues}
            onChange={(key, val) => setCustomFieldValues((prev) => ({ ...prev, [key]: val }))}
            disabled={isSubmitting}
          />

          {/* Stage Transition Comment / Audit Reason */}
          <div
            className={
              !isAdjacentForward
                ? "space-y-2 rounded-nx-md border border-warning/30 bg-warning/5 p-3"
                : "space-y-1.5"
            }
          >
            {!isAdjacentForward && (
              <div className="flex items-center gap-2 text-warning text-xs font-semibold">
                <ShieldAlert className="size-4" />
                <span>{t("crmOpportunities.dialogs.stage.overrideNotice")}</span>
              </div>
            )}
            <div className="space-y-1">
              <Label htmlFor="stage-reason" className="text-xs">
                {!isAdjacentForward
                  ? t("crmOpportunities.dialogs.stage.reasonLabel")
                  : t("crmOpportunities.dialogs.stage.transitionNoteLabel", {
                      defaultValue: "Stage Transition Comment / Note",
                    })}{" "}
                {!isAdjacentForward && <span className="text-destructive">*</span>}
              </Label>
              <Textarea
                id="stage-reason"
                placeholder={
                  !isAdjacentForward
                    ? t("crmOpportunities.dialogs.stage.reasonPlaceholder")
                    : t("crmOpportunities.dialogs.stage.transitionNotePlaceholder", {
                        defaultValue:
                          "Record key takeaways, stakeholder feedback, or stage exit notes...",
                      })
                }
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t("crmOpportunities.actions.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting || (lacksParty && partyOptions.length === 0)}>
              {isSubmitting
                ? t("crmOpportunities.actions.saving")
                : t("crmOpportunities.dialogs.stage.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
