import { createElement, type ReactNode } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSetRestrictionsViewModel } from "./useSetRestrictionsViewModel";
import { useSetRolesViewModel } from "./useSetRolesViewModel";

const mockAuthState = vi.hoisted(() => ({
  user: { id: "admin-1", tenantId: "tenant-1" } as { id: string; tenantId?: string | null } | null,
  permissions: [] as string[],
  isPlatformSuperAdmin: false,
}));

const mockIdentityRepos = vi.hoisted(() => ({
  tenantRepository: {
    getTenantPermissions: vi.fn(),
    getCreationPermissions: vi.fn(),
  },
  roleRepository: {
    getCurrentTenantAvailablePermissions: vi.fn(),
    getAll: vi.fn(),
    getCurrentTenantRoles: vi.fn(),
  },
  permissionRepository: {
    getAll: vi.fn(),
    getEffectivePermissions: vi.fn(),
  },
}));

vi.mock("@core/hooks/use-permission", () => ({
  usePermissions: () => ({
    user: mockAuthState.user,
    isPlatformSuperAdmin: mockAuthState.isPlatformSuperAdmin,
    has: (code: string) => mockAuthState.permissions.includes(code),
  }),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({ t: (k: string) => k, language: "en" }),
}));

vi.mock("@modules/identity/di", () => ({
  identityContainer: mockIdentityRepos,
}));

function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client }, children);
  };
}

describe("useSetRestrictionsViewModel — permission gating & platformOnly defense", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthState.user = { id: "admin-1", tenantId: "tenant-1" };
    mockAuthState.permissions = [];
    mockAuthState.isPlatformSuperAdmin = false;
  });

  it("uses roleRepository.getCurrentTenantAvailablePermissions for a tenant user holding roles.view and filters platformOnly permissions", async () => {
    mockAuthState.permissions = ["roles.view", "user_groups.update"];
    mockIdentityRepos.roleRepository.getCurrentTenantAvailablePermissions.mockResolvedValue([
      { code: "crm.opportunities.view", resource: "crm.opportunities", platformOnly: false },
      { code: "tenants.create", resource: "tenants", platformOnly: true },
    ]);

    const { result } = renderHook(
      () => useSetRestrictionsViewModel({ tenantId: "tenant-1", open: true }),
      { wrapper: makeWrapper() }
    );

    await waitFor(() => {
      expect(result.current.availablePermissions).toHaveLength(1);
    });

    expect(mockIdentityRepos.roleRepository.getCurrentTenantAvailablePermissions).toHaveBeenCalledTimes(1);
    expect(mockIdentityRepos.tenantRepository.getTenantPermissions).not.toHaveBeenCalled();
    expect(result.current.availablePermissions[0]?.code).toBe("crm.opportunities.view");
    expect(result.current.canReadCustomFields).toBe(false);
  });

  it("falls back to permissionRepository.getEffectivePermissions without firing 403 probes when user lacks roles.view/permissions.view", async () => {
    mockAuthState.permissions = ["user_groups.update", "custom-fields.view"];
    mockIdentityRepos.permissionRepository.getEffectivePermissions.mockResolvedValue([
      { code: "admins.view", resource: "admins", platformOnly: false },
    ]);

    const { result } = renderHook(
      () => useSetRestrictionsViewModel({ open: true }),
      { wrapper: makeWrapper() }
    );

    await waitFor(() => {
      expect(result.current.availablePermissions).toHaveLength(1);
    });

    expect(mockIdentityRepos.permissionRepository.getEffectivePermissions).toHaveBeenCalledTimes(1);
    expect(mockIdentityRepos.roleRepository.getCurrentTenantAvailablePermissions).not.toHaveBeenCalled();
    expect(mockIdentityRepos.tenantRepository.getCreationPermissions).not.toHaveBeenCalled();
    expect(result.current.canReadCustomFields).toBe(true);
  });

  it("retains platformOnly permissions exclusively for platform superadmin viewing a cross-tenant or platform scope", async () => {
    mockAuthState.user = { id: "platform-sa", tenantId: null };
    mockAuthState.isPlatformSuperAdmin = true;
    mockIdentityRepos.tenantRepository.getCreationPermissions.mockResolvedValue([
      { code: "tenants.create", resource: "tenants", platformOnly: true },
      { code: "admins.view", resource: "admins", platformOnly: false },
    ]);

    const { result } = renderHook(
      () => useSetRestrictionsViewModel({ open: true }),
      { wrapper: makeWrapper() }
    );

    await waitFor(() => {
      expect(result.current.availablePermissions).toHaveLength(2);
    });

    expect(mockIdentityRepos.tenantRepository.getCreationPermissions).toHaveBeenCalledTimes(1);
  });
});

describe("useSetRolesViewModel — ascending priority sort", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthState.user = { id: "admin-1", tenantId: "tenant-1" };
    mockAuthState.isPlatformSuperAdmin = false;
  });

  it("sorts returned roles ascending by priority (0 highest) with label tie-breaker", async () => {
    mockIdentityRepos.roleRepository.getCurrentTenantRoles.mockResolvedValue({
      items: [
        { id: "r-low", nameEn: "Viewer", nameAr: "مشاهد", code: "VIEWER", priority: 50 },
        { id: "r-top", nameEn: "Super Admin", nameAr: "مسؤول", code: "SA", priority: 0 },
        { id: "r-mid-b", nameEn: "Manager", nameAr: "مدير", code: "MGR", priority: 10 },
        { id: "r-mid-a", nameEn: "Analyst", nameAr: "محلل", code: "ANL", priority: 10 },
      ],
      totalCount: 4,
      page: 1,
      pageSize: 100,
    });

    const { result } = renderHook(() => useSetRolesViewModel({ open: true }), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => {
      expect(result.current.rolesData?.items).toHaveLength(4);
    });

    expect(result.current.rolesData?.items.map((r) => r.code)).toEqual([
      "SA",
      "ANL",
      "MGR",
      "VIEWER",
    ]);
  });
});
