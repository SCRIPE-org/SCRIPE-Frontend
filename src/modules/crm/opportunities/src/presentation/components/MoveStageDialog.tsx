"use client";

import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Alert, AlertDescription } from "@core/ui/alert";
import { AlertCircle } from "lucide-react";
import { encodeCustomFieldName, useCustomFieldsFormFields } from "@core/crud/customFieldsExtension";
import { useCrmSettingsStore, useCrmWorkflowsStore } from "@modules/crm";
import type { CrmOpportunity, MoveOpportunityStageInput, PipelineDefinition } from "../../domain/entities/OpportunityEntity";
import {
  buildMoveStageCustomFieldConfigs,
  computeMoveStageGateFlags,
  resolveMoveStageOptions,
  validateMoveStageSubmission,
} from "../utils/moveStageValidationHelpers";
import { MoveStageGateFieldsSection, type MoveStagePartyOption } from "./MoveStageGateFieldsSection";
import { MoveStageApprovalGateCard } from "./MoveStageApprovalGateCard";

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

export function MoveStageDialog({
  open, onOpenChange, opportunity, initialTargetStageKey, pipeline, onSubmit, onLookupParties: _onLookupParties, isSubmitting = false, submitError,
}: MoveStageDialogProps) {
  const { t, language } = useI18n();
  const isRtl = language === "ar";
  const [targetStageKey, setTargetStageKey] = useState("");
  const [reason, setReason] = useState("");
  const [selectedPartyId, setSelectedPartyId] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [selectedContactId, setSelectedContactId] = useState("");
  const [selectedOwnerUserId, setSelectedOwnerUserId] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [nextStepSummary, setNextStepSummary] = useState("");
  const [estimatedAmount, setEstimatedAmount] = useState("");
  const [targetCloseDate, setTargetCloseDate] = useState("");
  const [primaryContactRole, setPrimaryContactRole] = useState("");
  const [solutionFitConfirmed, setSolutionFitConfirmed] = useState(false);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, unknown>>({});
  const [validationError, setValidationError] = useState<string | null>(null);

  const activeOppId = open && opportunity ? opportunity.id : undefined;
  const { fieldConfigs: rawOppCf, isLoading: isOppCfLoading, refetch: refetchOppCf } = useCustomFieldsFormFields(
    activeOppId ? "crm.opportunity" : undefined,
    activeOppId,
  );
  const storeCustomFields = useCrmSettingsStore((s) => s.crmCustomFields);
  const addCrmCustomField = useCrmSettingsStore((s) => s.addCrmCustomField);
  const oppCustomFieldConfigs = buildMoveStageCustomFieldConfigs(rawOppCf, storeCustomFields, isRtl);

  const activeDealWorkflow = useCrmWorkflowsStore((s) => s.getActiveWorkflow("deal"));
  const evaluateTransition = useCrmWorkflowsStore((s) => s.evaluateTransition);
  const sourceStages =
    pipeline?.stages?.length && activeDealWorkflow.id === "wf-deal-default"
      ? pipeline.stages
      : activeDealWorkflow?.stages?.length >= 2
        ? activeDealWorkflow.stages
        : pipeline?.stages ?? [];

  const effectiveStages = resolveMoveStageOptions(sourceStages as any);

  const initialStageIdx = opportunity ? effectiveStages.findIndex((s) => s.key === opportunity.stageKey) : -1;
  const defaultTargetStageKey =
    initialTargetStageKey ||
    (effectiveStages[initialStageIdx + 1] ?? effectiveStages[initialStageIdx] ?? effectiveStages[0])?.key ||
    "";

  const [prevSyncKey, setPrevSyncKey] = useState("");
  const syncKey = open && opportunity ? `${opportunity.id}:${opportunity.rowVersion ?? ""}:${defaultTargetStageKey}` : "";
  if (syncKey && syncKey !== prevSyncKey && opportunity) {
    setPrevSyncKey(syncKey);
    setTargetStageKey(defaultTargetStageKey);
    setReason("");
    setSelectedPartyId(opportunity.partyId || "");
    setSelectedAccountId(opportunity.accountId || "");
    setSelectedContactId(opportunity.contactId || "");
    setSelectedOwnerUserId(opportunity.ownerUserId || "");
    setDiscountPercent(opportunity.discountPercent != null ? String(opportunity.discountPercent) : "");
    setNextStepSummary(opportunity.nextStepSummary || "");
    setEstimatedAmount(opportunity.estimatedAmount != null ? String(opportunity.estimatedAmount) : "");
    setTargetCloseDate(opportunity.targetCloseDate ? opportunity.targetCloseDate.slice(0, 10) : "");
    setPrimaryContactRole(opportunity.primaryContactRole || "");
    setSolutionFitConfirmed(Boolean(opportunity.solutionFitConfirmed));
    setCustomFieldValues({});
    setValidationError(null);
  } else if (!open && prevSyncKey !== "") {
    setPrevSyncKey("");
  }

  const [prevCfSig, setPrevCfSig] = useState("");
  const cfSig = open ? rawOppCf.map((fc) => `${fc.name}:${String(fc.defaultValue ?? "")}`).join("|") : "";
  if (open && rawOppCf.length > 0 && cfSig !== prevCfSig) {
    setPrevCfSig(cfSig);
    setCustomFieldValues((prev) => {
      const next: Record<string, unknown> = { ...prev };
      for (const fc of rawOppCf) if (next[fc.name] === undefined && fc.defaultValue != null) next[fc.name] = fc.defaultValue;
      return next;
    });
  } else if (!open && prevCfSig !== "") {
    setPrevCfSig("");
  }

  if (!opportunity) return null;

  const fromInWf = activeDealWorkflow.stages.some((s) => s.stageKey === opportunity.stageKey);
  const toInWf = activeDealWorkflow.stages.some((s) => s.stageKey === targetStageKey);
  const evalTransition = fromInWf && toInWf && targetStageKey ? evaluateTransition("deal", opportunity.stageKey, targetStageKey) : null;

  const gate = computeMoveStageGateFlags(opportunity, targetStageKey, effectiveStages, evalTransition, storeCustomFields);
  const effectivePartyId = opportunity.partyId || selectedPartyId;
  const lacksParty = (gate.isTargetProposalOrLater || gate.exitFields.includes("partyId")) && !effectivePartyId;
  const {
    isAdjacentForward, needsPartyInput, requiredCustomFieldKeys, needsAmountInput,
    needsCloseDateInput, needsContactRoleInput, needsSolutionFitInput, needsContactIdInput,
    needsAccountIdInput, needsOwnerUserIdInput, needsDiscountPercentInput, needsNextStepInput,
  } = gate;
  const nonGateCustomFieldConfigs = oppCustomFieldConfigs.filter(
    (fc) => !requiredCustomFieldKeys.some((k) => fc.name === k || fc.name === encodeCustomFieldName(k))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    const err = validateMoveStageSubmission({
      t,
      isRtl,
      currentStageKey: opportunity.stageKey,
      targetStageKey,
      evalAllowed: !evalTransition || evalTransition.allowed,
      evalReason: evalTransition?.reason,
      lacksParty,
      estimatedAmount,
      needsAmountInput,
      needsCloseDateInput,
      targetCloseDate,
      needsContactRoleInput,
      primaryContactRole,
      needsSolutionFitInput,
      solutionFitConfirmed,
      needsContactIdInput,
      selectedContactId,
      needsAccountIdInput,
      selectedAccountId,
      needsOwnerUserIdInput,
      selectedOwnerUserId,
      needsDiscountPercentInput,
      discountPercent,
      needsNextStepInput,
      nextStepSummary,
      requiredCustomFieldKeys,
      storeCustomFields,
      customFieldValues,
      isAdjacentForward,
      reason,
    });
    if (err) {
      setValidationError(err);
      return;
    }

    const trimmedNote = reason.trim() || undefined;
    const success = await onSubmit({
      opportunityId: opportunity.id,
      targetStageKey,
      reason: trimmedNote,
      stageTransitionNote: trimmedNote,
      expectedRowVersion: opportunity.rowVersion,
      partyId: !opportunity.partyId && selectedPartyId ? selectedPartyId : undefined,
      accountId: selectedAccountId && selectedAccountId !== opportunity.accountId ? selectedAccountId : undefined,
      contactId: selectedContactId && selectedContactId !== opportunity.contactId ? selectedContactId : undefined,
      ownerUserId: selectedOwnerUserId && selectedOwnerUserId !== opportunity.ownerUserId ? selectedOwnerUserId : undefined,
      estimatedAmount: estimatedAmount !== "" && Number(estimatedAmount) !== opportunity.estimatedAmount ? Number(estimatedAmount) : undefined,
      discountPercent: discountPercent !== "" ? Number(discountPercent) : undefined,
      nextStepSummary: nextStepSummary.trim() || undefined,
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
          <MoveStageApprovalGateCard t={t} evalTransition={evalTransition} />
          <MoveStageGateFieldsSection
            t={t} isRtl={isRtl} opportunity={opportunity} effectivePartyId={effectivePartyId}
            targetStageKey={targetStageKey} onTargetStageKeyChange={setTargetStageKey}
            effectiveStages={effectiveStages} currencyCode={opportunity.currencyCode}
            needsPartyInput={needsPartyInput} selectedPartyId={selectedPartyId}
            onPartyChange={(val, accId) => {
              setSelectedPartyId(val);
              if (accId !== undefined) setSelectedAccountId(accId || "");
              setValidationError(null);
            }}
            needsContactIdInput={needsContactIdInput} selectedContactId={selectedContactId} onContactChange={setSelectedContactId}
            needsAccountIdInput={needsAccountIdInput} selectedAccountId={selectedAccountId} onAccountChange={setSelectedAccountId}
            needsOwnerUserIdInput={needsOwnerUserIdInput} selectedOwnerUserId={selectedOwnerUserId} onOwnerChange={setSelectedOwnerUserId}
            needsDiscountPercentInput={needsDiscountPercentInput} discountPercent={discountPercent} onDiscountPercentChange={setDiscountPercent}
            needsNextStepInput={needsNextStepInput} nextStepSummary={nextStepSummary} onNextStepSummaryChange={setNextStepSummary}
            needsAmountInput={needsAmountInput} estimatedAmount={estimatedAmount} onEstimatedAmountChange={setEstimatedAmount}
            needsCloseDateInput={needsCloseDateInput} targetCloseDate={targetCloseDate} onTargetCloseDateChange={setTargetCloseDate}
            needsContactRoleInput={needsContactRoleInput} primaryContactRole={primaryContactRole} onPrimaryContactRoleChange={setPrimaryContactRole}
            needsSolutionFitInput={needsSolutionFitInput} solutionFitConfirmed={solutionFitConfirmed} onSolutionFitConfirmedChange={setSolutionFitConfirmed}
            oppCustomFieldConfigs={nonGateCustomFieldConfigs} requiredCustomFieldKeys={requiredCustomFieldKeys} storeCustomFields={storeCustomFields}
            onAddCrmCustomField={(field) => {
              addCrmCustomField(field);
              const wfStage = activeDealWorkflow.stages.find((s) => s.stageKey === opportunity.stageKey);
              if (wfStage) {
                useCrmWorkflowsStore.getState().updateStageInWorkflow(activeDealWorkflow.id, wfStage.stageKey, {
                  requiredExitFields: Array.from(new Set([...(wfStage.requiredExitFields ?? []), `custom:${field.key}`])),
                });
              }
            }}
            isOppCfLoading={isOppCfLoading} onRefetchOppCustomFields={() => void refetchOppCf()}
            customFieldValues={customFieldValues} onCustomFieldChange={(key, val) => setCustomFieldValues((prev) => ({ ...prev, [key]: val }))}
            isAdjacentForward={isAdjacentForward} reason={reason} onReasonChange={setReason} isSubmitting={isSubmitting}
          />
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>{t("crmOpportunities.actions.cancel")}</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t("crmOpportunities.actions.saving") : t("crmOpportunities.dialogs.stage.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
