import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { useAppStore } from "@core/store/useAppStore";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { Permission } from "../../../domain/entities/Permission";

const { mockPermissionRepository, mockTenantContextState } = vi.hoisted(() => ({
  mockPermissionRepository: {
    getAll: vi.fn(),
    getForTenant: vi.fn(),
    getCategories: vi.fn().mockResolvedValue(["CRM Opportunities"]),
    getGrouped: vi.fn(),
    getGroupedForTenant: vi.fn(),
  },
  mockTenantContextState: {
    currentTenant: null as { id: string; name: string } | null,
    isInTenantWorld: false,
  },
}));

vi.mock("@modules/identity/di", () => ({
  identityContainer: {
    permissionRepository: mockPermissionRepository,
  },
}));

vi.mock("@core/providers/tenant-context-provider", () => ({
  useTenantContext: () => mockTenantContextState,
  useCurrentTenantId: () => mockTenantContextState.currentTenant?.id ?? null,
}));

import { usePermissionsViewModel } from "../usePermissionsViewModel";
import { usePermissionCatalog } from "@core/hooks/use-permission-catalog";

function makePerm(code: string, platformOnly = false) {
  const parts = code.split(".");
  const action = parts[parts.length - 1];
  const resource = parts.slice(0, -1).join(".");
  return new Permission({
    id: code,
    code,
    resource,
    action,
    module: "CRM",
    category: "CRM",
    defaultScope: "tenant",
    displayOrder: 1,
    nameEn: code,
    platformOnly,
  });
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("Permissions ViewModel and Catalog Scoping", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    mockTenantContextState.currentTenant = null;
    mockTenantContextState.isInTenantWorld = false;

    const mixedPerms = [makePerm("crm.opportunities.read"), makePerm("tenants.create", true)];
    mockPermissionRepository.getAll.mockResolvedValue(mixedPerms);
    mockPermissionRepository.getForTenant.mockResolvedValue(mixedPerms);
    mockPermissionRepository.getGrouped.mockResolvedValue([
      { module: "CRM", categories: [{ category: "CRM", permissions: mixedPerms }] },
    ]);
    mockPermissionRepository.getGroupedForTenant.mockResolvedValue([
      {
        module: "CRM",
        categories: [{ category: "CRM", permissions: [makePerm("crm.opportunities.read")] }],
      },
    ]);
  });

  afterEach(() => {
    useAppStore.setState({
      isAuthenticated: false,
      user: null,
      permissions: [] as never,
      roles: [],
    });
  });

  it("keeps own-tenant admin without tenants.view on /permissions endpoints and filters out platformOnly permissions", async () => {
    useAppStore.setState({
      isAuthenticated: true,
      user: { id: "u1", username: "tenant.admin", tenantId: "tenant-1" } as never,
      permissions: [SYSTEM_PERMISSIONS.PERMISSIONS_VIEW] as never,
      roles: [],
    });

    const wrapper = createWrapper(queryClient);
    const { result } = renderHook(() => usePermissionsViewModel(), { wrapper });

    await waitFor(() => {
      expect(result.current.permissions).toHaveLength(1);
    });

    expect(mockPermissionRepository.getAll).toHaveBeenCalled();
    expect(mockPermissionRepository.getGrouped).toHaveBeenCalled();
    expect(mockPermissionRepository.getForTenant).not.toHaveBeenCalled();
    expect(mockPermissionRepository.getGroupedForTenant).not.toHaveBeenCalled();
    expect(result.current.permissions.map((p) => p.code)).toEqual(["crm.opportunities.read"]);

    const { result: catalogResult } = renderHook(() => usePermissionCatalog(), { wrapper });
    await waitFor(() => {
      expect(catalogResult.current.data).toHaveLength(1);
    });
    expect(mockPermissionRepository.getForTenant).not.toHaveBeenCalled();
    expect(catalogResult.current.data?.map((p) => p.code)).toEqual(["crm.opportunities.read"]);
  });

  it("uses explicit tenant endpoints when Platform Super Admin enters tenant drill-down", async () => {
    mockTenantContextState.currentTenant = { id: "tenant-2", name: "SCRIPE" };
    mockTenantContextState.isInTenantWorld = true;
    useAppStore.setState({
      isAuthenticated: true,
      user: { id: "sa", username: "root", tenantId: null } as never,
      permissions: [SYSTEM_PERMISSIONS.TENANTS_VIEW, SYSTEM_PERMISSIONS.PERMISSIONS_VIEW] as never,
      roles: [
        {
          roleId: "sys",
          roleName: "System Super Admin",
          roleCode: "SYSTEM_SUPER_ADMIN",
          inheritedPermissions: [],
        },
      ],
    });

    const wrapper = createWrapper(queryClient);
    const { result } = renderHook(() => usePermissionsViewModel(), { wrapper });

    await waitFor(() => {
      expect(mockPermissionRepository.getForTenant).toHaveBeenCalledWith("tenant-2", {
        search: "",
      });
    });
    expect(mockPermissionRepository.getGroupedForTenant).toHaveBeenCalledWith("tenant-2", undefined);
    expect(result.current.isSystemCatalogMode).toBe(false);

    const { result: catalogResult } = renderHook(() => usePermissionCatalog(), { wrapper });
    await waitFor(() => {
      expect(catalogResult.current.data).toHaveLength(1);
    });
    expect(mockPermissionRepository.getForTenant).toHaveBeenCalledWith("tenant-2");
    expect(catalogResult.current.data?.map((p) => p.code)).toEqual(["crm.opportunities.read"]);
  });
});
