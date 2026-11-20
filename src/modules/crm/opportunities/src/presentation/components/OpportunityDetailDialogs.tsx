"use client";

import {
  CrmWorkflowTransitionDialog,
  type CrmWorkflowDefinition,
  type CrmWorkflowTransitionSubmitPayload,
  type EvaluatedWorkflowTransition,
} from "@modules/crm/workflows";
import type { AssignOpportunityOwnerInput, CrmOpportunity } from "../../domain/entities/OpportunityEntity";
import { AssignOwnerDialog } from "./AssignOwnerDialog";

/** Props for `OpportunityDetailDialogs`. */
export interface OpportunityDetailDialogsProps {
  readonly opp: CrmOpportunity;
  readonly activeDealWorkflow: CrmWorkflowDefinition | undefined;
  readonly isRtl: boolean;
  readonly isSubmitting: boolean;
  readonly submitError: string | null;
  readonly isAssignOwnerOpen: boolean;
  readonly setIsAssignOwnerOpen: (open: boolean) => void;
  readonly handleAssignOwner: (payload: AssignOpportunityOwnerInput) => Promise<boolean>;
  readonly transitionDialogOpen: boolean;
  readonly setTransitionDialogOpen: (open: boolean) => void;
  readonly transitionFromKey: string;
  readonly transitionToKey: string;
  readonly transitionEvalResult: EvaluatedWorkflowTransition | null;
  readonly handleTransitionSubmit: (payload: CrmWorkflowTransitionSubmitPayload) => Promise<boolean>;
}

/** Unified Deal 360 dialog host (owner assignment + dynamic workflow transition screen). */
export function OpportunityDetailDialogs({
  opp,
  activeDealWorkflow,
  isRtl,
  isSubmitting,
  submitError,
  isAssignOwnerOpen,
  setIsAssignOwnerOpen,
  handleAssignOwner,
  transitionDialogOpen,
  setTransitionDialogOpen,
  transitionFromKey,
  transitionToKey,
  transitionEvalResult,
  handleTransitionSubmit,
}: OpportunityDetailDialogsProps) {
  const fromStage = activeDealWorkflow?.stages.find((s) => s.stageKey === transitionFromKey);
  const toStage = activeDealWorkflow?.stages.find((s) => s.stageKey === transitionToKey);

  return (
    <>
      <AssignOwnerDialog
        open={isAssignOwnerOpen}
        onOpenChange={setIsAssignOwnerOpen}
        opportunity={opp}
        onSubmit={handleAssignOwner}
        isSubmitting={isSubmitting}
        submitError={submitError}
      />

      <CrmWorkflowTransitionDialog
        open={transitionDialogOpen}
        onOpenChange={setTransitionDialogOpen}
        entityType="deal"
        record={opp ? {
          id: opp.id,
          title: opp.title,
          partyId: opp.partyId || opp.accountId,
          partyDisplayName: opp.partyDisplayName,
          accountId: opp.accountId,
          accountDisplayName: opp.accountDisplayName,
          contactId: opp.contactId,
          contactDisplayName: opp.primaryContactName,
          ownerUserId: opp.ownerUserId,
          ownerDisplayName: opp.ownerDisplayName,
          estimatedAmount: opp.estimatedAmount,
          estimatedValue: opp.estimatedAmount,
          currency: opp.currencyCode,
          currencyCode: opp.currencyCode,
          targetCloseDate: opp.targetCloseDate,
          discountPercent: opp.discountPercent,
          nextStepSummary: opp.nextStepSummary,
          solutionFitConfirmed: opp.solutionFitConfirmed,
          primaryContactRole: opp.primaryContactRole,
          rowVersion: opp.rowVersion,
        } : null}
        fromStageKey={transitionFromKey}
        toStageKey={transitionToKey}
        fromStageLabel={fromStage ? (isRtl && fromStage.labelAr ? fromStage.labelAr : fromStage.labelEn) : undefined}
        toStageLabel={toStage ? (isRtl && toStage.labelAr ? toStage.labelAr : toStage.labelEn) : undefined}
        evalResult={transitionEvalResult}
        onSubmit={handleTransitionSubmit}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
