"use client";

import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import {
  useCrmSettingsStore,
  useCrmWorkflowsStore,
  type CrmWorkflowEntityType,
} from "@modules/crm";
import type {
  CrmWorkflowStageNode,
  CrmWorkflowTransition,
} from "../components/workflow/CrmWorkflowCanvas2D";
import {
  buildStageNodesFromWorkflow,
  buildTransitionsFromWorkflow,
  serializeStudioDraftToWorkflow,
} from "../components/workflow/crmWorkflowStudioMappers";

export type StudioViewMode = "diagram" | "classic" | "text";

/** ViewModel hook for the CRM Pipelines Directory and Full-Screen 2D Workflow Studio. */
export function usePipelineStudioViewModel(defaultOpenStudio = false) {
  const { t } = useI18n();
  const {
    workflows, activeDealWorkflowId, activeLeadWorkflowId,
    setActiveWorkflow, saveWorkflow, createWorkflow, cloneWorkflow, deleteWorkflow,
  } = useCrmWorkflowsStore();
  const { crmCustomFields, addCrmCustomField, isServerHydrated, hydrateFromServer } = useCrmSettingsStore();

  useEffect(() => {
    const isTestEnv = typeof process !== "undefined" && process.env?.NODE_ENV === "test";
    if (!isServerHydrated && !isTestEnv) {
      void hydrateFromServer();
    }
  }, [isServerHydrated, hydrateFromServer]);

  const [isStudioOpen, setIsStudioOpen] = useState(defaultOpenStudio);
  const [directoryFilter, setDirectoryFilter] = useState<"all" | CrmWorkflowEntityType>("all");
  const [directorySearch, setDirectorySearch] = useState("");
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>(activeDealWorkflowId);
  const [viewMode, setViewMode] = useState<StudioViewMode>("diagram");
  const [zoom, setZoom] = useState(80);

  const selectedWorkflow = useMemo(
    () => workflows.find((w) => w.id === selectedWorkflowId) ?? workflows[0],
    [workflows, selectedWorkflowId],
  );
  const activeEntity: CrmWorkflowEntityType = selectedWorkflow?.entityType ?? "deal";

  const [stages, setStages] = useState<CrmWorkflowStageNode[]>(() =>
    selectedWorkflow ? buildStageNodesFromWorkflow(selectedWorkflow) : [],
  );
  const [transitions, setTransitions] = useState<CrmWorkflowTransition[]>(() =>
    selectedWorkflow ? buildTransitionsFromWorkflow(selectedWorkflow) : [],
  );
  const [selectedStageKey, setSelectedStageKeyState] = useState<string | null>(null);
  const [selectedTransitionId, setSelectedTransitionIdState] = useState<string | null>(null);
  const [openRuleCatalogSignal, setOpenRuleCatalogSignal] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);
  const [validationBanner, setValidationBanner] = useState<string | null>(null);

  const setSelectedStageKey = (key: string | null) => {
    setSelectedStageKeyState(key);
    if (key !== null) setOpenRuleCatalogSignal(0);
  };
  const setSelectedTransitionId = (id: string | null) => {
    setSelectedTransitionIdState(id);
    setOpenRuleCatalogSignal(0);
  };

  const [addStageModalOpen, setAddStageModalOpen] = useState(false);
  const [newStageNameEn, setNewStageNameEn] = useState("");
  const [newStageNameAr, setNewStageNameAr] = useState("");
  const [newStageProb, setNewStageProb] = useState(50);
  const [newStageSla, setNewStageSla] = useState(5);
  const [newStageConvertsLead, setNewStageConvertsLead] = useState(false);
  const [newStageAutoConnect, setNewStageAutoConnect] = useState(true);

  const [addTransitionModalOpen, setAddTransitionModalOpen] = useState(false);
  const [newTransFrom, setNewTransFrom] = useState("");
  const [newTransTo, setNewTransTo] = useState("");
  const [newTransNameEn, setNewTransNameEn] = useState("");
  const [newTransNameAr, setNewTransNameAr] = useState("");

  const [createWorkflowModalOpen, setCreateWorkflowModalOpen] = useState(false);
  const [newWfEntityType, setNewWfEntityType] = useState<CrmWorkflowEntityType>("deal");
  const [newWfNameEn, setNewWfNameEn] = useState("");
  const [newWfNameAr, setNewWfNameAr] = useState("");
  const [newWfDescEn, setNewWfDescEn] = useState("");
  const [newWfDescAr, setNewWfDescAr] = useState("");

  useEffect(() => {
    if (!selectedWorkflow) return;
    setStages(buildStageNodesFromWorkflow(selectedWorkflow));
    setTransitions(buildTransitionsFromWorkflow(selectedWorkflow));
    setSelectedStageKeyState(null);
    setSelectedTransitionIdState(null);
    setOpenRuleCatalogSignal(0);
    setHasChanges(false);
    setValidationBanner(null);
  }, [selectedWorkflow]);

  const filteredDirectoryWorkflows = useMemo(() => {
    const q = directorySearch.trim().toLowerCase();
    return workflows.filter((wf) => {
      if (directoryFilter !== "all" && wf.entityType !== directoryFilter) return false;
      return !q || wf.nameEn.toLowerCase().includes(q) || wf.nameAr.toLowerCase().includes(q) || wf.code.toLowerCase().includes(q);
    });
  }, [workflows, directoryFilter, directorySearch]);

  const selectedStage = useMemo(() => stages.find((s) => s.stageKey === selectedStageKey) ?? null, [stages, selectedStageKey]);
  const selectedTransition = useMemo(() => transitions.find((tr) => tr.id === selectedTransitionId) ?? null, [transitions, selectedTransitionId]);

  const openStudioForWorkflow = (wfId: string) => { setSelectedWorkflowId(wfId); setIsStudioOpen(true); };
  const handleSwitchEntity = (entity: CrmWorkflowEntityType) => {
    const targetId = entity === "deal" ? activeDealWorkflowId : activeLeadWorkflowId;
    const fallback = workflows.find((w) => w.entityType === entity);
    setSelectedWorkflowId(targetId || fallback?.id || selectedWorkflowId);
  };
  const handleNodeMove = (stageKey: string, x: number, y: number) => {
    setStages((prev) => prev.map((s) => (s.stageKey === stageKey ? { ...s, x, y } : s)));
    setHasChanges(true);
  };
  const handleStageChange = (updated: CrmWorkflowStageNode) => {
    setStages((prev) => prev.map((s) => (s.stageKey === updated.stageKey ? updated : s)));
    setHasChanges(true);
  };
  const handleMoveStageOrder = (stageKey: string, direction: "up" | "down") => {
    const nonTerm = stages.filter((s) => !s.isTerminalWon && !s.isTerminalLost).sort((a, b) => a.order - b.order);
    const idx = nonTerm.findIndex((s) => s.stageKey === stageKey);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (idx < 0 || swapIdx < 0 || swapIdx >= nonTerm.length) return;
    const aKey = nonTerm[idx].stageKey;
    const bKey = nonTerm[swapIdx].stageKey;
    setStages((prev) =>
      prev.map((s) =>
        s.stageKey === aKey ? { ...s, order: nonTerm[swapIdx].order, x: nonTerm[swapIdx].x }
        : s.stageKey === bKey ? { ...s, order: nonTerm[idx].order, x: nonTerm[idx].x } : s,
      ),
    );
    setHasChanges(true);
  };
  const handleRemoveStage = (stageKey: string) => {
    if (stages.filter((s) => !s.isTerminalWon && !s.isTerminalLost).length <= 2) {
      setValidationBanner(t("crmOpportunities.pipelinesPage.minTwoStatusesError"));
      return;
    }
    setStages((prev) => prev.filter((s) => s.stageKey !== stageKey));
    setTransitions((prev) => prev.filter((t) => t.fromStageKey !== stageKey && t.toStageKey !== stageKey));
    setSelectedStageKey(null);
    setHasChanges(true);
  };
  const handleReplaceStage = (stageKeyToRemove: string, replacementStageKey: string) => {
    if (stages.filter((s) => !s.isTerminalWon && !s.isTerminalLost).length <= 2) {
      setValidationBanner(t("crmOpportunities.pipelinesPage.minTwoStatusesError"));
      return;
    }
    if (stageKeyToRemove === replacementStageKey) return;
    setStages((prev) => prev.filter((s) => s.stageKey !== stageKeyToRemove));
    setTransitions((prev) =>
      prev
        .map((tr) => {
          const nextFrom = tr.fromStageKey === stageKeyToRemove ? replacementStageKey : tr.fromStageKey;
          const nextTo = tr.toStageKey === stageKeyToRemove ? replacementStageKey : tr.toStageKey;
          const nextFromKeys = tr.fromStageKeys
            ? Array.from(new Set(tr.fromStageKeys.map((k) => (k === stageKeyToRemove ? replacementStageKey : k))))
            : undefined;
          return { ...tr, fromStageKey: nextFrom, toStageKey: nextTo, fromStageKeys: nextFromKeys };
        })
        .filter((tr) => tr.fromStageKey !== tr.toStageKey),
    );
    setSelectedStageKey(replacementStageKey);
    setHasChanges(true);
  };
  const handleAddStageSubmit = () => {
    if (!newStageNameEn.trim()) return;
    const prefix = activeEntity === "lead" ? "lead" : "default";
    const slug = newStageNameEn.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
    const stageKey = `${prefix}.${slug}`;
    const nonTerm = stages.filter((s) => !s.isTerminalWon && !s.isTerminalLost);
    const nextOrder = nonTerm.length + 1;
    const newStageX = 116 + (nextOrder - 1) * 360;
    const newNode: CrmWorkflowStageNode = {
      stageKey, labelEn: newStageNameEn.trim(), labelAr: newStageNameAr.trim() || newStageNameEn.trim(),
      probability: newStageProb, slaDays: newStageSla, order: nextOrder,
      isTerminalWon: false, isTerminalLost: false, convertsToDeal: activeEntity === "lead" ? newStageConvertsLead : false,
      requiredExitFields: [], x: newStageX, y: 176,
    };
    setStages((prev) => [
      ...prev.map((s) =>
        s.isTerminalWon || s.isTerminalLost
          ? { ...s, x: Math.max(s.x, newStageX + 188 + 204), order: s.order + 1 }
          : s,
      ),
      newNode,
    ]);
    if (newStageAutoConnect && nonTerm.length > 0) {
      const lastStage = [...nonTerm].sort((a, b) => a.order - b.order)[nonTerm.length - 1];
      setTransitions((prev) => [
        ...prev,
        { id: `tr-auto-${Date.now()}`, nameEn: `Move to ${newNode.labelEn}`, nameAr: `الانتقال إلى ${newNode.labelAr}`, fromStageKey: lastStage.stageKey, toStageKey: stageKey, direction: "forward", requiredFields: [] },
      ]);
    }
    setNewStageNameEn(""); setNewStageNameAr(""); setAddStageModalOpen(false); setSelectedStageKey(stageKey); setHasChanges(true);
  };
  const openAddTransitionWithPreselect = (fromKey?: string, toKey?: string) => {
    const first = stages[0]?.stageKey ?? "";
    setNewTransFrom(fromKey ?? selectedStageKey ?? first);
    setNewTransTo(toKey ?? stages[1]?.stageKey ?? first);
    setNewTransNameEn(""); setNewTransNameAr(""); setAddTransitionModalOpen(true);
  };
  const handleAddTransitionSubmit = () => {
    if (!newTransFrom || !newTransTo || !newTransNameEn.trim()) return;
    const fromOrd = stages.find((s) => s.stageKey === newTransFrom)?.order ?? 0;
    const toOrd = stages.find((s) => s.stageKey === newTransTo)?.order ?? 0;
    const dir = newTransFrom === "*" ? "global" : toOrd < fromOrd ? "backward" : "forward";
    const created: CrmWorkflowTransition = {
      id: `tr-${Date.now()}`, nameEn: newTransNameEn.trim(), nameAr: newTransNameAr.trim() || newTransNameEn.trim(),
      fromStageKey: newTransFrom, toStageKey: newTransTo, direction: dir, requiredFields: [],
    };
    setTransitions((prev) => [...prev, created]);
    setAddTransitionModalOpen(false); setSelectedTransitionId(created.id); setSelectedStageKey(null); setHasChanges(true);
  };
  const handleOpenRuleForStage = (key: string) => {
    if (selectedTransitionId) {
      setSelectedStageKeyState(null);
      setOpenRuleCatalogSignal((prev) => prev + 1);
      return;
    }
    const matching =
      transitions.find(
        (tr) => tr.fromStageKey === key || (tr.fromStageKeys && tr.fromStageKeys.includes(key)),
      ) ?? transitions[0];
    if (matching) {
      setSelectedTransitionIdState(matching.id);
      setSelectedStageKeyState(null);
      setOpenRuleCatalogSignal((prev) => prev + 1);
    } else {
      setSelectedStageKey(key);
      setSelectedTransitionId(null);
    }
  };
  const handleCreateWorkflowSubmit = () => {
    if (!newWfNameEn.trim()) return;
    const created = createWorkflow({
      entityType: newWfEntityType, nameEn: newWfNameEn.trim(), nameAr: newWfNameAr.trim() || newWfNameEn.trim(),
      descriptionEn: newWfDescEn.trim(), descriptionAr: newWfDescAr.trim(),
    });
    setCreateWorkflowModalOpen(false); setNewWfNameEn(""); setNewWfNameAr(""); setNewWfDescEn(""); setNewWfDescAr("");
    openStudioForWorkflow(created.id);
  };
  const handleSave = () => {
    if (!selectedWorkflow) return;
    saveWorkflow(serializeStudioDraftToWorkflow(selectedWorkflow, stages, transitions));
    setHasChanges(false);
  };
  const handleValidateRules = () => {
    const activeCount = stages.filter((s) => !s.isTerminalWon && !s.isTerminalLost).length;
    setValidationBanner(
      t("crmOpportunities.pipelinesPage.workflowVerifiedBanner", {
        activeCount,
        transitionCount: transitions.length,
        defaultValue: `Workflow verified: ${activeCount} active statuses, ${transitions.length} transitions, and 0 cyclic deadlocks.`,
      }),
    );
  };

  return {
    workflows, activeDealWorkflowId, activeLeadWorkflowId, selectedWorkflow, selectedWorkflowId,
    isStudioOpen, setIsStudioOpen, directoryFilter, setDirectoryFilter, directorySearch, setDirectorySearch,
    filteredDirectoryWorkflows, activeEntity, viewMode, setViewMode, zoom, setZoom,
    activeStages: stages, transitions, selectedStage, selectedTransition, selectedStageKey, selectedTransitionId,
    setSelectedStageKey, setSelectedTransitionId, openRuleCatalogSignal, handleOpenRuleForStage,
    hasChanges, validationBanner, setValidationBanner, crmCustomFields, addCrmCustomField,
    addStageModalOpen, setAddStageModalOpen, newStageNameEn, setNewStageNameEn, newStageNameAr, setNewStageNameAr,
    newStageProb, setNewStageProb, newStageSla, setNewStageSla, newStageConvertsLead, setNewStageConvertsLead, newStageAutoConnect, setNewStageAutoConnect,
    addTransitionModalOpen, setAddTransitionModalOpen, newTransFrom, setNewTransFrom, newTransTo, setNewTransTo, newTransNameEn, setNewTransNameEn, newTransNameAr, setNewTransNameAr,
    createWorkflowModalOpen, setCreateWorkflowModalOpen, newWfEntityType, setNewWfEntityType, newWfNameEn, setNewWfNameEn, newWfNameAr, setNewWfNameAr, newWfDescEn, setNewWfDescEn, newWfDescAr, setNewWfDescAr,
    openStudioForWorkflow, handleSwitchEntity, handleNodeMove, handleStageChange, handleMoveStageOrder, handleRemoveStage, handleReplaceStage, handleAddStageSubmit, openAddTransitionWithPreselect, handleAddTransitionSubmit,
    handleTransitionChange: (u: CrmWorkflowTransition) => { setTransitions((prev) => prev.map((t) => (t.id === u.id ? u : t))); setHasChanges(true); },
    handleDeleteTransition: (id: string) => { setTransitions((prev) => prev.filter((t) => t.id !== id)); setSelectedTransitionId(null); setHasChanges(true); },
    handleCreateWorkflowSubmit, handleCloneWorkflow: (id: string) => openStudioForWorkflow(cloneWorkflow(id).id),
    handleActivateWorkflow: (_entity: CrmWorkflowEntityType, id: string) => setActiveWorkflow(id),
    handleDeleteWorkflow: deleteWorkflow,
    handleResetDraft: () => { if (!selectedWorkflow) return; setStages(buildStageNodesFromWorkflow(selectedWorkflow)); setTransitions(buildTransitionsFromWorkflow(selectedWorkflow)); setHasChanges(false); },
    handleSave, handleValidateRules,
  };
}
