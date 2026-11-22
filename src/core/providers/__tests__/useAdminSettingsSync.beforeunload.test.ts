import { renderHook } from "@testing-library/react";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { useAppStore } from "@core/store/useAppStore";
import { STORAGE_KEYS } from "@core/config/storage-keys";
import { broadcastTenantContext } from "@core/services/api-factory";

vi.mock("@core/common/secure-token-service", () => ({
  secureTokenService: {
    hasToken: () => true,
    getAccessToken: () => "jwt-keepalive-token",
    subscribe: () => () => {},
  },
}));

vi.mock("@core/services/api-factory", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@core/services/api-factory")>();
  return {
    ...actual,
    getModuleApiService: () => ({
      get: vi.fn().mockResolvedValue({ adminSettingsJson: null }),
      put: vi.fn().mockResolvedValue(undefined),
    }),
  };
});

import { useAdminSettingsSync } from "../useAdminSettingsSync";

describe("useAdminSettingsSync beforeunload keepalive headers (BUG-03)", () => {
  const originalFetch = global.fetch;
  const originalLocalGetItem = window.localStorage.getItem;
  const originalLocalSetItem = window.localStorage.setItem;
  const storageMap = new Map<string, string>();

  beforeEach(() => {
    vi.clearAllMocks();
    storageMap.clear();
    Object.defineProperty(window.localStorage, "getItem", {
      configurable: true,
      value: vi.fn((key: string) => storageMap.get(key) ?? null),
    });
    Object.defineProperty(window.localStorage, "setItem", {
      configurable: true,
      value: vi.fn((key: string, val: string) => {
        storageMap.set(key, val);
      }),
    });
    sessionStorage.clear();
    broadcastTenantContext(null);
    useAppStore.setState({
      isAuthenticated: true,
      mustChangePassword: false,
      _hasHydrated: true,
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    Object.defineProperty(window.localStorage, "getItem", {
      configurable: true,
      value: originalLocalGetItem,
    });
    Object.defineProperty(window.localStorage, "setItem", {
      configurable: true,
      value: originalLocalSetItem,
    });
    broadcastTenantContext(null);
  });

  it("includes X-Request-Timestamp, X-Request-Nonce, and X-Tenant-Context on keepalive PUT", () => {
    const fetchSpy = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    global.fetch = fetchSpy as typeof fetch;

    broadcastTenantContext("tenant-ctx-42");

    renderHook(() => useAdminSettingsSync());

    localStorage.setItem(
      STORAGE_KEYS.DASHBOARD_SETTINGS,
      JSON.stringify({ theme: "dark" })
    );
    window.dispatchEvent(
      new CustomEvent("settings-changed", { detail: { changedField: "theme" } })
    );
    window.dispatchEvent(new Event("beforeunload"));

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe("PUT");
    expect(init.keepalive).toBe(true);
    expect(init.credentials).toBe("include");

    const headers = init.headers as Record<string, string>;
    expect(headers["Content-Type"]).toBe("application/json");
    expect(headers.Authorization).toBe("Bearer jwt-keepalive-token");
    expect(headers["X-Request-Timestamp"]).toMatch(/^\d{10,}$/);
    expect(headers["X-Request-Nonce"]).toBeTruthy();
    expect(headers["X-Tenant-Context"]).toBe("tenant-ctx-42");
  });
});
