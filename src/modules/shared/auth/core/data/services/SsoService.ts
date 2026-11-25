import { buildUrl } from "@/core/config/api-endpoints/_shared";
import { isExternalCustomDomain } from "@core/common/origin-routing";
import * as customDomainRelayClient from "@core/services/custom-domain-relay-client";
import { postCustomDomainSessionRelay } from "@core/services/custom-domain-relay-client";
import type {
  ISsoService,
  OidcChallengeParams,
  SamlLoginUrlParams,
} from "../interfaces/ISsoService";
import type { IPublicApiService } from "@core/interfaces/public-api.interface";
import type { SsoCallbackResultDto, SsoChallengeDto, SsoProviderDto } from "../models/SsoModels";
import { AUTH_CORE_ENDPOINTS } from "./auth-core.endpoints";

async function resolveConsumedSsoBrowserNonce(options?: {
  clear?: boolean;
}): Promise<string | null> {
  const clear = options?.clear ?? true;
  const relayMod = customDomainRelayClient as unknown as {
    consumeSsoBrowserNonce?: (opts?: { clear?: boolean }) => Promise<string | null | undefined>;
  };
  try {
    if (typeof relayMod.consumeSsoBrowserNonce === "function") {
      const nonce = await relayMod.consumeSsoBrowserNonce({ clear });
      return typeof nonce === "string" && nonce.trim().length > 0 ? nonce.trim() : null;
    }
    const res = await fetch("/api/auth/sso/consume-binding", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ clear }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { browserBindingNonce?: unknown };
    return typeof json?.browserBindingNonce === "string" && json.browserBindingNonce.trim().length > 0
      ? json.browserBindingNonce.trim()
      : null;
  } catch {
    return null;
  }
}

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
    return this.api.post<SsoCallbackResultDto & SsoChallengeDto>(
      AUTH_CORE_ENDPOINTS.OIDC.CHALLENGE,
      params
    );
  }

  buildOidcStartUrl(params: OidcChallengeParams): string {
    const backendUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5035/api").replace(
      /\/+$/,
      ""
    );
    const url = buildUrl(AUTH_CORE_ENDPOINTS.OIDC.START, {
      providerId: params.providerId,
      redirectUri: params.redirectUri || undefined,
      returnOrigin: params.returnOrigin || undefined,
      returnPath: params.returnPath || undefined,
      targetTenantId: params.targetTenantId || undefined,
      targetTenantCode: params.targetTenantCode || undefined,
      staySignedIn: params.staySignedIn ? "true" : undefined,
      browserBindingHash: params.browserBindingHash || undefined,
    });
    return `${backendUrl}${url}`;
  }

  async redeemHandoff(params: {
    code: string;
    state: string;
    browserBindingNonce?: string | null;
  }): Promise<SsoCallbackResultDto> {
    if (isExternalCustomDomain()) {
      return postCustomDomainSessionRelay<SsoCallbackResultDto>("/api/auth/session/establish", {
        code: params.code,
        state: params.state,
      });
    }
    const usedDynamicNonce = params.browserBindingNonce === undefined;
    const browserBindingNonce = usedDynamicNonce
      ? await resolveConsumedSsoBrowserNonce({ clear: false })
      : params.browserBindingNonce;

    try {
      const result = await this.api.post<SsoCallbackResultDto>(AUTH_CORE_ENDPOINTS.SSO.HANDOFF, {
        code: params.code,
        state: params.state,
        ...(browserBindingNonce ? { browserBindingNonce } : {}),
      });
      const isPendingContinuation = Boolean(
        result?.requires2FA || result?.requiresWorkspaceSelection
      );
      if (usedDynamicNonce && browserBindingNonce && !isPendingContinuation) {
        await resolveConsumedSsoBrowserNonce({ clear: true });
      }
      return result;
    } catch (err) {
      if (usedDynamicNonce && browserBindingNonce) {
        await resolveConsumedSsoBrowserNonce({ clear: true });
      }
      throw err;
    }
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
    if (isExternalCustomDomain()) {
      return postCustomDomainSessionRelay<SsoCallbackResultDto>("/api/auth/session/establish", {
        mode: "workspace-selection",
        ...params,
      });
    }
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
      browserBindingHash: params.browserBindingHash || undefined,
    });
    return `${backendUrl}${url}`;
  }

  completeSamlCallback(params: { code: string; state: string }): Promise<SsoCallbackResultDto> {
    return this.api.post<SsoCallbackResultDto>(AUTH_CORE_ENDPOINTS.SAML.CALLBACK, params);
  }
}
