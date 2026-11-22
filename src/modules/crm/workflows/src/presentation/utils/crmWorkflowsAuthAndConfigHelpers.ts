"use client";

import { secureTokenService } from "@core/common/secure-token-service";
import { useAppStore } from "@core/store/useAppStore";
import type {
  CrmBuyingCommitteeRoleOption,
  CrmConfigurableOptionItem,
  CrmCustomFieldDefinition,
  CrmScopedRoleDefinition,
} from "@modules/crm/shared";
import {
  DEFAULT_CONFIGURED_ACTIVITY_TYPES,
  DEFAULT_CONFIGURED_LOSS_REASONS,
  DEFAULT_SETTINGS_BUYING_COMMITTEE_ROLES,
  DEFAULT_SETTINGS_SCOPED_ROLES,
} from "@modules/crm/settings";
import {
  type CrmWorkflowDefinition,
  type CrmWorkflowStage,
  type CrmWorkflowTransition,
} from "../../domain/constants/crmWorkflowDefaults";
import { CANONICAL_DEFAULT_STAGE_META } from "./crmWorkflowsStoreHelpers";

/** Envelope stored inside CrmTenantSettings.CustomFieldsConfigJson to persist custom fields & scoped roles. */
export interface CrmTenantCustomConfigEnvelope {
  customFields: CrmCustomFieldDefinition[];
  crmRoles?: CrmScopedRoleDefinition[];
  buyingCommitteeRoles?: CrmBuyingCommitteeRoleOption[];
  configuredLossReasons?: CrmConfigurableOptionItem[];
  configuredActivityTypes?: CrmConfigurableOptionItem[];
}

/** Serializes CRM custom fields and governance dictionaries into CrmTenantSettings.CustomFieldsConfigJson. */
export function serializeCrmTenantCustomConfig(
  customFields: CrmCustomFieldDefinition[],
  crmRoles?: CrmScopedRoleDefinition[],
  buyingCommitteeRoles?: CrmBuyingCommitteeRoleOption[],
  configuredLossReasons?: CrmConfigurableOptionItem[],
  configuredActivityTypes?: CrmConfigurableOptionItem[]
): string {
  return JSON.stringify({
    customFields,
    crmRoles: crmRoles ?? DEFAULT_SETTINGS_SCOPED_ROLES,
    buyingCommitteeRoles: buyingCommitteeRoles ?? DEFAULT_SETTINGS_BUYING_COMMITTEE_ROLES,
    configuredLossReasons: configuredLossReasons ?? DEFAULT_CONFIGURED_LOSS_REASONS,
    configuredActivityTypes: configuredActivityTypes ?? DEFAULT_CONFIGURED_ACTIVITY_TYPES,
  });
}

interface RawSyncedPipelineStage {
  stageKey: string;
  labelEn: string;
  labelAr?: string | null;
  sortOrder: number;
  winProbabilityPercent?: number | null;
  probabilityPercent?: number | null;
  statusCategory?: CrmWorkflowStage["category"];
  color?: CrmWorkflowStage["color"];
  slaDays?: number;
  slaTargetDays?: number;
  requiredExitFields?: string[];
  triggerDealConversion?: boolean;
}

/** Merges a backend default deal pipeline snapshot into the local workflows array. */
export function applyBackendDefaultDealPipelineSync(
  workflows: CrmWorkflowDefinition[],
  backendPipe: {
    nameEn: string;
    nameAr?: string | null;
    version?: number;
    transitionsJson?: string | null;
    stages: RawSyncedPipelineStage[];
  }
): CrmWorkflowDefinition[] {
  return workflows.map((w) => {
    if (w.id !== "wf-deal-default") return w;
    const allUniform50OrNull =
      backendPipe.stages.length >= 3 &&
      backendPipe.stages.every((st) => (st.winProbabilityPercent ?? st.probabilityPercent ?? 50) === 50);
    const syncedStages: CrmWorkflowStage[] = backendPipe.stages
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((s, idx) => {
        const prevStage = w.stages.find((ps) => ps.stageKey === s.stageKey);
        const canonicalMeta = CANONICAL_DEFAULT_STAGE_META[s.stageKey];
        const rawProb = s.winProbabilityPercent ?? s.probabilityPercent;
        const resolvedProb =
          rawProb == null || allUniform50OrNull
            ? Number(prevStage?.winProbabilityPercent ?? canonicalMeta?.prob ?? 50)
            : Number(rawProb);
        return {
          stageKey: s.stageKey,
          labelEn: s.labelEn,
          labelAr: s.labelAr || s.labelEn,
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
      } catch {
        /* keep existing transitions */
      }
    }
    return {
      ...w,
      nameEn: backendPipe.nameEn || w.nameEn,
      nameAr: backendPipe.nameAr || w.nameAr,
      version: backendPipe.version ?? w.version,
      stages: syncedStages,
      transitions: syncedTransitions,
    };
  });
}

const PUBLIC_CRM_SKIP_ROUTES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/not-authorized",
  "/magic-link",
  "/qr-approve",
  "/sso",
  "/oauth",
  "/authorize",
  "/setup-account",
  "/terms",
  "/privacy",
  "/docs",
  "/commercial",
  "/bookings/guest",
  "/403",
  "/404",
  "/500",
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
