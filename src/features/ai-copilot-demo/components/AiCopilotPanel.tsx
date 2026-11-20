"use client";

import React, { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@core/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@core/ui/sheet";
import { Textarea } from "@core/ui/textarea";
import { cn } from "@core/common/utils";
import { useCopilotI18n } from "../localization/useCopilotI18n";
import type { useAiCopilotDemo } from "../hooks/useAiCopilotDemo";
import { AiCopilotHeader } from "./AiCopilotHeader";
import { AiCopilotModeStrip } from "./AiCopilotModeStrip";
import { AiCopilotMessageList } from "./AiCopilotMessageList";
import { FinancialIntelligenceWorkspace } from "./FinancialIntelligenceWorkspace";
import { ExecutiveReportPreviewDialog } from "./ExecutiveReportPreviewDialog";

interface AiCopilotPanelProps {
  demo: ReturnType<typeof useAiCopilotDemo>;
}

function useIsDesktopLg(): boolean {
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return isDesktop;
}

export function AiCopilotPanel({ demo }: AiCopilotPanelProps) {
  const { tc, direction } = useCopilotI18n();
  const isDesktop = useIsDesktopLg();
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const hasFinancialSummaryReady =
    demo.activeScenarioId === "financial-q3-report" &&
    demo.messages.some((m) => m.cardType === "financial-summary" && !m.isStreaming);

  const isSplitFinancialWorkspace =
    demo.isExpandedWorkspace &&
    ((demo.activeMode === "analyze" && !demo.isRunning) ||
      hasFinancialSummaryReady);

  // Focus composer when panel opens
  useEffect(() => {
    if (!demo.isOpen) return;
    const timer = window.setTimeout(() => {
      composerRef.current?.focus();
    }, 60);
    return () => window.clearTimeout(timer);
  }, [demo.isOpen]);

  // Escape exits Max Mode first, then closes panel (ignore if a Radix Dialog handled it)
  useEffect(() => {
    if (!demo.isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      if (
        demo.selectedDocumentId ||
        demo.isExecutivePreviewOpen ||
        demo.isPlanReviewOpen ||
        document.querySelector('[role="dialog"]')
      ) {
        return; // Let Dialog handle Escape first
      }
      if (demo.isExpandedWorkspace) {
        demo.setIsExpandedWorkspace(false);
        return;
      }
      demo.closeCopilot();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [demo]);

  if (!demo.isOpen) {
    return null;
  }

  const renderChatBody = (isMaxLayout: boolean) => (
    <div
      dir={direction}
      className="flex h-full min-h-0 w-full flex-col bg-nx-surface text-nx-ink"
      data-testid="ai-copilot-chat-column"
    >
      <AiCopilotHeader
        activeScenarioId={demo.activeScenarioId}
        isExpandedWorkspace={demo.isExpandedWorkspace}
        hasMessages={demo.messages.length > 0}
        onToggleExpand={() =>
          demo.setIsExpandedWorkspace(!demo.isExpandedWorkspace)
        }
        onReset={demo.resetDemo}
        onClose={demo.closeCopilot}
        closeButtonRef={closeButtonRef}
      />

      <AiCopilotModeStrip
        activeMode={demo.activeMode}
        onSelectMode={demo.setActiveMode}
        isMaxLayout={isMaxLayout}
      />

      <AiCopilotMessageList
        activeMode={demo.activeMode}
        activeScenarioId={demo.activeScenarioId}
        messages={demo.messages}
        isRunning={demo.isRunning}
        thinkingPhase={demo.thinkingPhase}
        toolTrace={demo.toolTrace}
        elapsedMs={demo.elapsedMs}
        isTraceExpanded={demo.isTraceExpanded}
        onTraceExpandedChange={demo.setIsTraceExpanded}
        onPopulatePrompt={demo.populateSuggestedPrompt}
        onRunScenario={(id) => demo.startScenario(id)}
        onRunQuickQuery={demo.runQuickQuery}
        sessions={demo.sessions}
        expandedSessionId={demo.expandedSessionId}
        onToggleExpandSession={demo.setExpandedSessionId}
        isEditingPlan={demo.isEditingPlan}
        onToggleEditPlan={() => demo.setIsEditingPlan((v) => !v)}
        onUpdateReplacement={demo.updateSessionReplacement}
        proposedActions={demo.proposedActions}
        onToggleAction={demo.toggleProposedAction}
        executionPhase={demo.executionPhase}
        executionStepIndex={demo.executionStepIndex}
        onApproveAcademyActions={demo.approveAcademyDemoActions}
        isPlanReviewOpen={demo.isPlanReviewOpen}
        onSetPlanReviewOpen={demo.setIsPlanReviewOpen}
        isExpandedWorkspace={demo.isExpandedWorkspace}
        isMaxLayout={isMaxLayout}
        onOpenFinancialWorkspace={demo.openFinancialWorkspace}
        onOpenExecutivePreview={() => demo.setIsExecutivePreviewOpen(true)}
        monitorSeverityFilter={demo.monitorSeverityFilter}
        onMonitorSeverityFilterChange={demo.setMonitorSeverityFilter}
        acknowledgedAlertIds={demo.acknowledgedAlertIds}
        onToggleAcknowledgeAlert={demo.toggleAcknowledgeAlert}
        onInvestigateAlert={demo.investigateAlert}
      />

      {/* Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          demo.sendMessage();
        }}
        className="shrink-0 border-t border-nx-line bg-nx-surface p-3"
      >
        <div className={cn("w-full", isMaxLayout && "mx-auto max-w-4xl")}>
          <div className="flex items-end gap-2">
            <Textarea
              ref={composerRef}
              value={demo.inputValue}
              onChange={(e) => demo.setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  demo.sendMessage();
                }
              }}
              rows={2}
              placeholder={tc("composer.placeholder")}
              aria-label={tc("composer.placeholder")}
              data-testid="copilot-composer-input"
              className="min-h-[56px] max-h-28 resize-none text-xs"
            />
            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={demo.isRunning || !demo.inputValue.trim()}
              loading={demo.isRunning}
              aria-label={tc("composer.send")}
              data-testid="copilot-send-btn"
              className="h-10 shrink-0 cursor-pointer gap-1.5 px-3 text-xs font-semibold"
            >
              <Send className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
              <span>
                {demo.isRunning ? tc("composer.running") : tc("composer.send")}
              </span>
            </Button>
          </div>
          <p className="mt-1.5 text-[10px] text-nx-ink-3">
            {tc("composer.hint")}
          </p>
        </div>
      </form>
    </div>
  );

  // Max Mode (Full Viewport, Edge-to-Edge, No Outer Gap)
  if (demo.isExpandedWorkspace) {
    return (
      <>
        <section
          aria-label={
            isSplitFinancialWorkspace
              ? tc("financial.workspaceTitle")
              : tc("header.title")
          }
          dir={direction}
          data-testid="ai-copilot-expanded-workspace"
          className="fixed inset-0 z-modal flex flex-col bg-nx-surface text-nx-ink lg:flex-row"
        >
          {isSplitFinancialWorkspace ? (
            <>
              {/* Left / Start: Financial Intelligence Report Workspace */}
              <div className="min-h-0 flex-1 overflow-hidden border-b border-nx-line lg:border-b-0 lg:border-e">
                <FinancialIntelligenceWorkspace
                  activeTab={demo.reportTab}
                  onTabChange={demo.setReportTab}
                  selectedDocumentId={demo.selectedDocumentId}
                  onSelectDocument={demo.setSelectedDocumentId}
                  onOpenExecutivePreview={() =>
                    demo.setIsExecutivePreviewOpen(true)
                  }
                />
              </div>

              {/* Right / End: Retained Conversation Panel */}
              <div className="h-[42dvh] w-full shrink-0 overflow-hidden lg:h-full lg:w-[400px] xl:w-[430px]">
                {renderChatBody(false)}
              </div>
            </>
          ) : (
            <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
              {renderChatBody(true)}
            </div>
          )}
        </section>
        <ExecutiveReportPreviewDialog
          open={demo.isExecutivePreviewOpen}
          onOpenChange={demo.setIsExecutivePreviewOpen}
        />
      </>
    );
  }

  // Desktop: Contextual Side Panel docked beside the active SCRIPE dashboard
  if (isDesktop) {
    return (
      <>
        <aside
          aria-label={tc("header.title")}
          dir={direction}
          data-testid="ai-copilot-side-panel"
          className={cn(
            "flex h-full w-[420px] xl:w-[460px] shrink-0 flex-col overflow-hidden border-s border-nx-line bg-nx-surface"
          )}
        >
          {renderChatBody(false)}
        </aside>
        <ExecutiveReportPreviewDialog
          open={demo.isExecutivePreviewOpen}
          onOpenChange={demo.setIsExecutivePreviewOpen}
        />
      </>
    );
  }

  // Tablet / Mobile: Full-height responsive Sheet overlay
  return (
    <>
      <Sheet
        open={demo.isOpen}
        onOpenChange={(open) => {
          if (!open) demo.closeCopilot();
        }}
      >
        <SheetContent
          side="end"
          data-testid="ai-copilot-mobile-sheet"
          className="flex h-[100dvh] w-full max-w-full flex-col overflow-hidden p-0 sm:max-w-md [&>button]:hidden"
        >
          <SheetTitle className="sr-only">{tc("header.title")}</SheetTitle>
          {renderChatBody(false)}
        </SheetContent>
      </Sheet>
      <ExecutiveReportPreviewDialog
        open={demo.isExecutivePreviewOpen}
        onOpenChange={demo.setIsExecutivePreviewOpen}
      />
    </>
  );
}
