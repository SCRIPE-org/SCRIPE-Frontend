import { describe, it, expect, beforeEach, vi } from "vitest";
import { STORAGE_KEYS } from "@core/config/storage-keys";
import { useAppStore } from "@core/store/useAppStore";
import { useSudoStore } from "@core/store/useSudoStore";
import { usePatOneTimeSecretStore } from "@core/store/usePatOneTimeSecretStore";
import { useNavigationStore } from "@core/navigation/store/useNavigationStore";
import { secureTokenService } from "@core/common/secure-token-service";
import {
  clearAllLocalStorage,
  clearSessionOnLoginMount,
} from "../data/utils/auth-storage-cleanup";
import { ImpersonationRepository } from "../data/repositories/ImpersonationRepository";
import { SsoRepository } from "../data/repositories/SsoRepository";
import { AuthService } from "../data/services/AuthService";
import type { IAuthService } from "../domain/interfaces/IAuthService";
import type { ISsoService } from "../data/interfaces/ISsoService";
import { LoginResponseModel } from "../data/models/AuthModel";

describe("auth-storage-cleanup sudo & PAT secret resets", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    useAppStore.getState().logout();
    useSudoStore.getState().reset();
    usePatOneTimeSecretStore.getState().clearPendingReceipt();
  });

  it("resets useSudoStore, usePatOneTimeSecretStore, and scr_tenant_breadcrumbs in clearAllLocalStorage()", () => {
    useSudoStore.getState().markVerified({
      sudoToken: "sudo-jwt-123",
      expiresAtUtc: new Date(Date.now() + 300_000).toISOString(),
      methodUsed: "password",
    });
    usePatOneTimeSecretStore.getState().setPendingReceipt({
      tokenId: "pat-1",
      tokenName: "CI Token",
      plainTextSecret: "scr_pat_secret_123",
      fingerprintOrPrefix: "scr_pat_secret",
      isRotated: false,
      ownerUserId: "user-a",
    });
    sessionStorage.setItem("scr_tenant_breadcrumbs", '["A"]');

    clearAllLocalStorage();

    expect(useSudoStore.getState().sudoToken).toBeNull();
    expect(useSudoStore.getState().isActive).toBe(false);
    expect(usePatOneTimeSecretStore.getState().pendingReceipt).toBeNull();
    expect(sessionStorage.getItem("scr_tenant_breadcrumbs") ?? null).toBeNull();
  });

  it("resets useSudoStore, usePatOneTimeSecretStore, and scr_tenant_breadcrumbs on login mount", () => {
    useSudoStore.getState().markVerified({
      sudoToken: "sudo-jwt-456",
      expiresAtUtc: new Date(Date.now() + 300_000).toISOString(),
      methodUsed: "password",
    });
    usePatOneTimeSecretStore.getState().setPendingReceipt({
      tokenId: "pat-2",
      tokenName: "Deploy Token",
      plainTextSecret: "scr_pat_secret_456",
      fingerprintOrPrefix: "scr_pat_secret",
      isRotated: true,
      ownerUserId: "user-b",
    });
    sessionStorage.setItem("scr_tenant_breadcrumbs", '["B"]');

    clearSessionOnLoginMount();

    expect(useSudoStore.getState().sudoToken).toBeNull();
    expect(useSudoStore.getState().isActive).toBe(false);
    expect(usePatOneTimeSecretStore.getState().pendingReceipt).toBeNull();
    expect(sessionStorage.getItem("scr_tenant_breadcrumbs") ?? null).toBeNull();
  });
});

describe("ImpersonationRepository session & store cleanup", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    useAppStore.getState().logout();
    useSudoStore.getState().reset();
    usePatOneTimeSecretStore.getState().clearPendingReceipt();
  });

  it("clears previous admin store, sudo/PAT stores, and tenant context before storing impersonated token", async () => {
    useSudoStore.getState().markVerified({
      sudoToken: "sudo-prev",
      expiresAtUtc: new Date(Date.now() + 300_000).toISOString(),
      methodUsed: "password",
    });
    usePatOneTimeSecretStore.getState().setPendingReceipt({
      tokenId: "pat-prev",
      tokenName: "Prev",
      plainTextSecret: "secret-prev",
      fingerprintOrPrefix: "secret",
      isRotated: false,
      ownerUserId: "admin-prev",
    });
    useNavigationStore.setState({
      routesLoaded: true,
      routesContextKey: "tenant-prev:admin",
      landingResolution: {
        targetKind: "workspace",
        route: "/crm",
        workspaceKey: "crm",
        sourceReason: "AdminPreference",
        isEnforced: false,
        enforcingRoleName: null,
        wasFallbackApplied: false,
        fallbackReason: null,
      },
      recentWorkspaceKeysByContext: { "tenant-prev:admin": ["crm"] },
    });
    useAppStore.getState().setAuth(
      { id: "admin-prev", username: "prev", permissions: ["all"] } as never,
      ["all"],
      [],
      false
    );
    sessionStorage.setItem(STORAGE_KEYS.tenant_context, "stale-tenant");
    sessionStorage.setItem("scr_tenant_breadcrumbs", '["Prev"]');

    const removeItemSpy = vi.mocked(localStorage.removeItem);
    const setItemSpy = vi.mocked(localStorage.setItem);
    removeItemSpy.mockClear();
    setItemSpy.mockClear();

    const serviceMock = {
      impersonate: vi.fn().mockResolvedValue(new LoginResponseModel("impersonated-jwt")),
      stopImpersonation: vi.fn().mockResolvedValue(new LoginResponseModel("restored-admin-jwt")),
    } as unknown as IAuthService;

    const repo = new ImpersonationRepository(serviceMock);
    await repo.impersonate("target-admin");

    expect(useSudoStore.getState().sudoToken).toBeNull();
    expect(useSudoStore.getState().isActive).toBe(false);
    expect(usePatOneTimeSecretStore.getState().pendingReceipt).toBeNull();
    expect(useAppStore.getState().user).toBeNull();
    expect(useAppStore.getState().permissions).toEqual([]);
    expect(useAppStore.getState().roles).toEqual([]);
    expect(useAppStore.getState().isAuthenticated).toBe(true);
    expect(useAppStore.getState().isAuthTransitioning).toBe(true);
    expect(document.cookie).toContain(`${STORAGE_KEYS.scr_auth_state}=true`);
    expect(useNavigationStore.getState().routesLoaded).toBe(false);
    expect(useNavigationStore.getState().landingResolution).toBeNull();
    expect(useNavigationStore.getState().recentWorkspaceKeysByContext).toEqual({});
    expect(removeItemSpy).not.toHaveBeenCalledWith(STORAGE_KEYS.APP_STORE);
    const appStoreWrites = setItemSpy.mock.calls.filter(
      ([key]) => key === STORAGE_KEYS.APP_STORE
    );
    expect(appStoreWrites.length).toBeGreaterThan(0);
    const persistedState = JSON.parse(
      String(appStoreWrites[appStoreWrites.length - 1][1])
    ).state;
    expect(persistedState.isAuthenticated).toBe(true);
    expect(persistedState.user).toBeNull();
    expect(persistedState.permissions).toEqual([]);
    expect(persistedState.isAuthTransitioning).toBeUndefined();
    expect(sessionStorage.getItem(STORAGE_KEYS.tenant_context) ?? null).toBeNull();
    expect(sessionStorage.getItem("scr_tenant_breadcrumbs") ?? null).toBeNull();
    expect(sessionStorage.getItem(STORAGE_KEYS.IMPERSONATING)).toBe("true");
    expect(secureTokenService.getAccessToken()).toBe("impersonated-jwt");

    useNavigationStore.setState({
      routesLoaded: true,
      landingResolution: {
        targetKind: "hub",
        route: "/hub",
        workspaceKey: null,
        sourceReason: "MultiWorkspaceHub",
        isEnforced: false,
        enforcingRoleName: null,
        wasFallbackApplied: false,
        fallbackReason: null,
      },
    });
    await repo.stopImpersonation();
    expect(useAppStore.getState().isAuthenticated).toBe(true);
    expect(useAppStore.getState().isAuthTransitioning).toBe(true);
    expect(document.cookie).toContain(`${STORAGE_KEYS.scr_auth_state}=true`);
    expect(sessionStorage.getItem(STORAGE_KEYS.IMPERSONATING) ?? null).toBeNull();
    expect(secureTokenService.getAccessToken()).toBe("restored-admin-jwt");
    expect(useNavigationStore.getState().routesLoaded).toBe(false);
    expect(useNavigationStore.getState().landingResolution).toBeNull();
  });
});

describe("AuthService.buildOidcLogoutUrl & SsoRepository URL validation", () => {
  it("strips consent_ticket and builds /oidc/logout?returnUrl=/connect/authorize?...", () => {
    const service = new AuthService({} as never);
    const params = new URLSearchParams(
      "client_id=app1&redirect_uri=https://client.app/cb&response_type=code&scope=openid&consent_ticket=stale-ticket"
    );

    const logoutUrl = service.buildOidcLogoutUrl(params);
    const parsed = new URL(logoutUrl);
    expect(parsed.pathname).toBe("/oidc/logout");
    const returnUrl = parsed.searchParams.get("returnUrl");
    expect(returnUrl).toContain("/connect/authorize?");
    expect(returnUrl).toContain("client_id=app1");
    expect(returnUrl).not.toContain("consent_ticket");
    expect(returnUrl).not.toContain("stale-ticket");
  });

  it("blocks non-http(s) authorizationUrl in SsoRepository.initiateLogin", async () => {
    const ssoService = {
      initiateOidcChallenge: vi.fn().mockResolvedValue({
        authorizationUrl: "javascript:alert(1)",
        codeVerifier: "ver",
        state: "st",
      }),
      buildSamlLoginUrl: vi.fn().mockReturnValue("data:text/html,<script>alert(1)</script>"),
    } as unknown as ISsoService;

    const repo = new SsoRepository(ssoService);
    await expect(repo.initiateLogin("idp-1", "oidc")).rejects.toThrow(
      /Invalid SSO authorization redirect URL/i
    );
    await expect(repo.initiateLogin("idp-2", "saml")).rejects.toThrow(
      /Invalid SSO login redirect URL/i
    );
  });
});
