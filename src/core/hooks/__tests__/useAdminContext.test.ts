import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAdminContext } from "../useAdminContext";

const { mockAppState, mockUseAppStore, mockTenantContext, mockBranding, mockI18n } = vi.hoisted(() => {
  const mockAppState = {
    user: null as { id: string; tenantId?: string | null; tenantName?: string | null; tenantCode?: string | null } | null,
    tenantCode: null as string | null,
    _hasHydrated: true,
  };

  const mockTenantContext = {
    currentTenant: null as { id: string; name: string } | null,
    isInTenantWorld: false,
  };

  const mockBranding = {
    appName: "SCRIPE",
    companyName: "SCRIPE",
    isTenantContext: false,
  };

  const mockI18n = {
    language: "en" as "en" | "ar",
    t: (key: string, params?: Record<string, string | number>) =>
      params?.defaultValue ? String(params.defaultValue) : key,
  };

  const mockUseAppStore = (selector: (state: typeof mockAppState) => unknown) =>
    selector(mockAppState);

  return { mockAppState, mockUseAppStore, mockTenantContext, mockBranding, mockI18n };
});

vi.mock("@core/store/useAppStore", () => ({
  useAppStore: mockUseAppStore,
}));

vi.mock("@core/providers/tenant-context-provider", () => ({
  useTenantContext: () => mockTenantContext,
}));

vi.mock("@core/providers/tenant-branding-provider", () => ({
  useTenantBranding: () => mockBranding,
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => mockI18n,
}));

describe("useAdminContext", () => {
  beforeEach(() => {
    mockAppState.user = null;
    mockAppState.tenantCode = null;
    mockAppState._hasHydrated = true;
    mockTenantContext.currentTenant = null;
    mockTenantContext.isInTenantWorld = false;
    mockBranding.appName = "SCRIPE";
    mockBranding.companyName = "SCRIPE";
    mockBranding.isTenantContext = false;
    mockI18n.language = "en";
    mockI18n.t = (key: string, params?: Record<string, string | number>) =>
      params?.defaultValue ? String(params.defaultValue) : key;
  });

  it("resolves to platform context when user has no tenantId and is not in tenant world", () => {
    mockAppState.user = { id: "admin-1", tenantId: null };

    const { result } = renderHook(() => useAdminContext());

    expect(result.current.isPlatform).toBe(true);
    expect(result.current.isTenant).toBe(false);
    expect(result.current.contextType).toBe("platform");
    expect(result.current.isImpersonating).toBe(false);
    expect(result.current.activeTenantId).toBeNull();
    expect(result.current.activeTenantName).toBeNull();
    expect(result.current.isHydrated).toBe(true);
  });

  it("resolves active tenant code/branding for direct tenant admin and localized i18n fallback when unnamed", () => {
    mockAppState.user = { id: "user-tenant-1", tenantId: "tenant-abc" };
    mockAppState.tenantCode = "SCRIPE";

    const { result: withCode } = renderHook(() => useAdminContext());
    expect(withCode.current.isPlatform).toBe(false);
    expect(withCode.current.isTenant).toBe(true);
    expect(withCode.current.activeTenantId).toBe("tenant-abc");
    expect(withCode.current.activeTenantName).toBe("SCRIPE");

    mockAppState.tenantCode = null;
    mockBranding.isTenantContext = true;
    mockBranding.companyName = "SCRIPE Technologies SAE";
    const { result: withBranding } = renderHook(() => useAdminContext());
    expect(withBranding.current.activeTenantName).toBe("SCRIPE Technologies SAE");

    mockBranding.isTenantContext = false;
    mockI18n.language = "ar";
    mockI18n.t = (key: string) => (key === "chrome.section.organization" ? "المؤسسة" : key);
    const { result: withLocalizedFallback } = renderHook(() => useAdminContext());
    expect(withLocalizedFallback.current.activeTenantName).toBe("المؤسسة");
  });

  it("resolves to impersonated tenant context when superadmin drills into a tenant", () => {
    mockAppState.user = { id: "superadmin-1", tenantId: null };
    mockTenantContext.isInTenantWorld = true;
    mockTenantContext.currentTenant = { id: "tenant-xyz", name: "Al Ahly SC" };

    const { result } = renderHook(() => useAdminContext());

    expect(result.current.isPlatform).toBe(false);
    expect(result.current.isTenant).toBe(true);
    expect(result.current.contextType).toBe("tenant");
    expect(result.current.isImpersonating).toBe(true);
    expect(result.current.activeTenantId).toBe("tenant-xyz");
    expect(result.current.activeTenantName).toBe("Al Ahly SC");
  });
});
