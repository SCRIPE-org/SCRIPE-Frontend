import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import type { ISsoService } from "../interfaces/ISsoService";
import type { IPublicApiService } from "@core/interfaces/public-api.interface";
import type { SsoCallbackResultDto, SsoChallengeDto, SsoProviderDto } from "../models/SsoModels";

export class SsoService implements ISsoService {
  constructor(private readonly api: IPublicApiService) {}

  async getProviders(params: {
    tenantId?: string | null;
    mode?: string | null;
  }): Promise<SsoProviderDto[]> {
    const url = buildUrl(API_ENDPOINTS.AUTH.OIDC.ADMIN_PROVIDERS, {
      tenantId: params.tenantId ?? undefined,
      mode: params.tenantId ? (params.mode ?? undefined) : undefined,
    });
    const providers = await this.api.get<SsoProviderDto[]>(url);
    return providers ?? [];
  }

  initiateOidcChallenge(params: {
    providerId: string;
    redirectUri?: string;
  }): Promise<SsoChallengeDto> {
    return this.api.post<SsoChallengeDto>(API_ENDPOINTS.AUTH.OIDC.CHALLENGE, params);
  }

  completeOidcCallback(params: {
    providerId: string;
    code: string;
    codeVerifier: string;
    state: string;
    redirectUri?: string;
  }): Promise<SsoCallbackResultDto> {
    return this.api.post<SsoCallbackResultDto>(API_ENDPOINTS.AUTH.OIDC.CALLBACK, params);
  }

  completeWorkspaceSelection(params: {
    token: string;
    tenantId: string;
  }): Promise<SsoCallbackResultDto> {
    return this.api.post<SsoCallbackResultDto>(
      API_ENDPOINTS.AUTH.OIDC.COMPLETE_WORKSPACE_SELECTION,
      params
    );
  }

  buildSamlLoginUrl(params: { providerId: string; redirectUri?: string }): string {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const query = new URLSearchParams({ providerId: params.providerId });
    if (params.redirectUri) {
      query.set("redirectUri", params.redirectUri);
    }
    return `${backendUrl}${API_ENDPOINTS.AUTH.SAML.LOGIN}?${query.toString()}`;
  }
}
