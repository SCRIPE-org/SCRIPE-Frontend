import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TenantContextProvider, useTenantContext } from "../tenant-context-provider";
import { PermissionProvider } from "../permission-provider";
import { useAppStore } from "@core/store/useAppStore";
import { useNavigationStore } from "@core/navigation/store/useNavigationStore";
import { STORAGE_KEYS } from "@core/config/storage-keys";

const mockApiService = {
  setTenantContext: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
};

const mockBroadcastTenantContext = vi.fn();
const mockClearNavigationCaches = vi.fn();
const mockGetCurrentPrincipal = vi.fn();

vi.mock("@core/providers/service-provider", () => ({
  useServices: () => ({
    apiService: mockApiService,
    authRepository: {
      logout: vi.fn().mockResolvedValue(undefined),
      getCurrentPrincipal: mockGetCurrentPrincipal,
    },
  }),
}));

vi.mock("@core/services/api-factory", () => ({
  broadcastTenantContext: (tenantId: string | null) => mockBroadcastTenantContext(tenantId),
}));

vi.mock("@modules/auth/core/data/utils/auth-storage-cleanup", () => ({
  clearNavigationCaches: () => mockClearNavigationCaches(),
}));

const BREADCRUMBS_STORAGE_KEY = "scr_tenant_breadcrumbs";

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <PermissionProvider>
          <TenantContextProvider>{children}</TenantContextProvider>
        </PermissionProvider>
      </QueryClientProvider>
    );
  };
}

describe("TenantContextProvider", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    useAppStore.setState({
      isAuthenticated: true,
      _hasHydrated: true,
      permissions: ["tenants.drill_down"],
      roles: [],
      user: {
        id: "platform-admin-1",
        username: "platform.admin",
        isProtected: false,
        tenantId: null,
      } as never,
    });

    useNavigationStore.setState({
      allRoutes: new Set(["/crm/leads"]),
      allRoutesSorted: ["/crm/leads"],
      routesLoaded: true,
      routesContextKey: "platform",
      routesError: null,
    });
  });

  afterEach(() => {
    sessionStorage.clear();
    queryClient.clear();
  });

  it("persists drill-down breadcrumbs across navigateToBreadcrumb and invalidates nav/query caches", () => {
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const wrapper = createWrapper(queryClient);

    const { result } = renderHook(() => useTenantContext(), { wrapper });

    act(() => {
      result.current.enterTenantWorld(
        { id: "holding-1", name: "Holding Corp", code: "HOLD" },
        { redirectTo: null }
      );
    });

    act(() => {
      result.current.enterTenantWorld(
        { id: "club-2", name: "Al Ahly SC", code: "AHLY", parentId: "holding-1" },
        { redirectTo: null }
      );
    });

    expect(result.current.breadcrumbs).toEqual([
      { id: "holding-1", name: "Holding Corp" },
      { id: "club-2", name: "Al Ahly SC" },
    ]);

    act(() => {
      useNavigationStore.setState({
        allRoutes: new Set(["/venue/courts"]),
        allRoutesSorted: ["/venue/courts"],
        routesLoaded: true,
        routesContextKey: "tenant:club-2",
        routesError: null,
      });
      result.current.navigateToBreadcrumb("holding-1", { redirectTo: null });
    });

    expect(result.current.currentTenant?.id).toBe("holding-1");
    expect(result.current.currentTenant?.name).toBe("Holding Corp");
    expect(result.current.breadcrumbs).toEqual([{ id: "holding-1", name: "Holding Corp" }]);

    const persistedTenant = JSON.parse(sessionStorage.getItem(STORAGE_KEYS.tenant_context) || "{}");
    const persistedCrumbs = JSON.parse(sessionStorage.getItem(BREADCRUMBS_STORAGE_KEY) || "[]");

    expect(persistedTenant.id).toBe("holding-1");
    expect(persistedCrumbs).toEqual([{ id: "holding-1", name: "Holding Corp" }]);
    expect(mockApiService.setTenantContext).toHaveBeenLastCalledWith("holding-1");
    expect(mockBroadcastTenantContext).toHaveBeenLastCalledWith("holding-1");
    expect(mockClearNavigationCaches).toHaveBeenCalled();
    expect(useNavigationStore.getState().allRoutesSorted).toEqual([]);
    expect(useNavigationStore.getState().routesLoaded).toBe(false);
    expect(useNavigationStore.getState().routesContextKey).toBeNull();
    expect(invalidateSpy).toHaveBeenCalled();
  });

  it("exits tenant world and clears persisted storage when clicking the sole root breadcrumb", () => {
    const wrapper = createWrapper(queryClient);
    const { result } = renderHook(() => useTenantContext(), { wrapper });

    act(() => {
      result.current.enterTenantWorld(
        { id: "holding-1", name: "Holding Corp" },
        { redirectTo: null }
      );
    });

    expect(sessionStorage.getItem(STORAGE_KEYS.tenant_context)).not.toBeNull();
    expect(sessionStorage.getItem(BREADCRUMBS_STORAGE_KEY)).not.toBeNull();

    act(() => {
      result.current.navigateToBreadcrumb("holding-1", { redirectTo: null });
    });

    expect(result.current.currentTenant).toBeNull();
    expect(result.current.isInTenantWorld).toBe(false);
    expect(result.current.breadcrumbs).toEqual([]);
    expect(sessionStorage.getItem(STORAGE_KEYS.tenant_context)).toBeNull();
    expect(sessionStorage.getItem(BREADCRUMBS_STORAGE_KEY)).toBeNull();
    expect(mockBroadcastTenantContext).toHaveBeenLastCalledWith(null);
  });

  it("clears stale drill-down tenant_context on mount when authenticated user lacks tenants.drill_down", async () => {
    sessionStorage.setItem(
      STORAGE_KEYS.tenant_context,
      JSON.stringify({ id: "stale-tenant", name: "Stale Club", switchMode: "drill_down" })
    );
    sessionStorage.setItem(
      BREADCRUMBS_STORAGE_KEY,
      JSON.stringify([{ id: "stale-tenant", name: "Stale Club" }])
    );

    useAppStore.setState({
      isAuthenticated: true,
      _hasHydrated: true,
      permissions: ["crm.leads.view"],
      roles: [],
      user: {
        id: "user-2",
        username: "basic.user",
        isProtected: false,
        tenantId: "native-tenant-1",
      } as never,
    });

    const wrapper = createWrapper(queryClient);
    const { result } = renderHook(() => useTenantContext(), { wrapper });

    await waitFor(() => {
      expect(result.current.currentTenant).toBeNull();
    });

    expect(sessionStorage.getItem(STORAGE_KEYS.tenant_context)).toBeNull();
    expect(sessionStorage.getItem(BREADCRUMBS_STORAGE_KEY)).toBeNull();
    expect(mockBroadcastTenantContext).toHaveBeenCalledWith(null);
    expect(mockClearNavigationCaches).toHaveBeenCalled();
  });

  it("retains membership tenant_context when user holds identity_context.switch without tenants.drill_down", async () => {
    sessionStorage.setItem(
      STORAGE_KEYS.tenant_context,
      JSON.stringify({ id: "member-tenant-5", name: "Branch North", switchMode: "membership" })
    );

    useAppStore.setState({
      isAuthenticated: true,
      _hasHydrated: true,
      permissions: ["identity_context.switch"],
      roles: [],
      user: {
        id: "member-user-1",
        username: "multi.member",
        isProtected: false,
        tenantId: "home-tenant-1",
      } as never,
    });

    const wrapper = createWrapper(queryClient);
    const { result } = renderHook(() => useTenantContext(), { wrapper });

    await waitFor(() => {
      expect(result.current.currentTenant?.id).toBe("member-tenant-5");
    });

    expect(sessionStorage.getItem(STORAGE_KEYS.tenant_context)).not.toBeNull();
    expect(mockBroadcastTenantContext).toHaveBeenLastCalledWith("member-tenant-5");
  });

  it("resyncs principal and clears lastAuthRefresh immediately when switching with redirectTo: null", async () => {
    sessionStorage.setItem(STORAGE_KEYS.lastAuthRefresh, "1700000000000");
    useAppStore.setState({
      isAuthenticated: true,
      _hasHydrated: true,
      permissions: ["tenants.drill_down", "crm.leads.view"],
      roles: [
        {
          roleId: "r1",
          roleName: "System Super Admin",
          roleCode: "SYSTEM_SUPER_ADMIN",
          inheritedPermissions: [],
        },
      ],
      user: {
        id: "sa-1",
        username: "admin",
        isProtected: true,
        tenantId: null,
      } as never,
    });

    mockGetCurrentPrincipal.mockResolvedValue({
      id: "sa-1",
      username: "admin",
      isProtected: true,
      tenantId: "holding-1",
      roles: [
        {
          roleId: "r2",
          roleName: "Tenant View",
          roleCode: "T_VIEWER",
          inheritedPermissions: [],
        },
      ],
      permissions: ["crm.opportunities.read"],
      restrictedFields: { "crm.opportunities": ["estimatedAmount"] },
    });

    const wrapper = createWrapper(queryClient);
    const { result } = renderHook(() => useTenantContext(), { wrapper });

    act(() => {
      result.current.enterTenantWorld(
        { id: "holding-1", name: "Holding Corp" },
        { redirectTo: null }
      );
    });

    expect(sessionStorage.getItem(STORAGE_KEYS.lastAuthRefresh)).toBeNull();
    await waitFor(() => {
      expect(mockGetCurrentPrincipal).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(useAppStore.getState().permissions).toEqual(["crm.opportunities.read"]);
    });
    expect(useAppStore.getState().restrictedFields).toEqual({
      "crm.opportunities": ["estimatedAmount"],
    });
  });
});
