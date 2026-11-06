"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { Alert, AlertDescription } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
import {
  ArrowLeft,
  RotateCcw,
  CheckCircle,
  XCircle,
  ArrowRight,
  UserCheck,
} from "lucide-react";

import {
  CrmShell,
  ActivityTimeline,
  resolveDefaultStageColor,
  useCrmWorkflowsStore,
} from "@modules/crm";
import { OpportunityOverviewCard } from "../components/OpportunityOverviewCard";
import { OpportunityCommercialAndCommitteeSection } from "../components/OpportunityCommercialAndCommitteeSection";
import { OpportunityAuditTimeline } from "../components/OpportunityAuditTimeline";
import { OpportunityDetailSkeleton } from "../components/OpportunityDetailSkeleton";
import {
  OpportunityStageProgressionCard,
  OpportunityHqFulfillmentHandoffCard,
} from "../components/OpportunityStageProgressionAndHandoff";
import { MoveStageDialog } from "../components/MoveStageDialog";
import { CloseOpportunityDialog } from "../components/CloseOpportunityDialog";
import { ReopenOpportunityDialog } from "../components/ReopenOpportunityDialog";
import { AssignOwnerDialog } from "../components/AssignOwnerDialog";
import { useOpportunityDetailViewModel } from "../viewmodels/useOpportunityDetailViewModel";

export interface OpportunityDetailViewProps {
  opportunityId: string;
}

const DEFAULT_STAGE_STEPS = [
  { key: "default.discovery", label: "Discovery", order: 1, requiresParty: false },
  { key: "default.qualification", label: "Qualification", order: 2, requiresParty: false },
  { key: "default.solution_fit", label: "Solution Fit", order: 3, requiresParty: false },
  { key: "default.proposal", label: "Proposal", order: 4, requiresParty: true },
  { key: "default.negotiation", label: "Negotiation", order: 5, requiresParty: true },
];

export function OpportunityDetailView({ opportunityId }: OpportunityDetailViewProps) {
  const router = useRouter();
  const { t, language } = useI18n();
  const isRtl = language === "ar";
  const activeDealWorkflow = useCrmWorkflowsStore((s) => s.getActiveWorkflow("deal"));

  const {
    loading, error, data, pipeline, contactRoles, lookupPartyOptions,
    isMoveStageOpen, setIsMoveStageOpen, targetMoveStageKey, setTargetMoveStageKey,
    isCloseOpen, setIsCloseOpen, isReopenOpen, setIsReopenOpen,
    isAssignOwnerOpen, setIsAssignOwnerOpen, closeInitialOutcome, setCloseInitialOutcome,
    fulfillmentRequested, timelineVersion, isSubmitting, submitError, setSubmitError,
    handleMoveStage, handleCloseOpportunity, handleReopenOpportunity,
    handleAssignOwner, handleRequestFulfillment, handleAddContactRole, handleRemoveContactRole,
  } = useOpportunityDetailViewModel(opportunityId);

  const [isRequestingFulfillment, setIsRequestingFulfillment] = useState(false);

  if (loading) {
    return (
      <CrmShell activeTab="deals" onTabChange={() => {}}>
        <OpportunityDetailSkeleton />
      </CrmShell>
    );
  }

  if (error || !data) {
    return (
      <CrmShell activeTab="deals" onTabChange={() => {}}>
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => router.push("/crm/opportunities")} className="gap-2">
            <ArrowLeft className="size-4" />{t("crmOpportunities.detail.backToList")}
          </Button>
          <Alert variant="destructive"><AlertDescription>{error || "Opportunity not found"}</AlertDescription></Alert>
        </div>
      </CrmShell>
    );
  }

  const { opportunity: opp, stageHistory } = data;
  const isOpen = opp.status === "Open";

  const sourceStages =
    activeDealWorkflow?.stages && activeDealWorkflow.stages.length >= 2
      ? activeDealWorkflow.stages
      : pipeline?.stages ?? [];

  const baseStages =
    sourceStages.length > 0
      ? [...sourceStages]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((s) => {
            const rawStage = s as { category?: "todo" | "in_progress" | "done" | "lost"; color?: string; customColorHex?: string; properties?: Record<string, string> };
            return {
              key: s.stageKey,
              label: isRtl && s.labelAr ? s.labelAr : s.labelEn,
              order: s.sortOrder,
              color: resolveDefaultStageColor(s.stageKey, rawStage.category, s.sortOrder, rawStage.color),
              customColorHex: rawStage.customColorHex || rawStage.properties?.customColorHex,
              requiresParty:
                s.stageKey !== "terminal-lost" &&
                rawStage.category !== "lost" &&
                Boolean(s.requiresVerifiedParty || s.requiredExitFields?.includes("partyId")),
            };
          })
      : DEFAULT_STAGE_STEPS.map((st) => ({
          ...st,
          color: resolveDefaultStageColor(st.key, "in_progress", st.order),
          customColorHex: undefined as string | undefined,
        }));

  const stages =
    activeDealWorkflow?.properties?.customTerminalStages === "true"
      ? baseStages
      : [
          ...baseStages,
          ...(baseStages.some((s) => s.key === "terminal-won" || s.key.includes("won"))
            ? []
            : [{ key: "terminal-won", label: isRtl ? "مغلق ناجح" : "Closed Won", order: baseStages.length + 1, color: resolveDefaultStageColor("terminal-won", "done", baseStages.length + 1), customColorHex: undefined, requiresParty: true }]),
          ...(baseStages.some((s) => s.key === "terminal-lost" || s.key.includes("lost"))
            ? []
            : [{ key: "terminal-lost", label: isRtl ? "مغلق خاسر" : "Closed Lost", order: baseStages.length + 2, color: resolveDefaultStageColor("terminal-lost", "lost", baseStages.length + 2), customColorHex: undefined, requiresParty: false }]),
        ];

  const currentStageObj = stages.find((s) => s.key === opp.stageKey);
  const currentSortOrder = currentStageObj?.order ?? 1;

  const handleRequestFulfillmentHandoff = async () => {
    setIsRequestingFulfillment(true);
    await handleRequestFulfillment();
    setIsRequestingFulfillment(false);
  };

  return (
    <CrmShell activeTab="deals" onTabChange={() => {}}>
      <div className="space-y-6" dir={isRtl ? "rtl" : "ltr"} data-testid="opportunity-detail-view">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button type="button" variant="ghost" onClick={() => router.push("/crm/opportunities")} className="gap-2 text-xs">
            <ArrowLeft className="size-4" />{t("crmOpportunities.detail.backToList")}
          </Button>

          <div className="flex flex-wrap items-center gap-2">
            {isOpen ? (
              <>
                <Button type="button" variant="outline" size="sm" data-testid="deal-detail-move-stage-btn" className="gap-1.5 text-xs" onClick={() => { setTargetMoveStageKey(undefined); setSubmitError(null); setIsMoveStageOpen(true); }}>
                  <ArrowRight className="size-3.5" />{t("crmOpportunities.actions.moveStage")}
                </Button>
                <Button type="button" size="sm" variant="ghost" data-testid="deal-detail-close-won-btn" className="gap-1.5 text-xs text-success hover:bg-success/10" onClick={() => { setCloseInitialOutcome("Won"); setSubmitError(null); setIsCloseOpen(true); }}>
                  <CheckCircle className="size-3.5" />{t("crmOpportunities.actions.closeWon")}
                </Button>
                <Button type="button" size="sm" variant="ghost" data-testid="deal-detail-close-lost-btn" className="gap-1.5 text-xs text-destructive hover:bg-destructive/10" onClick={() => { setCloseInitialOutcome("Lost"); setSubmitError(null); setIsCloseOpen(true); }}>
                  <XCircle className="size-3.5" />{t("crmOpportunities.actions.closeLost")}
                </Button>
                <Button type="button" variant="ghost" size="sm" data-testid="deal-detail-assign-owner-btn" className="gap-1.5 text-xs text-nx-ink-3 hover:text-nx-ink" onClick={() => { setSubmitError(null); setIsAssignOwnerOpen(true); }}>
                  <UserCheck className="size-3.5" />{t("crmOpportunities.actions.assignOwner")}
                </Button>
              </>
            ) : (
              <Button type="button" variant="outline" size="sm" data-testid="deal-detail-reopen-btn" className="gap-1.5 text-xs text-nx-accent border-nx-line hover:border-nx-accent" onClick={() => { setSubmitError(null); setIsReopenOpen(true); }}>
                <RotateCcw className="size-3.5" />{t("crmOpportunities.actions.reopen")}
              </Button>
            )}
          </div>
        </div>

        <OpportunityStageProgressionCard
          t={t}
          opp={opp}
          isOpen={isOpen}
          stages={stages}
          currentSortOrder={currentSortOrder}
          onSelectStageStep={(stageKey) => {
            setTargetMoveStageKey(stageKey !== opp.stageKey ? stageKey : undefined);
            setSubmitError(null);
            setIsMoveStageOpen(true);
          }}
        />

        <OpportunityOverviewCard opp={opp} />

        <OpportunityCommercialAndCommitteeSection opp={opp} isRtl={isRtl} contactRoles={contactRoles} onLookupParties={lookupPartyOptions} onAddContactRole={handleAddContactRole} onRemoveContactRole={handleRemoveContactRole} />

        <OpportunityHqFulfillmentHandoffCard t={t} opp={opp} fulfillmentRequested={fulfillmentRequested} isRequestingFulfillment={isRequestingFulfillment} onRequestFulfillmentHandoff={handleRequestFulfillmentHandoff} />

        <Card className="p-5 border-nx-line bg-nx-surface">
          <ActivityTimeline key={`${opp.id}-${opp.rowVersion || ""}-${timelineVersion}`} opportunityId={opp.id} targetLabel={opp.title} />
        </Card>

        <OpportunityAuditTimeline stageHistory={stageHistory} isRtl={isRtl} />

        <MoveStageDialog open={isMoveStageOpen} onOpenChange={setIsMoveStageOpen} opportunity={opp} initialTargetStageKey={targetMoveStageKey} pipeline={pipeline} onSubmit={handleMoveStage} onLookupParties={lookupPartyOptions} isSubmitting={isSubmitting} submitError={submitError} />
        <CloseOpportunityDialog open={isCloseOpen} onOpenChange={setIsCloseOpen} opportunity={opp} initialOutcome={closeInitialOutcome} onSubmit={handleCloseOpportunity} isSubmitting={isSubmitting} submitError={submitError} />
        <ReopenOpportunityDialog open={isReopenOpen} onOpenChange={setIsReopenOpen} opportunity={opp} onSubmit={handleReopenOpportunity} isSubmitting={isSubmitting} submitError={submitError} />
        <AssignOwnerDialog open={isAssignOwnerOpen} onOpenChange={setIsAssignOwnerOpen} opportunity={opp} onSubmit={handleAssignOwner} isSubmitting={isSubmitting} submitError={submitError} />
      </div>
    </CrmShell>
  );
}
