import type { SsoCallbackResult, SsoProvider } from "../entities/SsoProvider";

export interface SsoInitiateLoginOptions {
  returnPath?: string | null;
  returnOrigin?: string | null;
  targetTenantId?: string | null;
  targetTenantCode?: string | null;
  staySignedIn?: boolean;
  useTopLevelOidcStart?: boolean;
}

export interface ISsoRepository {
  getProviders(params: { tenantId?: string | null; mode?: string | null }): Promise<SsoProvider[]>;
  initiateLogin(
    providerId: string,
    protocol?: string,
    options?: SsoInitiateLoginOptions
  ): Promise<void>;
  completeCallback(code: string, state: string): Promise<SsoCallbackResult>;
  completeWorkspaceSelection(token: string, tenantId: string): Promise<SsoCallbackResult>;
  completeSamlCallback(code: string, state: string): Promise<SsoCallbackResult>;
}
