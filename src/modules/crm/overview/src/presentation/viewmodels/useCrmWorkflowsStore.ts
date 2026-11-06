"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getCrmContainer } from "../../../../di";
import {
  INITIAL_CRM_WORKFLOWS,
  evaluateWorkflowTransition,
  makeWorkflowTransition,
  resolveDefaultStageColor,
  type CrmBuyingCommitteeRoleOption,
  type CrmScopedRoleDefinition,
  type CrmStageColorToken,
  type CrmWorkflowDefinition,
  type CrmWorkflowEntityType,
  type CrmWorkflowStage,
  type CrmWorkflowTransition,
  type EvaluatedWorkflowTransition,
} from "../../domain/constants/crmWorkflowDefaults";
import {
  useCrmSettingsStore,
  type CrmConfigurableOptionItem,
  type CrmCustomFieldDefinition,
} from "./useCrmSettingsStore";

export * from "../../domain/constants/crmWorkflowDefaults";
export * from "../utils/crmStageColorUtils";

/** Commercial quote line item persisted in backend tenant settings per deal. */
export interface CrmDealQuoteLineItem {
  id: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  discountPct: number;
}

/** Server-persisted deal commercial package (quote items + Venue/Academy provisioning state). */
export interface CrmDealCommercialPackage {
  quoteItems: CrmDealQuoteLineItem[];
  venueHoldStatus: "idle" | "reserved";
  academyCohortStatus: "idle" | "provisioned";
}

/** Envelope stored inside CrmTenantSettings.CustomFieldsConfigJson to persist custom fields & scoped roles in PostgreSQL. */
export interface CrmTenantCustomConfigEnvelope {
  customFields: CrmCustomFieldDefinition[];
  crmRoles?: CrmScopedRoleDefinition[];
  buyingCommitteeRoles?: CrmBuyingCommitteeRoleOption[];
  configuredLossReasons?: CrmConfigurableOptionItem[];
  configuredActivityTypes?: CrmConfigurableOptionItem[];
  dealCommercialPackages?: Record<string, CrmDealCommercialPackage>;
}

/** Serializes CRM custom fields, scoped roles, and deal commercial packages into CrmTenantSettings.CustomFieldsConfigJson (workflows are persisted relationally in crm.crm_pipelines). */
export function serializeCrmTenantCustomConfig(
  customFields: CrmCustomFieldDefinition[],
  crmRoles?: CrmScopedRoleDefinition[],
  buyingCommitteeRoles?: CrmBuyingCommitteeRoleOption[],
  configuredLossReasons?: CrmConfigurableOptionItem[],
  configuredActivityTypes?: CrmConfigurableOptionItem[],
  dealCommercialPackages?: Record<string, CrmDealCommercialPackage>
): string {
  const settingsState = useCrmSettingsStore.getState();
  return JSON.stringify({
    customFields,
    crmRoles: crmRoles ?? settingsState.crmRoles,
    buyingCommitteeRoles: buyingCommitteeRoles ?? settingsState.buyingCommitteeRoles,
    configuredLossReasons: configuredLossReasons ?? settingsState.configuredLossReasons,
    configuredActivityTypes: configuredActivityTypes ?? settingsState.configuredActivityTypes,
    dealCommercialPackages: dealCommercialPackages ?? settingsState.dealCommercialPackages,
  });
}

const CANONICAL_DEFAULT_STAGE_META: Record<string, { prob: number; sla: number }> = {
  "default.discovery": { prob: 10, sla: 7 },
  "default.qualification": { prob: 25, sla: 10 },
  "default.solution_fit": { prob: 50, sla: 14 },
  "default.proposal": { prob: 75, sla: 14 },
  "default.negotiation": { prob: 90, sla: 21 },
  "default.closed_won": { prob: 100, sla: 0 },
  "terminal-won": { prob: 100, sla: 0 },
  "default.closed_lost": { prob: 0, sla: 0 },
  "terminal-lost": { prob: 0, sla: 0 },
};

/** Synchronizes the current workflows state into relational /api/v1/crm/pipelines on PostgreSQL. */
function syncWorkflowsToBackend(
  wfState: { workflows: CrmWorkflowDefinition[]; activeDealWorkflowId: string; activeLeadWorkflowId: string },
  targetWf?: CrmWorkflowDefinition
): void {
  try {
    const container = getCrmContainer();
    const dealWf = wfState.workflows.find((w) => w.id === wfState.activeDealWorkflowId || w.id === "wf-deal-default");
    if (!targetWf && dealWf && dealWf.stages.length >= 2) {
      void container.opportunityRepository?.updateDefaultPipeline?.({
        nameEn: dealWf.nameEn, nameAr: dealWf.nameAr, transitionsJson: JSON.stringify(dealWf.transitions),
        expectedRowVersion: "auto", allowDynamicStages: true,
        stages: dealWf.stages.map((s, idx) => ({
          stageKey: s.stageKey as never, sortOrder: idx + 1, labelEn: s.labelEn, labelAr: s.labelAr,
          winProbabilityPercent: s.winProbabilityPercent, slaTargetDays: s.slaDays ?? null, requiredExitFields: s.requiredExitFields,
          triggerDealConversion: Boolean(s.triggerDealConversion || s.triggersDealConversion),
        })),
      })?.catch?.((err: unknown) => {
        if (process.env.NODE_ENV !== "test") console.warn("[CRM Workflows] Default pipeline sync warning:", err);
      });
    }
    if (targetWf && targetWf.stages.length >= 2) {
      void container.opportunityRepository?.savePipeline?.(targetWf.id, {
        nameEn: targetWf.nameEn, nameAr: targetWf.nameAr, entityType: targetWf.entityType, isActive: targetWf.isActive,
        transitionsJson: JSON.stringify(targetWf.transitions), expectedRowVersion: "auto", allowDynamicStages: true,
        stages: targetWf.stages.map((s, idx) => ({
          stageKey: s.stageKey as never, sortOrder: idx + 1, labelEn: s.labelEn, labelAr: s.labelAr,
          statusCategory: s.category,
          winProbabilityPercent: s.winProbabilityPercent, slaTargetDays: s.slaDays ?? null, requiredExitFields: s.requiredExitFields,
          triggerDealConversion: Boolean(s.triggerDealConversion || s.triggersDealConversion),
          propertiesJson: JSON.stringify({
            ...(s.properties ?? {}),
            ...(s.color ? { color: s.color } : {}),
            ...(s.customColorHex ? { customColorHex: s.customColorHex } : {}),
          }),
          canvasX: s.position?.x ?? null,
          canvasY: s.position?.y ?? null,
        })),
      })?.catch?.((err: unknown) => {
        if (process.env.NODE_ENV !== "test") console.warn("[CRM Workflows] Relational pipeline sync warning:", err);
      });
    }
  } catch { /* fallback to local persisted store when offline or in isolated unit tests */ }
}

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
        try {
          void getCrmContainer().opportunityRepository?.activatePipeline?.(workflowId)?.catch?.(() => undefined);
        } catch { /* ignore in isolated test */ }
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
                { stageKey: "lead.new", labelEn: "New", labelAr: "جديد", sortOrder: 1, category: "todo", winProbabilityPercent: 20, requiredExitFields: [] },
                { stageKey: "lead.converted", labelEn: "Converted", labelAr: "تم التحويل", sortOrder: 2, category: "done", winProbabilityPercent: 100, requiredExitFields: [], triggerDealConversion: true, triggersDealConversion: true },
              ]
            : [
                { stageKey: "default.discovery", labelEn: "Discovery", labelAr: "استكشاف", sortOrder: 1, category: "todo", winProbabilityPercent: 25, requiredExitFields: [] },
                { stageKey: "default.proposal", labelEn: "Proposal & Closing", labelAr: "العرض والإغلاق", sortOrder: 2, category: "in_progress", winProbabilityPercent: 80, requiredExitFields: ["partyId"], requiresVerifiedParty: true },
              ];
        const defaultTransitions: CrmWorkflowTransition[] = template
          ? template.transitions.map((t, idx) => ({ ...t, id: `tr-${Date.now()}-${idx}`, rules: { ...t.rules } }))
          : [
              makeWorkflowTransition(`tr-${Date.now()}-1`, defaultStages[0].stageKey, defaultStages[1].stageKey, "forward", `Advance to ${defaultStages[1].labelEn}`, `الانتقال إلى ${defaultStages[1].labelAr}`, {
                triggerDealConversion: Boolean(defaultStages[1].triggerDealConversion),
                requireVerifiedParty: Boolean(defaultStages[1].requiresVerifiedParty),
              }),
              makeWorkflowTransition(`tr-${Date.now()}-2`, defaultStages[1].stageKey, defaultStages[0].stageKey, "backward", `Return to ${defaultStages[0].labelEn}`, `العودة إلى ${defaultStages[0].labelAr}`),
            ];
        const created: CrmWorkflowDefinition = {
          id, code: `${entityType}.custom_${Date.now()}`, entityType,
          nameEn: nameEn.trim() || "Custom CRM Workflow", nameAr: nameAr?.trim() || nameEn.trim() || "مسار مخصص",
          descriptionEn: descriptionEn || "Custom tenant workflow created in SCRIPE Workflow Studio.",
          descriptionAr: descriptionAr || "مسار عمل مخصص تم إنشاؤه في استوديو مسارات العمل.",
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
          nameEn: customNameEn || `${src.nameEn} (Copy)`, nameAr: customNameAr || `${src.nameAr} (نسخة)`,
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
        try {
          void getCrmContainer().opportunityRepository?.deletePipeline?.(workflowId)?.catch?.(() => undefined);
        } catch { /* ignore in isolated test */ }
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
        if (!wf || wf.stages.length <= 2 || stageKeyToRemove === replacementStageKey) return false;
        if (!wf.stages.some((s) => s.stageKey === replacementStageKey)) return false;
        try {
          void getCrmContainer().opportunityRepository?.replacePipelineStage?.(workflowId, stageKeyToRemove, replacementStageKey)?.catch?.(() => undefined);
        } catch { /* ignore in isolated test */ }
        const rewiredTransitions = wf.transitions
          .map((t) => {
            const nextFrom = t.fromStageKey === stageKeyToRemove ? replacementStageKey : t.fromStageKey;
            const nextTo = t.toStageKey === stageKeyToRemove ? replacementStageKey : t.toStageKey;
            const nextFromKeys = t.fromStageKeys
              ? Array.from(new Set(t.fromStageKeys.map((k) => (k === stageKeyToRemove ? replacementStageKey : k))))
              : undefined;
            return { ...t, fromStageKey: nextFrom, toStageKey: nextTo, fromStageKeys: nextFromKeys };
          })
          .filter((t) => t.fromStageKey !== t.toStageKey);
        get().saveWorkflow({
          ...wf,
          stages: wf.stages.filter((s) => s.stageKey !== stageKeyToRemove),
          transitions: rewiredTransitions,
        });
        return true;
      },

      addTransition: (workflowId, input) => {
        const wf = get().workflows.find((w) => w.id === workflowId) ?? get().workflows[0];
        const fromOrd = wf.stages.find((s) => s.stageKey === input.fromStageKey)?.sortOrder ?? 0;
        const toOrd = wf.stages.find((s) => s.stageKey === input.toStageKey)?.sortOrder ?? 0;
        const dir = input.fromStageKey === "*" ? "global" : toOrd < fromOrd ? "backward" : "forward";
        const tr = makeWorkflowTransition(`tr-${Date.now()}`, input.fromStageKey, input.toStageKey, dir, input.nameEn, input.nameAr || input.nameEn, {
          ...input.rules,
          fromStageKeys: input.fromStageKeys,
        });
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
            const allUniform50OrNull =
              backendPipe.stages.length >= 3 &&
              backendPipe.stages.every(
                (st: any) => (st.winProbabilityPercent ?? st.probabilityPercent ?? 50) === 50
              );
            const syncedStages: CrmWorkflowStage[] = backendPipe.stages
              .slice()
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((s: any, idx) => {
                const prevStage = w.stages.find((ps) => ps.stageKey === s.stageKey);
                const canonicalMeta = CANONICAL_DEFAULT_STAGE_META[s.stageKey];
                const rawProb = s.winProbabilityPercent ?? s.probabilityPercent;
                const resolvedProb =
                  rawProb == null || allUniform50OrNull
                    ? Number(prevStage?.winProbabilityPercent ?? canonicalMeta?.prob ?? 50)
                    : Number(rawProb);
                const resolvedSla =
                  s.slaDays ?? s.slaTargetDays ?? prevStage?.slaDays ?? canonicalMeta?.sla;
                return {
                  stageKey: s.stageKey,
                  labelEn: s.labelEn,
                  labelAr: s.labelAr || s.labelEn,
                  sortOrder: s.sortOrder || idx + 1,
                  category: s.statusCategory || prevStage?.category || (idx === 0 ? "todo" : "in_progress"),
                  color: s.color || prevStage?.color,
                  winProbabilityPercent: resolvedProb,
                  slaDays: resolvedSla,
                  requiredExitFields: s.requiredExitFields ? [...s.requiredExitFields] : [],
                  requiresVerifiedParty: Boolean(s.requiredExitFields?.includes("partyId")),
                  triggerDealConversion: Boolean(s.triggerDealConversion),
                };
              });
            let syncedTransitions = w.transitions;
            if (backendPipe.transitionsJson) {
              try { const parsed = JSON.parse(backendPipe.transitionsJson); if (Array.isArray(parsed) && parsed.length > 0) syncedTransitions = parsed; } catch { /* keep */ }
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
        const codeToId: Record<string, string> = {
          default: "wf-deal-default",
          "deal.fast_track": "wf-deal-fast-track",
          "deal.sports_sponsorship": "wf-deal-sponsorship",
          "deal.academy_enrollment": "wf-deal-academy-enrollment",
          "deal.venue_block_booking": "wf-deal-venue-booking",
          "lead.default": "wf-lead-default",
          "lead.two_stage": "wf-lead-2stage-fast",
          "lead.three_stage_deal": "wf-lead-custom-3stage",
          "lead.standalone_manual": "wf-lead-standalone-manual",
        };
        set((state) => {
          const nextWorkflows = [...state.workflows];
          let nextActiveDealId = state.activeDealWorkflowId;
          let nextActiveLeadId = state.activeLeadWorkflowId;
          for (const bp of backendPipelines) {
            if (!Array.isArray(bp.stages) || bp.stages.length < 2) continue;
            const wfId = codeToId[bp.code || bp.key || ""] || bp.code || bp.key || bp.id || "";
            if (!wfId) continue;
            const entityType: CrmWorkflowEntityType =
              (bp as any).entityType === "lead" || wfId.includes("lead") ? "lead" : "deal";
            const existingIdx = nextWorkflows.findIndex((w) => w.id === wfId || w.code === (bp.code || bp.key));
            const curWf = existingIdx >= 0 ? nextWorkflows[existingIdx] : undefined;
            const allUniform50OrNull =
              wfId === "wf-deal-default" &&
              bp.stages.length >= 3 &&
              bp.stages.every(
                (st: any) => (st.winProbabilityPercent ?? st.probabilityPercent ?? 50) === 50
              );
            const mappedStages: CrmWorkflowStage[] = bp.stages
              .slice()
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((s: any, idx: number) => {
                let parsedProps: Record<string, string> = {};
                if (s.propertiesJson && typeof s.propertiesJson === "string") {
                  try {
                    const p = JSON.parse(s.propertiesJson);
                    if (p && typeof p === "object") parsedProps = p;
                  } catch { /* ignore */ }
                }
                const prevStage = curWf?.stages.find((ps) => ps.stageKey === s.stageKey);
                const canonicalMeta = CANONICAL_DEFAULT_STAGE_META[s.stageKey];
                const category = s.statusCategory || prevStage?.category || (idx === 0 ? "todo" : "in_progress");
                const color: CrmStageColorToken = resolveDefaultStageColor(
                  s.stageKey,
                  category,
                  s.sortOrder || idx + 1,
                  parsedProps.color || s.color || prevStage?.color
                );
                const customColorHex = parsedProps.customColorHex || s.customColorHex || prevStage?.customColorHex;
                const rawProb = s.winProbabilityPercent ?? s.probabilityPercent;
                const resolvedProb =
                  rawProb == null || allUniform50OrNull
                    ? Number(canonicalMeta?.prob ?? prevStage?.winProbabilityPercent ?? 50)
                    : Number(rawProb);
                const resolvedSla =
                  s.slaDays ?? s.slaTargetDays ?? prevStage?.slaDays ?? canonicalMeta?.sla;
                return {
                  stageKey: s.stageKey,
                  labelEn: s.labelEn,
                  labelAr: s.labelAr || s.labelEn,
                  sortOrder: s.sortOrder || idx + 1,
                  category,
                  color,
                  customColorHex,
                  winProbabilityPercent: resolvedProb,
                  slaDays: resolvedSla,
                  requiredExitFields: s.requiredExitFields ? [...s.requiredExitFields] : [],
                  requiresVerifiedParty:
                    category !== "lost" &&
                    s.stageKey !== "terminal-lost" &&
                    Boolean(s.requiresVerifiedParty || s.requiredExitFields?.includes("partyId")),
                  triggerDealConversion: Boolean(s.triggerDealConversion),
                  triggersDealConversion: Boolean(s.triggerDealConversion),
                  properties: Object.keys(parsedProps).length > 0 ? parsedProps : prevStage?.properties,
                  position:
                    typeof s.canvasX === "number" && typeof s.canvasY === "number"
                      ? { x: s.canvasX, y: s.canvasY }
                      : prevStage?.position,
                };
              });
            let mappedTransitions: CrmWorkflowTransition[] = [];
            if (bp.transitionsJson) {
              try {
                const parsed = JSON.parse(bp.transitionsJson);
                if (Array.isArray(parsed)) mappedTransitions = parsed;
              } catch { /* ignore */ }
            }
            if (bp.isDefault) {
              if (entityType === "lead") nextActiveLeadId = wfId;
              else nextActiveDealId = wfId;
            }
            if (existingIdx >= 0) {
              const cur = nextWorkflows[existingIdx];
              nextWorkflows[existingIdx] = {
                ...cur,
                nameEn: bp.nameEn || bp.name || cur.nameEn,
                nameAr: bp.nameAr || cur.nameAr,
                isActive: bp.isDefault !== undefined ? Boolean(bp.isDefault) : cur.isActive,
                version: Math.max(bp.version ?? 1, cur.version ?? 1),
                stages: mappedStages,
                transitions: mappedTransitions.length > 0 ? mappedTransitions : cur.transitions,
              };
            } else {
              nextWorkflows.push({
                id: wfId,
                code: bp.code || bp.key || wfId,
                entityType,
                nameEn: bp.nameEn || bp.name || wfId,
                nameAr: bp.nameAr || bp.nameEn || wfId,
                descriptionEn: "Relational CRM Pipeline",
                descriptionAr: "مسار عمللائحة CRM",
                isActive: Boolean(bp.isDefault),
                isTemplate: false,
                version: bp.version ?? 1,
                stages: mappedStages,
                transitions: mappedTransitions,
                updatedAtUtc: new Date().toISOString(),
              });
            }
          }
          return {
            workflows: nextWorkflows,
            activeDealWorkflowId: nextActiveDealId,
            activeLeadWorkflowId: nextActiveLeadId,
          };
        });
      },

      evaluateTransition: (entityType, fromStageKey, toStageKey, recordContext) =>
        evaluateWorkflowTransition(get().getActiveWorkflow(entityType), fromStageKey, toStageKey, recordContext),

      resetDefaults: () => set({ workflows: INITIAL_CRM_WORKFLOWS, activeDealWorkflowId: "wf-deal-default", activeLeadWorkflowId: "wf-lead-default" }),
      resetWorkflows: () => set({ workflows: INITIAL_CRM_WORKFLOWS, activeDealWorkflowId: "wf-deal-default", activeLeadWorkflowId: "wf-lead-default" }),
    }),
    { name: "scripe-crm-workflows-v2" }
  )
);

