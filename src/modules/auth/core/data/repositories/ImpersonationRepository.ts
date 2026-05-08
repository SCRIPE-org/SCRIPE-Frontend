/**
 * ImpersonationRepository — Impersonation operations for AuthRepository
 *
 * Extracted from AuthRepository to keep that class focused on
 * authentication (login / logout / refresh / 2FA / workspace).
 *
 * These methods are mixed in via composition in AuthRepository.
 */
import { secureTokenService } from "@core/common/secure-token-service";
import { authBroadcast } from "@core/common/broadcast-auth";
import { STORAGE_KEYS } from "@core/config/storage-keys";
import { appLogger } from "@core/common/logger";
import { clearNavigationCaches } from "../utils/auth-storage-cleanup";
import type { IAuthService } from "../../domain/interfaces/IAuthService";

export class ImpersonationRepository {
  constructor(private readonly service: IAuthService) {}

  /**
   * Start impersonation — calls auth endpoint, sets access token.
   * CookieAuthMiddleware handles the httpOnly refresh token cookie.
   */
  async impersonate(adminId: string): Promise<void> {
    const responseModel = await this.service.impersonate(adminId);

    if (responseModel.accessToken) {
      secureTokenService.setAccessToken(responseModel.accessToken);

      if (typeof window !== "undefined") {
        sessionStorage.setItem(STORAGE_KEYS.IMPERSONATING, "true");
        // Clear navigation cache so menu items reload with the impersonated identity
        clearNavigationCaches();
      }

      authBroadcast.broadcastImpersonationStart();
    } else {
      throw new Error("Impersonation failed: No access token received.");
    }
  }

  /**
   * Stop impersonation — restores the original admin session.
   * CookieAuthMiddleware reads refresh token from cookie and replaces it.
   */
  async stopImpersonation(): Promise<void> {
    const responseModel = await this.service.stopImpersonation();

    if (responseModel.accessToken) {
      secureTokenService.setAccessToken(responseModel.accessToken);

      if (typeof window !== "undefined") {
        sessionStorage.removeItem(STORAGE_KEYS.IMPERSONATING);
        sessionStorage.removeItem(STORAGE_KEYS.admin_backup_token);
        clearNavigationCaches();
      }

      authBroadcast.broadcastImpersonationStop();
    } else {
      throw new Error("Stop impersonation failed: No access token received.");
    }
  }

  /**
   * Link an external SSO account to the currently authenticated admin profile.
   * Used by SSO/SAML callback views when auto-linking during a linking session.
   */
  async linkExternalLogin(data: {
    identityProviderId: string;
    providerName: string;
    providerKey: string;
    email: string;
    displayName?: string;
  }): Promise<void> {
    await this.service.linkExternalLogin(data);
  }

  /**
   * Abstract the OIDC Consent form parameters generation out of the Presentation layer.
   */
  buildOidcConsentForm(
    searchParams: URLSearchParams,
    accessToken: string
  ): { action: string; params: Record<string, string> } {
    return this.service.buildOidcConsentForm(searchParams, accessToken);
  }
}
