"use client";

import {
  DEFAULT_NEW_WORKFLOW_META,
  type CrmWorkflowEntityType,
} from "@modules/crm/shared";
import {
  makeWorkflowTransition,
  type CrmWorkflowDefinition,
  type CrmWorkflowStage,
  type CrmWorkflowTransition,
} from "../../domain/constants/crmWorkflowDefaults";

/** Constructs a new `CrmWorkflowDefinition` from a template, clone source, or minimal skeleton. */
export function buildNewWorkflowDef(
  existingWorkflows: CrmWorkflowDefinition[],
  input: {
    entityType: CrmWorkflowEntityType;
    nameEn: string;
    nameAr?: string;
    descriptionEn?: string;
    descriptionAr?: string;
    templateId?: string;
    cloneFromId?: string;
  }
): CrmWorkflowDefinition {
  const resolvedTemplateId = input.templateId || input.cloneFromId;
  const template = resolvedTemplateId
    ? existingWorkflows.find((w) => w.id === resolvedTemplateId)
    : undefined;
  const id = `wf-${input.entityType}-${Date.now()}`;
  const defaultStages: CrmWorkflowStage[] = template
    ? template.stages.map((s) => ({ ...s, requiredExitFields: [...s.requiredExitFields] }))
    : input.entityType === "lead"
      ? [
          { stageKey: "lead.new", labelEn: DEFAULT_NEW_WORKFLOW_META.leadNewEn, labelAr: DEFAULT_NEW_WORKFLOW_META.leadNewAr, sortOrder: 1, category: "todo", winProbabilityPercent: 20, requiredExitFields: [] },
          { stageKey: "lead.converted", labelEn: DEFAULT_NEW_WORKFLOW_META.leadConvertedEn, labelAr: DEFAULT_NEW_WORKFLOW_META.leadConvertedAr, sortOrder: 2, category: "done", winProbabilityPercent: 100, requiredExitFields: [], triggerDealConversion: true, triggersDealConversion: true },
        ]
      : [
          { stageKey: "default.discovery", labelEn: DEFAULT_NEW_WORKFLOW_META.dealDiscoveryEn, labelAr: DEFAULT_NEW_WORKFLOW_META.dealDiscoveryAr, sortOrder: 1, category: "todo", winProbabilityPercent: 25, requiredExitFields: [] },
          { stageKey: "default.proposal", labelEn: DEFAULT_NEW_WORKFLOW_META.dealProposalClosingEn, labelAr: DEFAULT_NEW_WORKFLOW_META.dealProposalClosingAr, sortOrder: 2, category: "in_progress", winProbabilityPercent: 80, requiredExitFields: ["partyId"], requiresVerifiedParty: true },
        ];

  const defaultTransitions: CrmWorkflowTransition[] = template
    ? template.transitions.map((t, idx) => ({ ...t, id: `tr-${Date.now()}-${idx}`, rules: { ...t.rules } }))
    : [
        makeWorkflowTransition(`tr-${Date.now()}-1`, defaultStages[0].stageKey, defaultStages[1].stageKey, "forward", `${DEFAULT_NEW_WORKFLOW_META.advanceToPrefixEn} ${defaultStages[1].labelEn}`, `${DEFAULT_NEW_WORKFLOW_META.advanceToPrefixAr} ${defaultStages[1].labelAr}`, {
          triggerDealConversion: Boolean(defaultStages[1].triggerDealConversion),
          requireVerifiedParty: Boolean(defaultStages[1].requiresVerifiedParty),
        }),
        makeWorkflowTransition(`tr-${Date.now()}-2`, defaultStages[1].stageKey, defaultStages[0].stageKey, "backward", `${DEFAULT_NEW_WORKFLOW_META.returnToPrefixEn} ${defaultStages[0].labelEn}`, `${DEFAULT_NEW_WORKFLOW_META.returnToPrefixAr} ${defaultStages[0].labelAr}`),
      ];

  return {
    id,
    code: `${input.entityType}.custom_${Date.now()}`,
    entityType: input.entityType,
    nameEn: input.nameEn.trim() || DEFAULT_NEW_WORKFLOW_META.customWfNameEn,
    nameAr: input.nameAr?.trim() || input.nameEn.trim() || DEFAULT_NEW_WORKFLOW_META.customWfNameAr,
    descriptionEn: input.descriptionEn || DEFAULT_NEW_WORKFLOW_META.customWfDescEn,
    descriptionAr: input.descriptionAr || DEFAULT_NEW_WORKFLOW_META.customWfDescAr,
    isActive: false,
    isTemplate: false,
    version: 1,
    stages: defaultStages,
    transitions: defaultTransitions,
    updatedAtUtc: new Date().toISOString(),
  };
}

/** Deep-clones an existing `CrmWorkflowDefinition` with regenerated IDs and bilingual copy suffixes. */
export function buildClonedWorkflowDef(
  sourceWf: CrmWorkflowDefinition,
  customNameEn?: string,
  customNameAr?: string
): CrmWorkflowDefinition {
  return {
    ...sourceWf,
    id: `wf-${sourceWf.entityType}-clone-${Date.now()}`,
    code: `${sourceWf.code}_copy_${Date.now()}`,
    nameEn: customNameEn || `${sourceWf.nameEn} ${DEFAULT_NEW_WORKFLOW_META.copySuffixEn}`,
    nameAr: customNameAr || `${sourceWf.nameAr} ${DEFAULT_NEW_WORKFLOW_META.copySuffixAr}`,
    isActive: false,
    isTemplate: false,
    version: 1,
    stages: sourceWf.stages.map((s) => ({ ...s, requiredExitFields: [...s.requiredExitFields] })),
    transitions: sourceWf.transitions.map((t, i) => ({ ...t, id: `tr-clone-${Date.now()}-${i}`, rules: { ...t.rules } })),
    updatedAtUtc: new Date().toISOString(),
  };
}

/** Creates a new `CrmWorkflowStage` definition appended to the target workflow. */
export function buildNewStageForWorkflow(
  wf: CrmWorkflowDefinition,
  input: {
    stageKey?: string; labelEn: string; labelAr?: string; winProbabilityPercent?: number;
    requiresVerifiedParty?: boolean; triggerDealConversion?: boolean; triggersDealConversion?: boolean; requiredExitFields?: string[];
  }
): CrmWorkflowStage {
  const prefix = wf.entityType === "lead" ? "lead" : "default";
  const slug = input.labelEn.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || `stage_${Date.now()}`;
  return {
    stageKey: input.stageKey || `${prefix}.${slug}`,
    labelEn: input.labelEn.trim(),
    labelAr: input.labelAr?.trim() || input.labelEn.trim(),
    sortOrder: wf.stages.length + 1,
    category: "in_progress",
    winProbabilityPercent: input.winProbabilityPercent ?? 50,
    requiredExitFields: input.requiredExitFields ?? (input.requiresVerifiedParty ? ["partyId"] : []),
    requiresVerifiedParty: Boolean(input.requiresVerifiedParty),
    triggerDealConversion: Boolean(input.triggerDealConversion || input.triggersDealConversion),
    triggersDealConversion: Boolean(input.triggerDealConversion || input.triggersDealConversion),
  };
}

/** Rewires transition endpoints to a replacement stage key and removes self-loops. */
export function rewireTransitionsOnStageReplace(
  transitions: CrmWorkflowTransition[],
  stageKeyToRemove: string,
  replacementStageKey: string
): CrmWorkflowTransition[] {
  return transitions
    .map((t) => ({
      ...t,
      fromStageKey: t.fromStageKey === stageKeyToRemove ? replacementStageKey : t.fromStageKey,
      toStageKey: t.toStageKey === stageKeyToRemove ? replacementStageKey : t.toStageKey,
      fromStageKeys: t.fromStageKeys ? Array.from(new Set(t.fromStageKeys.map((k) => (k === stageKeyToRemove ? replacementStageKey : k)))) : undefined,
    }))
    .filter((t) => t.fromStageKey !== t.toStageKey);
}
