"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useCopilotI18n } from "../localization/useCopilotI18n";
import {
  INITIAL_ACADEMY_SESSIONS,
  INITIAL_PROPOSED_ACTIONS,
} from "../mock-data/academy-scenario.data";
import {
  INITIAL_MONITOR_ALERTS,
  QUICK_QUERIES,
} from "../mock-data/mode-views.data";
import {
  SCENARIO_REGISTRY,
  matchScenarioFromPrompt,
} from "../scenarios/scenario-registry";
import type {
  CopilotMessage,
  CopilotMode,
  CopilotStageItem,
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

export type FinancialWorkspaceTab = "overview" | "sources" | "attachments";

function splitStreamChunks(text: string, targetSteps = 12): string[] {
  const words = text.match(/\S+\s*/g);
  if (!words || words.length <= 1) {
    return [text];
  }
  const chunkSize = Math.max(1, Math.ceil(words.length / targetSteps));
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize).join(""));
  }
  return chunks;
}

function formatNowTime(language: "en" | "ar"): string {
  try {
    return new Intl.DateTimeFormat(language === "ar" ? "ar-EG" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());
  } catch {
    return "09:30";
  }
}

export function useAiCopilotDemo() {
  const { tc, language } = useCopilotI18n();

  const [isOpen, setIsOpen] = useState(false);
  const [isExpandedWorkspace, setIsExpandedWorkspace] = useState(false);
  const [activeMode, setActiveMode] = useState<CopilotMode>("ask");
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [activeScenarioId, setActiveScenarioId] = useState<ScenarioId | null>(null);
  const [stages, setStages] = useState<CopilotStageItem[]>([]);
  const [thinkingPhase, setThinkingPhase] = useState<ThinkingPhase>("idle");
  const [toolTrace, setToolTrace] = useState<ToolCallTraceItem[]>([]);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isTraceExpanded, setIsTraceExpanded] = useState(true);
  const [isRunning, setIsRunning] = useState(false);

  // Scenario 1 interactive state
  const [sessions, setSessions] = useState<SessionReassignmentRow[]>(INITIAL_ACADEMY_SESSIONS);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>("sess-u16");
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [proposedActions, setProposedActions] =
    useState<ProposedActionItem[]>(INITIAL_PROPOSED_ACTIONS);
  const [executionPhase, setExecutionPhase] = useState<ExecutionPhase>("idle");
  const [executionStepIndex, setExecutionStepIndex] = useState(0);
  const [isPlanReviewOpen, setIsPlanReviewOpen] = useState(false);

  // Scenario 2 interactive state
  const [reportTab, setReportTab] = useState<FinancialWorkspaceTab>("overview");
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [isExecutivePreviewOpen, setIsExecutivePreviewOpen] = useState(false);

  // Monitor mode interactive state
  const [monitorSeverityFilter, setMonitorSeverityFilter] =
    useState<MonitorSeverityFilter>("all");
  const [acknowledgedAlertIds, setAcknowledgedAlertIds] = useState<string[]>(() =>
    INITIAL_MONITOR_ALERTS.filter((a) => a.isResolvedByDefault).map((a) => a.id)
  );

  const timersRef = useRef<number[]>([]);
  const intervalsRef = useRef<number[]>([]);
  const runTokenRef = useRef(0);

  const clearPendingTimers = useCallback(() => {
    for (const timerId of timersRef.current) {
      window.clearTimeout(timerId);
    }
    timersRef.current = [];
    for (const intervalId of intervalsRef.current) {
      window.clearInterval(intervalId);
    }
    intervalsRef.current = [];
  }, []);

  // Cancel any pending timers on unmount
  useEffect(() => {
    return () => {
      clearPendingTimers();
    };
  }, [clearPendingTimers]);

  const scheduleTimer = useCallback((fn: () => void, delayMs: number) => {
    const id = window.setTimeout(fn, delayMs);
    timersRef.current.push(id);
  }, []);

  const streamTextIntoMessage = useCallback(
    (
      messageId: string,
      fullText: string,
      stepIntervalMs: number,
      targetSteps: number,
      token: number,
      onComplete?: () => void
    ) => {
      const chunks = splitStreamChunks(fullText, targetSteps);
      let cursor = 0;

      const tick = () => {
        if (runTokenRef.current !== token) return;
        cursor += 1;
        const partial = chunks.slice(0, cursor).join("").trimEnd();
        const finished = cursor >= chunks.length;

        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? {
                  ...m,
                  text: finished ? fullText : partial,
                  isStreaming: !finished,
                }
              : m
          )
        );

        if (finished) {
          onComplete?.();
        } else {
          scheduleTimer(tick, stepIntervalMs);
        }
      };

      scheduleTimer(tick, stepIntervalMs);
    },
    [scheduleTimer]
  );

  const resetScenarioInteractiveState = useCallback(() => {
    setSessions(INITIAL_ACADEMY_SESSIONS);
    setExpandedSessionId("sess-u16");
    setIsEditingPlan(false);
    setProposedActions(INITIAL_PROPOSED_ACTIONS);
    setExecutionPhase("idle");
    setExecutionStepIndex(0);
    setIsPlanReviewOpen(false);
    setReportTab("overview");
    setSelectedDocumentId(null);
    setIsExecutivePreviewOpen(false);
    setMonitorSeverityFilter("all");
    setAcknowledgedAlertIds(
      INITIAL_MONITOR_ALERTS.filter((a) => a.isResolvedByDefault).map((a) => a.id)
    );
  }, []);

  const resetDemo = useCallback(() => {
    runTokenRef.current += 1;
    clearPendingTimers();
    setIsRunning(false);
    setActiveScenarioId(null);
    setStages([]);
    setThinkingPhase("idle");
    setToolTrace([]);
    setElapsedMs(0);
    setIsTraceExpanded(true);
    setMessages([]);
    setInputValue("");
    setActiveMode("ask");
    resetScenarioInteractiveState();
  }, [clearPendingTimers, resetScenarioInteractiveState]);

  const closeCopilot = useCallback(() => {
    // Requirement 13: Cancel pending timers when closed
    runTokenRef.current += 1;
    clearPendingTimers();
    setIsRunning(false);
    setIsOpen(false);
    setIsExpandedWorkspace(false);
  }, [clearPendingTimers]);

  const openCopilot = useCallback(() => {
    setIsOpen(true);
  }, []);

  const toggleCopilot = useCallback(() => {
    if (isOpen) {
      closeCopilot();
    } else {
      openCopilot();
    }
  }, [isOpen, closeCopilot, openCopilot]);

  const populateSuggestedPrompt = useCallback(
    (scenarioId: ScenarioId) => {
      const def = SCENARIO_REGISTRY[scenarioId];
      setActiveMode(def.defaultMode);
      setInputValue(tc(def.promptKey));
    },
    [tc]
  );

  const startScenario = useCallback(
    (scenarioId: ScenarioId, userText?: string) => {
      runTokenRef.current += 1;
      const currentToken = runTokenRef.current;
      clearPendingTimers();
      resetScenarioInteractiveState();

      const def = SCENARIO_REGISTRY[scenarioId];
      const promptDisplay = (userText ?? tc(def.promptKey)).trim();
      const now = formatNowTime(language);
      const startedAt = Date.now();

      setActiveMode(def.defaultMode);
      setActiveScenarioId(scenarioId);
      setIsRunning(true);
      setInputValue("");
      setIsTraceExpanded(true);
      setElapsedMs(100);
      setThinkingPhase(def.tools[0]?.thinkingPhase ?? "thinking");

      const initialStages: CopilotStageItem[] = def.stages.map((s, idx) => ({
        id: s.id,
        labelKey: s.labelKey,
        status: idx === 0 ? "active" : "pending",
      }));
      setStages(initialStages);

      const initialToolTrace: ToolCallTraceItem[] = def.tools.map((t, idx) => ({
        id: t.id,
        toolName: t.toolName,
        labelKey: t.labelKey,
        findingKey: t.findingKey,
        status: idx === 0 ? "running" : "pending",
      }));
      setToolTrace(initialToolTrace);

      const elapsedIntervalId = window.setInterval(() => {
        if (runTokenRef.current !== currentToken) return;
        setElapsedMs(Math.max(100, Date.now() - startedAt));
      }, 100);
      intervalsRef.current.push(elapsedIntervalId);

      const userMessage: CopilotMessage = {
        id: `msg-user-${currentToken}`,
        role: "user",
        text: promptDisplay,
        timestamp: now,
        scenarioId,
      };

      const ackFullText = tc(def.ackMessageKey);
      const ackId = `msg-ack-${currentToken}`;
      const ackMessage: CopilotMessage = {
        id: ackId,
        role: "assistant",
        text: "",
        isStreaming: true,
        timestamp: now,
        scenarioId,
      };

      setMessages([userMessage]);

      // Small delay then stream assistant acknowledgement
      scheduleTimer(() => {
        if (runTokenRef.current !== currentToken) return;
        setMessages([userMessage, ackMessage]);
        streamTextIntoMessage(ackId, ackFullText, 45, 9, currentToken);
      }, 160);

      // Step through tool calls & reasoning phases deterministically
      let elapsed = 200;
      def.tools.forEach((tool, idx) => {
        elapsed += tool.delayMs;
        const stepFinishAt = elapsed;
        scheduleTimer(() => {
          if (runTokenRef.current !== currentToken) return;

          setToolTrace((prev) =>
            prev.map((item, itemIdx) => {
              if (itemIdx < idx) return item;
              if (itemIdx === idx) {
                return { ...item, status: "done", durationMs: tool.delayMs };
              }
              if (itemIdx === idx + 1) {
                return { ...item, status: "running" };
              }
              return item;
            })
          );

          const nextTool = def.tools[idx + 1];
          if (nextTool) {
            setThinkingPhase(nextTool.thinkingPhase);
          }

          setStages((prev) =>
            prev.map((item, itemIdx) => {
              if (itemIdx <= idx) return { ...item, status: "done" };
              if (itemIdx === idx + 1) return { ...item, status: "active" };
              return item;
            })
          );

          // Final tool completed -> stream executive summary text, then reveal rich card
          if (idx === def.tools.length - 1) {
            const summaryFullText = tc(def.summaryMessageKey);
            const resultId = `msg-result-${currentToken}`;
            const resultMsg: CopilotMessage = {
              id: resultId,
              role: "assistant",
              text: "",
              isStreaming: true,
              timestamp: formatNowTime(language),
              scenarioId,
              cardType: def.cardType,
            };
            setMessages((prev) => [
              ...prev.map((m) =>
                m.id === ackId ? { ...m, text: ackFullText, isStreaming: false } : m
              ),
              resultMsg,
            ]);

            streamTextIntoMessage(resultId, summaryFullText, 48, 13, currentToken, () => {
              if (runTokenRef.current !== currentToken) return;
              window.clearInterval(elapsedIntervalId);
              setElapsedMs(Math.max(100, Date.now() - startedAt));
              setThinkingPhase("done");
              setIsRunning(false);
            });
          }
        }, stepFinishAt);
      });
    },
    [
      clearPendingTimers,
      language,
      resetScenarioInteractiveState,
      scheduleTimer,
      streamTextIntoMessage,
      tc,
    ]
  );

  const sendMessage = useCallback(
    (overrideText?: string) => {
      if (isRunning) return;
      const text = (overrideText ?? inputValue).trim();
      if (!text) return;

      const matched = matchScenarioFromPrompt(text);
      if (matched) {
        startScenario(matched, text);
        return;
      }

      // Graceful localized response for unsupported prompts
      const now = formatNowTime(language);
      const token = ++runTokenRef.current;
      clearPendingTimers();
      setInputValue("");
      setActiveScenarioId(null);
      setStages([]);
      setThinkingPhase("idle");
      setToolTrace([]);
      setElapsedMs(0);

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-user-${token}`,
          role: "user",
          text,
          timestamp: now,
        },
        {
          id: `msg-unsupported-${token}`,
          role: "assistant",
          text: tc("conversation.unsupportedMessage"),
          timestamp: now,
          cardType: "unsupported",
        },
      ]);
    },
    [clearPendingTimers, inputValue, isRunning, language, startScenario, tc]
  );

  // Scenario 1 interactive controls
  const updateSessionReplacement = useCallback((sessionId: string, replacementId: string) => {
    setSessions((prev) =>
      prev.map((row) => {
        if (row.id !== sessionId) return row;
        const resolvedStatus = replacementId === "needs-review" ? "conflict" : "available";
        return {
          ...row,
          selectedReplacementId: replacementId,
          status: resolvedStatus,
        };
      })
    );
  }, []);

  const toggleProposedAction = useCallback((actionId: ProposedActionItem["id"]) => {
    setProposedActions((prev) =>
      prev.map((item) => (item.id === actionId ? { ...item, enabled: !item.enabled } : item))
    );
  }, []);

  const approveAcademyDemoActions = useCallback(() => {
    if (executionPhase === "executing") return;
    if (!proposedActions.some((a) => a.enabled)) return;

    const currentToken = ++runTokenRef.current;
    clearPendingTimers();
    setExecutionPhase("executing");
    setExecutionStepIndex(1);
    setIsPlanReviewOpen(false);
    setIsEditingPlan(false);

    scheduleTimer(() => {
      if (runTokenRef.current !== currentToken) return;
      setExecutionStepIndex(2);
    }, 450);

    scheduleTimer(() => {
      if (runTokenRef.current !== currentToken) return;
      setExecutionStepIndex(3);
    }, 900);

    scheduleTimer(() => {
      if (runTokenRef.current !== currentToken) return;
      setExecutionPhase("completed");
    }, 1350);
  }, [clearPendingTimers, executionPhase, proposedActions, scheduleTimer]);

  // Scenario 2 workspace helpers
  const openFinancialWorkspace = useCallback((tab: FinancialWorkspaceTab = "overview") => {
    setActiveMode("analyze");
    setReportTab(tab);
    setIsExpandedWorkspace(true);
  }, []);

  const runQuickQuery = useCallback(
    (queryId: QuickQueryId) => {
      if (isRunning) return;
      const queryDef = QUICK_QUERIES.find((q) => q.id === queryId);
      if (!queryDef) return;

      runTokenRef.current += 1;
      const currentToken = runTokenRef.current;
      clearPendingTimers();

      const now = formatNowTime(language);
      const startedAt = Date.now();
      const promptText = tc(queryDef.promptKey);
      const answerFullText = tc(queryDef.answerKey);

      setActiveMode("ask");
      setIsRunning(true);
      setIsTraceExpanded(true);
      setElapsedMs(100);
      setThinkingPhase(queryDef.tools[0]?.thinkingPhase ?? "thinking");
      setStages([]);

      setToolTrace(
        queryDef.tools.map((t, idx) => ({
          id: t.id,
          toolName: t.toolName,
          labelKey: t.labelKey,
          findingKey: t.findingKey,
          status: idx === 0 ? "running" : "pending",
        }))
      );

      const elapsedIntervalId = window.setInterval(() => {
        if (runTokenRef.current !== currentToken) return;
        setElapsedMs(Math.max(100, Date.now() - startedAt));
      }, 100);
      intervalsRef.current.push(elapsedIntervalId);

      const userMsg: CopilotMessage = {
        id: `msg-qq-user-${currentToken}`,
        role: "user",
        text: promptText,
        timestamp: now,
      };
      const answerId = `msg-qq-ans-${currentToken}`;
      const answerMsg: CopilotMessage = {
        id: answerId,
        role: "assistant",
        text: "",
        isStreaming: true,
        timestamp: now,
      };

      setMessages((prev) => [...prev, userMsg]);

      let elapsed = 120;
      queryDef.tools.forEach((tool, idx) => {
        elapsed += tool.delayMs;
        const stepFinishAt = elapsed;
        scheduleTimer(() => {
          if (runTokenRef.current !== currentToken) return;
          setToolTrace((prev) =>
            prev.map((item, itemIdx) => {
              if (itemIdx < idx) return item;
              if (itemIdx === idx) return { ...item, status: "done", durationMs: tool.delayMs };
              if (itemIdx === idx + 1) return { ...item, status: "running" };
              return item;
            })
          );
          const nextTool = queryDef.tools[idx + 1];
          if (nextTool) {
            setThinkingPhase(nextTool.thinkingPhase);
          }

          if (idx === queryDef.tools.length - 1) {
            setMessages((prev) => [...prev, answerMsg]);
            streamTextIntoMessage(answerId, answerFullText, 40, 10, currentToken, () => {
              if (runTokenRef.current !== currentToken) return;
              window.clearInterval(elapsedIntervalId);
              setElapsedMs(Math.max(100, Date.now() - startedAt));
              setThinkingPhase("done");
              setIsRunning(false);
            });
          }
        }, stepFinishAt);
      });
    },
    [clearPendingTimers, isRunning, language, scheduleTimer, streamTextIntoMessage, tc]
  );

  const toggleAcknowledgeAlert = useCallback((alertId: string) => {
    setAcknowledgedAlertIds((prev) =>
      prev.includes(alertId) ? prev.filter((id) => id !== alertId) : [...prev, alertId]
    );
  }, []);

  const investigateAlert = useCallback(
    (alert: MonitorAlertItem) => {
      if (alert.targetScenario) {
        startScenario(alert.targetScenario);
        return;
      }
      setActiveMode(alert.targetMode);
    },
    [startScenario]
  );

  return {
    isOpen,
    openCopilot,
    closeCopilot,
    toggleCopilot,
    isExpandedWorkspace,
    setIsExpandedWorkspace,
    activeMode,
    setActiveMode,
    inputValue,
    setInputValue,
    messages,
    activeScenarioId,
    stages,
    thinkingPhase,
    toolTrace,
    elapsedMs,
    isTraceExpanded,
    setIsTraceExpanded,
    isRunning,
    populateSuggestedPrompt,
    startScenario,
    runQuickQuery,
    sendMessage,
    resetDemo,
    // Scenario 1
    sessions,
    expandedSessionId,
    setExpandedSessionId,
    isEditingPlan,
    setIsEditingPlan,
    proposedActions,
    toggleProposedAction,
    updateSessionReplacement,
    executionPhase,
    executionStepIndex,
    approveAcademyDemoActions,
    isPlanReviewOpen,
    setIsPlanReviewOpen,
    // Scenario 2
    reportTab,
    setReportTab,
    openFinancialWorkspace,
    selectedDocumentId,
    setSelectedDocumentId,
    isExecutivePreviewOpen,
    setIsExecutivePreviewOpen,
    // Monitor mode
    monitorSeverityFilter,
    setMonitorSeverityFilter,
    acknowledgedAlertIds,
    toggleAcknowledgeAlert,
    investigateAlert,
  };
}
