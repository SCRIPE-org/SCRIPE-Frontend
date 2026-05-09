import type { SsoCallbackResult, SsoProvider } from "../entities/SsoProvider";

export interface ISsoRepository {
  getProviders(params: { tenantId?: string | null; mode?: string | null }): Promise<SsoProvider[]>;
  initiateLogin(providerId: string, protocol?: string): Promise<void>;
  completeCallback(code: string, state: string): Promise<SsoCallbackResult>;
}
