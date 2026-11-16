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
      actionType: "DelegateAuthority",
      targetAdminId: "adm-2",
      targetDelegateEmailOrId: "adm-2",
      permissions: ["CRM.*"],
      justification: "Annual Leave",
      startsAtUtc: "2026-11-08T00:00:00Z",
      endsAtUtc: "2026-12-01T00:00:00Z",
    });

    await repo.createDelegation({
      delegateAdminId: "enc-colleague-id",
      delegateDisplayName: "Ahmed El-Shenawy",
      delegationType: "TemporaryCoverage",
      grantedScopes: ["Venue.Read"],
      justification: "Coverage",
      startsAtUtc: "2026-11-08T00:00:00Z",
      expiresAtUtc: "2026-11-09T00:00:00Z",
    });
    expect(api.post).toHaveBeenLastCalledWith(PROFILE_ENDPOINTS.ACCOUNT.DELEGATIONS, {
      actionType: "DelegateAuthority",
      targetAdminId: "enc-colleague-id",
      targetDelegateEmailOrId: "enc-colleague-id",
      permissions: ["Venue.Read"],
      justification: "Coverage",
      startsAtUtc: "2026-11-08T00:00:00Z",
      endsAtUtc: "2026-11-09T00:00:00Z",
    });

    await repo.createDelegation({
      delegateAdminId: "00000000-0000-0000-0000-000000000000",
      delegateDisplayName: "ahly.booking@scripe-dev.local",
      delegationType: "SuccessionCustody",
      grantedScopes: ["Venue.Read"],
      justification: "Email fallback",
      startsAtUtc: "2026-11-08T00:00:00Z",
      expiresAtUtc: "2026-11-09T00:00:00Z",
    });
    expect(api.post).toHaveBeenLastCalledWith(PROFILE_ENDPOINTS.ACCOUNT.DELEGATIONS, {
      actionType: "SuccessionCustody",
      targetDelegateEmailOrId: "ahly.booking@scripe-dev.local",
      permissions: ["Venue.Read"],
      justification: "Email fallback",
      startsAtUtc: "2026-11-08T00:00:00Z",
      endsAtUtc: "2026-11-09T00:00:00Z",
    });

    await repo.createDelegation({
      delegateAdminId: "adm-9",
      delegateDisplayName: "Incident Lead",
      delegationType: "BreakGlassJitElevation",
      grantedScopes: ["Identity.*"],
      justification: "SEV-1",
      startsAtUtc: "2026-11-08T00:00:00Z",
      expiresAtUtc: "2026-11-08T02:00:00Z",
    });
    expect(api.post).toHaveBeenLastCalledWith(
      PROFILE_ENDPOINTS.ACCOUNT.DELEGATIONS,
      expect.objectContaining({
        actionType: "BreakGlassElevation",
        targetAdminId: "adm-9",
        targetDelegateEmailOrId: "adm-9",
      })
    );

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

  it("carries and submits rowVersion across GET -> PUT round-trips for dossier, security, preferences, and notifications", async () => {
    const api = createMockApi({
      get: vi.fn().mockImplementation(async (endpoint: string) => {
        if (endpoint === PROFILE_ENDPOINTS.ACCOUNT.DOSSIER) {
          return { rowVersion: "rv-dossier-1" };
        }
        if (endpoint === PROFILE_ENDPOINTS.ACCOUNT.SECURITY) {
          return { rowVersion: "rv-sec-1", trustedCidrs: ["10.0.0.0/8"] };
        }
        if (endpoint === PROFILE_ENDPOINTS.ACCOUNT.PREFERENCES) {
          return { rowVersion: "rv-pref-2", themeMode: "dark" };
        }
        if (endpoint === PROFILE_ENDPOINTS.ACCOUNT.NOTIFICATIONS) {
          return { rowVersion: "rv-notif-server-newer", quietHoursEnabled: true };
        }
        return {};
      }),
    });
    const repo = new SovereignAccountRepository(api);

    const dossier = await repo.getDossier();
    expect(dossier.rowVersion).toBe("rv-dossier-1");

    const security = await repo.getSecurity();
    expect(security.rowVersion).toBe("rv-sec-1");

    await repo.updateSecurityPosture({
      trustedCidrs: ["10.24.0.0/16"],
      rowVersion: "rv-sec-1",
    });
    expect(api.put).toHaveBeenCalledWith(PROFILE_ENDPOINTS.ACCOUNT.SECURITY, {
      allowedCidrs: ["10.24.0.0/16"],
      elevateSudo: false,
      stepUpVerificationCode: undefined,
      triggerEmergencyLockdown: false,
      lockdownConfirmationPhrase: undefined,
      rowVersion: "rv-sec-1",
    });

    const prefs = await repo.getPreferences();
    expect(prefs.rowVersion).toBe("rv-pref-2");

    const updatedPrefs = await repo.updatePreferences({
      themeMode: "light",
      rowVersion: "rv-pref-1",
    });
    expect(api.put).toHaveBeenCalledWith(
      PROFILE_ENDPOINTS.ACCOUNT.PREFERENCES,
      expect.objectContaining({
        themeMode: "light",
        rowVersion: "rv-pref-1",
      })
    );
    expect(updatedPrefs.rowVersion).toBe("rv-pref-2");

    // Stale client rowVersion must NOT be overwritten by the intermediate GET inside updateNotifications
    await repo.updateNotifications({
      quietHoursEnabled: false,
      rowVersion: "rv-notif-stale-client",
    });
    expect(api.put).toHaveBeenCalledWith(
      PROFILE_ENDPOINTS.ACCOUNT.NOTIFICATIONS,
      expect.objectContaining({
        quietHoursEnabled: false,
        rowVersion: "rv-notif-stale-client",
      })
    );

    // Partial update omitting rowVersion falls back to fetched current rowVersion
    await repo.updateNotifications({
      quietHoursEnabled: true,
    });
    expect(api.put).toHaveBeenCalledWith(
      PROFILE_ENDPOINTS.ACCOUNT.NOTIFICATIONS,
      expect.objectContaining({
        quietHoursEnabled: true,
        rowVersion: "rv-notif-server-newer",
      })
    );
  });

  it("getActivity(query) forwards outcome and omits ALL category/outcome sentinels", async () => {
    const api = createMockApi();
    const repo = new SovereignAccountRepository(api);

    await repo.getActivity({
      search: "login",
      category: "ALL",
      outcome: "FAILURE",
      page: 2,
      pageSize: 25,
    });
    expect(api.get).toHaveBeenCalledWith(
      `${PROFILE_ENDPOINTS.ACCOUNT.ACTIVITY}?search=login&outcome=FAILURE&page=2&pageSize=25`
    );

    await repo.getActivity({
      category: "Security",
      outcome: "ALL",
      page: 1,
      pageSize: 50,
    });
    expect(api.get).toHaveBeenCalledWith(
      `${PROFILE_ENDPOINTS.ACCOUNT.ACTIVITY}?category=Security&page=1&pageSize=50`
    );
  });

  it("getIntegrations() preserves real backend rateLimitTelemetry and nullable dev policy limits without fabrications", async () => {
    const devApi = createMockApi({
      get: vi.fn().mockResolvedValue({
        externalIdpLinks: [],
        personalAccessTokens: [
          {
            id: "pat-1",
            name: "CI Sync",
            tokenPrefix: "scr_live_abc",
            scopes: ["academy:read"],
            rateLimitPerMinute: null,
            dailyRequestCount: 4,
            createdAtUtc: "2026-11-15T10:00:00Z",
          },
        ],
        availableScopes: ["academy:read"],
        rateLimitTelemetry: {
          rateLimitingEnabled: false,
          requestsPerMinuteLimit: null,
          configuredRequestsPerMinuteLimit: 100,
          hourlyLimit: null,
          hourlyRequestsUsed: 4,
          hourlyRemaining: null,
          dailyRequestsUsed: 12,
          remainingQuotaPercentage: null,
        },
      }),
    });
    const devRepo = new SovereignAccountRepository(devApi);
    const devResult = await devRepo.getIntegrations();
    expect(devResult.personalAccessTokens[0].rateLimitPerMinute).toBeNull();
    expect(devResult.personalAccessTokens[0].dailyRequestCount).toBe(4);
    expect(devResult.rateLimitTelemetry).toEqual({
      rateLimitingEnabled: false,
      requestsPerMinuteLimit: null,
      configuredRequestsPerMinuteLimit: 100,
      hourlyLimit: null,
      hourlyRequestsUsed: 4,
      hourlyRemaining: null,
      dailyRequestsUsed: 12,
      remainingQuotaPercentage: null,
    });

    const prodApi = createMockApi({
      get: vi.fn().mockResolvedValue({
        externalIdpLinks: [],
        personalAccessTokens: [
          {
            id: "pat-2",
            name: "Prod Webhook",
            tokenPrefix: "scr_live_xyz",
            scopes: ["venue:write"],
            rateLimitPerMinute: 100,
            dailyRequestCount: 180,
            createdAtUtc: "2026-11-15T10:00:00Z",
          },
        ],
        availableScopes: ["venue:write"],
        rateLimitTelemetry: {
          rateLimitingEnabled: true,
          requestsPerMinuteLimit: 100,
          configuredRequestsPerMinuteLimit: 100,
          hourlyLimit: 6000,
          hourlyRequestsUsed: 150,
          hourlyRemaining: 5850,
          dailyRequestsUsed: 180,
          remainingQuotaPercentage: 97.5,
        },
      }),
    });
    const prodRepo = new SovereignAccountRepository(prodApi);
    const prodResult = await prodRepo.getIntegrations();
    expect(prodResult.personalAccessTokens[0].rateLimitPerMinute).toBe(100);
    expect(prodResult.rateLimitTelemetry).toEqual({
      rateLimitingEnabled: true,
      requestsPerMinuteLimit: 100,
      configuredRequestsPerMinuteLimit: 100,
      hourlyLimit: 6000,
      hourlyRequestsUsed: 150,
      hourlyRemaining: 5850,
      dailyRequestsUsed: 180,
      remainingQuotaPercentage: 97.5,
    });
    expect(prodResult.integrationsFeatureEnabled).toBe(true);
    expect(prodResult.patQuota).toBeNull();
  });

  it("maps featureFlags on context, 2FA/SSO feature gates on security, and PAT quota states (finite, exhausted, disabled, backward-compat)", async () => {
    const legacyCtxRepo = new SovereignAccountRepository(createMockApi());
    const legacyCtx = await legacyCtxRepo.getContext();
    expect(legacyCtx.featureFlags).toEqual({
      integrationsEnabled: true,
      twoFactorEnabled: true,
      externalSsoEnabled: true,
      vacationDelegationEnabled: true,
      planAndQuotasEnabled: true,
    });

    const gatedCtxRepo = new SovereignAccountRepository(
      createMockApi({
        get: vi.fn().mockResolvedValue({
          adminId: "starter-1",
          featureFlags: {
            integrationsEnabled: false,
            twoFactorEnabled: false,
            externalSsoEnabled: false,
            vacationDelegationEnabled: false,
            planAndQuotasEnabled: true,
          },
        }),
      })
    );
    const gatedCtx = await gatedCtxRepo.getContext();
    expect(gatedCtx.featureFlags).toEqual({
      integrationsEnabled: false,
      twoFactorEnabled: false,
      externalSsoEnabled: false,
      vacationDelegationEnabled: false,
      planAndQuotasEnabled: true,
    });

    const gatedSecRepo = new SovereignAccountRepository(
      createMockApi({
        get: vi.fn().mockResolvedValue({
          isTwoFactorEnabled: false,
          isTwoFactorFeatureEnabled: false,
          isSsoFeatureEnabled: false,
          isSecurityPageEnabled: true,
        }),
      })
    );
    const gatedSec = await gatedSecRepo.getSecurity();
    expect(gatedSec.isTwoFactorFeatureEnabled).toBe(false);
    expect(gatedSec.isSsoFeatureEnabled).toBe(false);
    expect(gatedSec.isSecurityPageEnabled).toBe(true);

    const planRepo = new SovereignAccountRepository(
      createMockApi({
        get: vi.fn().mockResolvedValue({
          quotas: [
            {
              quotaCode: "Integrations.ApiKeys.MaxPerTenant",
              displayName: "Personal Access Tokens",
              used: 4,
              limit: 10,
              unit: "tokens",
              source: "override",
            },
          ],
        }),
      })
    );
    const plan = await planRepo.getPlan();
    expect(plan.quotas[0].source).toBe("override");

    const finiteIntRepo = new SovereignAccountRepository(
      createMockApi({
        get: vi.fn().mockResolvedValue({
          integrationsFeatureEnabled: true,
          patQuota: {
            activeCount: 4,
            maxLimit: 10,
            isUnlimited: false,
            remaining: 6,
            isEnabled: true,
          },
        }),
      })
    );
    const finiteInt = await finiteIntRepo.getIntegrations();
    expect(finiteInt.integrationsFeatureEnabled).toBe(true);
    expect(finiteInt.patQuota).toEqual({
      activeCount: 4,
      maxLimit: 10,
      isUnlimited: false,
      remaining: 6,
      isEnabled: true,
    });

    const exhaustedIntRepo = new SovereignAccountRepository(
      createMockApi({
        get: vi.fn().mockResolvedValue({
          integrationsFeatureEnabled: false,
          patQuota: {
            activeCount: 5,
            maxLimit: 5,
            isUnlimited: false,
            remaining: 0,
            isEnabled: false,
          },
        }),
      })
    );
    const exhaustedInt = await exhaustedIntRepo.getIntegrations();
    expect(exhaustedInt.integrationsFeatureEnabled).toBe(false);
    expect(exhaustedInt.patQuota).toEqual({
      activeCount: 5,
      maxLimit: 5,
      isUnlimited: false,
      remaining: 0,
      isEnabled: false,
    });
  });
});
