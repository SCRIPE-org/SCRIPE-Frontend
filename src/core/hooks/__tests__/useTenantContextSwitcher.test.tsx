import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTenantContextSwitcher } from "../useTenantContextSwitcher";
import { TenantContextProvider } from "@core/providers/tenant-context-provider";
import { PermissionProvider } from "@core/providers/permission-provider";
import { useAppStore } from "@core/store/useAppStore";
import { useNavigationStore } from "@core/navigation/store/useNavigationStore";
import { STORAGE_KEYS } from "@core/config/storage-keys";
import { TENANTS_ENDPOINTS } from "@core/config/api-endpoints/tenants.endpoints";
import { IDENTITY_ENDPOINTS } from "@core/config/api-endpoints/identity.endpoints";

let mockPathname = "/crm/leads";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => mockPathname,
  useSearchParams: () => new URLSearchParams("stage=qualified"),
}));

const mockApiService = {
  get: vi.fn(),
  post: vi.fn(),
  setTenantContext: vi.fn(),
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

describe("useTenantContextSwitcher", () => {
  let queryClient: QueryClient;
  const originalLocation = window.location;
  let assignedHref: string | null = null;
  const reloadSpy = vi.fn();

  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
    mockPathname = "/crm/leads";
    assignedHref = null;

    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        origin: "http://localhost:3000",
        pathname: "/crm/leads",
        search: "?stage=qualified",
        hash: "",
        get href() {
          return assignedHref ?? "http://localhost:3000/crm/leads?stage=qualified";
        },
        set href(value: string) {
          assignedHref = value;
        },
        reload: reloadSpy,
        assign: vi.fn(),
        replace: vi.fn(),
      },
    });

    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
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
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
    sessionStorage.clear();
    queryClient.clear();
  });

  it("combines drill-down and membership candidates while filtering inactive, suspended, and expired targets", async () => {
    useAppStore.setState({
      isAuthenticated: true,
      _hasHydrated: true,
      permissions: ["tenants.drill_down", "identity_context.switch"],
      roles: [],
      user: {
        id: "user-1",
        username: "hybrid.admin",
        isProtected: false,
        tenantId: null,
      } as never,
    });

    mockApiService.get.mockImplementation(async (endpoint: string) => {
      if (endpoint === TENANTS_ENDPOINTS.TENANTS.SWITCHABLE) {
        return {
          items: [
            {
              id: "enc-t-1",
              name: "Al Ahly SC",
              code: "AHLY",
              slug: "ahly",
              status: "Active",
              isActive: true,
              isSuspended: false,
            },
            {
              id: "enc-t-suspended",
              name: "Suspended FC",
              code: "SUSP",
              isActive: true,
              isSuspended: true,
            },
            {
              id: "enc-t-inactive",
              name: "Inactive FC",
              code: "INACT",
              isActive: false,
              isSuspended: false,
            },
          ],
          totalCount: 3,
          page: 1,
          pageSize: 50,
          totalPages: 1,
        };
      }
      if (endpoint === IDENTITY_ENDPOINTS.IDENTITY_CONTEXT.MEMBERSHIPS) {
        return [
          {
            memberTenantId: "enc-t-1",
            memberTenantName: "Al Ahly SC Duplicate",
            effectiveRoleCode: "CLUB_ADMIN",
          },
          {
            memberTenantId: "enc-t-2",
            memberTenantName: "Zamalek Academy",
            memberTenantCode: "ZAM",
            effectiveRoleCode: "ACADEMY_DIRECTOR",
            expiresAt: "2099-01-01T00:00:00Z",
          },
          {
            memberTenantId: "enc-t-expired",
            memberTenantName: "Expired Membership",
            expiresAt: "2020-01-01T00:00:00Z",
          },
        ];
      }
      return [];
    });

    const { result } = renderHook(() => useTenantContextSwitcher(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.candidates).toHaveLength(2);
    });

    expect(result.current.candidates.map((c) => c.id)).toEqual(["enc-t-1", "enc-t-2"]);
    expect(result.current.candidates[0].source).toBe("drill_down");
    expect(result.current.candidates[1].source).toBe("membership");
    expect(result.current.candidates[1].effectiveRoleCode).toBe("ACADEMY_DIRECTOR");
    expect(result.current.hasCandidates).toBe(true);
    expect(result.current.loadError).toBeNull();
  });

  it("gracefully degrades when drill-down endpoint returns 403 while retaining membership targets", async () => {
    useAppStore.setState({
      isAuthenticated: true,
      _hasHydrated: true,
      permissions: ["tenants.drill_down", "identity_context.switch"],
      roles: [],
      user: {
        id: "user-2",
        username: "member.user",
        isProtected: false,
        tenantId: "home-t",
      } as never,
    });

    mockApiService.get.mockImplementation(async (endpoint: string) => {
      if (endpoint === TENANTS_ENDPOINTS.TENANTS.SWITCHABLE) {
        throw { status: 403, message: "Forbidden" };
      }
      if (endpoint === IDENTITY_ENDPOINTS.IDENTITY_CONTEXT.MEMBERSHIPS) {
        return {
          items: [
            {
              memberTenantId: "enc-m-1",
              memberTenantName: "Branch West",
              memberTenantCode: "WEST",
              effectiveRoleCode: "COACH_LEAD",
            },
          ],
        };
      }
      return [];
    });

    const { result } = renderHook(() => useTenantContextSwitcher(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.candidates).toHaveLength(1);
    });

    expect(result.current.candidates[0].id).toBe("enc-m-1");
    expect(result.current.loadError).toBeNull();
  });

  it("executes membership switch on current URL without /tenants detour and syncs caches", async () => {
    useAppStore.setState({
      isAuthenticated: true,
      _hasHydrated: true,
      permissions: ["identity_context.switch"],
      roles: [],
      user: {
        id: "user-3",
        username: "multi.org.user",
        isProtected: false,
        tenantId: "home-t",
      } as never,
    });

    mockApiService.get.mockResolvedValue([
      {
        memberTenantId: "enc-m-9",
        memberTenantName: "Alexandria Branch",
        memberTenantCode: "ALEX",
        effectiveRoleCode: "BRANCH_MANAGER",
      },
    ]);
    mockApiService.post.mockResolvedValue(undefined);

    const { result } = renderHook(() => useTenantContextSwitcher(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.candidates).toHaveLength(1);
    });

    let ok = false;
    await act(async () => {
      ok = await result.current.switchToTenant(result.current.candidates[0]);
    });

    expect(ok).toBe(true);
    expect(mockApiService.post).toHaveBeenCalledWith(IDENTITY_ENDPOINTS.IDENTITY_CONTEXT.SWITCH, {
      targetTenantId: "enc-m-9",
    });

    const persisted = JSON.parse(sessionStorage.getItem(STORAGE_KEYS.tenant_context) || "{}");
    expect(persisted.id).toBe("enc-m-9");
    expect(persisted.name).toBe("Alexandria Branch");
    expect(persisted.switchMode).toBe("membership");

    expect(mockApiService.setTenantContext).toHaveBeenLastCalledWith("enc-m-9");
    expect(mockBroadcastTenantContext).toHaveBeenLastCalledWith("enc-m-9");
    expect(mockClearNavigationCaches).toHaveBeenCalled();
    expect(useNavigationStore.getState().allRoutesSorted).toEqual([]);
    expect(useNavigationStore.getState().routesLoaded).toBe(false);
    expect(assignedHref).toBe("/crm/leads?stage=qualified");
    expect(assignedHref).not.toContain("/tenants");
  });

  it("executes exitToPlatform cleanly on current route without redirecting to /tenants", async () => {
    useAppStore.setState({
      isAuthenticated: true,
      _hasHydrated: true,
      permissions: ["tenants.drill_down"],
      roles: [],
      user: {
        id: "admin-1",
        username: "platform.admin",
        isProtected: false,
        tenantId: null,
      } as never,
    });

    sessionStorage.setItem(
      STORAGE_KEYS.tenant_context,
      JSON.stringify({ id: "enc-t-1", name: "Al Ahly SC", switchMode: "drill_down" })
    );
    mockApiService.get.mockResolvedValue({ items: [] });

    const { result } = renderHook(() => useTenantContextSwitcher({ enabled: false }), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.exitToPlatform();
    });

    expect(sessionStorage.getItem(STORAGE_KEYS.tenant_context)).toBeNull();
    expect(mockBroadcastTenantContext).toHaveBeenLastCalledWith(null);
    expect(mockClearNavigationCaches).toHaveBeenCalled();
    expect(assignedHref).toBe("/crm/leads?stage=qualified");
    expect(assignedHref).not.toContain("/tenants");
  });

  it("returns false and skips API calls when user lacks switch permissions", async () => {
    useAppStore.setState({
      isAuthenticated: true,
      _hasHydrated: true,
      permissions: ["crm.leads.view"],
      roles: [],
      user: {
        id: "user-4",
        username: "readonly.user",
        isProtected: false,
        tenantId: null,
      } as never,
    });

    const { result } = renderHook(() => useTenantContextSwitcher(), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.canSwitchContext).toBe(false);
    expect(mockApiService.get).not.toHaveBeenCalled();

    let ok = true;
    await act(async () => {
      ok = await result.current.switchToTenant({ id: "enc-t-1", name: "Forbidden Target" });
    });

    expect(ok).toBe(false);
    expect(mockApiService.post).not.toHaveBeenCalled();
  });

  it("resyncs principal immediately in-place on membership switch and clears lastAuthRefresh", async () => {
    sessionStorage.setItem(STORAGE_KEYS.lastAuthRefresh, "1700000000000");
    useAppStore.setState({
      isAuthenticated: true,
      _hasHydrated: true,
      permissions: ["identity_context.switch", "crm.leads.view"],
      roles: [],
      user: {
        id: "user-3",
        username: "multi.org.user",
        isProtected: false,
        tenantId: "home-t",
      } as never,
    });

    mockApiService.get.mockResolvedValue([
      {
        memberTenantId: "enc-m-9",
        memberTenantName: "Alexandria Branch",
        memberTenantCode: "ALEX",
        effectiveRoleCode: "BRANCH_MANAGER",
      },
    ]);
    mockApiService.post.mockResolvedValue(undefined);
    mockGetCurrentPrincipal.mockResolvedValue({
      id: "user-3",
      username: "multi.org.user",
      isProtected: false,
      tenantId: "enc-m-9",
      roles: [
        {
          roleId: "r-branch",
          roleName: "Branch Manager",
          roleCode: "BRANCH_MANAGER",
          inheritedPermissions: [],
        },
      ],
      permissions: ["venue.courts.view", "identity_context.switch"],
      restrictedFields: { "crm.opportunities": ["estimatedAmount"] },
    });

    const { result } = renderHook(() => useTenantContextSwitcher(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.candidates).toHaveLength(1);
    });

    let ok = false;
    await act(async () => {
      ok = await result.current.switchToTenant(result.current.candidates[0], {
        redirectTo: null,
      });
    });

    expect(ok).toBe(true);
    expect(sessionStorage.getItem(STORAGE_KEYS.lastAuthRefresh)).toBeNull();
    await waitFor(() => {
      expect(mockGetCurrentPrincipal).toHaveBeenCalledTimes(1);
    });
    expect(useAppStore.getState().permissions).toEqual([
      "venue.courts.view",
      "identity_context.switch",
    ]);
  });
});
