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

describe("SovereignAccountRepository — 15-Slice Sovereign Account World v3.0 Contract", () => {
  it("getContext() and getDossier() target /v1/account/context & /v1/account/dossier with zero hardcoded mock arrays", async () => {
    const api = createMockApi();
    const repo = new SovereignAccountRepository(api);

    const ctx = await repo.getContext();
    expect(api.get).toHaveBeenCalledWith(PROFILE_ENDPOINTS.ACCOUNT.CONTEXT);
    expect(ctx.postureChecklist).toEqual([]);

    const dossier = await repo.getDossier();
    expect(api.get).toHaveBeenCalledWith(PROFILE_ENDPOINTS.ACCOUNT.DOSSIER);
    expect(dossier.clubMemberships).toEqual([]);
    expect(dossier.linkedAthletes).toEqual([]);
  });

  it("getCredentials(), upsertCredential(), and deleteCredential() target /v1/account/credentials*", async () => {
    const api = createMockApi();
    const repo = new SovereignAccountRepository(api);

    const creds = await repo.getCredentials();
    expect(api.get).toHaveBeenCalledWith(PROFILE_ENDPOINTS.ACCOUNT.CREDENTIALS);
    expect(creds.credentials).toEqual([]);

    await repo.upsertCredential({
      category: "COACHING_LICENSE",
      governingBody: "UEFA",
      title: "UEFA Pro",
      licenseNumber: "UEFA-2026-001",
      issuedAtUtc: "2026-01-01T00:00:00Z",
    });
    expect(api.post).toHaveBeenCalledWith(PROFILE_ENDPOINTS.ACCOUNT.CREDENTIALS, {
      action: "ADD_CREDENTIAL",
      category: "COACHING_LICENSE",
      issuingBody: "UEFA",
      credentialTitle: "UEFA Pro",
      certificateNumber: "UEFA-2026-001",
      issuedAtUtc: "2026-01-01T00:00:00Z",
      expiresAtUtc: undefined,
      stadiumZonesJson: "[]",
      digitalSealSvg: undefined,
      signingPin: undefined,
    });

    await repo.deleteCredential("cred-1");
    expect(api.delete).toHaveBeenCalledWith(PROFILE_ENDPOINTS.ACCOUNT.CREDENTIAL_BY_ID("cred-1"));
  });

  it("getSecurity() and updateSecurityPosture() target /v1/account/security", async () => {
    const api = createMockApi();
    const repo = new SovereignAccountRepository(api);

    const posture = await repo.getSecurity();
    expect(api.get).toHaveBeenCalledWith(PROFILE_ENDPOINTS.ACCOUNT.SECURITY);
    expect(posture.securityPostureScore).toBe(0);
    expect(posture.postureChecklist).toEqual([]);

    await repo.updateSecurityPosture({
      travelShieldEnabled: true,
      trustedCidrs: ["10.24.0.0/16"],
    });
    expect(api.put).toHaveBeenCalledWith(PROFILE_ENDPOINTS.ACCOUNT.SECURITY, {
      travelShieldEnabled: true,
      travelShieldExpiresAtUtc: undefined,
      allowedCidrs: ["10.24.0.0/16"],
      duressPin: undefined,
      sudoVerificationPin: undefined,
      lockdownConfirmation: undefined,
    });
  });

  it("getSessions(), pingSession(), getDevices(), upsertDevice(), and revokeDevice() target /v1/account/sessions & /v1/account/devices*", async () => {
    const api = createMockApi();
    const repo = new SovereignAccountRepository(api);

    const sessions = await repo.getSessions();
    expect(api.get).toHaveBeenCalledWith(PROFILE_ENDPOINTS.ACCOUNT.SESSIONS);
    expect(sessions.sessions).toEqual([]);

    await repo.pingSession("sess-1");
    expect(api.post).toHaveBeenCalledWith(PROFILE_ENDPOINTS.ACCOUNT.PING_SESSION("sess-1"), {});

    const devices = await repo.getDevices();
    expect(api.get).toHaveBeenCalledWith(PROFILE_ENDPOINTS.ACCOUNT.DEVICES);
    expect(devices.devices).toEqual([]);

    await repo.upsertDevice({
      deviceId: "ipad-01",
      deviceName: "Touchline iPad Pro",
      deviceCategory: "PITCH_TABLET",
      platformOs: "iPadOS 18.2",
      appVersion: "3.0.0",
      isTrusted: true,
      isBiometricEnrolled: true,
      offlineVaultQuotaMb: 2048,
    });
    expect(api.post).toHaveBeenCalledWith(PROFILE_ENDPOINTS.ACCOUNT.DEVICES, {
      action: "REGISTER_DEVICE",
      deviceName: "Touchline iPad Pro",
      deviceCategory: "PITCH_TABLET",
      platformOs: "iPadOS 18.2",
      hardwareFingerprint: "ipad-01",
      offlinePackagesJson: "[]",
    });

    await repo.revokeDevice("dev-1", true);
    expect(api.delete).toHaveBeenCalledWith(
      `${PROFILE_ENDPOINTS.ACCOUNT.REVOKE_DEVICE("dev-1")}?wipeOfflineVault=true`
    );
  });

  it("getGovernance(), createDelegation(), revokeDelegation(), getActivity(), and generateInspectorPass() target /v1/account/governance & /v1/account/activity", async () => {
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
      grantedScopes: ["Academy.*"],
      justification: "Away Fixture",
      startsAtUtc: "2026-11-08T00:00:00Z",
      expiresAtUtc: "2026-12-01T00:00:00Z",
    });
    expect(api.post).toHaveBeenCalledWith(PROFILE_ENDPOINTS.ACCOUNT.DELEGATIONS, {
      actionType: "DELEGATION",
      delegateDisplayName: "Deputy Director",
      delegationType: "ACTING_AS",
      grantedScopes: ["Academy.*"],
      justification: "Away Fixture",
      startsAtUtc: "2026-11-08T00:00:00Z",
      expiresAtUtc: "2026-12-01T00:00:00Z",
    });

    await repo.revokeDelegation("del-1");
    expect(api.delete).toHaveBeenCalledWith(PROFILE_ENDPOINTS.ACCOUNT.REVOKE_DELEGATION("del-1"));

    const activity = await repo.getActivity(20);
    expect(api.get).toHaveBeenCalledWith(`${PROFILE_ENDPOINTS.ACCOUNT.ACTIVITY}?count=20`);
    expect(activity.entries).toEqual([]);

    await repo.generateInspectorPass("FIFA Compliance", 24);
    expect(api.post).toHaveBeenCalledWith(PROFILE_ENDPOINTS.ACCOUNT.INSPECTOR_PASS, {
      inspectorOrganization: "FIFA Compliance",
      validHours: 24,
    });
  });

  it("getPrivacy(), updatePrivacy(), requestPrivacyExport(), getPreferences(), getAccessibility(), getAiCopilot(), and getNotifications() target their exact /v1/account/* slices", async () => {
    const api = createMockApi();
    const repo = new SovereignAccountRepository(api);

    await repo.getPrivacy();
    expect(api.get).toHaveBeenCalledWith(PROFILE_ENDPOINTS.ACCOUNT.PRIVACY);

    await repo.updatePrivacy({
      encryptedScratchpadCiphertext: "AES-CIPHERTEXT",
      aiTelemetryConsent: true,
    });
    expect(api.put).toHaveBeenCalledWith(PROFILE_ENDPOINTS.ACCOUNT.PRIVACY, {
      encryptedVaultCiphertext: "AES-CIPHERTEXT",
      aiTelemetryConsentEnabled: true,
    });

    await repo.requestPrivacyExport();
    expect(api.post).toHaveBeenCalledWith(PROFILE_ENDPOINTS.ACCOUNT.PRIVACY_EXPORT, {});

    await repo.getPreferences();
    expect(api.get).toHaveBeenCalledWith(PROFILE_ENDPOINTS.ACCOUNT.PREFERENCES);

    await repo.getAccessibility();
    expect(api.get).toHaveBeenCalledWith(PROFILE_ENDPOINTS.ACCOUNT.ACCESSIBILITY);

    await repo.getAiCopilot();
    expect(api.get).toHaveBeenCalledWith(PROFILE_ENDPOINTS.ACCOUNT.AI_COPILOT);

    await repo.getNotifications();
    expect(api.get).toHaveBeenCalledWith(PROFILE_ENDPOINTS.ACCOUNT.NOTIFICATIONS);
  });

  it("getPlan(), submitPlanRequest(), getBilling(), submitExpenseClaim(), getIntegrations(), createIntegrationItem(), and deleteIntegrationItem() target /v1/account/plan, /v1/account/billing, and /v1/account/integrations*", async () => {
    const api = createMockApi();
    const repo = new SovereignAccountRepository(api);

    const plan = await repo.getPlan();
    expect(api.get).toHaveBeenCalledWith(PROFILE_ENDPOINTS.ACCOUNT.PLAN);
    expect(plan.quotas).toEqual([]);
    expect(plan.features).toEqual([]);

    await repo.submitPlanRequest("UPGRADE", "CRM.MaxPipelines", "Need more pipelines");
    expect(api.post).toHaveBeenCalledWith(PROFILE_ENDPOINTS.ACCOUNT.PLAN_REQUEST, {
      actionType: "UPGRADE",
      targetFeatureCode: "CRM.MaxPipelines",
      justification: "Need more pipelines",
    });

    const billing = await repo.getBilling();
    expect(api.get).toHaveBeenCalledWith(PROFILE_ENDPOINTS.ACCOUNT.BILLING);
    expect(billing.expenses).toEqual([]);
    expect(billing.invoices).toEqual([]);

    await repo.submitExpenseClaim({
      category: "SCOUTING_TRAVEL",
      title: "CAF Final",
      amount: 450,
      currency: "USD",
    });
    expect(api.post).toHaveBeenCalledWith(PROFILE_ENDPOINTS.ACCOUNT.BILLING_EXPENSES, {
      category: "SCOUTING_TRAVEL",
      description: "CAF Final",
      amountUsd: 450,
      currency: "USD",
    });

    const integrations = await repo.getIntegrations();
    expect(api.get).toHaveBeenCalledWith(PROFILE_ENDPOINTS.ACCOUNT.INTEGRATIONS);
    expect(integrations.sshKeys).toEqual([]);
    expect(integrations.webhooks).toEqual([]);

    await repo.createIntegrationItem({
      itemKind: "ssh",
      name: "R&D Laptop",
      publicKeyOrTargetUrl: "ssh-ed25519 AAAAC3...",
    });
    expect(api.post).toHaveBeenCalledWith(PROFILE_ENDPOINTS.ACCOUNT.INTEGRATIONS, {
      integrationType: "SSH_KEY",
      name: "R&D Laptop",
      scopes: undefined,
      expiresInDays: 90,
      keyType: "ssh-ed25519",
      publicKeyMaterial: "ssh-ed25519 AAAAC3...",
      targetUrl: undefined,
      subscribedEvents: undefined,
    });

    await repo.deleteIntegrationItem("ssh", "ssh-1");
    expect(api.delete).toHaveBeenCalledWith(
      PROFILE_ENDPOINTS.ACCOUNT.INTEGRATION_BY_ID("ssh", "ssh-1")
    );
  });
});
