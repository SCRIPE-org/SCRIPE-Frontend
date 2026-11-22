"use client";

import { useState } from "react";
import type { CrmCustomFieldDefinition } from "@modules/crm";
import type {
  CrmWorkflowStageNode,
  CrmWorkflowTransition,
} from "../components/studio/CrmWorkflowCanvas2D";

/** Core Opportunity exit-gate field keys selectable in the Stage Inspector. */
export const DEAL_EXIT_FIELD_KEYS = [
  "partyId",
  "estimatedAmount",
  "targetCloseDate",
  "primaryContactRole",
  "solutionFitConfirmed",
];

/** Core Lead exit-gate field keys selectable in the Stage Inspector. */
export const LEAD_EXIT_FIELD_KEYS = [
  "leadPhoneOrEmail",
  "leadSource",
  "leadBantNotes",
  "leadAccountOrContact",
];

/** Input parameters for `useStageInspectorViewModel`. */
export interface UseStageInspectorParams {
  activeEntity: "deal" | "lead";
  stages: CrmWorkflowStageNode[];
  transitions: CrmWorkflowTransition[];
  selectedStage: CrmWorkflowStageNode | null;
  onStageChange: (updated: CrmWorkflowStageNode) => void;
  onRemoveStage: (stageKey: string) => void;
  onReplaceStage?: (oldStageKey: string, replacementStageKey: string) => void;
  onAddCrmCustomField?: (field: Omit<CrmCustomFieldDefinition, "id">) => void;
}

/**
 * ViewModel hook encapsulating all state and mutation handlers for CrmWorkflowInspectorPanel.
 */
export function useStageInspectorViewModel({
  activeEntity,
  stages,
  transitions,
  selectedStage,
  onStageChange,
  onRemoveStage,
  onReplaceStage,
  onAddCrmCustomField,
}: UseStageInspectorParams) {
  const [showCfForm, setShowCfForm] = useState(false);
  const [newCfKey, setNewCfKey] = useState("");
  const [newCfNameEn, setNewCfNameEn] = useState("");
  const [newCfNameAr, setNewCfNameAr] = useState("");
  const [newCfType, setNewCfType] = useState<CrmCustomFieldDefinition["valueType"]>("Text");
  const [replaceModalOpen, setReplaceModalOpen] = useState(false);
  const [replacementTargetKey, setReplacementTargetKey] = useState<string>("");
  const [stagePropKey, setStagePropKey] = useState("");
  const [stagePropVal, setStagePropVal] = useState("");
  const [showStagePropForm, setShowStagePropForm] = useState(false);

  const nonTerminalStages = stages.filter((s) => !s.isTerminalWon && !s.isTerminalLost);
  const canDeleteStage = selectedStage !== null && stages.length > 2;

  const candidateReplacementStages = selectedStage
    ? stages.filter((s) => s.stageKey !== selectedStage.stageKey)
    : [];

  const outgoing = selectedStage
    ? transitions.filter(
        (tr) =>
          tr.fromStageKey !== "*" &&
          (tr.fromStageKey === selectedStage.stageKey ||
            Boolean(tr.fromStageKeys && tr.fromStageKeys.includes(selectedStage.stageKey))),
      )
    : [];

  const incoming = selectedStage
    ? transitions.filter((tr) => tr.toStageKey === selectedStage.stageKey)
    : [];

  const allowInboundFromAny = Boolean(
    selectedStage &&
      incoming.some((tr) => tr.fromStageKey === "*" || tr.fromStageKeys?.includes("*")),
  );

  const coreFieldKeys = activeEntity === "lead" ? LEAD_EXIT_FIELD_KEYS : DEAL_EXIT_FIELD_KEYS;
  const stageProps = selectedStage?.properties ?? {};

  const toggleExitField = (fieldKey: string, checked: boolean) => {
    if (!selectedStage) return;
    const next = checked
      ? Array.from(new Set([...selectedStage.requiredExitFields, fieldKey]))
      : selectedStage.requiredExitFields.filter((f) => f !== fieldKey);
    onStageChange({ ...selectedStage, requiredExitFields: next });
  };

  const handleCreateCustomField = () => {
    if (!selectedStage || !onAddCrmCustomField || !newCfNameEn.trim()) return;
    const key = (newCfKey.trim() || newCfNameEn.trim())
      .toLowerCase()
      .replace(/[^a-z0-9_]+/g, "_");
    onAddCrmCustomField({
      entityTypeKey: activeEntity === "lead" ? "crm.lead" : "crm.opportunity",
      key,
      labelEn: newCfNameEn.trim(),
      labelAr: newCfNameAr.trim() || newCfNameEn.trim(),
      valueType: newCfType,
      isRequired: false,
      defaultStageGateKey: selectedStage.stageKey,
    });
    toggleExitField(`custom:${key}`, true);
    setNewCfKey("");
    setNewCfNameEn("");
    setNewCfNameAr("");
    setNewCfType("Text");
    setShowCfForm(false);
  };

  const handleOpenReplaceModal = () => {
    setReplacementTargetKey(candidateReplacementStages[0]?.stageKey ?? "");
    setReplaceModalOpen(true);
  };

  const handleConfirmReplaceStage = () => {
    if (!selectedStage || !replacementTargetKey) return;
    if (onReplaceStage) {
      onReplaceStage(selectedStage.stageKey, replacementTargetKey);
    } else {
      onRemoveStage(selectedStage.stageKey);
    }
    setReplaceModalOpen(false);
  };

  const handleAddStageProperty = () => {
    if (!selectedStage || !stagePropKey.trim()) return;
    onStageChange({
      ...selectedStage,
      properties: { ...stageProps, [stagePropKey.trim()]: stagePropVal.trim() },
    });
    setStagePropKey("");
    setStagePropVal("");
    setShowStagePropForm(false);
  };

  const handleRemoveStageProperty = (key: string) => {
    if (!selectedStage) return;
    const next = { ...stageProps };
    delete next[key];
    onStageChange({ ...selectedStage, properties: next });
  };

  return {
    showCfForm,
    setShowCfForm,
    newCfKey,
    setNewCfKey,
    newCfNameEn,
    setNewCfNameEn,
    newCfNameAr,
    setNewCfNameAr,
    newCfType,
    setNewCfType,
    replaceModalOpen,
    setReplaceModalOpen,
    replacementTargetKey,
    setReplacementTargetKey,
    stagePropKey,
    setStagePropKey,
    stagePropVal,
    setStagePropVal,
    showStagePropForm,
    setShowStagePropForm,
    nonTerminalStages,
    canDeleteStage,
    candidateReplacementStages,
    outgoing,
    incoming,
    allowInboundFromAny,
    coreFieldKeys,
    stageProps,
    toggleExitField,
    handleCreateCustomField,
    handleOpenReplaceModal,
    handleConfirmReplaceStage,
    handleAddStageProperty,
    handleRemoveStageProperty,
  };
}
