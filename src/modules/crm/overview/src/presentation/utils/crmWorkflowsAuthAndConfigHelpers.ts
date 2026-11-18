import { secureTokenService } from "@core/common/secure-token-service";
import { useAppStore } from "@core/store/useAppStore";
import type {
  CrmDealCommercialPackage,
  CrmDealQuoteLineItem,
  CrmConfigurableOptionItem,
  CrmCustomFieldDefinition,
} from "../../domain/constants/crmSettingsDefaults";
import type {
  CrmBuyingCommitteeRoleOption,
  CrmScopedRoleDefinition,
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

import { CANONICAL_DEFAULT_STAGE_META } from "./crmWorkflowsStoreHelpers";
import type { CrmWorkflowDefinition, CrmWorkflowStage, CrmWorkflowTransition } from "../../domain/constants/crmWorkflowDefaults";

/** Merges a backend default deal pipeline snapshot into the local workflows array. */
export function applyBackendDefaultDealPipelineSync(
  workflows: CrmWorkflowDefinition[],
  backendPipe: {
    nameEn: string; nameAr?: string | null; version?: number; transitionsJson?: string | null;
    stages: Array<{ stageKey: string; labelEn: string; labelAr?: string | null; sortOrder: number; winProbabilityPercent?: number | null; requiredExitFields?: string[]; triggerDealConversion?: boolean }>;
  }
): CrmWorkflowDefinition[] {
  return workflows.map((w) => {
    if (w.id !== "wf-deal-default") return w;
    const allUniform50OrNull =
      backendPipe.stages.length >= 3 &&
      backendPipe.stages.every((st: any) => (st.winProbabilityPercent ?? st.probabilityPercent ?? 50) === 50);
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
        return {
          stageKey: s.stageKey, labelEn: s.labelEn, labelAr: s.labelAr || s.labelEn,
          sortOrder: s.sortOrder || idx + 1,
          category: s.statusCategory || prevStage?.category || (idx === 0 ? "todo" : "in_progress"),
          color: s.color || prevStage?.color,
          winProbabilityPercent: resolvedProb,
          slaDays: s.slaDays ?? s.slaTargetDays ?? prevStage?.slaDays ?? canonicalMeta?.sla,
          requiredExitFields: s.requiredExitFields ? [...s.requiredExitFields] : [],
          requiresVerifiedParty: Boolean(s.requiredExitFields?.includes("partyId")),
          triggerDealConversion: Boolean(s.triggerDealConversion),
        };
      });
    let syncedTransitions = w.transitions;
    if (backendPipe.transitionsJson) {
      try {
        const parsed = JSON.parse(backendPipe.transitionsJson);
        if (Array.isArray(parsed)) syncedTransitions = parsed as CrmWorkflowTransition[];
      } catch { /* keep */ }
    }
    return {
      ...w, nameEn: backendPipe.nameEn || w.nameEn, nameAr: backendPipe.nameAr || w.nameAr,
      version: backendPipe.version ?? w.version, stages: syncedStages, transitions: syncedTransitions,
    };
  });
}

const PUBLIC_CRM_SKIP_ROUTES = [
  "/login", "/signup", "/forgot-password", "/reset-password", "/not-authorized",
  "/magic-link", "/qr-approve", "/sso", "/oauth", "/authorize", "/setup-account",
  "/terms", "/privacy", "/docs", "/commercial", "/bookings/guest", "/403", "/404", "/500",
];

/** Returns true only when on a protected route with an active authenticated session or token. */
export function hasAuthenticatedCrmSession(): boolean {
  if (typeof window === "undefined") return false;
  const pathname = window.location?.pathname || "";
  if (PUBLIC_CRM_SKIP_ROUTES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return false;
  }
  if (secureTokenService.hasToken() || useAppStore.getState().isAuthenticated) return true;
  try {
    const raw = window.localStorage?.getItem("app-storage");
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { state?: { isAuthenticated?: boolean; user?: unknown } };
    return Boolean(parsed?.state?.isAuthenticated && parsed?.state?.user);
  } catch {
    return false;
  }
}
