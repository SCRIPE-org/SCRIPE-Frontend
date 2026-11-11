"use client";

import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { useCrmSettingsStore, useCrmWorkflowsStore, type CrmWorkflowEntityType } from "@modules/crm";
import { CANONICAL_TERMINAL_LABELS } from "../../domain/constants/crmCanonicalStages";
import type { CrmWorkflowStageNode, CrmWorkflowTransition } from "../components/workflow/CrmWorkflowCanvas2D";
import type { StagePortId } from "../components/workflow/CrmWorkflowCanvasSubViews";
import {
  buildStageNodesFromWorkflow, buildTransitionsFromWorkflow,
  computeBalanced2DStagePosition, serializeStudioDraftToWorkflow,
} from "../components/workflow/crmWorkflowStudioMappers";
import { useWorkflowHistoryStack } from "./useWorkflowHistoryStack";
import { useWorkflowKeyboardShortcuts } from "./useWorkflowKeyboardShortcuts";

export type StudioViewMode = "diagram" | "classic" | "text";

/** ViewModel hook for CRM Pipelines Directory and Full-Screen 2D Workflow Studio v3.0 (<275 lines). */
export function usePipelineStudioViewModel(defaultOpenStudio = false) {
  const { t } = useI18n();
  const { workflows, activeDealWorkflowId, activeLeadWorkflowId, setActiveWorkflow, saveWorkflow, createWorkflow, cloneWorkflow, deleteWorkflow } = useCrmWorkflowsStore();
  const { crmCustomFields, addCrmCustomField, isHydrating, isServerHydrated, hydrateFromServer } = useCrmSettingsStore();

  useEffect(() => {
    const isTestEnv = typeof process !== "undefined" && process.env?.NODE_ENV === "test";
    if (!isServerHydrated && !isTestEnv) void hydrateFromServer();
  }, [isServerHydrated, hydrateFromServer]);

  const [isStudioOpen, setIsStudioOpen] = useState(defaultOpenStudio);
  const [directoryFilter, setDirectoryFilter] = useState<"all" | CrmWorkflowEntityType>("all");
  const [directorySearch, setDirectorySearch] = useState("");
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>(activeDealWorkflowId);
  const [viewMode, setViewMode] = useState<StudioViewMode>("diagram");
  const [zoom, setZoom] = useState(80);

  const selectedWorkflow = useMemo(() => workflows.find((w) => w.id === selectedWorkflowId) ?? workflows[0], [workflows, selectedWorkflowId]);
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

  const setSelectedStageKey = (key: string | null) => { setSelectedStageKeyState(key); if (key !== null) setOpenRuleCatalogSignal(0); };
  const setSelectedTransitionId = (id: string | null) => { setSelectedTransitionIdState(id); setOpenRuleCatalogSignal(0); };

  const [addStageModalOpen, setAddStageModalOpen] = useState(false);
  const [newStageNameEn, setNewStageNameEn] = useState(""); const [newStageNameAr, setNewStageNameAr] = useState("");
  const [newStageProb, setNewStageProb] = useState(50); const [newStageSla, setNewStageSla] = useState(5);
  const [newStageConvertsLead, setNewStageConvertsLead] = useState(false);
  const [newStageAutoConnect, setNewStageAutoConnect] = useState(true);
  const [newStageAllowFromAny, setNewStageAllowFromAny] = useState(true);

  const [addTransitionModalOpen, setAddTransitionModalOpen] = useState(false);
  const [newTransFrom, setNewTransFrom] = useState(""); const [newTransTo, setNewTransTo] = useState("");
  const [newTransNameEn, setNewTransNameEn] = useState(""); const [newTransNameAr, setNewTransNameAr] = useState("");
  const [newTransSourcePort, setNewTransSourcePort] = useState<StagePortId | undefined>(undefined);
  const [newTransTargetPort, setNewTransTargetPort] = useState<StagePortId | undefined>(undefined);

  const [createWorkflowModalOpen, setCreateWorkflowModalOpen] = useState(false);
  const [newWfEntityType, setNewWfEntityType] = useState<CrmWorkflowEntityType>("deal");
  const [newWfNameEn, setNewWfNameEn] = useState(""); const [newWfNameAr, setNewWfNameAr] = useState("");
  const [newWfDescEn, setNewWfDescEn] = useState(""); const [newWfDescAr, setNewWfDescAr] = useState("");

  useEffect(() => {
    if (!selectedWorkflow) return;
    const iStages = buildStageNodesFromWorkflow(selectedWorkflow);
    const iTransitions = buildTransitionsFromWorkflow(selectedWorkflow);
    setStages(iStages); setTransitions(iTransitions);
    historyStack.resetHistory(iStages, iTransitions);
    setSelectedStageKeyState(null); setSelectedTransitionIdState(null);
    setOpenRuleCatalogSignal(0); setHasChanges(false); setValidationBanner(null);
  }, [selectedWorkflow]);

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

  const filteredDirectoryWorkflows = useMemo(() => {
    const q = directorySearch.trim().toLowerCase();
    return workflows.filter((wf) => (directoryFilter === "all" || wf.entityType === directoryFilter) && (!q || wf.nameEn.toLowerCase().includes(q) || wf.nameAr.toLowerCase().includes(q) || wf.code.toLowerCase().includes(q)));
  }, [workflows, directoryFilter, directorySearch]);

  const selectedStage = useMemo(() => stages.find((s) => s.stageKey === selectedStageKey) ?? null, [stages, selectedStageKey]);
  const selectedTransition = useMemo(() => transitions.find((tr) => tr.id === selectedTransitionId) ?? null, [transitions, selectedTransitionId]);

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
      return { ...tr, fromStageKey: newFromKey, fromStageKeys: [newFromKey], toStageKey: newToKey, direction: (newFromKey === "*" ? "global" : toOrd < fromOrd ? "backward" : "forward") as any, sourcePort: sourcePort ?? tr.sourcePort, targetPort: targetPort ?? tr.targetPort };
    });
    commitTransitions(() => next);
  };
  const handleStageChange = (updated: CrmWorkflowStageNode) => {
    commitStages((prev) => prev.map((s) => (s.stageKey === updated.stageKey ? updated : s)));
  };
  const handleToggleAllowAnyTransition = (stageKey: string, allowed: boolean) => {
    const nextStages = stages.map((s) => (s.stageKey === stageKey ? { ...s, allowInboundFromAny: allowed } : s));
    const existing = transitions.find((tr) => (tr.fromStageKey === "*" || tr.fromStageKeys?.includes("*")) && tr.toStageKey === stageKey);
    let nextTransitions = transitions;
    if (allowed && !existing) {
      const st = stages.find((s) => s.stageKey === stageKey);
      nextTransitions = [...transitions, { id: `tr-any-${stageKey}-${Date.now()}`, nameEn: st?.labelEn ?? stageKey, nameAr: st?.labelAr ?? stageKey, fromStageKey: "*", fromStageKeys: ["*"], toStageKey: stageKey, direction: "global", requiredFields: [] }];
    } else if (!allowed && existing) {
      nextTransitions = transitions.filter((tr) => tr.id !== existing.id);
    }
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
    const nextStages = stages.filter((s) => s.stageKey !== stageKeyToRemove);
    const nextTransitions = transitions
      .map((tr) => ({
        ...tr, fromStageKey: tr.fromStageKey === stageKeyToRemove ? replacementStageKey : tr.fromStageKey,
        toStageKey: tr.toStageKey === stageKeyToRemove ? replacementStageKey : tr.toStageKey,
        fromStageKeys: tr.fromStageKeys ? Array.from(new Set(tr.fromStageKeys.map((k) => (k === stageKeyToRemove ? replacementStageKey : k)))) : undefined,
      }))
      .filter((tr) => tr.fromStageKey !== tr.toStageKey);
    commitDraft(nextStages, nextTransitions); setSelectedStageKey(replacementStageKey);
  };

  const handleAddStageSubmit = () => {
    if (!newStageNameEn.trim()) return;
    const prefix = activeEntity === "lead" ? "lead" : "default";
    const slug = newStageNameEn.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
    const stageKey = `${prefix}.${slug}`;
    const nonTerm = stages.filter((s) => !s.isTerminalWon && !s.isTerminalLost);
    const nextOrder = nonTerm.length + 1;
    const pos = computeBalanced2DStagePosition(nextOrder - 1);
    const newNode: CrmWorkflowStageNode = {
      stageKey, labelEn: newStageNameEn.trim(), labelAr: newStageNameAr.trim() || newStageNameEn.trim(),
      probability: newStageProb, slaDays: newStageSla, order: nextOrder, allowInboundFromAny: newStageAllowFromAny,
      isTerminalWon: false, isTerminalLost: false, convertsToDeal: activeEntity === "lead" ? newStageConvertsLead : false,
      requiredExitFields: [], x: pos.x, y: pos.y,
    };
    const nextStages = [...stages.map((s) => (s.isTerminalWon || s.isTerminalLost ? { ...s, order: s.order + 1 } : s)), newNode];
    const addedTr: CrmWorkflowTransition[] = [];
    if (newStageAutoConnect && nonTerm.length > 0) {
      const last = [...nonTerm].sort((a, b) => a.order - b.order)[nonTerm.length - 1];
      addedTr.push({ id: `tr-auto-${Date.now()}`, nameEn: `${CANONICAL_TERMINAL_LABELS.moveToPrefixEn} ${newNode.labelEn}`, nameAr: `${CANONICAL_TERMINAL_LABELS.moveToPrefixAr} ${newNode.labelAr}`, fromStageKey: last.stageKey, fromStageKeys: [last.stageKey], toStageKey: stageKey, direction: "forward", requiredFields: [] });
    }
    if (newStageAllowFromAny) {
      addedTr.push({ id: `tr-any-${stageKey}-${Date.now() + 1}`, nameEn: newNode.labelEn, nameAr: newNode.labelAr, fromStageKey: "*", fromStageKeys: ["*"], toStageKey: stageKey, direction: "global", requiredFields: [] });
    }
    commitDraft(nextStages, addedTr.length > 0 ? [...transitions, ...addedTr] : transitions);
    setNewStageNameEn(""); setNewStageNameAr(""); setAddStageModalOpen(false); setSelectedStageKey(stageKey);
  };

  const openAddTransitionWithPreselect = (fromKey?: string, toKey?: string, sourcePort?: StagePortId, targetPort?: StagePortId) => {
    const first = stages[0]?.stageKey ?? "";
    const resFrom = fromKey ?? (toKey ? "*" : selectedStageKey ?? first);
    const resTo = toKey ?? stages.find((s) => s.stageKey !== resFrom)?.stageKey ?? first;
    const tgt = stages.find((s) => s.stageKey === resTo);
    setNewTransFrom(resFrom); setNewTransTo(resTo); setNewTransSourcePort(sourcePort); setNewTransTargetPort(targetPort);
    setNewTransNameEn(tgt ? `${CANONICAL_TERMINAL_LABELS.moveToPrefixEn} ${tgt.labelEn}` : "");
    setNewTransNameAr(tgt ? `${CANONICAL_TERMINAL_LABELS.moveToPrefixAr} ${tgt.labelAr}` : "");
    setAddTransitionModalOpen(true);
  };
  const handleAddTransitionSubmit = () => {
    if (!newTransFrom || !newTransTo || newTransFrom === newTransTo) return;
    const tgt = stages.find((s) => s.stageKey === newTransTo);
    const fbEn = tgt ? `${CANONICAL_TERMINAL_LABELS.moveToPrefixEn} ${tgt.labelEn}` : newTransTo;
    const fbAr = tgt ? `${CANONICAL_TERMINAL_LABELS.moveToPrefixAr} ${tgt.labelAr}` : fbEn;
    const fNameEn = newTransNameEn.trim() || fbEn; const fNameAr = newTransNameAr.trim() || (newTransNameEn.trim() ? newTransNameEn.trim() : fbAr);
    const fromOrd = stages.find((s) => s.stageKey === newTransFrom)?.order ?? 0; const toOrd = tgt?.order ?? 0;
    const dir = newTransFrom === "*" ? "global" : toOrd < fromOrd ? "backward" : "forward";
    const created: CrmWorkflowTransition = { id: `tr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, nameEn: fNameEn, nameAr: fNameAr, fromStageKey: newTransFrom, fromStageKeys: [newTransFrom], toStageKey: newTransTo, direction: dir, sourcePort: newTransSourcePort, targetPort: newTransTargetPort, requiredFields: [] };
    commitTransitions((prev) => [...prev, created]);
    setAddTransitionModalOpen(false); setSelectedTransitionId(created.id); setSelectedStageKey(null);
  };

  const handleOpenRuleForStage = (key: string) => {
    if (selectedTransitionId) { setSelectedStageKeyState(null); setOpenRuleCatalogSignal((prev) => prev + 1); return; }
    const m = transitions.find((tr) => tr.fromStageKey === key || (tr.fromStageKeys && tr.fromStageKeys.includes(key))) ?? transitions[0];
    if (m) { setSelectedTransitionIdState(m.id); setSelectedStageKeyState(null); setOpenRuleCatalogSignal((prev) => prev + 1); }
    else { setSelectedStageKey(key); setSelectedTransitionId(null); }
  };
  const handleCreateWorkflowSubmit = () => {
    if (!newWfNameEn.trim()) return;
    const c = createWorkflow({ entityType: newWfEntityType, nameEn: newWfNameEn.trim(), nameAr: newWfNameAr.trim() || newWfNameEn.trim(), descriptionEn: newWfDescEn.trim(), descriptionAr: newWfDescAr.trim() });
    setCreateWorkflowModalOpen(false); setNewWfNameEn(""); setNewWfNameAr(""); setNewWfDescEn(""); setNewWfDescAr(""); openStudioForWorkflow(c.id);
  };
  const handleSave = () => { if (selectedWorkflow) { saveWorkflow(serializeStudioDraftToWorkflow(selectedWorkflow, stages, transitions)); setHasChanges(false); } };
  const handleDeleteTransition = (id: string) => { commitTransitions((prev) => prev.filter((t) => t.id !== id)); setSelectedTransitionId(null); };
  const handleValidateRules = () => {
    const activeCount = stages.filter((s) => !s.isTerminalWon && !s.isTerminalLost).length;
    setValidationBanner(t("crmOpportunities.pipelinesPage.workflowVerifiedBanner", { activeCount, transitionCount: transitions.length, defaultValue: `Workflow verified: ${activeCount} active statuses, ${transitions.length} transitions, and 0 cyclic deadlocks.` }));
  };

  useWorkflowKeyboardShortcuts({
    enabled: isStudioOpen, canUndo: historyStack.canUndo, canRedo: historyStack.canRedo, onUndo: handleUndo, onRedo: handleRedo,
    selectedStageKey, selectedTransitionId, onDeleteSelectedStage: handleRemoveStage, onDeleteSelectedTransition: handleDeleteTransition,
    onClearSelection: () => { setSelectedStageKey(null); setSelectedTransitionId(null); },
    isAnyModalOpen: addStageModalOpen || addTransitionModalOpen || createWorkflowModalOpen,
  });

  return {
    isHydrating, workflows, activeDealWorkflowId, activeLeadWorkflowId, selectedWorkflow, selectedWorkflowId,
    isStudioOpen, setIsStudioOpen, directoryFilter, setDirectoryFilter, directorySearch, setDirectorySearch,
    filteredDirectoryWorkflows, activeEntity, viewMode, setViewMode, zoom, setZoom,
    activeStages: stages, transitions, selectedStage, selectedTransition, selectedStageKey, selectedTransitionId,
    setSelectedStageKey, setSelectedTransitionId, openRuleCatalogSignal, handleOpenRuleForStage,
    hasChanges, validationBanner, setValidationBanner, crmCustomFields, addCrmCustomField,
    addStageModalOpen, setAddStageModalOpen, newStageNameEn, setNewStageNameEn, newStageNameAr, setNewStageNameAr,
    newStageProb, setNewStageProb, newStageSla, setNewStageSla, newStageConvertsLead, setNewStageConvertsLead,
    newStageAutoConnect, setNewStageAutoConnect, newStageAllowFromAny, setNewStageAllowFromAny,
    addTransitionModalOpen, setAddTransitionModalOpen, newTransFrom, setNewTransFrom, newTransTo, setNewTransTo,
    newTransNameEn, setNewTransNameEn, newTransNameAr, setNewTransNameAr,
    createWorkflowModalOpen, setCreateWorkflowModalOpen, newWfEntityType, setNewWfEntityType,
    newWfNameEn, setNewWfNameEn, newWfNameAr, setNewWfNameAr, newWfDescEn, setNewWfDescEn, newWfDescAr, setNewWfDescAr,
    openStudioForWorkflow, handleSwitchEntity, handleNodeMove, handleApplyLayoutPositions, handleReconnectTransition, handleStageChange, handleToggleAllowAnyTransition,
    handleMoveStageOrder, handleRemoveStage, handleReplaceStage, handleAddStageSubmit, openAddTransitionWithPreselect, handleAddTransitionSubmit,
    handleTransitionChange: (u: CrmWorkflowTransition) => commitTransitions((prev) => prev.map((t) => (t.id === u.id ? u : t))),
    handleDeleteTransition,
    handleCreateWorkflowSubmit, handleCloneWorkflow: (id: string) => openStudioForWorkflow(cloneWorkflow(id).id),
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
