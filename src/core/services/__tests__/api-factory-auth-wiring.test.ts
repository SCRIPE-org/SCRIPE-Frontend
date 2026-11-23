import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import {
  clearApiServiceCache,
  configureApiAuthHandlers,
  getBaseApiService,
  getModuleApiService,
} from "@core/services/api-factory";
import { STORAGE_KEYS } from "@core/config/storage-keys";
import { proxy } from "../../../proxy";
import nextConfig from "../../../../next.config";

describe("api-factory centralized auth handler wiring", () => {
  beforeEach(() => {
    clearApiServiceCache();
  });

  it("applies configureApiAuthHandlers to existing cached instances (base + IDENTITY) and lazily created module instances", async () => {
    const onRefresh = vi.fn(async () => "fresh-jwt-token");
    const onLogout = vi.fn();

    const baseService = getBaseApiService();
    const identityService = getModuleApiService("IDENTITY");

    configureApiAuthHandlers({ onRefresh, onLogout });

    const lazyCrmService = getModuleApiService("CRM");

    // Verify refreshHandler and logoutHandler fields are wired on all instances (same-URL or distinct microservice URLs)
    expect((baseService as unknown as { refreshHandler: unknown }).refreshHandler).toBe(onRefresh);
    expect((baseService as unknown as { logoutHandler: unknown }).logoutHandler).toBe(onLogout);
    expect((identityService as unknown as { refreshHandler: unknown }).refreshHandler).toBe(onRefresh);
    expect((identityService as unknown as { logoutHandler: unknown }).logoutHandler).toBe(onLogout);
    expect((lazyCrmService as unknown as { refreshHandler: unknown }).refreshHandler).toBe(onRefresh);
    expect((lazyCrmService as unknown as { logoutHandler: unknown }).logoutHandler).toBe(onLogout);
  });

  it("wires auth handlers even when IDENTITY uses a split microservice URL distinct from BASE_URL", async () => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:5035/api");
    vi.stubEnv("NEXT_PUBLIC_IDENTITY_API_URL", "http://localhost:5099/identity");

    try {
      const freshFactory = await import("@core/services/api-factory");
      freshFactory.clearApiServiceCache();
      const onRefresh = vi.fn(async () => "rotated-token");
      const onLogout = vi.fn();
      const base = freshFactory.getBaseApiService();
      const identity = freshFactory.getModuleApiService("IDENTITY");

      expect(base).not.toBe(identity);

      freshFactory.configureApiAuthHandlers({ onRefresh, onLogout });

      expect((base as unknown as { refreshHandler: unknown }).refreshHandler).toBe(onRefresh);
      expect((identity as unknown as { refreshHandler: unknown }).refreshHandler).toBe(onRefresh);
      expect((identity as unknown as { logoutHandler: unknown }).logoutHandler).toBe(onLogout);
    } finally {
      vi.unstubAllEnvs();
    }
  });
});

describe("proxy pre-hydration auth-state UX hint routing", () => {
  it("redirects protected manifest routes without hint cookie to /login preserving safe redirect", () => {
    const req = new NextRequest("http://localhost:3000/account/security?tab=2fa");
    const res = proxy(req);
    expect(res.status).toBe(307);
    const location = res.headers.get("location");
    expect(location).toBe(
      `http://localhost:3000/login?redirect=${encodeURIComponent("/account/security?tab=2fa")}`
    );
  });

  it("allows protected manifest routes when pre-hydration hint cookie is present", () => {
    const req = new NextRequest("http://localhost:3000/account/security", {
      headers: { cookie: `${STORAGE_KEYS.scr_auth_state}=true` },
    });
    const res = proxy(req);
    expect(res.status).toBe(200);
  });

  it("allows public recovery routes without hint cookie", () => {
    for (const path of ["/forgot-password", "/reset-password", "/setup-account", "/magic-link"]) {
      const req = new NextRequest(`http://localhost:3000${path}`);
      const res = proxy(req);
      expect(res.status).toBe(200);
    }
  });
});

describe("next.config.ts TypeScript & HTTP security header hardening", () => {
  it("removes typescript.ignoreBuildErrors and sets baseline security headers including CSP and WebAuthn Permissions-Policy", async () => {
    expect(nextConfig.typescript?.ignoreBuildErrors).not.toBe(true);
    expect(typeof nextConfig.headers).toBe("function");

    const rules = await nextConfig.headers!();
    const globalRule = rules.find((r) => r.source === "/(.*)");
    expect(globalRule).toBeDefined();

    const headerMap = new Map(globalRule!.headers.map((h) => [h.key, h.value]));
    expect(headerMap.get("X-Frame-Options")).toBe("DENY");
    expect(headerMap.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headerMap.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(headerMap.get("Permissions-Policy")).toContain("publickey-credentials-get=(self)");
    expect(headerMap.get("Permissions-Policy")).toContain("publickey-credentials-create=(self)");
    expect(headerMap.get("Content-Security-Policy")).toContain("frame-ancestors 'none'");
    expect(headerMap.get("Content-Security-Policy")).toContain("object-src 'none'");
  });
});
