"use client";

import React from "react";
import {
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Loader2,
  Wrench,
} from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Card, CardContent } from "@core/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@core/ui/collapsible";
import { cn } from "@core/common/utils";
import { useCopilotI18n } from "../localization/useCopilotI18n";
import type { ThinkingPhase, ToolCallTraceItem } from "../types";

interface AiThinkingTraceCardProps {
  thinkingPhase: ThinkingPhase;
  toolTrace: ToolCallTraceItem[];
  elapsedMs: number;
  isExpanded: boolean;
  onExpandedChange: (open: boolean) => void;
}

export function AiThinkingTraceCard({
  thinkingPhase,
  toolTrace,
  elapsedMs,
  isExpanded,
  onExpandedChange,
}: AiThinkingTraceCardProps) {
  const { tc } = useCopilotI18n();

  if (toolTrace.length === 0) {
    return null;
  }

  const isDone = thinkingPhase === "done";
  const completedCount = toolTrace.filter((t) => t.status === "done").length;
  const elapsedSeconds = (elapsedMs / 1000).toFixed(1);

  const statusText =
    thinkingPhase === "thinking"
      ? tc("thinking.statusThinking")
      : thinkingPhase === "collecting"
        ? tc("thinking.statusCollecting")
        : thinkingPhase === "analyzing"
          ? tc("thinking.statusAnalyzing")
          : tc("thinking.statusDone", { count: toolTrace.length });

  return (
    <Card
      data-testid="ai-thinking-trace"
      className="border-nx-line bg-nx-raised/70"
    >
      <Collapsible open={isExpanded} onOpenChange={onExpandedChange}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            data-testid="ai-thinking-toggle"
            aria-label={
              isExpanded ? tc("thinking.hideDetails") : tc("thinking.showDetails")
            }
            className="flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2.5 text-start transition-colors duration-nx-micro hover:bg-nx-surface/60"
          >
            <div className="flex min-w-0 items-center gap-2">
              {isDone ? (
                <CheckCircle2
                  className="h-3.5 w-3.5 shrink-0 text-success"
                  aria-hidden="true"
                />
              ) : (
                <Loader2
                  className="h-3.5 w-3.5 shrink-0 animate-spin text-nx-accent motion-reduce:animate-none"
                  aria-hidden="true"
                />
              )}
              <Brain
                className="h-3.5 w-3.5 shrink-0 text-nx-ink-3"
                aria-hidden="true"
              />
              <span className="truncate text-xs font-medium text-nx-ink">
                {statusText}
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <Badge
                variant="secondary"
                data-testid="ai-thinking-elapsed"
                className="gap-1 border-nx-line bg-nx-surface px-1.5 py-0 text-[10px] font-medium tabular-nums text-nx-ink-2"
              >
                <Clock className="h-2.5 w-2.5 text-nx-ink-3" aria-hidden="true" />
                <span>
                  {elapsedSeconds}
                  {tc("thinking.secondsSuffix")}
                </span>
              </Badge>
              <Badge
                variant="outline"
                className="px-1.5 py-0 text-[10px] tabular-nums text-nx-ink-3"
              >
                {completedCount}/{toolTrace.length}
              </Badge>
              {isExpanded ? (
                <ChevronUp className="h-3.5 w-3.5 text-nx-ink-3" aria-hidden="true" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 text-nx-ink-3" aria-hidden="true" />
              )}
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-2 border-t border-nx-line px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-nx-ink-3">
              <Wrench className="h-3 w-3" aria-hidden="true" />
              <span>{tc("thinking.toolsLabel")}</span>
            </div>

            <div className="space-y-1.5">
              {toolTrace.map((tool) => {
                const isRunningTool = tool.status === "running";
                const isDoneTool = tool.status === "done";
                return (
                  <div
                    key={tool.id}
                    data-testid={`tool-call-chip-${tool.id}`}
                    className={cn(
                      "flex flex-wrap items-center justify-between gap-2 rounded-nx-md border px-2.5 py-1.5 text-xs transition-colors duration-nx-micro",
                      isRunningTool
                        ? "border-nx-accent/40 bg-nx-accent-wash/50"
                        : isDoneTool
                          ? "border-nx-line bg-nx-surface"
                          : "border-nx-line/60 bg-nx-ground/60 opacity-70"
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      {isDoneTool ? (
                        <CheckCircle2
                          className="h-3.5 w-3.5 shrink-0 text-success"
                          aria-hidden="true"
                        />
                      ) : isRunningTool ? (
                        <Loader2
                          className="h-3.5 w-3.5 shrink-0 animate-spin text-nx-accent motion-reduce:animate-none"
                          aria-hidden="true"
                        />
                      ) : (
                        <span
                          aria-hidden="true"
                          className="h-3.5 w-3.5 shrink-0 rounded-full border border-nx-line-hi"
                        />
                      )}
                      <div className="min-w-0">
                        <code className="block truncate font-mono text-[11px] font-semibold text-nx-ink">
                          {tool.toolName}
                        </code>
                        <span className="block truncate text-[11px] text-nx-ink-3">
                          {tc(tool.labelKey)}
                        </span>
                      </div>
                    </div>

                    {isDoneTool && (
                      <Badge
                        variant="success"
                        className="shrink-0 px-1.5 py-0 text-[10px] font-medium tabular-nums"
                      >
                        {tc(tool.findingKey)}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
