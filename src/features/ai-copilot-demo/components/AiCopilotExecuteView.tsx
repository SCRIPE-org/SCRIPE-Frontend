"use client";

import React from "react";
import { Play, PlayCircle, Sparkles, User } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { cn } from "@core/common/utils";
import { useCopilotI18n } from "../localization/useCopilotI18n";
import { QUEUED_WORKFLOWS } from "../mock-data/mode-views.data";
import { AcademyCoachPlanCard } from "./AcademyCoachPlanCard";
import { AiThinkingTraceCard } from "./AiThinkingTraceCard";
import type {
  CopilotMessage,
  ExecutionPhase,
  ProposedActionItem,
  ScenarioId,
  SessionReassignmentRow,
  ThinkingPhase,
  ToolCallTraceItem,
} from "../types";

interface AiCopilotExecuteViewProps {
  activeScenarioId: ScenarioId | null;
  messages: CopilotMessage[];
  isRunning: boolean;
  thinkingPhase: ThinkingPhase;
  toolTrace: ToolCallTraceItem[];
  elapsedMs: number;
  isTraceExpanded: boolean;
  onTraceExpandedChange: (open: boolean) => void;
  onRunScenario: (scenarioId: ScenarioId) => void;
  // Scenario 1 interactive props
  sessions: SessionReassignmentRow[];
  expandedSessionId: string | null;
  onToggleExpandSession: (id: string | null) => void;
  isEditingPlan: boolean;
  onToggleEditPlan: () => void;
  onUpdateReplacement: (sessionId: string, replacementId: string) => void;
  proposedActions: ProposedActionItem[];
  onToggleAction: (actionId: ProposedActionItem["id"]) => void;
  executionPhase: ExecutionPhase;
  executionStepIndex: number;
  onApproveAcademyActions: () => void;
  isPlanReviewOpen: boolean;
  onSetPlanReviewOpen: (open: boolean) => void;
  isMaxLayout?: boolean;
}

export function AiCopilotExecuteView({
  activeScenarioId,
  messages,
  isRunning,
  thinkingPhase,
  toolTrace,
  elapsedMs,
  isTraceExpanded,
  onTraceExpandedChange,
  onRunScenario,
  sessions,
  expandedSessionId,
  onToggleExpandSession,
  isEditingPlan,
  onToggleEditPlan,
  onUpdateReplacement,
  proposedActions,
  onToggleAction,
  executionPhase,
  executionStepIndex,
  onApproveAcademyActions,
  isPlanReviewOpen,
  onSetPlanReviewOpen,
  isMaxLayout = false,
}: AiCopilotExecuteViewProps) {
  const { tc } = useCopilotI18n();

  const academyMessages = messages.filter(
    (m) => m.scenarioId === "academy-coach-replacement"
  );
  const showActiveScenario1 =
    activeScenarioId === "academy-coach-replacement" && academyMessages.length > 0;

  if (showActiveScenario1) {
    return (
      <div data-testid="copilot-execute-view" className="space-y-4">
        {academyMessages.map((msg, idx) => {
          const isUser = msg.role === "user";
          const showTraceHere = !isUser && idx === 1 && toolTrace.length > 0;
          const showCard = msg.cardType === "academy-plan" && !msg.isStreaming;

          return (
            <div key={msg.id} className="space-y-3">
              <div
                className={cn(
                  "flex items-start gap-2.5",
                  isUser && "flex-row-reverse"
                )}
              >
                <div
                  aria-hidden="true"
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-nx-md border",
                    isUser
                      ? "border-nx-line-hi bg-nx-raised text-nx-ink"
                      : "border-nx-accent-fill bg-nx-accent-fill text-nx-on-fill"
                  )}
                >
                  {isUser ? (
                    <User className="h-3.5 w-3.5" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                </div>

                <div
                  className={cn(
                    "min-w-0 max-w-[88%] rounded-nx-lg border px-3.5 py-2.5 text-xs leading-relaxed",
                    isUser
                      ? "border-nx-line-hi bg-nx-raised text-nx-ink"
                      : "border-nx-line bg-nx-surface text-nx-ink"
                  )}
                >
                  <div className="mb-1 flex items-center justify-between gap-3 text-[10px] text-nx-ink-3">
                    <span className="font-semibold text-nx-ink-2">
                      {isUser
                        ? tc("conversation.youLabel")
                        : tc("conversation.copilotLabel")}
                    </span>
                    <span className="tabular-nums">{msg.timestamp}</span>
                  </div>
                  <p>
                    {msg.text}
                    {msg.isStreaming && (
                      <span
                        aria-hidden="true"
                        className="ms-1 inline-block h-3 w-1.5 animate-pulse bg-nx-accent align-middle"
                      />
                    )}
                  </p>
                </div>
              </div>

              {showTraceHere && (
                <AiThinkingTraceCard
                  thinkingPhase={thinkingPhase}
                  toolTrace={toolTrace}
                  elapsedMs={elapsedMs}
                  isExpanded={isTraceExpanded}
                  onExpandedChange={onTraceExpandedChange}
                />
              )}

              {showCard && (
                <AcademyCoachPlanCard
                  sessions={sessions}
                  expandedSessionId={expandedSessionId}
                  onToggleExpandSession={onToggleExpandSession}
                  isEditingPlan={isEditingPlan}
                  onToggleEditPlan={onToggleEditPlan}
                  onUpdateReplacement={onUpdateReplacement}
                  proposedActions={proposedActions}
                  onToggleAction={onToggleAction}
                  executionPhase={executionPhase}
                  executionStepIndex={executionStepIndex}
                  onApprove={onApproveAcademyActions}
                  isPlanReviewOpen={isPlanReviewOpen}
                  onSetPlanReviewOpen={onSetPlanReviewOpen}
                />
              )}
            </div>
          );
        })}

        {isRunning && academyMessages.length === 1 && toolTrace.length > 0 && (
          <AiThinkingTraceCard
            thinkingPhase={thinkingPhase}
            toolTrace={toolTrace}
            elapsedMs={elapsedMs}
            isExpanded={isTraceExpanded}
            onExpandedChange={onTraceExpandedChange}
          />
        )}
      </div>
    );
  }

  return (
    <div data-testid="copilot-execute-view" className="space-y-4">
      {/* Execute Hero Card */}
      <Card className="border-nx-line bg-nx-raised">
        <CardContent className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-nx-md bg-nx-accent-fill text-nx-on-fill">
                <PlayCircle className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-nx-ink">
                  {tc("modes.execute.previewTitle")}
                </h3>
                <p className="mt-0.5 text-xs leading-relaxed text-nx-ink-2">
                  {tc("modes.execute.previewBody")}
                </p>
              </div>
            </div>
            <Badge variant="accent" className="shrink-0 text-[10px]">
              {tc("modes.execute.label")}
            </Badge>
          </div>

          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => onRunScenario("academy-coach-replacement")}
            data-testid="execute-launch-academy-btn"
            className="h-8 cursor-pointer gap-1.5 text-xs font-semibold"
          >
            <Play className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{tc("modes.execute.previewCta")}</span>
          </Button>
        </CardContent>
      </Card>

      {/* Queued Operational Workflows */}
      <Card
        data-testid="execute-queued-workflows"
        className="border-nx-line bg-nx-surface"
      >
        <CardHeader className="flex flex-row items-center justify-between gap-2 border-b border-nx-line px-3.5 py-2.5">
          <CardTitle className="text-xs font-semibold text-nx-ink">
            {tc("executeView.queuedTitle")}
          </CardTitle>
          <Badge variant="secondary" className="text-[10px]">
            {tc("executeView.queuedBadge")}
          </Badge>
        </CardHeader>

        <CardContent
          className={cn(
            "grid gap-2.5 p-3.5",
            isMaxLayout ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
          )}
        >
          {QUEUED_WORKFLOWS.map((wf) => (
            <div
              key={wf.id}
              className="flex flex-col justify-between gap-2.5 rounded-nx-md border border-nx-line bg-nx-raised/70 p-3"
            >
              <div className="space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold text-nx-ink">
                    {tc(wf.titleKey)}
                  </p>
                  <Badge variant={wf.badgeTone} className="shrink-0 text-[10px]">
                    {tc(wf.badgeKey)}
                  </Badge>
                </div>
                <p className="text-[11px] leading-relaxed text-nx-ink-2">
                  {tc(wf.descKey)}
                </p>
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onRunScenario(wf.scenarioId ?? "academy-coach-replacement")
                  }
                  className="h-7 cursor-pointer gap-1 px-2.5 text-[11px]"
                >
                  <Play className="h-3 w-3" aria-hidden="true" />
                  <span>
                    {wf.scenarioId
                      ? tc("executeView.runWorkflowBtn")
                      : tc("executeView.stageNowBtn")}
                  </span>
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
