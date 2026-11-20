"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { qk } from "@core/common/query-keys";
import { useI18n } from "@core/providers/i18n-provider";
import { getCrmContainer } from "@modules/crm/di";
import { useCrmTenantScope, useSafeQueryClient, type CrmWorkflowEntityType } from "@modules/crm/shared";
import { useCrmWorkflowsStore } from "../stores/useCrmWorkflowsStore";
import { hasAuthenticatedCrmSession } from "../utils/crmWorkflowsAuthAndConfigHelpers";
import type { CrmWorkflowStageNode, CrmWorkflowTransition } from "../components/studio/CrmWorkflowCanvas2D";
import type { StagePortId } from "../components/studio/CrmWorkflowCanvasSubViews";
import {
  buildStageNodesFromWorkflow, buildTransitionsFromWorkflow,
  serializeStudioDraftToWorkflow,
} from "../utils/crmWorkflowStudioMappers";
import {
  applyReplaceStageDraft,
  applyToggleAllowAnyDraft,
  validateWorkflowGraph,
} from "../utils/crmWorkflowGraphValidator";
import { useCrmWorkflowGovernanceQuery } from "./useCrmWorkflowGovernanceQuery";
import { useWorkflowHistoryStack } from "./useWorkflowHistoryStack";
import { useWorkflowKeyboardShortcuts } from "./useWorkflowKeyboardShortcuts";
import { usePipelineStudioModals } from "./usePipelineStudioModals";

/** Supported visualization modes inside the CRM Pipeline Workflow Studio. */
export type StudioViewMode = "diagram" | "classic" | "text";

/** ViewModel hook for CRM Pipelines Directory and Full-Screen 2D Workflow Studio. */
export function usePipelineStudioViewModel(defaultOpenStudio = false) {
  const { t } = useI18n();
  const safeQueryClient = useSafeQueryClient();
  const { tenantId } = useCrmTenantScope();
  const {
    workflows, activeDealWorkflowId, activeLeadWorkflowId,
    syncError, clearSyncError,
    setActiveWorkflow, saveWorkflowAndSync, createWorkflow, cloneWorkflow, deleteWorkflow,
    hydrateFromBackendPipelines,
  } = useCrmWorkflowsStore();
  const { crmCustomFields, addCrmCustomField, isHydrating: isGovernanceHydrating, governanceSyncError } = useCrmWorkflowGovernanceQuery();

  const canQueryServer = hasAuthenticatedCrmSession();

  const pipelinesQuery = useQuery(
    {
      queryKey: qk.crm.pipelines(tenantId),
      queryFn: () => getCrmContainer().workflowRepository.getPipelines(),
      enabled: canQueryServer,
      staleTime: 60_000,
    },
    safeQueryClient
  );

  const pipelinesData = pipelinesQuery.data;
  useEffect(() => {
    if (Array.isArray(pipelinesData) && pipelinesData.length > 0) {
      hydrateFromBackendPipelines(pipelinesData);
    }
  }, [pipelinesData, hydrateFromBackendPipelines]);

  const [isStudioOpen, setIsStudioOpen] = useState(defaultOpenStudio);
  const [directoryFilter, setDirectoryFilter] = useState<"all" | CrmWorkflowEntityType>("all");
  const [directorySearch, setDirectorySearch] = useState("");
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>(activeDealWorkflowId);
  const [viewMode, setViewMode] = useState<StudioViewMode>("diagram");
  const [zoom, setZoom] = useState(80);

  const selectedWorkflow = workflows.find((w) => w.id === selectedWorkflowId) ?? workflows[0];
  const activeEntity: CrmWorkflowEntityType = selectedWorkflow?.entityType ?? "deal";

  const [stages, setStages] = useState<CrmWorkflowStageNode[]>(() => selectedWorkflow ? buildStageNodesFromWorkflow(selectedWorkflow) : []);
  const [transitions, setTransitions] = useState<CrmWorkflowTransition[]>(() => selectedWorkflow ? buildTransitionsFromWorkflow(selectedWorkflow) : []);
  const [selectedStageKey, setSelectedStageKeyState] = useState<string | null>(null);
  const [selectedTransitionId, setSelectedTransitionIdState] = useState<string | null>(null);
  const [openRuleCatalogSignal, setOpenRuleCatalogSignal] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);
  const [validationBanner, setValidationBanner] = useState<string | null>(null);

  const historyStack = useWorkflowHistoryStack((snapshot) => {
    setStages(snapshot.stages); setTransitions(snapshot.transitions); setHasChanges(true);
  });
  const { resetHistory } = historyStack;

  const setSelectedStageKey = (key: string | null) => { setSelectedStageKeyState(key); if (key !== null) setOpenRuleCatalogSignal(0); };
  const setSelectedTransitionId = (id: string | null) => { setSelectedTransitionIdState(id); setOpenRuleCatalogSignal(0); };

  const activeWorkflowKey = selectedWorkflow?.id ?? "";
  useEffect(() => {
    const wf = workflows.find((w) => w.id === activeWorkflowKey) ?? workflows[0];
    if (!wf) return;
    const iStages = buildStageNodesFromWorkflow(wf);
    const iTransitions = buildTransitionsFromWorkflow(wf);
    setStages(iStages);
    setTransitions(iTransitions);
    setSelectedStageKeyState(null);
    setSelectedTransitionIdState(null);
    setOpenRuleCatalogSignal(0);
    setHasChanges(false);
    setValidationBanner(null);
    resetHistory(iStages, iTransitions);
    // Intentionally reset draft only when the active workflow identifier changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWorkflowKey, resetHistory]);

  const commitDraft = (nextStages: CrmWorkflowStageNode[], nextTransitions: CrmWorkflowTransition[]) => {
    setStages(nextStages); setTransitions(nextTransitions);
    historyStack.pushSnapshot(nextStages, nextTransitions); setHasChanges(true);
  };
  const commitStages = (updater: (prev: CrmWorkflowStageNode[]) => CrmWorkflowStageNode[]) => {
    setStages((prev) => { const next = updater(prev); historyStack.pushSnapshot(next, transitions); return next; });
    setHasChanges(true);
  };
  const commitTransitions = (updater: (prev: CrmWorkflowTransition[]) => CrmWorkflowTransition[]) => {
    setTransitions((prev) => { const next = updater(prev); historyStack.pushSnapshot(stages, next); return next; });
    setHasChanges(true);
  };

  const handleUndo = () => {
    const prev = historyStack.undo();
    if (!prev) return;
    setStages(prev.stages); setTransitions(prev.transitions); setHasChanges(true);
    if (selectedStageKey && !prev.stages.some((s) => s.stageKey === selectedStageKey)) setSelectedStageKey(null);
    if (selectedTransitionId && !prev.transitions.some((tr) => tr.id === selectedTransitionId)) setSelectedTransitionId(null);
  };
  const handleRedo = () => {
    const next = historyStack.redo();
    if (!next) return;
    setStages(next.stages); setTransitions(next.transitions); setHasChanges(true);
  };

  const q = directorySearch.trim().toLowerCase();
  const filteredDirectoryWorkflows = workflows.filter(
    (wf) =>
      (directoryFilter === "all" || wf.entityType === directoryFilter) &&
      (!q || wf.nameEn.toLowerCase().includes(q) || wf.nameAr.toLowerCase().includes(q) || wf.code.toLowerCase().includes(q))
  );

  const selectedStage = stages.find((s) => s.stageKey === selectedStageKey) ?? null;
  const selectedTransition = transitions.find((tr) => tr.id === selectedTransitionId) ?? null;

  const openStudioForWorkflow = (wfId: string) => { setSelectedWorkflowId(wfId); setIsStudioOpen(true); };
  const handleSwitchEntity = (entity: CrmWorkflowEntityType) => {
    const targetId = entity === "deal" ? activeDealWorkflowId : activeLeadWorkflowId;
    setSelectedWorkflowId(targetId || workflows.find((w) => w.entityType === entity)?.id || selectedWorkflowId);
  };
  const handleNodeMove = (stageKey: string, x: number, y: number) => {
    commitStages((prev) => prev.map((s) => (s.stageKey === stageKey ? { ...s, x, y } : s)));
  };
  const handleApplyLayoutPositions = (positions: Map<string, { x: number; y: number }> | Record<string, { x: number; y: number }>) => {
    const nextStages = stages.map((s) => {
      const pos = positions instanceof Map ? positions.get(s.stageKey) : (positions as Record<string, { x: number; y: number }>)[s.stageKey];
      return pos ? { ...s, x: pos.x, y: pos.y } : s;
    });
    commitDraft(nextStages, transitions);
  };
  const handleReconnectTransition = (
    edgeId: string, newFromKey: string, newToKey: string, sourcePort?: StagePortId, targetPort?: StagePortId,
  ) => {
    const next = transitions.map((tr) => {
      if (tr.id !== edgeId) return tr;
      const fromOrd = stages.find((s) => s.stageKey === newFromKey)?.order ?? 0;
      const toOrd = stages.find((s) => s.stageKey === newToKey)?.order ?? 0;
      const direction: CrmWorkflowTransition["direction"] = newFromKey === "*" ? "global" : toOrd < fromOrd ? "backward" : "forward";
      return { ...tr, fromStageKey: newFromKey, fromStageKeys: [newFromKey], toStageKey: newToKey, direction, sourcePort: sourcePort ?? tr.sourcePort, targetPort: targetPort ?? tr.targetPort };
    });
    commitTransitions(() => next);
  };
  const handleStageChange = (updated: CrmWorkflowStageNode) => {
    commitStages((prev) => prev.map((s) => (s.stageKey === updated.stageKey ? updated : s)));
  };
  const handleToggleAllowAnyTransition = (stageKey: string, allowed: boolean) => {
    const { nextStages, nextTransitions } = applyToggleAllowAnyDraft(stages, transitions, stageKey, allowed);
    commitDraft(nextStages, nextTransitions);
  };
  const handleMoveStageOrder = (stageKey: string, direction: "up" | "down") => {
    const nonTerm = stages.filter((s) => !s.isTerminalWon && !s.isTerminalLost).sort((a, b) => a.order - b.order);
    const idx = nonTerm.findIndex((s) => s.stageKey === stageKey);
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (idx === -1 || targetIdx < 0 || targetIdx >= nonTerm.length) return;
    const cur = nonTerm[idx]; const tgt = nonTerm[targetIdx];
    commitStages((prev) => prev.map((s) => s.stageKey === cur.stageKey ? { ...s, order: tgt.order } : s.stageKey === tgt.stageKey ? { ...s, order: cur.order } : s));
  };
  const handleRemoveStage = (stageKey: string) => {
    const target = stages.find((s) => s.stageKey === stageKey);
    if (!target || target.isTerminalWon || target.isTerminalLost) return;
    commitDraft(stages.filter((s) => s.stageKey !== stageKey), transitions.filter((tr) => tr.fromStageKey !== stageKey && tr.toStageKey !== stageKey));
    if (selectedStageKey === stageKey) setSelectedStageKey(null);
  };
  const handleReplaceStage = (stageKeyToRemove: string, replacementStageKey: string) => {
    const { nextStages, nextTransitions } = applyReplaceStageDraft(stages, transitions, stageKeyToRemove, replacementStageKey);
    commitDraft(nextStages, nextTransitions); setSelectedStageKey(replacementStageKey);
  };
  const handleOpenRuleForStage = (key: string) => {
    if (selectedTransitionId) { setSelectedStageKeyState(null); setOpenRuleCatalogSignal((prev) => prev + 1); return; }
    const m = transitions.find((tr) => tr.fromStageKey === key || (tr.fromStageKeys && tr.fromStageKeys.includes(key))) ?? transitions[0];
    if (m) { setSelectedTransitionIdState(m.id); setSelectedStageKeyState(null); setOpenRuleCatalogSignal((prev) => prev + 1); }
    else { setSelectedStageKey(key); setSelectedTransitionId(null); }
  };
  const handleSave = async () => {
    if (!selectedWorkflow) return;
    await saveWorkflowAndSync(serializeStudioDraftToWorkflow(selectedWorkflow, stages, transitions));
    setHasChanges(false);
    void safeQueryClient.invalidateQueries({ queryKey: qk.crm.pipelines(tenantId) });
  };
  const handleDeleteTransition = (id: string) => { commitTransitions((prev) => prev.filter((t) => t.id !== id)); setSelectedTransitionId(null); };
  const handleValidateRules = () => {
    const report = validateWorkflowGraph(stages, transitions);
    if (report.valid) { setValidationBanner(t("crmWorkflows.pipelinesPage.workflowVerifiedBanner", { activeCount: report.activeCount, transitionCount: report.transitionCount, defaultValue: `Workflow verified: ${report.activeCount} active statuses, ${report.transitionCount} transitions, and 0 cyclic deadlocks.` })); return; }
    const issues = [report.unreachableStages.length > 0 ? `Unreachable: ${report.unreachableStages.join(", ")}` : "", report.deadlockedStages.length > 0 ? `Deadlocks: ${report.deadlockedStages.join(", ")}` : "", report.unexpectedCycleCount > 0 ? `Forward cycles: ${report.unexpectedCycleCount}` : ""].filter(Boolean).join(" · ");
    setValidationBanner(t("crmWorkflows.pipelinesPage.workflowIssuesBanner", { issues, defaultValue: `Workflow validation warnings: ${issues}` }));
  };
  const handleImportWorkflowJson = (importedStages: CrmWorkflowStageNode[], importedTransitions: CrmWorkflowTransition[]) => commitDraft(importedStages, importedTransitions);

  const studioModals = usePipelineStudioModals({
    activeEntity, stages, transitions, selectedStageKey, setSelectedStageKey, setSelectedTransitionId,
    commitDraft, commitTransitions, createWorkflow, openStudioForWorkflow,
  });

  useWorkflowKeyboardShortcuts({
    enabled: isStudioOpen, canUndo: historyStack.canUndo, canRedo: historyStack.canRedo, onUndo: handleUndo, onRedo: handleRedo, onSave: handleSave,
    selectedStageKey, selectedTransitionId, onDeleteSelectedStage: handleRemoveStage, onDeleteSelectedTransition: handleDeleteTransition,
    onClearSelection: () => { setSelectedStageKey(null); setSelectedTransitionId(null); },
    isAnyModalOpen: studioModals.addStageModalOpen || studioModals.addTransitionModalOpen || studioModals.createWorkflowModalOpen,
  });

  return {
    isHydrating: isGovernanceHydrating || (canQueryServer && pipelinesQuery.isLoading),
    syncError: syncError || governanceSyncError, clearSyncError, workflows, activeDealWorkflowId, activeLeadWorkflowId, selectedWorkflow, selectedWorkflowId,
    isStudioOpen, setIsStudioOpen, directoryFilter, setDirectoryFilter, directorySearch, setDirectorySearch,
    filteredDirectoryWorkflows, activeEntity, viewMode, setViewMode, zoom, setZoom,
    activeStages: stages, transitions, selectedStage, selectedTransition, selectedStageKey, selectedTransitionId,
    setSelectedStageKey, setSelectedTransitionId, openRuleCatalogSignal, handleOpenRuleForStage,
    hasChanges, validationBanner, setValidationBanner, crmCustomFields, addCrmCustomField,
    ...studioModals,
    openStudioForWorkflow, handleSwitchEntity, handleNodeMove, handleApplyLayoutPositions, handleReconnectTransition, handleStageChange, handleToggleAllowAnyTransition,
    handleMoveStageOrder, handleRemoveStage, handleReplaceStage, handleImportWorkflowJson,
    handleTransitionChange: (u: CrmWorkflowTransition) => commitTransitions((prev) => prev.map((t) => (t.id === u.id ? u : t))),
    handleDeleteTransition,
    handleCloneWorkflow: (id: string) => openStudioForWorkflow(cloneWorkflow(id).id),
    handleActivateWorkflow: (_entity: CrmWorkflowEntityType, id: string) => setActiveWorkflow(id),
    handleDeleteWorkflow: deleteWorkflow,
    handleResetDraft: () => {
      if (!selectedWorkflow) return;
      const rS = buildStageNodesFromWorkflow(selectedWorkflow); const rT = buildTransitionsFromWorkflow(selectedWorkflow);
      setStages(rS); setTransitions(rT); historyStack.resetHistory(rS, rT); setHasChanges(false);
    },
    handleSave, handleValidateRules,
    canUndo: historyStack.canUndo, canRedo: historyStack.canRedo, handleUndo, handleRedo,
  };
}
