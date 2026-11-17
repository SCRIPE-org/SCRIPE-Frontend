"use client";

import React from "react";
import { BarChart3, Play, Sparkles, User } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card, CardContent } from "@core/ui/card";
import { cn } from "@core/common/utils";
import { useCopilotI18n } from "../localization/useCopilotI18n";
import type { FinancialWorkspaceTab } from "../hooks/useAiCopilotDemo";
import { AiThinkingTraceCard } from "./AiThinkingTraceCard";
import { FinancialReportCard } from "./FinancialReportCard";
import type {
  CopilotMessage,
  ScenarioId,
  ThinkingPhase,
  ToolCallTraceItem,
} from "../types";

interface AiCopilotAnalyzeViewProps {
  activeScenarioId: ScenarioId | null;
  messages: CopilotMessage[];
  isRunning: boolean;
  thinkingPhase: ThinkingPhase;
  toolTrace: ToolCallTraceItem[];
  elapsedMs: number;
  isTraceExpanded: boolean;
  onTraceExpandedChange: (open: boolean) => void;
  onRunScenario: (scenarioId: ScenarioId) => void;
  isExpandedWorkspace: boolean;
  onOpenFinancialWorkspace: (tab: FinancialWorkspaceTab) => void;
  onOpenExecutivePreview: () => void;
}

export function AiCopilotAnalyzeView({
  activeScenarioId,
  messages,
  isRunning,
  thinkingPhase,
  toolTrace,
  elapsedMs,
  isTraceExpanded,
  onTraceExpandedChange,
  onRunScenario,
  isExpandedWorkspace,
  onOpenFinancialWorkspace,
  onOpenExecutivePreview,
}: AiCopilotAnalyzeViewProps) {
  const { tc } = useCopilotI18n();

  const financialMessages = messages.filter(
    (m) => m.scenarioId === "financial-q3-report"
  );
  const showActiveScenario2 =
    activeScenarioId === "financial-q3-report" && financialMessages.length > 0;

  if (showActiveScenario2) {
    return (
      <div data-testid="copilot-analyze-view" className="space-y-4">
        {financialMessages.map((msg, idx) => {
          const isUser = msg.role === "user";
          const showTraceHere = !isUser && idx === 1 && toolTrace.length > 0;
          const showCard =
            msg.cardType === "financial-summary" && !msg.isStreaming;

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
                <FinancialReportCard
                  isWorkspaceExpanded={isExpandedWorkspace}
                  onOpenWorkspace={onOpenFinancialWorkspace}
                  onOpenExecutivePreview={onOpenExecutivePreview}
                />
              )}
            </div>
          );
        })}

        {isRunning && financialMessages.length === 1 && toolTrace.length > 0 && (
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
    <div data-testid="copilot-analyze-view" className="space-y-4">
      {/* Analyze Banner with One-Click AI Trace Trigger */}
      <Card className="border-nx-line bg-nx-raised">
        <CardContent className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-nx-md bg-nx-accent-fill text-nx-on-fill">
                <BarChart3 className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-nx-ink">
                  {tc("analyzeView.bannerTitle")}
                </h3>
                <p className="mt-0.5 text-xs leading-relaxed text-nx-ink-2">
                  {tc("analyzeView.bannerDesc")}
                </p>
              </div>
            </div>
            <Badge variant="accent" className="shrink-0 text-[10px]">
              {tc("modes.analyze.label")}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="default"
              size="sm"
              disabled={isRunning}
              onClick={() => onRunScenario("financial-q3-report")}
              data-testid="analyze-run-full-btn"
              className="h-8 cursor-pointer gap-1.5 text-xs font-semibold"
            >
              <Play className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{tc("analyzeView.runAnalysisBtn")}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Immediate Live Demo Snapshot */}
      <FinancialReportCard
        isWorkspaceExpanded={isExpandedWorkspace}
        onOpenWorkspace={onOpenFinancialWorkspace}
        onOpenExecutivePreview={onOpenExecutivePreview}
      />
    </div>
  );
}
