"use client";

import {
  CrmWorkflowTransitionDialog,
  type CrmWorkflowTransitionSubmitPayload,
  type EvaluatedWorkflowTransition,
} from "@modules/crm";
import type { CrmOpportunity } from "../../domain/entities/OpportunityEntity";
import { MoveStageDialog } from "./MoveStageDialog";
import { CloseOpportunityDialog } from "./CloseOpportunityDialog";
import { ReopenOpportunityDialog } from "./ReopenOpportunityDialog";
import { AssignOwnerDialog } from "./AssignOwnerDialog";

export interface OpportunityDetailDialogsProps {
  readonly opp: CrmOpportunity;
  readonly pipeline: any;
  readonly activeDealWorkflow: any;
  readonly isRtl: boolean;
  readonly isSubmitting: boolean;
  readonly submitError: string | null;
  readonly lookupPartyOptions: (q?: string) => Promise<any[]>;
  readonly isMoveStageOpen: boolean;
  readonly setIsMoveStageOpen: (open: boolean) => void;
  readonly targetMoveStageKey?: string;
  readonly handleMoveStage: (payload: any) => Promise<boolean>;
  readonly isCloseOpen: boolean;
  readonly setIsCloseOpen: (open: boolean) => void;
  readonly closeInitialOutcome?: "Won" | "Lost";
  readonly handleCloseOpportunity: (payload: any) => Promise<boolean>;
  readonly isReopenOpen: boolean;
  readonly setIsReopenOpen: (open: boolean) => void;
  readonly handleReopenOpportunity: (payload: any) => Promise<boolean>;
  readonly isAssignOwnerOpen: boolean;
  readonly setIsAssignOwnerOpen: (open: boolean) => void;
  readonly handleAssignOwner: (payload: any) => Promise<boolean>;
  readonly transitionDialogOpen: boolean;
  readonly setTransitionDialogOpen: (open: boolean) => void;
  readonly transitionFromKey: string;
  readonly transitionToKey: string;
  readonly transitionEvalResult: EvaluatedWorkflowTransition | null;
  readonly handleTransitionSubmit: (payload: CrmWorkflowTransitionSubmitPayload) => Promise<boolean>;
}

export function OpportunityDetailDialogs({
  opp,
  pipeline,
  activeDealWorkflow,
  isRtl,
  isSubmitting,
  submitError,
  lookupPartyOptions,
  isMoveStageOpen,
  setIsMoveStageOpen,
  targetMoveStageKey,
  handleMoveStage,
  isCloseOpen,
  setIsCloseOpen,
  closeInitialOutcome,
  handleCloseOpportunity,
  isReopenOpen,
  setIsReopenOpen,
  handleReopenOpportunity,
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
  const fromStage = activeDealWorkflow?.stages.find((s: any) => s.stageKey === transitionFromKey);
  const toStage = activeDealWorkflow?.stages.find((s: any) => s.stageKey === transitionToKey);

  return (
    <>
      <MoveStageDialog
        open={isMoveStageOpen}
        onOpenChange={setIsMoveStageOpen}
        opportunity={opp}
        initialTargetStageKey={targetMoveStageKey}
        pipeline={pipeline}
        onSubmit={handleMoveStage}
        onLookupParties={lookupPartyOptions}
        isSubmitting={isSubmitting}
        submitError={submitError}
      />
      <CloseOpportunityDialog
        open={isCloseOpen}
        onOpenChange={setIsCloseOpen}
        opportunity={opp}
        initialOutcome={closeInitialOutcome}
        onSubmit={handleCloseOpportunity}
        isSubmitting={isSubmitting}
        submitError={submitError}
      />
      <ReopenOpportunityDialog
        open={isReopenOpen}
        onOpenChange={setIsReopenOpen}
        opportunity={opp}
        onSubmit={handleReopenOpportunity}
        isSubmitting={isSubmitting}
        submitError={submitError}
      />
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
          estimatedValue: opp.estimatedAmount,
          currency: opp.currencyCode,
          targetCloseDate: opp.targetCloseDate,
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
