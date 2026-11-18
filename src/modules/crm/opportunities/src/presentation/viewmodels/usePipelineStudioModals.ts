"use client";

import { useState } from "react";
import { CANONICAL_TERMINAL_LABELS } from "../../domain/constants/crmCanonicalStages";
import type { CrmStageColorToken, CrmWorkflowDefinition, CrmWorkflowEntityType } from "@modules/crm";
import type { CrmWorkflowStageNode, CrmWorkflowTransition } from "../components/workflow/CrmWorkflowCanvas2D";
import type { StagePortId } from "../components/workflow/CrmWorkflowCanvasSubViews";
import { computeBalanced2DStagePosition } from "../components/workflow/crmWorkflowStudioMappers";

interface UsePipelineStudioModalsArgs {
  activeEntity: CrmWorkflowEntityType;
  stages: CrmWorkflowStageNode[];
  transitions: CrmWorkflowTransition[];
  selectedStageKey: string | null;
  setSelectedStageKey: (k: string | null) => void;
  setSelectedTransitionId: (id: string | null) => void;
  commitDraft: (s: CrmWorkflowStageNode[], t: CrmWorkflowTransition[]) => void;
  commitTransitions: (u: (prev: CrmWorkflowTransition[]) => CrmWorkflowTransition[]) => void;
  createWorkflow: (input: {
    entityType: CrmWorkflowEntityType;
    nameEn: string;
    nameAr?: string;
    descriptionEn?: string;
    descriptionAr?: string;
  }) => CrmWorkflowDefinition;
  openStudioForWorkflow: (id: string) => void;
}

/** Encapsulates modal state and submit handlers for adding stages, transitions, and workflows in Pipeline Studio. */
export function usePipelineStudioModals({
  activeEntity,
  stages,
  transitions,
  selectedStageKey,
  setSelectedStageKey,
  setSelectedTransitionId,
  commitDraft,
  commitTransitions,
  createWorkflow,
  openStudioForWorkflow,
}: UsePipelineStudioModalsArgs) {
  const [addStageModalOpen, setAddStageModalOpen] = useState(false);
  const [newStageNameEn, setNewStageNameEn] = useState("");
  const [newStageNameAr, setNewStageNameAr] = useState("");
  const [newStageProb, setNewStageProb] = useState(50);
  const [newStageSla, setNewStageSla] = useState(5);
  const [newStageColorToken, setNewStageColorToken] = useState<CrmStageColorToken>("blue");
  const [newStageCustomHex, setNewStageCustomHex] = useState("");
  const [newStageConvertsLead, setNewStageConvertsLead] = useState(false);
  const [newStageAutoConnect, setNewStageAutoConnect] = useState(true);
  const [newStageAllowFromAny, setNewStageAllowFromAny] = useState(true);

  const [addTransitionModalOpen, setAddTransitionModalOpen] = useState(false);
  const [newTransFrom, setNewTransFrom] = useState("");
  const [newTransTo, setNewTransTo] = useState("");
  const [newTransNameEn, setNewTransNameEn] = useState("");
  const [newTransNameAr, setNewTransNameAr] = useState("");
  const [newTransSourcePort, setNewTransSourcePort] = useState<StagePortId | undefined>(undefined);
  const [newTransTargetPort, setNewTransTargetPort] = useState<StagePortId | undefined>(undefined);

  const [createWorkflowModalOpen, setCreateWorkflowModalOpen] = useState(false);
  const [newWfEntityType, setNewWfEntityType] = useState<CrmWorkflowEntityType>("deal");
  const [newWfNameEn, setNewWfNameEn] = useState("");
  const [newWfNameAr, setNewWfNameAr] = useState("");
  const [newWfDescEn, setNewWfDescEn] = useState("");
  const [newWfDescAr, setNewWfDescAr] = useState("");

  const handleAddStageSubmit = () => {
    if (!newStageNameEn.trim()) return;
    const prefix = activeEntity === "lead" ? "lead" : "default";
    const slug = newStageNameEn.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
    const stageKey = `${prefix}.${slug}`;
    const nonTerm = stages.filter((s) => !s.isTerminalWon && !s.isTerminalLost);
    const nextOrder = nonTerm.length + 1;
    const pos = computeBalanced2DStagePosition(nextOrder - 1);
    const customHexClean = newStageCustomHex.trim() || undefined;
    const newNode: CrmWorkflowStageNode = {
      stageKey, labelEn: newStageNameEn.trim(), labelAr: newStageNameAr.trim() || newStageNameEn.trim(),
      probability: newStageProb, slaDays: newStageSla, order: nextOrder, allowInboundFromAny: newStageAllowFromAny,
      color: newStageColorToken, customColorHex: customHexClean,
      properties: customHexClean ? { customColorHex: customHexClean } : { color: newStageColorToken },
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
    setNewStageNameEn(""); setNewStageNameAr(""); setNewStageColorToken("blue"); setNewStageCustomHex("");
    setAddStageModalOpen(false); setSelectedStageKey(stageKey);
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
    const fNameEn = newTransNameEn.trim() || fbEn;
    const fNameAr = newTransNameAr.trim() || (newTransNameEn.trim() ? newTransNameEn.trim() : fbAr);
    const fromOrd = stages.find((s) => s.stageKey === newTransFrom)?.order ?? 0;
    const toOrd = tgt?.order ?? 0;
    const dir = newTransFrom === "*" ? "global" : toOrd < fromOrd ? "backward" : "forward";
    const created: CrmWorkflowTransition = {
      id: `tr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      nameEn: fNameEn, nameAr: fNameAr, fromStageKey: newTransFrom, fromStageKeys: [newTransFrom],
      toStageKey: newTransTo, direction: dir, sourcePort: newTransSourcePort, targetPort: newTransTargetPort, requiredFields: [],
    };
    commitTransitions((prev) => [...prev, created]);
    setAddTransitionModalOpen(false); setSelectedTransitionId(created.id); setSelectedStageKey(null);
  };

  const handleCreateWorkflowSubmit = () => {
    if (!newWfNameEn.trim()) return;
    const c = createWorkflow({
      entityType: newWfEntityType, nameEn: newWfNameEn.trim(), nameAr: newWfNameAr.trim() || newWfNameEn.trim(),
      descriptionEn: newWfDescEn.trim(), descriptionAr: newWfDescAr.trim(),
    });
    setCreateWorkflowModalOpen(false); setNewWfNameEn(""); setNewWfNameAr(""); setNewWfDescEn(""); setNewWfDescAr("");
    openStudioForWorkflow(c.id);
  };

  return {
    addStageModalOpen, setAddStageModalOpen, newStageNameEn, setNewStageNameEn, newStageNameAr, setNewStageNameAr,
    newStageProb, setNewStageProb, newStageSla, setNewStageSla,
    newStageColorToken, setNewStageColorToken, newStageCustomHex, setNewStageCustomHex,
    newStageConvertsLead, setNewStageConvertsLead, newStageAutoConnect, setNewStageAutoConnect, newStageAllowFromAny, setNewStageAllowFromAny,
    addTransitionModalOpen, setAddTransitionModalOpen, newTransFrom, setNewTransFrom, newTransTo, setNewTransTo,
    newTransNameEn, setNewTransNameEn, newTransNameAr, setNewTransNameAr,
    createWorkflowModalOpen, setCreateWorkflowModalOpen, newWfEntityType, setNewWfEntityType,
    newWfNameEn, setNewWfNameEn, newWfNameAr, setNewWfNameAr, newWfDescEn, setNewWfDescEn, newWfDescAr, setNewWfDescAr,
    handleAddStageSubmit, openAddTransitionWithPreselect, handleAddTransitionSubmit, handleCreateWorkflowSubmit,
  };
}
