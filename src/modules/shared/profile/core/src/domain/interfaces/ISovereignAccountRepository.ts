import type {
  SovereignAccountContext,
  SovereignDossierSlice,
  SovereignCredentialsSlice,
  AdminCredentialItem,
  SovereignSecuritySlice,
  SovereignSessionsSlice,
  SovereignDevicesSlice,
  AdminDeviceItem,
  SovereignGovernanceSlice,
  AdminDelegationItem,
  SovereignActivitySlice,
  SovereignPrivacySlice,
  SovereignPreferencesSlice,
  SovereignAccessibilitySlice,
  SovereignAiCopilotSlice,
  SovereignNotificationsSlice,
  SovereignPlanSlice,
  SovereignBillingSlice,
  SovereignIntegrationsSlice,
} from "../entities/SovereignAccountEntities";

export interface ISovereignAccountRepository {
  getContext(): Promise<SovereignAccountContext>;
  getDossier(): Promise<SovereignDossierSlice>;
  getCredentials(): Promise<SovereignCredentialsSlice>;
  upsertCredential(data: {
    id?: string;
    category: string;
    governingBody: string;
    title: string;
    licenseNumber: string;
    issuedAtUtc: string;
    expiresAtUtc?: string | null;
    verificationStatus?: string;
    documentUrl?: string | null;
    authorityNotes?: string | null;
    bloodType?: string;
    stadiumZoneClearances?: string[];
    digitalSignatureSealSvg?: string | null;
    signingPin?: string | null;
  }): Promise<AdminCredentialItem>;
  deleteCredential(id: string): Promise<void>;
  getSecurity(): Promise<SovereignSecuritySlice>;
  updateSecurityPosture(data: {
    travelShieldEnabled?: boolean;
    travelShieldExpiresAtUtc?: string | null;
    trustedCidrs?: string[];
    duressPin?: string | null;
    verifySudoPinOrPasskeyToken?: string | null;
    lockdownConfirmation?: string | null;
  }): Promise<void>;
  getSessions(): Promise<SovereignSessionsSlice>;
  pingSession(sessionId: string): Promise<{ sessionId: string; rttMilliseconds: number; status: string }>;
  getDevices(): Promise<SovereignDevicesSlice>;
  upsertDevice(data: {
    id?: string;
    deviceId: string;
    deviceName: string;
    deviceCategory: string;
    platformOs: string;
    appVersion: string;
    isTrusted: boolean;
    isBiometricEnrolled: boolean;
    offlineVaultQuotaMb: number;
    telemetryBridgeProvider?: string | null;
  }): Promise<AdminDeviceItem>;
  revokeDevice(id: string, wipeOfflineVault?: boolean): Promise<void>;
  getGovernance(): Promise<SovereignGovernanceSlice>;
  createDelegation(data: {
    delegateAdminId: string;
    delegateDisplayName: string;
    delegationType: string;
    grantedScopes: string[];
    justification: string;
    startsAtUtc: string;
    expiresAtUtc: string;
    successionCustodianAdminId?: string | null;
  }): Promise<AdminDelegationItem>;
  revokeDelegation(id: string): Promise<void>;
  getActivity(count?: number): Promise<SovereignActivitySlice>;
  generateInspectorPass(inspectorOrganization: string, validHours: number): Promise<{
    passToken: string;
    expiresAtUtc: string;
    scopeDescription: string;
  }>;
  getPrivacy(): Promise<SovereignPrivacySlice>;
  updatePrivacy(data: {
    encryptedScratchpadCiphertext?: string | null;
    aiTelemetryConsent?: boolean;
    anonymizedBenchmarkConsent?: boolean;
  }): Promise<void>;
  requestPrivacyExport(): Promise<{
    archiveId: string;
    generatedAtUtc: string;
    sha256Signature: string;
    jsonPayload: string;
  }>;
  getPreferences(): Promise<SovereignPreferencesSlice>;
  updatePreferences(data: Partial<SovereignPreferencesSlice>): Promise<SovereignPreferencesSlice>;
  getAccessibility(): Promise<SovereignAccessibilitySlice>;
  updateAccessibility(data: Partial<SovereignAccessibilitySlice>): Promise<SovereignAccessibilitySlice>;
  getAiCopilot(): Promise<SovereignAiCopilotSlice>;
  updateAiCopilot(data: Partial<SovereignAiCopilotSlice>): Promise<SovereignAiCopilotSlice>;
  getNotifications(): Promise<SovereignNotificationsSlice>;
  updateNotifications(data: Partial<SovereignNotificationsSlice>): Promise<SovereignNotificationsSlice>;
  getPlan(): Promise<SovereignPlanSlice>;
  submitPlanRequest(requestType: string, targetCode: string, notes?: string): Promise<void>;
  getBilling(): Promise<SovereignBillingSlice>;
  submitExpenseClaim(data: {
    title: string;
    category: string;
    amount: number;
    currency: string;
    reimbursementIban?: string | null;
    defaultCurrency?: string | null;
  }): Promise<SovereignBillingSlice>;
  getIntegrations(): Promise<SovereignIntegrationsSlice>;
  createIntegrationItem(data: {
    itemKind: "pat" | "ssh" | "webhook";
    name: string;
    publicKeyOrTargetUrl: string;
    scopesOrEvents: string[];
    expiresInDays?: number | null;
  }): Promise<{
    id: string;
    itemKind: string;
    plainTextSecretOnce?: string | null;
    fingerprintOrPrefix: string;
  }>;
  deleteIntegrationItem(itemKind: string, id: string): Promise<void>;
}
