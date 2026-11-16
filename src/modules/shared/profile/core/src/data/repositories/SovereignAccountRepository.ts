/**
 * SovereignAccountRepository
 *
 * Concrete implementation of ISovereignAccountRepository for the Clean 9-Page
 * B2B Enterprise Account Console (v4.0).
 * Communicates strictly with /api/v1/account/* endpoints via IApiService.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import { PROFILE_ENDPOINTS } from "../services/profile.endpoints";
import type { ISovereignAccountRepository } from "../../domain/interfaces/ISovereignAccountRepository";
import type {
  AdminDelegationItem,
  SovereignAccountContext,
  SovereignActivityQuery,
  SovereignActivitySlice,
  SovereignDossierSlice,
  SovereignGovernanceSlice,
  SovereignIntegrationsSlice,
  SovereignNotificationsSlice,
  SovereignPlanSlice,
  SovereignPreferencesSlice,
  SovereignSecuritySlice,
  SovereignSessionsSlice,
} from "../../domain/entities/SovereignAccountEntities";
import {
  mapAccountContext,
  mapDossierSlice,
  mapSecuritySlice,
  mapSessionsSlice,
} from "../mappers/SovereignAccountIdentityMapper";
import {
  mapActivitySlice,
  mapColleagueOptions,
  mapCreatedDelegation,
  mapGovernanceSlice,
} from "../mappers/SovereignAccountGovernanceMapper";
import {
  mapIntegrationsSlice,
  mapNotificationsSlice,
  mapPlanSlice,
  mapPreferencesSlice,
} from "../mappers/SovereignAccountWorkstationMapper";
import { mapPersonalAccessTokenSummary } from "../mappers/SovereignAccountIntegrationsMapper";
import {
  buildActivityQueryParams,
  buildCreateDelegationPayload,
  buildPreferencesUpdatePayload,
  buildSecurityPosturePayload,
  buildUpdatedNotificationRules,
} from "../mappers/SovereignAccountPayloadBuilders";

interface IntegrationSecretResponse {
  id?: string;
  oneTimePlaintextSecret?: string | null;
  previewOrFingerprint?: string;
}

/**
 * HTTP-backed repository implementing `ISovereignAccountRepository` across all account slices.
 */
export class SovereignAccountRepository implements ISovereignAccountRepository {
  constructor(private readonly api: IApiService) {}

  async getContext(): Promise<SovereignAccountContext> {
    return mapAccountContext(await this.api.get<unknown>(PROFILE_ENDPOINTS.ACCOUNT.CONTEXT));
  }

  async getDossier(): Promise<SovereignDossierSlice> {
    return mapDossierSlice(await this.api.get<unknown>(PROFILE_ENDPOINTS.ACCOUNT.DOSSIER));
  }

  async sendEmailVerification(): Promise<{ message?: string; expiresInSeconds?: number }> {
    return this.api.post(PROFILE_ENDPOINTS.ACCOUNT.SEND_EMAIL_VERIFICATION, {});
  }

  async exportAccountData(): Promise<Record<string, unknown>> {
    return this.api.post<Record<string, unknown>>(PROFILE_ENDPOINTS.ACCOUNT.EXPORT_DOSSIER, {});
  }

  async deactivateAccount(): Promise<{ deactivated?: boolean; message?: string }> {
    return this.api.post<{ deactivated?: boolean; message?: string }>(
      PROFILE_ENDPOINTS.ACCOUNT.DEACTIVATE_ACCOUNT,
      {}
    );
  }

  async getSecurity(): Promise<SovereignSecuritySlice> {
    return mapSecuritySlice(await this.api.get<unknown>(PROFILE_ENDPOINTS.ACCOUNT.SECURITY));
  }

  async updateSecurityPosture(
    data: Parameters<ISovereignAccountRepository["updateSecurityPosture"]>[0]
  ): Promise<void> {
    await this.api.put(PROFILE_ENDPOINTS.ACCOUNT.SECURITY, buildSecurityPosturePayload(data));
  }

  async getSessions(): Promise<SovereignSessionsSlice> {
    return mapSessionsSlice(await this.api.get<unknown>(PROFILE_ENDPOINTS.ACCOUNT.SESSIONS));
  }

  async pingSession(
    sessionId: string
  ): Promise<{ sessionId: string; rttMilliseconds: number; status: string }> {
    return this.api.post(PROFILE_ENDPOINTS.ACCOUNT.PING_SESSION(sessionId), {});
  }

  async getGovernance(): Promise<SovereignGovernanceSlice> {
    return mapGovernanceSlice(await this.api.get<unknown>(PROFILE_ENDPOINTS.ACCOUNT.GOVERNANCE));
  }

  async createDelegation(
    data: Parameters<ISovereignAccountRepository["createDelegation"]>[0]
  ): Promise<AdminDelegationItem> {
    const res = await this.api.post<unknown>(
      PROFILE_ENDPOINTS.ACCOUNT.DELEGATIONS,
      buildCreateDelegationPayload(data)
    );
    return mapCreatedDelegation(res, data);
  }

  async revokeDelegation(id: string): Promise<void> {
    await this.api.delete(PROFILE_ENDPOINTS.ACCOUNT.REVOKE_DELEGATION(id));
  }

  async getActivity(
    countOrQuery: number | SovereignActivityQuery = 30
  ): Promise<SovereignActivitySlice> {
    const queryParams = buildActivityQueryParams(countOrQuery);
    const url = buildUrl(PROFILE_ENDPOINTS.ACCOUNT.ACTIVITY, queryParams);
    return mapActivitySlice(await this.api.get<unknown>(url), countOrQuery);
  }

  async getPreferences(): Promise<SovereignPreferencesSlice> {
    return mapPreferencesSlice(await this.api.get<unknown>(PROFILE_ENDPOINTS.ACCOUNT.PREFERENCES));
  }

  async updatePreferences(
    data: Partial<SovereignPreferencesSlice>
  ): Promise<SovereignPreferencesSlice> {
    await this.api.put(PROFILE_ENDPOINTS.ACCOUNT.PREFERENCES, buildPreferencesUpdatePayload(data));
    return this.getPreferences();
  }

  async getNotifications(): Promise<SovereignNotificationsSlice> {
    return mapNotificationsSlice(
      await this.api.get<unknown>(PROFILE_ENDPOINTS.ACCOUNT.NOTIFICATIONS)
    );
  }

  async updateNotifications(
    data: Partial<SovereignNotificationsSlice>
  ): Promise<SovereignNotificationsSlice> {
    const current = await this.getNotifications();
    const resolvedRowVersion = data.rowVersion ?? current.rowVersion;
    const merged = { ...current, ...data };
    const updatedRules = buildUpdatedNotificationRules(current, data);
    await this.api.put(PROFILE_ENDPOINTS.ACCOUNT.NOTIFICATIONS, {
      categoryRules: updatedRules,
      quietHoursStart: merged.quietHoursStartUtc,
      quietHoursEnd: merged.quietHoursEndUtc,
      quietHoursEnabled: merged.quietHoursEnabled,
      ...(resolvedRowVersion !== undefined ? { rowVersion: resolvedRowVersion } : {}),
    });
    return this.getNotifications();
  }

  async sendTestNotification(category: string = "Security"): Promise<SovereignNotificationsSlice> {
    await this.api.post(PROFILE_ENDPOINTS.ACCOUNT.SEND_TEST_NOTIFICATION, { category });
    return this.getNotifications();
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await this.api.patch(PROFILE_ENDPOINTS.ACCOUNT.MARK_NOTIFICATION_READ(id), {});
  }

  async markAllNotificationsAsRead(): Promise<void> {
    await this.api.patch(PROFILE_ENDPOINTS.ACCOUNT.MARK_ALL_NOTIFICATIONS_READ, {});
  }

  async deleteNotification(id: string): Promise<void> {
    await this.api.delete(PROFILE_ENDPOINTS.ACCOUNT.DELETE_NOTIFICATION(id));
  }

  async getPlan(): Promise<SovereignPlanSlice> {
    return mapPlanSlice(await this.api.get<unknown>(PROFILE_ENDPOINTS.ACCOUNT.PLAN));
  }

  async submitPlanRequest(requestType: string, targetCode: string, notes: string = ""): Promise<void> {
    await this.api.post(PROFILE_ENDPOINTS.ACCOUNT.PLAN_REQUEST, {
      actionType: requestType,
      targetCode,
      notes,
    });
  }

  async getIntegrations(): Promise<SovereignIntegrationsSlice> {
    return mapIntegrationsSlice(
      await this.api.get<unknown>(PROFILE_ENDPOINTS.ACCOUNT.INTEGRATIONS)
    );
  }

  async createIntegrationItem(
    data: Parameters<ISovereignAccountRepository["createIntegrationItem"]>[0]
  ) {
    const trimmedDesc = data.description?.trim();
    const res = await this.api.post<IntegrationSecretResponse>(
      PROFILE_ENDPOINTS.ACCOUNT.INTEGRATIONS,
      {
        itemType: data.itemKind === "sso" ? "SSO" : "PAT",
        name: data.name,
        scopes: data.scopesOrEvents,
        expiresInDays: data.expiresInDays ?? 90,
        ...(trimmedDesc ? { description: trimmedDesc } : {}),
        ...(data.allowedCidrs ? { allowedCidrs: data.allowedCidrs } : {}),
      }
    );
    return {
      id: String(res?.id ?? ""),
      itemKind: data.itemKind,
      plainTextSecretOnce: res?.oneTimePlaintextSecret ?? null,
      fingerprintOrPrefix: res?.previewOrFingerprint ?? "",
    };
  }

  async updatePersonalAccessToken(
    id: string,
    data: Parameters<ISovereignAccountRepository["updatePersonalAccessToken"]>[1]
  ) {
    const res = await this.api.put<unknown>(PROFILE_ENDPOINTS.INTEGRATION_PAT_UPDATE(id), {
      name: data.name,
      description: data.description?.trim() || null,
      scopes: data.scopes,
      allowedCidrs: data.allowedCidrs ?? [],
      ...(data.expiresInDays != null ? { expiresInDays: data.expiresInDays } : {}),
      ...(data.rowVersion ? { rowVersion: data.rowVersion } : {}),
    });
    return mapPersonalAccessTokenSummary(res);
  }

  async rollPersonalAccessToken(id: string) {
    const res = await this.api.post<IntegrationSecretResponse>(
      PROFILE_ENDPOINTS.INTEGRATION_PAT_ROLL(id),
      {}
    );
    return {
      id: String(res?.id ?? id),
      itemKind: "pat" as const,
      plainTextSecretOnce: res?.oneTimePlaintextSecret ?? null,
      fingerprintOrPrefix: res?.previewOrFingerprint ?? "",
    };
  }

  async searchColleagues(query: string) {
    const q = query.trim();
    const url = q
      ? `${PROFILE_ENDPOINTS.COLLEAGUES}?q=${encodeURIComponent(q)}`
      : PROFILE_ENDPOINTS.COLLEAGUES;
    return mapColleagueOptions(await this.api.get<unknown>(url));
  }

  async deleteIntegrationItem(itemKind: string, id: string): Promise<void> {
    await this.api.delete(PROFILE_ENDPOINTS.ACCOUNT.INTEGRATION_BY_ID(itemKind, id));
  }
}
