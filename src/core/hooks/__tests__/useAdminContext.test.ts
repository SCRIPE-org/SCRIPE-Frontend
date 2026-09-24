import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAdminContext } from "../useAdminContext";

const { mockAppState, mockUseAppStore, mockTenantContext } = vi.hoisted(() => {
  const mockAppState = {
    user: null as { id: string; tenantId?: string | null } | null,
    _hasHydrated: true,
  };

  const mockTenantContext = {
    currentTenant: null as { id: string; name: string } | null,
    isInTenantWorld: false,
  };

  const mockUseAppStore = (selector: (state: typeof mockAppState) => unknown) =>
    selector(mockAppState);

  return { mockAppState, mockUseAppStore, mockTenantContext };
});

vi.mock("@core/store/useAppStore", () => ({
  useAppStore: mockUseAppStore,
}));

vi.mock("@core/providers/tenant-context-provider", () => ({
  useTenantContext: () => mockTenantContext,
}));

describe("useAdminContext", () => {
  beforeEach(() => {
    mockAppState.user = null;
    mockAppState._hasHydrated = true;
    mockTenantContext.currentTenant = null;
    mockTenantContext.isInTenantWorld = false;
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

  it("resolves to tenant context when user is a direct tenant admin", () => {
    mockAppState.user = { id: "user-tenant-1", tenantId: "tenant-abc" };

    const { result } = renderHook(() => useAdminContext());

    expect(result.current.isPlatform).toBe(false);
    expect(result.current.isTenant).toBe(true);
    expect(result.current.contextType).toBe("tenant");
    expect(result.current.isImpersonating).toBe(false);
    expect(result.current.activeTenantId).toBe("tenant-abc");
    expect(result.current.activeTenantName).toBe("Organization");
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

