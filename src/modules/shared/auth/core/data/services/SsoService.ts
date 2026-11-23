import { buildUrl } from "@/core/config/api-endpoints/_shared";
import { isExternalCustomDomain } from "@core/common/origin-routing";
import { postCustomDomainSessionRelay } from "@core/services/custom-domain-relay-client";
import type {
  ISsoService,
  OidcChallengeParams,
  SamlLoginUrlParams,
} from "../interfaces/ISsoService";
import type { IPublicApiService } from "@core/interfaces/public-api.interface";
import type { SsoCallbackResultDto, SsoChallengeDto, SsoProviderDto } from "../models/SsoModels";
import { AUTH_CORE_ENDPOINTS } from "./auth-core.endpoints";

export class SsoService implements ISsoService {
  constructor(private readonly api: IPublicApiService) {}

  async getProviders(params: {
    tenantId?: string | null;
    mode?: string | null;
  }): Promise<SsoProviderDto[]> {
    const url = buildUrl(AUTH_CORE_ENDPOINTS.OIDC.ADMIN_PROVIDERS, {
      tenantId: params.tenantId ?? undefined,
      mode: params.tenantId ? (params.mode ?? undefined) : undefined,
    });
    const providers = await this.api.get<SsoProviderDto[]>(url);
    return providers ?? [];
  }

  initiateOidcChallenge(params: OidcChallengeParams): Promise<SsoChallengeDto> {
    return this.api.post<SsoChallengeDto>(AUTH_CORE_ENDPOINTS.OIDC.CHALLENGE, params);
  }

  redeemHandoff(params: { code: string; state: string }): Promise<SsoCallbackResultDto> {
    if (isExternalCustomDomain()) {
      return postCustomDomainSessionRelay<SsoCallbackResultDto>("/api/auth/session/establish", params);
    }
    return this.api.post<SsoCallbackResultDto>(AUTH_CORE_ENDPOINTS.SSO.HANDOFF, params);
  }

  completeOidcCallback(params: {
    providerId: string;
    code: string;
    codeVerifier?: string;
    state: string;
    redirectUri?: string;
  }): Promise<SsoCallbackResultDto> {
    return this.api.post<SsoCallbackResultDto>(AUTH_CORE_ENDPOINTS.OIDC.CALLBACK, params);
  }

  completeWorkspaceSelection(params: {
    token: string;
    tenantId: string;
  }): Promise<SsoCallbackResultDto> {
    return this.api.post<SsoCallbackResultDto>(
      AUTH_CORE_ENDPOINTS.OIDC.COMPLETE_WORKSPACE_SELECTION,
      params
    );
  }

  buildSamlLoginUrl(params: SamlLoginUrlParams): string {
    const backendUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5035/api").replace(
      /\/+$/,
      ""
    );
    const url = buildUrl(AUTH_CORE_ENDPOINTS.SAML.LOGIN, {
      providerId: params.providerId,
      redirectUri: params.redirectUri || undefined,
      returnOrigin: params.returnOrigin || undefined,
      returnPath: params.returnPath || undefined,
      targetTenantId: params.targetTenantId || undefined,
      targetTenantCode: params.targetTenantCode || undefined,
      staySignedIn: params.staySignedIn ? "true" : undefined,
    });
    return `${backendUrl}${url}`;
  }

  completeSamlCallback(params: { code: string; state: string }): Promise<SsoCallbackResultDto> {
    return this.api.post<SsoCallbackResultDto>(AUTH_CORE_ENDPOINTS.SAML.CALLBACK, params);
  }
}
