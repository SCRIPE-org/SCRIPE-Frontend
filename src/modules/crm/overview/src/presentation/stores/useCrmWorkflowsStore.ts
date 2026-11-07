"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getCrmContainer } from "@modules/crm/di";
import { DEFAULT_NEW_WORKFLOW_META } from "../../domain/constants/crmSettingsDefaults";
import {
  INITIAL_CRM_WORKFLOWS,
  evaluateWorkflowTransition,
  makeWorkflowTransition,
  type CrmWorkflowDefinition,
  type CrmWorkflowEntityType,
  type CrmWorkflowStage,
  type CrmWorkflowTransition,
  type EvaluatedWorkflowTransition,
} from "../../domain/constants/crmWorkflowDefaults";
import {
  CANONICAL_DEFAULT_STAGE_META,
  mergeBackendPipelinesIntoState,
  syncWorkflowsToBackend,
} from "../utils/crmWorkflowsStoreHelpers";

export * from "../../domain/constants/crmWorkflowDefaults";
export * from "../utils/crmStageColorUtils";
export * from "../utils/crmWorkflowsStoreHelpers";

/** Zustand store state and actions for dynamic CRM Deal and Lead workflows. */
export interface CrmWorkflowsState {
  workflows: CrmWorkflowDefinition[];
  activeDealWorkflowId: string;
  activeLeadWorkflowId: string;
  getActiveWorkflow: (entityType: CrmWorkflowEntityType) => CrmWorkflowDefinition;
  setActiveWorkflow: (idOrEntity: string, maybeWorkflowId?: string) => void;
  saveWorkflow: (workflow: CrmWorkflowDefinition) => CrmWorkflowDefinition;
  createWorkflow: (input: {
    entityType: CrmWorkflowEntityType; nameEn: string; nameAr?: string;
    descriptionEn?: string; descriptionAr?: string; templateId?: string; cloneFromId?: string;
  }) => CrmWorkflowDefinition;
  cloneWorkflow: (workflowId: string, customNameEn?: string, customNameAr?: string) => CrmWorkflowDefinition;
  deleteWorkflow: (workflowId: string) => boolean;
  addStageToWorkflow: (workflowId: string, input: {
    stageKey?: string; labelEn: string; labelAr?: string; winProbabilityPercent?: number;
    requiresVerifiedParty?: boolean; triggerDealConversion?: boolean; triggersDealConversion?: boolean; requiredExitFields?: string[];
  }) => CrmWorkflowStage;
  updateStageInWorkflow: (workflowId: string, stageKey: string, patch: Partial<CrmWorkflowStage>) => void;
  deleteStageFromWorkflow: (workflowId: string, stageKey: string) => boolean;
  replaceAndDeleteStageFromWorkflow: (workflowId: string, stageKeyToRemove: string, replacementStageKey: string) => boolean;
  addTransition: (workflowId: string, input: {
    fromStageKey: string; fromStageKeys?: string[]; toStageKey: string; nameEn: string; nameAr?: string; rules?: Partial<CrmWorkflowTransition["rules"]>;
  }) => CrmWorkflowTransition;
  updateTransitionRules: (
    workflowId: string, transitionId: string, patch: Partial<CrmWorkflowTransition["rules"]>,
    metaPatch?: {
      nameEn?: string; nameAr?: string; fromStageKey?: string; fromStageKeys?: string[]; toStageKey?: string;
      domainEventKey?: string; triggers?: string[]; properties?: Record<string, string>; catalogRules?: CrmWorkflowTransition["catalogRules"];
    }
  ) => void;
  deleteTransition: (workflowId: string, transitionId: string) => void;
  syncBackendDealPipeline: (backendPipe: {
    nameEn: string; nameAr?: string | null; version?: number; transitionsJson?: string | null;
    stages: Array<{ stageKey: string; labelEn: string; labelAr?: string | null; sortOrder: number; winProbabilityPercent?: number | null; requiredExitFields?: string[]; triggerDealConversion?: boolean }>;
  }) => void;
  hydrateFromServerPayload: (payload: { workflows?: CrmWorkflowDefinition[]; activeDealWorkflowId?: string; activeLeadWorkflowId?: string }) => void;
  hydrateFromBackendPipelines: (backendPipelines: any[]) => void;
  evaluateTransition: (
    entityType: CrmWorkflowEntityType, fromStageKey: string, toStageKey: string,
    recordContext?: { hasVerifiedParty?: boolean; estimatedAmount?: number | null; targetCloseDate?: string | null }
  ) => EvaluatedWorkflowTransition;
  resetDefaults: () => void;
  resetWorkflows: () => void;
}

/** Zustand store managing 2..N stage Deal and Lead workflows with automatic PostgreSQL tenant settings persistence. */
export const useCrmWorkflowsStore = create<CrmWorkflowsState>()(
  persist(
    (set, get) => ({
      workflows: INITIAL_CRM_WORKFLOWS,
      activeDealWorkflowId: "wf-deal-default",
      activeLeadWorkflowId: "wf-lead-default",

      getActiveWorkflow: (entityType) => {
        const all = get().workflows;
        return all.find((w) => w.entityType === entityType && w.isActive) ?? all.find((w) => w.entityType === entityType) ?? INITIAL_CRM_WORKFLOWS[0];
      },

      setActiveWorkflow: (idOrEntity, maybeWorkflowId) => {
        const workflowId = maybeWorkflowId ?? idOrEntity;
        const target = get().workflows.find((w) => w.id === workflowId);
        if (!target) return;
        set((state) => ({
          activeDealWorkflowId: target.entityType === "deal" ? workflowId : state.activeDealWorkflowId,
          activeLeadWorkflowId: target.entityType === "lead" ? workflowId : state.activeLeadWorkflowId,
          workflows: state.workflows.map((w) =>
            w.entityType === target.entityType ? { ...w, isActive: w.id === workflowId, updatedAtUtc: new Date().toISOString() } : w
          ),
        }));
        try { void getCrmContainer().opportunityRepository?.activatePipeline?.(workflowId)?.catch?.(() => undefined); } catch { /* noop */ }
        syncWorkflowsToBackend(get(), { ...target, isActive: true });
      },

      saveWorkflow: (updated) => {
        const normalizedStages = [...updated.stages].sort((a, b) => a.sortOrder - b.sortOrder).map((s, idx) => ({ ...s, sortOrder: idx + 1 }));
        const saved: CrmWorkflowDefinition = { ...updated, stages: normalizedStages, updatedAtUtc: new Date().toISOString() };
        set((state) => {
          const exists = state.workflows.some((w) => w.id === saved.id);
          return { workflows: exists ? state.workflows.map((w) => (w.id === saved.id ? saved : w)) : [...state.workflows, saved] };
        });
        syncWorkflowsToBackend(get(), saved);
        return saved;
      },

      createWorkflow: ({ entityType, nameEn, nameAr, descriptionEn, descriptionAr, templateId, cloneFromId }) => {
        const resolvedTemplateId = templateId || cloneFromId;
        const template = resolvedTemplateId ? get().workflows.find((w) => w.id === resolvedTemplateId) : undefined;
        const id = `wf-${entityType}-${Date.now()}`;
        const defaultStages: CrmWorkflowStage[] = template
          ? template.stages.map((s) => ({ ...s, requiredExitFields: [...s.requiredExitFields] }))
          : entityType === "lead"
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
        const created: CrmWorkflowDefinition = {
          id, code: `${entityType}.custom_${Date.now()}`, entityType,
          nameEn: nameEn.trim() || DEFAULT_NEW_WORKFLOW_META.customWfNameEn, nameAr: nameAr?.trim() || nameEn.trim() || DEFAULT_NEW_WORKFLOW_META.customWfNameAr,
          descriptionEn: descriptionEn || DEFAULT_NEW_WORKFLOW_META.customWfDescEn,
          descriptionAr: descriptionAr || DEFAULT_NEW_WORKFLOW_META.customWfDescAr,
          isActive: false, isTemplate: false, version: 1, stages: defaultStages, transitions: defaultTransitions, updatedAtUtc: new Date().toISOString(),
        };
        set((state) => ({ workflows: [...state.workflows, created] }));
        syncWorkflowsToBackend(get(), created);
        return created;
      },

      cloneWorkflow: (workflowId, customNameEn, customNameAr) => {
        const src = get().workflows.find((w) => w.id === workflowId) ?? INITIAL_CRM_WORKFLOWS[0];
        const cloned: CrmWorkflowDefinition = {
          ...src, id: `wf-${src.entityType}-clone-${Date.now()}`, code: `${src.code}_copy_${Date.now()}`,
          nameEn: customNameEn || `${src.nameEn} ${DEFAULT_NEW_WORKFLOW_META.copySuffixEn}`, nameAr: customNameAr || `${src.nameAr} ${DEFAULT_NEW_WORKFLOW_META.copySuffixAr}`,
          isActive: false, isTemplate: false, version: 1,
          stages: src.stages.map((s) => ({ ...s, requiredExitFields: [...s.requiredExitFields] })),
          transitions: src.transitions.map((t, i) => ({ ...t, id: `tr-clone-${Date.now()}-${i}`, rules: { ...t.rules } })),
          updatedAtUtc: new Date().toISOString(),
        };
        set((state) => ({ workflows: [...state.workflows, cloned] }));
        syncWorkflowsToBackend(get(), cloned);
        return cloned;
      },

      deleteWorkflow: (workflowId) => {
        const target = get().workflows.find((w) => w.id === workflowId);
        if (!target || target.isActive) return false;
        set((state) => ({ workflows: state.workflows.filter((w) => w.id !== workflowId) }));
        try { void getCrmContainer().opportunityRepository?.deletePipeline?.(workflowId)?.catch?.(() => undefined); } catch { /* noop */ }
        syncWorkflowsToBackend(get());
        return true;
      },

      addStageToWorkflow: (workflowId, input) => {
        const wf = get().workflows.find((w) => w.id === workflowId) ?? get().workflows[0];
        const prefix = wf.entityType === "lead" ? "lead" : "default";
        const slug = input.labelEn.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || `stage_${Date.now()}`;
        const newStage: CrmWorkflowStage = {
          stageKey: input.stageKey || `${prefix}.${slug}`, labelEn: input.labelEn.trim(), labelAr: input.labelAr?.trim() || input.labelEn.trim(),
          sortOrder: wf.stages.length + 1, category: "in_progress", winProbabilityPercent: input.winProbabilityPercent ?? 50,
          requiredExitFields: input.requiredExitFields ?? (input.requiresVerifiedParty ? ["partyId"] : []),
          requiresVerifiedParty: Boolean(input.requiresVerifiedParty),
          triggerDealConversion: Boolean(input.triggerDealConversion || input.triggersDealConversion),
          triggersDealConversion: Boolean(input.triggerDealConversion || input.triggersDealConversion),
        };
        get().saveWorkflow({ ...wf, stages: [...wf.stages, newStage] });
        return newStage;
      },

      updateStageInWorkflow: (workflowId, stageKey, patch) => {
        const wf = get().workflows.find((w) => w.id === workflowId);
        if (wf) get().saveWorkflow({ ...wf, stages: wf.stages.map((s) => (s.stageKey === stageKey ? { ...s, ...patch } : s)) });
      },

      deleteStageFromWorkflow: (workflowId, stageKey) => {
        const wf = get().workflows.find((w) => w.id === workflowId);
        if (!wf || wf.stages.length <= 2) return false;
        get().saveWorkflow({ ...wf, stages: wf.stages.filter((s) => s.stageKey !== stageKey), transitions: wf.transitions.filter((t) => t.fromStageKey !== stageKey && t.toStageKey !== stageKey) });
        return true;
      },

      replaceAndDeleteStageFromWorkflow: (workflowId, stageKeyToRemove, replacementStageKey) => {
        const wf = get().workflows.find((w) => w.id === workflowId);
        if (!wf || wf.stages.length <= 2 || stageKeyToRemove === replacementStageKey || !wf.stages.some((s) => s.stageKey === replacementStageKey)) return false;
        try { void getCrmContainer().opportunityRepository?.replacePipelineStage?.(workflowId, stageKeyToRemove, replacementStageKey)?.catch?.(() => undefined); } catch { /* noop */ }
        const rewiredTransitions = wf.transitions
          .map((t) => ({
            ...t,
            fromStageKey: t.fromStageKey === stageKeyToRemove ? replacementStageKey : t.fromStageKey,
            toStageKey: t.toStageKey === stageKeyToRemove ? replacementStageKey : t.toStageKey,
            fromStageKeys: t.fromStageKeys ? Array.from(new Set(t.fromStageKeys.map((k) => (k === stageKeyToRemove ? replacementStageKey : k)))) : undefined,
          }))
          .filter((t) => t.fromStageKey !== t.toStageKey);
        get().saveWorkflow({ ...wf, stages: wf.stages.filter((s) => s.stageKey !== stageKeyToRemove), transitions: rewiredTransitions });
        return true;
      },

      addTransition: (workflowId, input) => {
        const wf = get().workflows.find((w) => w.id === workflowId) ?? get().workflows[0];
        const fromOrd = wf.stages.find((s) => s.stageKey === input.fromStageKey)?.sortOrder ?? 0;
        const toOrd = wf.stages.find((s) => s.stageKey === input.toStageKey)?.sortOrder ?? 0;
        const dir = input.fromStageKey === "*" ? "global" : toOrd < fromOrd ? "backward" : "forward";
        const tr = makeWorkflowTransition(`tr-${Date.now()}`, input.fromStageKey, input.toStageKey, dir, input.nameEn, input.nameAr || input.nameEn, { ...input.rules, fromStageKeys: input.fromStageKeys });
        get().saveWorkflow({ ...wf, transitions: [...wf.transitions, tr] });
        return tr;
      },

      updateTransitionRules: (workflowId, transitionId, patch, metaPatch) => {
        const wf = get().workflows.find((w) => w.id === workflowId);
        if (wf) get().saveWorkflow({ ...wf, transitions: wf.transitions.map((t) => (t.id === transitionId ? { ...t, ...metaPatch, rules: { ...t.rules, ...patch } } : t)) });
      },

      deleteTransition: (workflowId, transitionId) => {
        const wf = get().workflows.find((w) => w.id === workflowId);
        if (wf) get().saveWorkflow({ ...wf, transitions: wf.transitions.filter((t) => t.id !== transitionId) });
      },

      syncBackendDealPipeline: (backendPipe) => {
        if (!backendPipe.stages || backendPipe.stages.length < 2) return;
        set((state) => ({
          workflows: state.workflows.map((w) => {
            if (w.id !== "wf-deal-default") return w;
            const allUniform50OrNull = backendPipe.stages.length >= 3 && backendPipe.stages.every((st: any) => (st.winProbabilityPercent ?? st.probabilityPercent ?? 50) === 50);
            const syncedStages: CrmWorkflowStage[] = backendPipe.stages.slice().sort((a, b) => a.sortOrder - b.sortOrder).map((s: any, idx) => {
              const prevStage = w.stages.find((ps) => ps.stageKey === s.stageKey);
              const canonicalMeta = CANONICAL_DEFAULT_STAGE_META[s.stageKey];
              const rawProb = s.winProbabilityPercent ?? s.probabilityPercent;
              const resolvedProb = rawProb == null || allUniform50OrNull ? Number(prevStage?.winProbabilityPercent ?? canonicalMeta?.prob ?? 50) : Number(rawProb);
              const resolvedSla = s.slaDays ?? s.slaTargetDays ?? prevStage?.slaDays ?? canonicalMeta?.sla;
              return {
                stageKey: s.stageKey, labelEn: s.labelEn, labelAr: s.labelAr || s.labelEn, sortOrder: s.sortOrder || idx + 1,
                category: s.statusCategory || prevStage?.category || (idx === 0 ? "todo" : "in_progress"), color: s.color || prevStage?.color,
                winProbabilityPercent: resolvedProb, slaDays: resolvedSla, requiredExitFields: s.requiredExitFields ? [...s.requiredExitFields] : [],
                requiresVerifiedParty: Boolean(s.requiredExitFields?.includes("partyId")), triggerDealConversion: Boolean(s.triggerDealConversion),
              };
            });
            let syncedTransitions = w.transitions;
            if (backendPipe.transitionsJson) {
              try {
                const parsed = JSON.parse(backendPipe.transitionsJson);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  const qualHasSolFit = syncedStages.find((s) => s.stageKey === "default.qualification")?.requiredExitFields.includes("solutionFitConfirmed");
                  syncedTransitions = parsed.map((tr: CrmWorkflowTransition) =>
                    tr.fromStageKey === "default.qualification" && tr.toStageKey === "default.solution_fit" && !qualHasSolFit && tr.rules?.requiredFieldKeys?.includes("solutionFitConfirmed")
                      ? { ...tr, rules: { ...tr.rules, requiredFieldKeys: tr.rules.requiredFieldKeys.filter((k) => k !== "solutionFitConfirmed") } }
                      : tr
                  );
                }
              } catch { /* keep */ }
            }
            return { ...w, nameEn: backendPipe.nameEn || w.nameEn, nameAr: backendPipe.nameAr || w.nameAr, version: backendPipe.version ?? w.version, stages: syncedStages, transitions: syncedTransitions };
          }),
        }));
      },

      hydrateFromServerPayload: (payload) => {
        if (!Array.isArray(payload.workflows) || payload.workflows.length === 0) return;
        set((state) => ({
          workflows: payload.workflows!,
          activeDealWorkflowId: payload.activeDealWorkflowId || state.activeDealWorkflowId,
          activeLeadWorkflowId: payload.activeLeadWorkflowId || state.activeLeadWorkflowId,
        }));
      },

      hydrateFromBackendPipelines: (backendPipelines) => {
        if (!Array.isArray(backendPipelines) || backendPipelines.length === 0) return;
        set((state) => mergeBackendPipelinesIntoState(state, backendPipelines));
      },

      evaluateTransition: (entityType, fromStageKey, toStageKey, recordContext) =>
        evaluateWorkflowTransition(get().getActiveWorkflow(entityType), fromStageKey, toStageKey, recordContext),

      resetDefaults: () => set({ workflows: INITIAL_CRM_WORKFLOWS, activeDealWorkflowId: "wf-deal-default", activeLeadWorkflowId: "wf-lead-default" }),
      resetWorkflows: () => set({ workflows: INITIAL_CRM_WORKFLOWS, activeDealWorkflowId: "wf-deal-default", activeLeadWorkflowId: "wf-lead-default" }),
    }),
    { name: "scripe-crm-workflows-v2" }
  )
);
