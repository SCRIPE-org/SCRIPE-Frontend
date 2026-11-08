import { describe, it, expect, vi } from "vitest";
import { SovereignAccountRepository } from "./SovereignAccountRepository";
import { PROFILE_ENDPOINTS } from "../services/profile.endpoints";
import type { IApiService } from "@core/interfaces/api.interface";

function createMockApi(overrides: Partial<IApiService> = {}): IApiService {
  return {
    get: vi.fn().mockResolvedValue({}),
    post: vi.fn().mockResolvedValue({}),
    put: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
    patch: vi.fn().mockResolvedValue({}),
    ...overrides,
  } as unknown as IApiService;
}

describe("SovereignAccountRepository — Clean 9-Page B2B Enterprise Account Console (v4.0)", () => {
  it("getContext(), getDossier(), and sendEmailVerification() target /v1/account/context & /v1/account/dossier with zero hardcoded mock arrays", async () => {
    const api = createMockApi();
    const repo = new SovereignAccountRepository(api);

    const ctx = await repo.getContext();
    expect(api.get).toHaveBeenCalledWith(PROFILE_ENDPOINTS.ACCOUNT.CONTEXT);
    expect(ctx.postureChecklist).toEqual([]);

    const dossier = await repo.getDossier();
    expect(api.get).toHaveBeenCalledWith(PROFILE_ENDPOINTS.ACCOUNT.DOSSIER);
    expect(dossier.clubMemberships).toEqual([]);
    expect(dossier.customFields).toEqual([]);

    await repo.sendEmailVerification();
    expect(api.post).toHaveBeenCalledWith(PROFILE_ENDPOINTS.ACCOUNT.SEND_EMAIL_VERIFICATION, {});
  });

  it("getSecurity() and updateSecurityPosture() target /v1/account/security", async () => {
    const api = createMockApi();
    const repo = new SovereignAccountRepository(api);

    const posture = await repo.getSecurity();
    expect(api.get).toHaveBeenCalledWith(PROFILE_ENDPOINTS.ACCOUNT.SECURITY);
    expect(posture.securityPostureScore).toBe(0);
    expect(posture.postureChecklist).toEqual([]);

    await repo.updateSecurityPosture({
      trustedCidrs: ["10.24.0.0/16"],
    });
    expect(api.put).toHaveBeenCalledWith(PROFILE_ENDPOINTS.ACCOUNT.SECURITY, {
      allowedCidrs: ["10.24.0.0/16"],
      elevateSudo: false,
      stepUpVerificationCode: undefined,
      triggerEmergencyLockdown: false,
      lockdownConfirmationPhrase: undefined,
    });
  });

  it("getSessions() and pingSession() target /v1/account/sessions", async () => {
    const api = createMockApi();
    const repo = new SovereignAccountRepository(api);

    const sessions = await repo.getSessions();
    expect(api.get).toHaveBeenCalledWith(PROFILE_ENDPOINTS.ACCOUNT.SESSIONS);
    expect(sessions.sessions).toEqual([]);

    await repo.pingSession("sess-1");
    expect(api.post).toHaveBeenCalledWith(PROFILE_ENDPOINTS.ACCOUNT.PING_SESSION("sess-1"), {});
  });

  it("getGovernance(), createDelegation(), revokeDelegation(), and getActivity() target /v1/account/governance & /v1/account/activity", async () => {
    const api = createMockApi();
    const repo = new SovereignAccountRepository(api);

    const gov = await repo.getGovernance();
    expect(api.get).toHaveBeenCalledWith(PROFILE_ENDPOINTS.ACCOUNT.GOVERNANCE);
    expect(gov.delegations).toEqual([]);
    expect(gov.provenanceGraph).toEqual([]);

    await repo.createDelegation({
      delegateAdminId: "adm-2",
      delegateDisplayName: "Deputy Director",
      delegationType: "ACTING_AS",
      grantedScopes: ["CRM.*"],
      justification: "Annual Leave",
      startsAtUtc: "2026-11-08T00:00:00Z",
      expiresAtUtc: "2026-12-01T00:00:00Z",
    });
    expect(api.post).toHaveBeenCalledWith(PROFILE_ENDPOINTS.ACCOUNT.DELEGATIONS, {
      actionType: "CreateDelegation",
      targetDelegateEmailOrId: "Deputy Director",
      permissions: ["CRM.*"],
      justification: "Annual Leave",
      startsAtUtc: "2026-11-08T00:00:00Z",
      endsAtUtc: "2026-12-01T00:00:00Z",
    });

    await repo.revokeDelegation("del-1");
    expect(api.delete).toHaveBeenCalledWith(PROFILE_ENDPOINTS.ACCOUNT.REVOKE_DELEGATION("del-1"));

    const activity = await repo.getActivity(20);
    expect(api.get).toHaveBeenCalledWith(`${PROFILE_ENDPOINTS.ACCOUNT.ACTIVITY}?pageSize=20`);
    expect(activity.entries).toEqual([]);
  });

  it("getPreferences(), updatePreferences(), getNotifications(), updateNotifications(), and sendTestNotification() target /v1/account/preferences & /v1/account/notifications*", async () => {
    const api = createMockApi();
    const repo = new SovereignAccountRepository(api);

    await repo.getPreferences();
    expect(api.get).toHaveBeenCalledWith(PROFILE_ENDPOINTS.ACCOUNT.PREFERENCES);

    await repo.updatePreferences({
      themeMode: "dark",
      density: "compact",
      numeralSystem: "latn",
      operatingTimezone: "Africa/Cairo",
      toastPosition: "bottom-center",
    });
    expect(api.put).toHaveBeenCalledWith(
      PROFILE_ENDPOINTS.ACCOUNT.PREFERENCES,
      expect.objectContaining({
        themeMode: "dark",
        interfaceDensity: "compact",
        numeralSystem: "latn",
        operatingTimezone: "Africa/Cairo",
        toastPosition: "bottom-center",
      })
    );

    const notifs = await repo.getNotifications();
    expect(api.get).toHaveBeenCalledWith(PROFILE_ENDPOINTS.ACCOUNT.NOTIFICATIONS);
    expect(notifs.categoryRules).toEqual([]);
    expect(notifs.recentNotifications).toEqual([]);

    await repo.sendTestNotification("Security");
    expect(api.post).toHaveBeenCalledWith(PROFILE_ENDPOINTS.ACCOUNT.SEND_TEST_NOTIFICATION, {
      category: "Security",
    });

    await repo.markNotificationAsRead("notif-1");
    expect(api.patch).toHaveBeenCalledWith(
      PROFILE_ENDPOINTS.ACCOUNT.MARK_NOTIFICATION_READ("notif-1"),
      {}
    );

    await repo.markAllNotificationsAsRead();
    expect(api.patch).toHaveBeenCalledWith(
      PROFILE_ENDPOINTS.ACCOUNT.MARK_ALL_NOTIFICATIONS_READ,
      {}
    );

    await repo.deleteNotification("notif-1");
    expect(api.delete).toHaveBeenCalledWith(
      PROFILE_ENDPOINTS.ACCOUNT.DELETE_NOTIFICATION("notif-1")
    );
  });

  it("getPlan(), submitPlanRequest(), getIntegrations(), createIntegrationItem(), and deleteIntegrationItem() target /v1/account/plan & /v1/account/integrations*", async () => {
    const api = createMockApi();
    const repo = new SovereignAccountRepository(api);

    const plan = await repo.getPlan();
    expect(api.get).toHaveBeenCalledWith(PROFILE_ENDPOINTS.ACCOUNT.PLAN);
    expect(plan.quotas).toEqual([]);
    expect(plan.features).toEqual([]);

    await repo.submitPlanRequest("UPGRADE", "CRM.MaxPipelines", "Need more pipelines");
    expect(api.post).toHaveBeenCalledWith(PROFILE_ENDPOINTS.ACCOUNT.PLAN_REQUEST, {
      actionType: "UPGRADE",
      targetCode: "CRM.MaxPipelines",
      notes: "Need more pipelines",
    });

    const integrations = await repo.getIntegrations();
    expect(api.get).toHaveBeenCalledWith(PROFILE_ENDPOINTS.ACCOUNT.INTEGRATIONS);
    expect(integrations.externalIdpLinks).toEqual([]);
    expect(integrations.personalAccessTokens).toEqual([]);

    await repo.createIntegrationItem({
      itemKind: "pat",
      name: "CI/CD Pipeline Token",
      scopesOrEvents: ["CRM.Read"],
      expiresInDays: 90,
    });
    expect(api.post).toHaveBeenCalledWith(PROFILE_ENDPOINTS.ACCOUNT.INTEGRATIONS, {
      itemType: "PAT",
      name: "CI/CD Pipeline Token",
      scopes: ["CRM.Read"],
      expiresInDays: 90,
    });

    await repo.deleteIntegrationItem("pat", "pat-1");
    expect(api.delete).toHaveBeenCalledWith(
      PROFILE_ENDPOINTS.ACCOUNT.INTEGRATION_BY_ID("pat", "pat-1")
    );
  });
});
