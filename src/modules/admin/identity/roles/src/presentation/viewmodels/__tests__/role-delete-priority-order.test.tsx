import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { useAppStore } from "@core/store/useAppStore";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { Role } from "../../../domain/entities/Role";

const { mockRoleRepository } = vi.hoisted(() => ({
  mockRoleRepository: {
    getAdminCount: vi.fn(),
    getCurrentTenantRoles: vi.fn(),
    getAll: vi.fn(),
  },
}));

vi.mock("@modules/identity/di", () => ({
  identityContainer: {
    roleRepository: mockRoleRepository,
  },
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    language: "en" as const,
  }),
}));

import { useRoleDeleteViewModel } from "../useRoleDeleteViewModel";

function makeRole(id: string, nameEn: string, priority: number) {
  return new Role({
    id,
    nameEn,
    nameAr: nameEn,
    code: nameEn.toUpperCase(),
    isSystem: priority === 0,
    isTenantSuperAdmin: priority === 0,
    isPermissionLocked: priority === 0,
    priority,
    isActive: true,
    permissions: [],
    createdAt: "2026-01-01T00:00:00Z",
    tenantId: "tenant-1",
  });
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useRoleDeleteViewModel fallback picker scoping and priority sorting", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    mockRoleRepository.getAdminCount.mockResolvedValue(2);
    const unorderedRoles = [
      makeRole("r-emp", "Employee", 900),
      makeRole("r-target", "Deleted Role", 50),
      makeRole("r-sa", "Tenant Super Admin", 0),
      makeRole("r-mgr", "CRM Manager", 20),
    ];
    mockRoleRepository.getCurrentTenantRoles.mockResolvedValue({ items: unorderedRoles });
    mockRoleRepository.getAll.mockResolvedValue({ items: unorderedRoles });
  });

  afterEach(() => {
    useAppStore.setState({ user: null, permissions: [] as never, roles: [] });
  });

  it("uses current-tenant endpoint for own-tenant admin and sorts fallback roles ascending by priority (0 = highest)", async () => {
    useAppStore.setState({
      isAuthenticated: true,
      user: { id: "u1", username: "tenant.admin", tenantId: "tenant-1" } as never,
      permissions: [SYSTEM_PERMISSIONS.ROLES_DELETE] as never,
      roles: [],
    });

    const { result } = renderHook(
      () => useRoleDeleteViewModel({ roleId: "r-target", tenantId: "tenant-1", open: true }),
      { wrapper: createWrapper(queryClient) }
    );

    await waitFor(() => {
      expect(result.current.availableRoles).toHaveLength(3);
    });

    expect(mockRoleRepository.getCurrentTenantRoles).toHaveBeenCalledTimes(1);
    expect(mockRoleRepository.getAll).not.toHaveBeenCalled();
    expect(result.current.availableRoles.map((r) => `${r.id}:${r.priority}`)).toEqual([
      "r-sa:0",
      "r-mgr:20",
      "r-emp:900",
    ]);
  });

  it("uses cross-tenant getAll endpoint for platform super admin and preserves ascending priority sort", async () => {
    useAppStore.setState({
      isAuthenticated: true,
      user: { id: "sa", username: "root", tenantId: null } as never,
      permissions: [SYSTEM_PERMISSIONS.TENANTS_VIEW, SYSTEM_PERMISSIONS.ROLES_DELETE] as never,
      roles: [
        {
          roleId: "sys",
          roleName: "System Super Admin",
          roleCode: "SYSTEM_SUPER_ADMIN",
          inheritedPermissions: [],
        },
      ],
    });

    const { result } = renderHook(
      () => useRoleDeleteViewModel({ roleId: "r-target", tenantId: "tenant-1", open: true }),
      { wrapper: createWrapper(queryClient) }
    );

    await waitFor(() => {
      expect(result.current.availableRoles).toHaveLength(3);
    });

    expect(mockRoleRepository.getAll).toHaveBeenCalledWith({
      page: 1,
      pageSize: 100,
      tenantId: "tenant-1",
      strict: true,
    });
    expect(result.current.availableRoles.map((r) => r.priority)).toEqual([0, 20, 900]);
  });
});
