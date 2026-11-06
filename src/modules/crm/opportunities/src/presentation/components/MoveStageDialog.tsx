"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Alert, AlertDescription } from "@core/ui/alert";
import { AlertCircle } from "lucide-react";
import { encodeCustomFieldName, useCustomFieldsFormFields } from "@core/crud/customFieldsExtension";
import { useCrmSettingsStore, useCrmWorkflowsStore } from "@modules/crm";
import type { CrmOpportunity, MoveOpportunityStageInput, PipelineDefinition } from "../../domain/entities/OpportunityEntity";
import { MoveStageGateFieldsSection, type MoveStagePartyOption } from "./MoveStageGateFieldsSection";

export type { MoveStagePartyOption };

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
  { key: "default.proposal", order: 4, labelEn: "Proposal", labelAr: "عرض السعر", partyRequired: true },
  { key: "default.negotiation", order: 5, labelEn: "Negotiation", labelAr: "تفاوض", partyRequired: true },
];

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
  const [targetStageKey, setTargetStageKey] = useState("");
  const [reason, setReason] = useState("");
  const [selectedPartyId, setSelectedPartyId] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [estimatedAmount, setEstimatedAmount] = useState("");
  const [targetCloseDate, setTargetCloseDate] = useState("");
  const [primaryContactRole, setPrimaryContactRole] = useState("");
  const [solutionFitConfirmed, setSolutionFitConfirmed] = useState(false);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, unknown>>({});
  const [partyOptions, setPartyOptions] = useState<MoveStagePartyOption[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  const activeOppId = open && opportunity ? opportunity.id : undefined;
  const { fieldConfigs: rawOppCf, isLoading: isOppCfLoading, refetch: refetchOppCf } = useCustomFieldsFormFields(
    activeOppId ? "crm.opportunity" : undefined,
    activeOppId,
  );
  const storeCustomFields = useCrmSettingsStore((s) => s.crmCustomFields);
  const addCrmCustomField = useCrmSettingsStore((s) => s.addCrmCustomField);
  const oppCustomFieldConfigs = [
    ...rawOppCf,
    ...storeCustomFields
      .filter((f) => f.entityTypeKey === "crm.opportunity" && !rawOppCf.some((r) => r.name === encodeCustomFieldName(f.key) || r.name === f.key))
      .map((f) => ({
        name: encodeCustomFieldName(f.key),
        label: isRtl && f.labelAr ? f.labelAr : f.labelEn,
        type: (f.valueType === "Number" || f.valueType === "Currency" ? "number" : f.valueType === "Date" ? "date" : f.valueType === "Boolean" ? "checkbox" : "text") as any,
        required: f.isRequired,
        defaultValue: undefined,
      })),
  ];

  useEffect(() => {
    if (!open || oppCustomFieldConfigs.length === 0) return;
    setCustomFieldValues((prev) => {
      let changed = false;
      const next: Record<string, unknown> = { ...prev };
      for (const fc of oppCustomFieldConfigs) {
        if (next[fc.name] === undefined && fc.defaultValue != null) {
          next[fc.name] = fc.defaultValue;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [open, rawOppCf, storeCustomFields]);

  const activeDealWorkflow = useCrmWorkflowsStore((s) => s.getActiveWorkflow("deal"));
  const evaluateTransition = useCrmWorkflowsStore((s) => s.evaluateTransition);
  const sourceStages =
    pipeline?.stages?.length && activeDealWorkflow.id === "wf-deal-default"
      ? pipeline.stages
      : activeDealWorkflow?.stages?.length >= 2
        ? activeDealWorkflow.stages
        : pipeline?.stages ?? [];

  const effectiveStages =
    sourceStages.length > 0
      ? [...sourceStages]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((s) => ({
            key: s.stageKey,
            order: s.sortOrder,
            labelEn: s.labelEn,
            labelAr: s.labelAr || s.labelEn,
            partyRequired: s.requiresVerifiedParty || Boolean(s.requiredExitFields?.includes("partyId")) || s.stageKey === "default.proposal" || s.stageKey === "default.negotiation",
            requiredExitFields: s.requiredExitFields ?? [],
          }))
      : CANONICAL_ACTIVE_STAGES.map((s) => ({ ...s, requiredExitFields: [] as string[] }));

  useEffect(() => {
    if (!opportunity || !open) return;
    const idx = effectiveStages.findIndex((s) => s.key === opportunity.stageKey);
    setTargetStageKey(initialTargetStageKey || (effectiveStages[idx + 1] ?? effectiveStages[idx] ?? effectiveStages[0]).key);
    setReason("");
    setSelectedPartyId(opportunity.partyId || "");
    setSelectedAccountId(opportunity.accountId || "");
    setEstimatedAmount(opportunity.estimatedAmount != null ? String(opportunity.estimatedAmount) : "");
    setTargetCloseDate(opportunity.targetCloseDate ? opportunity.targetCloseDate.slice(0, 10) : "");
    setPrimaryContactRole(opportunity.primaryContactRole || "");
    setSolutionFitConfirmed(Boolean(opportunity.solutionFitConfirmed));
    setCustomFieldValues({});
    setValidationError(null);
  }, [opportunity, open, initialTargetStageKey]);

  useEffect(() => {
    if (!open || !onLookupParties) return;
    let cancelled = false;
    onLookupParties()
      .then((opts) => {
        if (!cancelled) setPartyOptions(opts);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [open, onLookupParties]);

  if (!opportunity) return null;

  const currentStageIndex = effectiveStages.findIndex((s) => s.key === opportunity.stageKey);
  const targetStageIndex = effectiveStages.findIndex((s) => s.key === targetStageKey);
  const targetStageConfig = effectiveStages[targetStageIndex];
  const fromInWf = activeDealWorkflow.stages.some((s) => s.stageKey === opportunity.stageKey);
  const toInWf = activeDealWorkflow.stages.some((s) => s.stageKey === targetStageKey);
  const evalTransition = fromInWf && toInWf && targetStageKey ? evaluateTransition("deal", opportunity.stageKey, targetStageKey) : null;

  const isForward = targetStageIndex > currentStageIndex;
  const isAdjacentForward = targetStageIndex === currentStageIndex + 1 && !evalTransition?.promptForComment;
  const isTargetProposalOrLater =
    targetStageConfig?.partyRequired ||
    Boolean(evalTransition?.matchedTransition?.rules.requireVerifiedParty) ||
    targetStageKey === "default.proposal" ||
    targetStageKey === "default.negotiation";

  const stageExitFields = isForward
    ? Array.from(new Set(effectiveStages.slice(Math.max(0, currentStageIndex), targetStageIndex).flatMap((s) => s.requiredExitFields ?? [])))
    : [];
  const exitFields = Array.from(new Set([...stageExitFields, ...(evalTransition?.requiredFields ?? [])]));
  const needsPartyInput = (isTargetProposalOrLater || exitFields.includes("partyId")) && !opportunity.partyId;
  const effectivePartyId = opportunity.partyId || selectedPartyId;
  const lacksParty = (isTargetProposalOrLater || exitFields.includes("partyId")) && !effectivePartyId;
  const needsAmountInput = exitFields.includes("estimatedAmount");
  const needsCloseDateInput = exitFields.includes("targetCloseDate");
  const needsContactRoleInput = exitFields.includes("primaryContactRole");
  const needsSolutionFitInput = exitFields.includes("solutionFitConfirmed");
  const requiredCustomFieldKeys = Array.from(
    new Set([
      ...exitFields.filter((f) => f.startsWith("custom:")).map((f) => f.slice("custom:".length)),
      ...storeCustomFields
        .filter(
          (f) =>
            f.entityTypeKey === "crm.opportunity" &&
            Boolean(f.defaultStageGateKey) &&
            (f.defaultStageGateKey === opportunity.stageKey || f.defaultStageGateKey === targetStageKey)
        )
        .map((f) => f.key),
    ])
  );
  const nonGateCustomFieldConfigs = oppCustomFieldConfigs.filter(
    (fc) => !requiredCustomFieldKeys.some((k) => fc.name === k || fc.name === encodeCustomFieldName(k))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    if (targetStageKey === opportunity.stageKey) return setValidationError("Opportunity is already in the selected stage. Choose a different target stage.");
    if (evalTransition && !evalTransition.allowed) return setValidationError(evalTransition.reason || "Transition between these stages is restricted in the active workflow.");
    if (lacksParty) return setValidationError(t("crmOpportunities.dialogs.stage.partyNotice"));
    if (estimatedAmount !== "" && (!Number.isFinite(Number(estimatedAmount)) || Number(estimatedAmount) < 0)) return setValidationError("Estimated Deal Value cannot be negative.");
    if (needsAmountInput && (!estimatedAmount || Number(estimatedAmount) <= 0)) return setValidationError("Estimated Deal Value (> 0) is required to exit the current stage.");
    if (needsCloseDateInput && !targetCloseDate) return setValidationError("Target Close Date is required to exit the current stage.");
    if (needsContactRoleInput && !primaryContactRole) return setValidationError("Primary Contact Role is required to exit the current stage.");
    if (needsSolutionFitInput && !solutionFitConfirmed) return setValidationError("Solution Fit Confirmed check is required to exit the current stage.");
    for (const cfKey of requiredCustomFieldKeys) {
      const def = storeCustomFields.find((f) => f.key === cfKey);
      const val = customFieldValues[encodeCustomFieldName(cfKey)] ?? customFieldValues[cfKey];
      if (def?.valueType === "Boolean") {
        if (val !== true && val !== "true") {
          return setValidationError(`Required stage gate custom field '${def.labelEn || cfKey}' must be confirmed before advancing.`);
        }
      } else if (def?.valueType === "Number" || def?.valueType === "Currency") {
        if (val === undefined || val === null || String(val).trim() === "" || !Number.isFinite(Number(val))) {
          return setValidationError(`Required stage gate numeric field '${def.labelEn || cfKey}' must have a valid number before advancing.`);
        }
      } else if (val === undefined || val === null || String(val).trim() === "") {
        return setValidationError(`Required stage gate custom field '${def?.labelEn || cfKey}' must be completed before advancing.`);
      }
    }
    if (!isAdjacentForward && (!reason.trim() || reason.trim().length < 5)) return setValidationError("A stage transition comment/reason of at least 5 characters is required when moving backward or skipping stages.");

    const trimmedNote = reason.trim() || undefined;
    const success = await onSubmit({
      opportunityId: opportunity.id,
      targetStageKey,
      reason: trimmedNote,
      stageTransitionNote: trimmedNote,
      expectedRowVersion: opportunity.rowVersion,
      partyId: !opportunity.partyId && selectedPartyId ? selectedPartyId : undefined,
      accountId: !opportunity.accountId && selectedAccountId ? selectedAccountId : undefined,
      estimatedAmount: estimatedAmount !== "" && Number(estimatedAmount) !== opportunity.estimatedAmount ? Number(estimatedAmount) : undefined,
      targetCloseDate: targetCloseDate ? new Date(targetCloseDate).toISOString() : undefined,
      primaryContactRole: primaryContactRole || undefined,
      solutionFitConfirmed: needsSolutionFitInput || solutionFitConfirmed ? solutionFitConfirmed : undefined,
      customFieldValues: Object.keys(customFieldValues).length > 0 ? customFieldValues : undefined,
    });
    if (success) {
      onOpenChange(false);
      setReason("");
      setValidationError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" dir={isRtl ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle>{t("crmOpportunities.dialogs.stage.title")}</DialogTitle>
          <DialogDescription>{t("crmOpportunities.dialogs.stage.description")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {(submitError || validationError) && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>{submitError || validationError}</AlertDescription>
            </Alert>
          )}
          <div
            className="rounded-lg border border-nx-line bg-nx-raised/40 px-3 py-2 flex items-center justify-between gap-2 text-xs"
            data-testid="move-stage-approval-gate-card"
          >
            <span className="font-semibold text-nx-ink">
              {isRtl ? "حوكمة الانتقال وطابور الاعتماد:" : "Pipeline Role Gate & Quorum:"}
            </span>
            <span className="font-mono text-[11px] text-nx-ink-2">
              {evalTransition?.matchedTransition?.rules.requireApproval
                ? `${evalTransition.matchedTransition.rules.approverRole || "pipe_role:deal_desk"} (${evalTransition.matchedTransition.rules.approvalQuorum || "any"})`
                : isRtl
                  ? "مسموح لدور المسار النشط"
                  : "Authorized via Active Pipeline Role"}
            </span>
          </div>
          <MoveStageGateFieldsSection
            t={t}
            isRtl={isRtl}
            opportunity={opportunity}
            effectivePartyId={effectivePartyId}
            targetStageKey={targetStageKey}
            onTargetStageKeyChange={setTargetStageKey}
            effectiveStages={effectiveStages}
            currencyCode={opportunity.currencyCode}
            needsPartyInput={needsPartyInput}
            selectedPartyId={selectedPartyId}
            partyOptions={partyOptions}
            onPartyChange={(val) => {
              setSelectedPartyId(val);
              setSelectedAccountId(partyOptions.find((o) => o.partyId === val)?.accountId || "");
              setValidationError(null);
            }}
            needsAmountInput={needsAmountInput}
            estimatedAmount={estimatedAmount}
            onEstimatedAmountChange={setEstimatedAmount}
            needsCloseDateInput={needsCloseDateInput}
            targetCloseDate={targetCloseDate}
            onTargetCloseDateChange={setTargetCloseDate}
            needsContactRoleInput={needsContactRoleInput}
            primaryContactRole={primaryContactRole}
            onPrimaryContactRoleChange={setPrimaryContactRole}
            needsSolutionFitInput={needsSolutionFitInput}
            solutionFitConfirmed={solutionFitConfirmed}
            onSolutionFitConfirmedChange={setSolutionFitConfirmed}
            oppCustomFieldConfigs={nonGateCustomFieldConfigs}
            requiredCustomFieldKeys={requiredCustomFieldKeys}
            storeCustomFields={storeCustomFields}
            onAddCrmCustomField={(field) => {
              addCrmCustomField(field);
              const wfStage = activeDealWorkflow.stages.find((s) => s.stageKey === opportunity.stageKey);
              if (wfStage) {
                useCrmWorkflowsStore.getState().updateStageInWorkflow(activeDealWorkflow.id, wfStage.stageKey, {
                  requiredExitFields: Array.from(new Set([...(wfStage.requiredExitFields ?? []), `custom:${field.key}`])),
                });
              }
            }}
            isOppCfLoading={isOppCfLoading}
            onRefetchOppCustomFields={() => void refetchOppCf()}
            customFieldValues={customFieldValues}
            onCustomFieldChange={(key, val) => setCustomFieldValues((prev) => ({ ...prev, [key]: val }))}
            isAdjacentForward={isAdjacentForward}
            reason={reason}
            onReasonChange={setReason}
            isSubmitting={isSubmitting}
          />
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              {t("crmOpportunities.actions.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting || (lacksParty && partyOptions.length === 0)}>
              {isSubmitting ? t("crmOpportunities.actions.saving") : t("crmOpportunities.dialogs.stage.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
