import type {
  SovereignAccountContext,
  SovereignDossierSlice,
  SovereignSecuritySlice,
  SovereignSessionsSlice,
  SovereignGovernanceSlice,
  AdminDelegationItem,
  SovereignActivitySlice,
  SovereignPreferencesSlice,
  SovereignNotificationsSlice,
  SovereignPlanSlice,
  SovereignIntegrationsSlice,
} from "../entities/SovereignAccountEntities";

export interface ISovereignAccountRepository {
  getContext(): Promise<SovereignAccountContext>;
  getDossier(): Promise<SovereignDossierSlice>;
  sendEmailVerification(): Promise<{ message?: string; expiresInSeconds?: number }>;
  getSecurity(): Promise<SovereignSecuritySlice>;
  updateSecurityPosture(data: {
    trustedCidrs?: string[];
    verifySudoPinOrPasskeyToken?: string | null;
    lockdownConfirmation?: string | null;
  }): Promise<void>;
  getSessions(): Promise<SovereignSessionsSlice>;
  pingSession(sessionId: string): Promise<{ sessionId: string; rttMilliseconds: number; status: string }>;
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
  getPreferences(): Promise<SovereignPreferencesSlice>;
  updatePreferences(data: Partial<SovereignPreferencesSlice>): Promise<SovereignPreferencesSlice>;
  getNotifications(): Promise<SovereignNotificationsSlice>;
  updateNotifications(data: Partial<SovereignNotificationsSlice>): Promise<SovereignNotificationsSlice>;
  sendTestNotification(category?: string): Promise<SovereignNotificationsSlice>;
  getPlan(): Promise<SovereignPlanSlice>;
  submitPlanRequest(requestType: string, targetCode: string, notes?: string): Promise<void>;
  getIntegrations(): Promise<SovereignIntegrationsSlice>;
  createIntegrationItem(data: {
    itemKind: "pat";
    name: string;
    publicKeyOrTargetUrl?: string;
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

