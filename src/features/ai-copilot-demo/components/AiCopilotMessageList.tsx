"use client";

import React, { useEffect, useRef } from "react";
import {
  AlertCircle,
  Play,
  Sparkles,
  User,
  Zap,
} from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card, CardContent } from "@core/ui/card";
import { cn } from "@core/common/utils";
import { useCopilotI18n } from "../localization/useCopilotI18n";
import { QUICK_QUERIES } from "../mock-data/mode-views.data";
import { AcademyCoachPlanCard } from "./AcademyCoachPlanCard";
import { AiCopilotAnalyzeView } from "./AiCopilotAnalyzeView";
import { AiCopilotExecuteView } from "./AiCopilotExecuteView";
import { AiCopilotMonitorView } from "./AiCopilotMonitorView";
import { AiThinkingTraceCard } from "./AiThinkingTraceCard";
import { FinancialReportCard } from "./FinancialReportCard";
import type { FinancialWorkspaceTab } from "../hooks/useAiCopilotDemo";
import type {
  CopilotMessage,
  CopilotMode,
  ExecutionPhase,
  MonitorAlertItem,
  MonitorSeverityFilter,
  ProposedActionItem,
  QuickQueryId,
  ScenarioId,
  SessionReassignmentRow,
  ThinkingPhase,
  ToolCallTraceItem,
} from "../types";

interface AiCopilotMessageListProps {
  activeMode: CopilotMode;
  activeScenarioId: ScenarioId | null;
  messages: CopilotMessage[];
  isRunning: boolean;
  thinkingPhase: ThinkingPhase;
  toolTrace: ToolCallTraceItem[];
  elapsedMs: number;
  isTraceExpanded: boolean;
  onTraceExpandedChange: (open: boolean) => void;
  onPopulatePrompt: (scenarioId: ScenarioId) => void;
  onRunScenario: (scenarioId: ScenarioId) => void;
  onRunQuickQuery: (queryId: QuickQueryId) => void;
  // Scenario 1 props
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
  // Scenario 2 props
  isExpandedWorkspace: boolean;
  isMaxLayout?: boolean;
  onOpenFinancialWorkspace: (tab: FinancialWorkspaceTab) => void;
  onOpenExecutivePreview: () => void;
  // Monitor props
  monitorSeverityFilter: MonitorSeverityFilter;
  onMonitorSeverityFilterChange: (filter: MonitorSeverityFilter) => void;
  acknowledgedAlertIds: string[];
  onToggleAcknowledgeAlert: (alertId: string) => void;
  onInvestigateAlert: (alert: MonitorAlertItem) => void;
}

export function AiCopilotMessageList({
  activeMode,
  activeScenarioId,
  messages,
  isRunning,
  thinkingPhase,
  toolTrace,
  elapsedMs,
  isTraceExpanded,
  onTraceExpandedChange,
  onPopulatePrompt,
  onRunScenario,
  onRunQuickQuery,
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
  isExpandedWorkspace,
  isMaxLayout = false,
  onOpenFinancialWorkspace,
  onOpenExecutivePreview,
  monitorSeverityFilter,
  onMonitorSeverityFilterChange,
  acknowledgedAlertIds,
  onToggleAcknowledgeAlert,
  onInvestigateAlert,
}: AiCopilotMessageListProps) {
  const { tc, direction } = useCopilotI18n();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [activeMode, messages.length, toolTrace.length, executionPhase]);

  const lastUserIndex = messages.reduce(
    (lastIdx, msg, idx) => (msg.role === "user" ? idx : lastIdx),
    -1
  );

  return (
    <div
      dir={direction}
      className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4"
      data-testid="copilot-message-list"
    >
      <div className={cn("w-full", isMaxLayout && "mx-auto max-w-4xl")}>
        {activeMode === "monitor" ? (
          <AiCopilotMonitorView
            severityFilter={monitorSeverityFilter}
            onSeverityFilterChange={onMonitorSeverityFilterChange}
            acknowledgedAlertIds={acknowledgedAlertIds}
            onToggleAcknowledge={onToggleAcknowledgeAlert}
            onInvestigateAlert={onInvestigateAlert}
            isMaxLayout={isMaxLayout}
          />
        ) : activeMode === "execute" ? (
          <AiCopilotExecuteView
            activeScenarioId={activeScenarioId}
            messages={messages}
            isRunning={isRunning}
            thinkingPhase={thinkingPhase}
            toolTrace={toolTrace}
            elapsedMs={elapsedMs}
            isTraceExpanded={isTraceExpanded}
            onTraceExpandedChange={onTraceExpandedChange}
            onRunScenario={onRunScenario}
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
            onApproveAcademyActions={onApproveAcademyActions}
            isPlanReviewOpen={isPlanReviewOpen}
            onSetPlanReviewOpen={onSetPlanReviewOpen}
            isMaxLayout={isMaxLayout}
          />
        ) : activeMode === "analyze" ? (
          <AiCopilotAnalyzeView
            activeScenarioId={activeScenarioId}
            messages={messages}
            isRunning={isRunning}
            thinkingPhase={thinkingPhase}
            toolTrace={toolTrace}
            elapsedMs={elapsedMs}
            isTraceExpanded={isTraceExpanded}
            onTraceExpandedChange={onTraceExpandedChange}
            onRunScenario={onRunScenario}
            isExpandedWorkspace={isExpandedWorkspace}
            onOpenFinancialWorkspace={onOpenFinancialWorkspace}
            onOpenExecutivePreview={onOpenExecutivePreview}
          />
        ) : messages.length === 0 ? (
          <div className="space-y-4" data-testid="copilot-welcome-state">
            {/* Welcome Intro */}
            <div className="rounded-nx-lg border border-nx-line bg-nx-raised p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-nx-md bg-nx-accent-fill text-nx-on-fill">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                </div>
                <div className="min-w-0 space-y-1">
                  <h3 className="text-sm font-semibold text-nx-ink">
                    {tc("welcome.heading")}
                  </h3>
                  <p className="text-xs leading-relaxed text-nx-ink-2">
                    {tc("welcome.subheading")}
                  </p>
                </div>
              </div>
            </div>

            {/* Cross-Module Quick Demo Q&A Cards */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-nx-ink-3">
                <Zap className="h-3 w-3 text-nx-accent" aria-hidden="true" />
                <span>{tc("quickQueries.sectionTitle")}</span>
              </div>
              <div
                className={cn(
                  "grid gap-2",
                  isMaxLayout ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2"
                )}
              >
                {QUICK_QUERIES.map((q) => (
                  <button
                    key={q.id}
                    type="button"
                    disabled={isRunning}
                    onClick={() => onRunQuickQuery(q.id)}
                    data-testid={`quick-query-${q.id}`}
                    className="flex cursor-pointer flex-col items-start justify-between rounded-nx-md border border-nx-line bg-nx-surface p-2.5 text-start transition-colors duration-nx-micro hover:border-nx-accent hover:bg-nx-raised focus-visible:outline-none focus-visible:shadow-nx-focus"
                  >
                    <span className="text-[11px] font-medium text-nx-ink-2">
                      {tc(q.titleKey)}
                    </span>
                    <span className="mt-1 text-xs font-bold tabular-nums text-nx-ink">
                      {tc(q.metricKey)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Suggested Clickable Prompts */}
            <div className="space-y-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-nx-ink-3">
                {tc("welcome.suggestedTitle")}
              </p>

              <div
                className={cn(
                  "grid gap-3",
                  isMaxLayout ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
                )}
              >
                {/* Scenario 1 Prompt Card */}
                <Card className="border-nx-line bg-nx-surface hover:border-nx-line-hi">
                  <CardContent className="flex h-full flex-col justify-between space-y-2.5 p-3.5">
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-nx-ink">
                          {tc("welcome.scenario1Title")}
                        </span>
                        <Badge variant="success" className="text-[10px]">
                          {tc("welcome.scenario1Tag")}
                        </Badge>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          onPopulatePrompt("academy-coach-replacement")
                        }
                        data-testid="suggested-prompt-academy"
                        className="w-full cursor-pointer rounded-nx-md border border-nx-line bg-nx-ground p-2.5 text-start text-xs leading-relaxed text-nx-ink-2 transition-colors duration-nx-micro hover:border-nx-accent hover:text-nx-ink focus-visible:outline-none focus-visible:shadow-nx-focus"
                      >
                        “{tc("welcome.scenario1Prompt")}”
                      </button>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          onPopulatePrompt("academy-coach-replacement")
                        }
                        className="h-7 cursor-pointer px-2 text-[11px]"
                      >
                        {tc("welcome.usePrompt")}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          onRunScenario("academy-coach-replacement")
                        }
                        data-testid="run-scenario-academy-btn"
                        className="h-7 cursor-pointer gap-1 px-2.5 text-[11px] font-semibold"
                      >
                        <Play className="h-3 w-3" aria-hidden="true" />
                        <span>{tc("welcome.runNow")}</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Scenario 2 Prompt Card */}
                <Card className="border-nx-line bg-nx-surface hover:border-nx-line-hi">
                  <CardContent className="flex h-full flex-col justify-between space-y-2.5 p-3.5">
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-nx-ink">
                          {tc("welcome.scenario2Title")}
                        </span>
                        <Badge variant="info" className="text-[10px]">
                          {tc("welcome.scenario2Tag")}
                        </Badge>
                      </div>
                      <button
                        type="button"
                        onClick={() => onPopulatePrompt("financial-q3-report")}
                        data-testid="suggested-prompt-financial"
                        className="w-full cursor-pointer rounded-nx-md border border-nx-line bg-nx-ground p-2.5 text-start text-xs leading-relaxed text-nx-ink-2 transition-colors duration-nx-micro hover:border-nx-accent hover:text-nx-ink focus-visible:outline-none focus-visible:shadow-nx-focus"
                      >
                        “{tc("welcome.scenario2Prompt")}”
                      </button>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onPopulatePrompt("financial-q3-report")}
                        className="h-7 cursor-pointer px-2 text-[11px]"
                      >
                        {tc("welcome.usePrompt")}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => onRunScenario("financial-q3-report")}
                        data-testid="run-scenario-financial-btn"
                        className="h-7 cursor-pointer gap-1 px-2.5 text-[11px] font-semibold"
                      >
                        <Play className="h-3 w-3" aria-hidden="true" />
                        <span>{tc("welcome.runNow")}</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        ) : (
          <div data-testid="copilot-ask-stream" className="space-y-4">
            {messages.map((msg, idx) => {
              const isUser = msg.role === "user";
              const showTraceAfterThis =
                idx === lastUserIndex && toolTrace.length > 0;
              const showCard = Boolean(msg.cardType) && !msg.isStreaming;

              return (
                <div key={msg.id} className="space-y-3">
                  {/* Conversation Bubble */}
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

                  {/* Collapsible AI Thinking & Tool Trace */}
                  {showTraceAfterThis && (
                    <AiThinkingTraceCard
                      thinkingPhase={thinkingPhase}
                      toolTrace={toolTrace}
                      elapsedMs={elapsedMs}
                      isExpanded={isTraceExpanded}
                      onExpandedChange={onTraceExpandedChange}
                    />
                  )}

                  {/* Rich Result Card: Scenario 1 */}
                  {showCard && msg.cardType === "academy-plan" && (
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

                  {/* Rich Result Card: Scenario 2 */}
                  {showCard && msg.cardType === "financial-summary" && (
                    <FinancialReportCard
                      isWorkspaceExpanded={isExpandedWorkspace}
                      onOpenWorkspace={onOpenFinancialWorkspace}
                      onOpenExecutivePreview={onOpenExecutivePreview}
                    />
                  )}

                  {/* Graceful Unsupported Prompt Card */}
                  {showCard && msg.cardType === "unsupported" && (
                    <Card
                      data-testid="copilot-unsupported-card"
                      className="border-nx-line bg-nx-raised"
                    >
                      <CardContent className="space-y-2.5 p-3">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-nx-ink-2">
                          <AlertCircle
                            className="h-3.5 w-3.5 text-info"
                            aria-hidden="true"
                          />
                          <span>{tc("welcome.suggestedTitle")}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() =>
                              onRunScenario("academy-coach-replacement")
                            }
                            className="h-8 cursor-pointer text-xs"
                          >
                            {tc("conversation.runScenario1")}
                          </Button>
                          <Button
                            type="button"
                            variant="default"
                            size="sm"
                            onClick={() => onRunScenario("financial-q3-report")}
                            className="h-8 cursor-pointer text-xs font-semibold"
                          >
                            {tc("conversation.runScenario2")}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              );
            })}

            {/* Always-available Quick Club Pulse chips below stream */}
            {!isRunning && (
              <div className="border-t border-nx-line pt-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-nx-ink-3">
                  {tc("quickQueries.sectionTitle")}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_QUERIES.map((q) => (
                    <Button
                      key={q.id}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onRunQuickQuery(q.id)}
                      className="h-7 cursor-pointer gap-1.5 px-2.5 text-[11px]"
                    >
                      <span>{tc(q.titleKey)}</span>
                      <Badge variant="secondary" className="px-1 py-0 text-[10px]">
                        {tc(q.metricKey)}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
