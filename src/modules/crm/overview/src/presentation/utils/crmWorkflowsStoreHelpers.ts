import { getCrmContainer } from "@modules/crm/di";
import {
  DEFAULT_NEW_WORKFLOW_META,
  type CrmDealCommercialPackage,
  type CrmDealQuoteLineItem,
  type CrmConfigurableOptionItem,
  type CrmCustomFieldDefinition,
} from "../../domain/constants/crmSettingsDefaults";
import {
  resolveDefaultStageColor,
  type CrmBuyingCommitteeRoleOption,
  type CrmScopedRoleDefinition,
  type CrmStageColorToken,
  type CrmWorkflowDefinition,
  type CrmWorkflowEntityType,
  type CrmWorkflowStage,
  type CrmWorkflowTransition,
} from "../../domain/constants/crmWorkflowDefaults";
import { useCrmSettingsStore } from "../stores/useCrmSettingsStore";

export type { CrmDealCommercialPackage, CrmDealQuoteLineItem };

/** Envelope stored inside CrmTenantSettings.CustomFieldsConfigJson to persist custom fields & scoped roles in PostgreSQL. */
export interface CrmTenantCustomConfigEnvelope {
  customFields: CrmCustomFieldDefinition[];
  crmRoles?: CrmScopedRoleDefinition[];
  buyingCommitteeRoles?: CrmBuyingCommitteeRoleOption[];
  configuredLossReasons?: CrmConfigurableOptionItem[];
  configuredActivityTypes?: CrmConfigurableOptionItem[];
  dealCommercialPackages?: Record<string, CrmDealCommercialPackage>;
}

/** Serializes CRM custom fields, scoped roles, and deal commercial packages into CrmTenantSettings.CustomFieldsConfigJson. */
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

export const CANONICAL_DEFAULT_STAGE_META: Record<string, { prob: number; sla: number }> = {
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
export function syncWorkflowsToBackend(
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

/** Maps relational backend pipelines into the store's workflow definitions. */
export function mergeBackendPipelinesIntoState(
  state: { workflows: CrmWorkflowDefinition[]; activeDealWorkflowId: string; activeLeadWorkflowId: string },
  backendPipelines: any[]
) {
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
      .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
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
        if (Array.isArray(parsed)) {
          const qualHasSolFit = mappedStages.find((s) => s.stageKey === "default.qualification")?.requiredExitFields.includes("solutionFitConfirmed");
          mappedTransitions = parsed.map((tr: CrmWorkflowTransition) =>
            tr.fromStageKey === "default.qualification" && tr.toStageKey === "default.solution_fit" && !qualHasSolFit && tr.rules?.requiredFieldKeys?.includes("solutionFitConfirmed")
              ? { ...tr, rules: { ...tr.rules, requiredFieldKeys: tr.rules.requiredFieldKeys.filter((k) => k !== "solutionFitConfirmed") } }
              : tr
          );
        }
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
        descriptionEn: DEFAULT_NEW_WORKFLOW_META.relationalPipelineDescEn,
        descriptionAr: DEFAULT_NEW_WORKFLOW_META.relationalPipelineDescAr,
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
}
