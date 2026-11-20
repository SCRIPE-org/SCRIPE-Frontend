"use client";

import { create } from "zustand";
import { getCrmContainer } from "@modules/crm/di";
import type { CrmWorkflowEntityType } from "@modules/crm/shared";
import type { PipelineDefinition } from "../../domain/models/crm-workflow.types";
import {
  INITIAL_CRM_WORKFLOWS,
  evaluateWorkflowTransition,
  makeWorkflowTransition,
  type CrmWorkflowDefinition,
  type CrmWorkflowStage,
  type CrmWorkflowTransition,
  type EvaluatedWorkflowTransition,
  type RecordTransitionContext,
} from "../../domain/constants/crmWorkflowDefaults";
import {
  hasAuthenticatedCrmSession,
  mergeBackendPipelinesIntoState,
  runWorkflowRepoAction,
  syncWorkflowsToBackend,
} from "../utils/crmWorkflowsStoreHelpers";
import { applyBackendDefaultDealPipelineSync } from "../utils/crmWorkflowsAuthAndConfigHelpers";
import {
  buildClonedWorkflowDef,
  buildNewStageForWorkflow,
  buildNewWorkflowDef,
  rewireTransitionsOnStageReplace,
} from "../utils/crmWorkflowsActionHelpers";

export * from "../../domain/constants/crmWorkflowDefaults";
export * from "../utils/crmWorkflowsStoreHelpers";

/** In-memory Zustand store state and actions for dynamic CRM Deal and Lead workflows. */
export interface CrmWorkflowsState {
  workflows: CrmWorkflowDefinition[];
  activeDealWorkflowId: string;
  activeLeadWorkflowId: string;
  isHydrating: boolean;
  syncError: string | null;
  clearSyncError: () => void;
  getActiveWorkflow: (entityType: CrmWorkflowEntityType) => CrmWorkflowDefinition;
  setActiveWorkflow: (idOrEntity: string, maybeWorkflowId?: string) => void;
  saveWorkflow: (workflow: CrmWorkflowDefinition) => CrmWorkflowDefinition;
  saveWorkflowAndSync: (workflow: CrmWorkflowDefinition) => Promise<CrmWorkflowDefinition>;
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
  fetchPipelinesFromBackend: () => Promise<void>;
  hydrateFromServerPayload: (payload: { workflows?: CrmWorkflowDefinition[]; activeDealWorkflowId?: string; activeLeadWorkflowId?: string }) => void;
  hydrateFromBackendPipelines: (backendPipelines: PipelineDefinition[]) => void;
  evaluateTransition: (
    entityType: CrmWorkflowEntityType, fromStageKey: string, toStageKey: string,
    recordContext?: RecordTransitionContext
  ) => EvaluatedWorkflowTransition;
  resetDefaults: () => void;
  resetWorkflows: () => void;
}

/**
 * Pure server-hydrated Zustand workflow store (no localStorage/client persistence).
 * Relational workflow definitions are fetched and persisted via `workflowRepository`.
 */
export const useCrmWorkflowsStore = create<CrmWorkflowsState>()((set, get) => {
  const reportSyncError = (msg: string) => {
    if (hasAuthenticatedCrmSession()) set({ syncError: msg });
  };

  return {
    workflows: INITIAL_CRM_WORKFLOWS,
    activeDealWorkflowId: "wf-deal-default",
    activeLeadWorkflowId: "wf-lead-default",
    isHydrating: false,
    syncError: null,
    clearSyncError: () => set({ syncError: null }),

    getActiveWorkflow: (entityType) => {
      const all = get().workflows;
      return all.find((w) => w.entityType === entityType && w.isActive) ?? all.find((w) => w.entityType === entityType) ?? INITIAL_CRM_WORKFLOWS[0];
    },

    setActiveWorkflow: (idOrEntity, maybeWorkflowId) => {
      const workflowId = maybeWorkflowId ?? idOrEntity;
      const target = get().workflows.find((w) => w.id === workflowId);
      if (!target) return;
      set((state) => ({
        syncError: null,
        activeDealWorkflowId: target.entityType === "deal" ? workflowId : state.activeDealWorkflowId,
        activeLeadWorkflowId: target.entityType === "lead" ? workflowId : state.activeLeadWorkflowId,
        workflows: state.workflows.map((w) =>
          w.entityType === target.entityType ? { ...w, isActive: w.id === workflowId, updatedAtUtc: new Date().toISOString() } : w
        ),
      }));
      runWorkflowRepoAction(() => getCrmContainer().workflowRepository?.activatePipeline?.(workflowId), "Failed to activate pipeline.", reportSyncError);
      void syncWorkflowsToBackend(get(), { ...target, isActive: true }, reportSyncError, getCrmContainer().workflowRepository);
    },

    saveWorkflow: (updated) => {
      const normalizedStages = [...updated.stages].sort((a, b) => a.sortOrder - b.sortOrder).map((s, idx) => ({ ...s, sortOrder: idx + 1 }));
      const saved: CrmWorkflowDefinition = { ...updated, stages: normalizedStages, updatedAtUtc: new Date().toISOString() };
      set((state) => {
        const exists = state.workflows.some((w) => w.id === saved.id);
        return { syncError: null, workflows: exists ? state.workflows.map((w) => (w.id === saved.id ? saved : w)) : [...state.workflows, saved] };
      });
      void syncWorkflowsToBackend(get(), saved, reportSyncError, getCrmContainer().workflowRepository);
      return saved;
    },

    saveWorkflowAndSync: async (updated) => {
      const saved = get().saveWorkflow(updated);
      await syncWorkflowsToBackend(get(), saved, reportSyncError, getCrmContainer().workflowRepository);
      return saved;
    },

    createWorkflow: (input) => {
      const created = buildNewWorkflowDef(get().workflows, input);
      set((state) => ({ syncError: null, workflows: [...state.workflows, created] }));
      void syncWorkflowsToBackend(get(), created, reportSyncError, getCrmContainer().workflowRepository);
      return created;
    },

    cloneWorkflow: (workflowId, customNameEn, customNameAr) => {
      const src = get().workflows.find((w) => w.id === workflowId) ?? INITIAL_CRM_WORKFLOWS[0];
      const cloned = buildClonedWorkflowDef(src, customNameEn, customNameAr);
      set((state) => ({ syncError: null, workflows: [...state.workflows, cloned] }));
      void syncWorkflowsToBackend(get(), cloned, reportSyncError, getCrmContainer().workflowRepository);
      return cloned;
    },

    deleteWorkflow: (workflowId) => {
      const target = get().workflows.find((w) => w.id === workflowId);
      if (!target || target.isActive) return false;
      set((state) => ({ syncError: null, workflows: state.workflows.filter((w) => w.id !== workflowId) }));
      runWorkflowRepoAction(() => getCrmContainer().workflowRepository?.deletePipeline?.(workflowId), "Failed to delete pipeline.", reportSyncError);
      void syncWorkflowsToBackend(get(), undefined, reportSyncError, getCrmContainer().workflowRepository);
      return true;
    },

    addStageToWorkflow: (workflowId, input) => {
      const wf = get().workflows.find((w) => w.id === workflowId) ?? get().workflows[0];
      const newStage = buildNewStageForWorkflow(wf, input);
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
      runWorkflowRepoAction(() => getCrmContainer().workflowRepository?.replacePipelineStage?.(workflowId, stageKeyToRemove, replacementStageKey), "Failed to replace pipeline stage.", reportSyncError);
      const rewired = rewireTransitionsOnStageReplace(wf.transitions, stageKeyToRemove, replacementStageKey);
      get().saveWorkflow({ ...wf, stages: wf.stages.filter((s) => s.stageKey !== stageKeyToRemove), transitions: rewired });
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
      set((state) => ({ workflows: applyBackendDefaultDealPipelineSync(state.workflows, backendPipe) }));
    },

    fetchPipelinesFromBackend: async () => {
      if (!hasAuthenticatedCrmSession()) return;
      set({ isHydrating: true, syncError: null });
      try {
        const container = getCrmContainer();
        if (container.workflowRepository?.getPipelines) {
          const pipes = await container.workflowRepository.getPipelines();
          if (Array.isArray(pipes) && pipes.length > 0) {
            set((state) => mergeBackendPipelinesIntoState(state, pipes));
          }
        }
      } catch (err: unknown) {
        reportSyncError(err instanceof Error ? err.message : "Failed to load workflows from server.");
      } finally {
        set({ isHydrating: false });
      }
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

    resetDefaults: () => set({ workflows: INITIAL_CRM_WORKFLOWS, activeDealWorkflowId: "wf-deal-default", activeLeadWorkflowId: "wf-lead-default", syncError: null }),
    resetWorkflows: () => set({ workflows: INITIAL_CRM_WORKFLOWS, activeDealWorkflowId: "wf-deal-default", activeLeadWorkflowId: "wf-lead-default", syncError: null }),
  };
});
