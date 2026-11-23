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
import { useAppStore } from "@core/store/useAppStore";
import { useNavigationStore } from "@core/navigation/store/useNavigationStore";
import { clearNavigationCaches } from "../utils/auth-storage-cleanup";
import type { IAuthService } from "../../domain/interfaces/IAuthService";

export class ImpersonationRepository {
  constructor(private readonly service: IAuthService) {}

  /**
   * Prepare client stores and cookies for an identity swap (impersonate / stop-impersonate)
   * without flipping `isAuthenticated` to false or deleting the auth-state reload hint.
   */
  private resetSessionForIdentitySwap(options: {
    isImpersonating: boolean;
    accessToken: string;
  }): void {
    const { isImpersonating, accessToken } = options;

    useAppStore.getState().beginSessionTransition();
    useNavigationStore.getState().reset();

    if (typeof window !== "undefined") {
      sessionStorage.removeItem(STORAGE_KEYS.tenant_context);
      sessionStorage.removeItem("scr_tenant_breadcrumbs");
      if (isImpersonating) {
        sessionStorage.setItem(STORAGE_KEYS.IMPERSONATING, "true");
      } else {
        sessionStorage.removeItem(STORAGE_KEYS.IMPERSONATING);
        sessionStorage.removeItem(STORAGE_KEYS.admin_backup_token);
      }
      // Clear navigation cache so menu items reload with the swapped identity
      clearNavigationCaches();
    }

    secureTokenService.setAccessToken(accessToken);
    if (isImpersonating) {
      authBroadcast.broadcastImpersonationStart();
    } else {
      authBroadcast.broadcastImpersonationStop();
    }
  }

  /**
   * Start impersonation — calls auth endpoint, resets prior user state/caches, sets access token.
   * CookieAuthMiddleware handles the httpOnly refresh token cookie.
   */
  async impersonate(adminId: string): Promise<void> {
    const responseModel = await this.service.impersonate(adminId);

    if (responseModel.accessToken) {
      this.resetSessionForIdentitySwap({
        isImpersonating: true,
        accessToken: responseModel.accessToken,
      });
    } else {
      throw new Error("Impersonation failed: No access token received.");
    }
  }

  /**
   * Stop impersonation — resets impersonated state/caches and restores the original admin session.
   * CookieAuthMiddleware reads refresh token from cookie and replaces it.
   */
  async stopImpersonation(): Promise<void> {
    const responseModel = await this.service.stopImpersonation();

    if (responseModel.accessToken) {
      this.resetSessionForIdentitySwap({
        isImpersonating: false,
        accessToken: responseModel.accessToken,
      });
    } else {
      throw new Error("Stop impersonation failed: No access token received.");
    }
  }

  /**
   * Builds the backend `/connect/authorize?...` URL without stale `consent_ticket`
   * so unauthenticated consent sessions re-authenticate through OpenIddict cleanly.
   */
  buildOidcAuthorizeUrl(searchParams: URLSearchParams): string {
    return this.service.buildOidcAuthorizeUrl(searchParams);
  }

  /**
   * Abstract the OIDC Consent form parameters generation out of the Presentation layer.
   */
  buildOidcConsentForm(
    searchParams: URLSearchParams,
    decision: "approve" | "deny" = "approve"
  ): { action: string; params: Record<string, string> } {
    return this.service.buildOidcConsentForm(searchParams, decision);
  }

  /**
   * Builds the backend `/oidc/logout` URL with a sanitized `/connect/authorize` returnUrl.
   */
  buildOidcLogoutUrl(searchParams: URLSearchParams): string {
    return this.service.buildOidcLogoutUrl(searchParams);
  }
}
