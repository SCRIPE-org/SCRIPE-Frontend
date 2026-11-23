import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getSafeRedirectPath, isSafeRedirectTarget } from "../redirect-safety";
import { sanitizeHttpUrl } from "../sanitize";
import { secureTokenService } from "../secure-token-service";
import { authBroadcast } from "../broadcast-auth";
import { STORAGE_KEYS } from "@core/config/storage-keys";
import { useAppStore } from "@core/store/useAppStore";
import { useSudoStore } from "@core/store/useSudoStore";
import { usePatOneTimeSecretStore } from "@core/store/usePatOneTimeSecretStore";

describe("redirect-safety same-origin normalization", () => {
  it("normalizes same-origin absolute URLs to relative pathname+search+hash", () => {
    const origin = window.location.origin;
    expect(isSafeRedirectTarget(`${origin}/venue/courts?tab=pricing#top`)).toBe(true);
    expect(getSafeRedirectPath(`${origin}/venue/courts?tab=pricing#top`, "/overview")).toBe(
      "/venue/courts?tab=pricing#top"
    );
  });

  it("blocks cross-origin, backslash, and script redirect targets", () => {
    expect(getSafeRedirectPath("https://evil.example/steal", "/overview")).toBe("/overview");
    expect(getSafeRedirectPath("javascript:alert(1)", "/overview")).toBe("/overview");
    expect(getSafeRedirectPath("/%5cevil.example", "/overview")).toBe("/overview");
  });
});

describe("sanitizeHttpUrl", () => {
  it("accepts only http: and https: URLs with non-empty hostnames", () => {
    expect(sanitizeHttpUrl("https://accounts.google.com/o/oauth2/v2/auth?client_id=1")).toBe(
      "https://accounts.google.com/o/oauth2/v2/auth?client_id=1"
    );
    expect(sanitizeHttpUrl("http://localhost:5035/api/v1/auth/saml/login?providerId=1")).toBe(
      "http://localhost:5035/api/v1/auth/saml/login?providerId=1"
    );
    expect(sanitizeHttpUrl("javascript:alert(document.domain)")).toBeNull();
    expect(sanitizeHttpUrl("data:text/html,<script>alert(1)</script>")).toBeNull();
    expect(sanitizeHttpUrl("vbscript:msgbox(1)")).toBeNull();
    expect(sanitizeHttpUrl("/relative/path")).toBeNull();
  });
});

describe("secureTokenService memory-only isolation", () => {
  beforeEach(() => {
    secureTokenService.clearTokens();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    secureTokenService.clearTokens();
    sessionStorage.clear();
  });

  it("never mirrors or reads dev_access_token in sessionStorage in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    secureTokenService.setAccessToken("prod-token-123");
    expect(sessionStorage.getItem("dev_access_token")).toBeNull();

    secureTokenService.clearTokens();
    sessionStorage.setItem("dev_access_token", "injected-token");
    expect(secureTokenService.getAccessToken()).toBeNull();
  });

  it("never mirrors or reads dev_access_token in sessionStorage in development either", () => {
    vi.stubEnv("NODE_ENV", "development");
    secureTokenService.setAccessToken("dev-token-abc");
    expect(sessionStorage.getItem("dev_access_token")).toBeNull();

    secureTokenService.clearTokens();
    sessionStorage.setItem("dev_access_token", "header.payload.signature");
    expect(secureTokenService.getAccessToken()).toBeNull();
  });
});

describe("authBroadcast Set listeners & cross-tab impersonation invalidation", () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    useAppStore.getState().logout();
  });

  it("supports multiple independent listeners with unsubscribe cleanup and clears sibling state on impersonation events", () => {
    const firstListener = vi.fn();
    const secondListener = vi.fn();

    const unsubFirst = authBroadcast.onImpersonation(firstListener);
    const unsubSecond = authBroadcast.onImpersonation(secondListener);

    useAppStore.getState().setAuth(
      { id: "admin-1", username: "admin1", permissions: ["admin"] } as never,
      ["admin"],
      [],
      false
    );
    localStorage.setItem(STORAGE_KEYS.APP_STORE, '{"state":{"user":"admin1"}}');
    sessionStorage.setItem(STORAGE_KEYS.tenant_context, "tenant-a");
    sessionStorage.setItem("scr_tenant_breadcrumbs", '["Home"]');
    secureTokenService.setAccessToken("old-tab-token");

    (authBroadcast as unknown as { handleMessage: (evt: unknown) => void }).handleMessage({
      type: "IMPERSONATION_START",
    });

    expect(firstListener).toHaveBeenCalledWith("start");
    expect(secondListener).toHaveBeenCalledWith("start");
    expect(secureTokenService.getAccessToken()).toBeNull();
    expect(useAppStore.getState().user).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.APP_STORE) ?? null).toBeNull();
    expect(sessionStorage.getItem(STORAGE_KEYS.tenant_context) ?? null).toBeNull();
    expect(sessionStorage.getItem("scr_tenant_breadcrumbs") ?? null).toBeNull();
    expect(sessionStorage.getItem(STORAGE_KEYS.IMPERSONATING)).toBe("true");

    unsubFirst();

    (authBroadcast as unknown as { handleMessage: (evt: unknown) => void }).handleMessage({
      type: "IMPERSONATION_STOP",
    });

    expect(firstListener).toHaveBeenCalledTimes(1);
    expect(secondListener).toHaveBeenCalledWith("stop");
    expect(sessionStorage.getItem(STORAGE_KEYS.IMPERSONATING) ?? null).toBeNull();

    unsubSecond();
  });

  it("resets useSudoStore and usePatOneTimeSecretStore when useAppStore.logout() runs", () => {
    useSudoStore.getState().markVerified({
      sudoToken: "sudo-jwt-logout",
      expiresAtUtc: new Date(Date.now() + 300_000).toISOString(),
      methodUsed: "password",
    });
    usePatOneTimeSecretStore.getState().setPendingReceipt({
      tokenId: "pat-logout",
      tokenName: "Temp",
      plainTextSecret: "scr_pat_secret",
      fingerprintOrPrefix: "scr_pat",
      isRotated: false,
      ownerUserId: "u1",
    });

    useAppStore.getState().logout();

    expect(useSudoStore.getState().sudoToken).toBeNull();
    expect(useSudoStore.getState().isActive).toBe(false);
    expect(usePatOneTimeSecretStore.getState().pendingReceipt).toBeNull();
  });
});
