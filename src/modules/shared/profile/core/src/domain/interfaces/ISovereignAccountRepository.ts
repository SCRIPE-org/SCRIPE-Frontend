import type {
  AccountColleagueOption,
  SovereignAccountContext,
  SovereignDossierSlice,
  SovereignSecuritySlice,
  SovereignSessionsSlice,
  SovereignGovernanceSlice,
  AdminDelegationItem,
  SovereignActivityQuery,
  SovereignActivitySlice,
  SovereignPreferencesSlice,
  SovereignNotificationsSlice,
  SovereignPlanSlice,
  SovereignIntegrationsSlice,
  PersonalAccessTokenSummary,
} from "../entities/SovereignAccountEntities";

/** Repository contract for Sovereign B2B Account slices, governance, preferences, notifications, plan, and integrations. */
export interface ISovereignAccountRepository {
  getContext(): Promise<SovereignAccountContext>;
  getDossier(): Promise<SovereignDossierSlice>;
  sendEmailVerification(): Promise<{ message?: string; expiresInSeconds?: number }>;
  exportAccountData(): Promise<Record<string, unknown>>;
  deactivateAccount(): Promise<{ deactivated?: boolean; message?: string }>;
  getSecurity(): Promise<SovereignSecuritySlice>;
  updateSecurityPosture(data: {
    trustedCidrs?: string[];
    verifySudoPinOrPasskeyToken?: string | null;
    lockdownConfirmation?: string | null;
    rowVersion?: string;
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
  getActivity(countOrQuery?: number | SovereignActivityQuery): Promise<SovereignActivitySlice>;
  getPreferences(): Promise<SovereignPreferencesSlice>;
  updatePreferences(data: Partial<SovereignPreferencesSlice>): Promise<SovereignPreferencesSlice>;
  getNotifications(): Promise<SovereignNotificationsSlice>;
  updateNotifications(data: Partial<SovereignNotificationsSlice>): Promise<SovereignNotificationsSlice>;
  sendTestNotification(category?: string): Promise<SovereignNotificationsSlice>;
  markNotificationAsRead(id: string): Promise<void>;
  markAllNotificationsAsRead(): Promise<void>;
  deleteNotification(id: string): Promise<void>;
  getPlan(): Promise<SovereignPlanSlice>;
  submitPlanRequest(requestType: string, targetCode: string, notes?: string): Promise<void>;
  getIntegrations(): Promise<SovereignIntegrationsSlice>;
  createIntegrationItem(data: {
    itemKind: "pat" | "sso";
    name: string;
    description?: string | null;
    publicKeyOrTargetUrl?: string;
    scopesOrEvents: string[];
    expiresInDays?: number | null;
    allowedCidrs?: string[] | null;
  }): Promise<{
    id: string;
    itemKind: string;
    plainTextSecretOnce?: string | null;
    fingerprintOrPrefix: string;
  }>;
  updatePersonalAccessToken(
    id: string,
    data: {
      name: string;
      description?: string | null;
      scopes: string[];
      allowedCidrs?: string[] | null;
      expiresInDays?: number | null;
      rowVersion?: string | null;
    }
  ): Promise<PersonalAccessTokenSummary>;
  rollPersonalAccessToken(id: string): Promise<{
    id: string;
    itemKind: string;
    plainTextSecretOnce?: string | null;
    fingerprintOrPrefix: string;
  }>;
  searchColleagues(query: string): Promise<AccountColleagueOption[]>;
  deleteIntegrationItem(itemKind: string, id: string): Promise<void>;
}

