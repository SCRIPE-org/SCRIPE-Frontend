import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { useAppStore } from "@core/store/useAppStore";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { Permission } from "@modules/identity/permissions";
import { Role } from "../../../domain/entities/Role";
import { PermissionScopes } from "../../../domain/types/PermissionTypes";

const {
  mockRoleRepository,
  mockRefreshNavigation,
  mockGetCurrentPrincipal,
  mockToast,
  mockSuccessToast,
  mockErrorToast,
} = vi.hoisted(() => ({
  mockRoleRepository: {
    getById: vi.fn(),
    getRolePermissions: vi.fn(),
    getAdminCount: vi.fn().mockResolvedValue(0),
    getCurrentTenantAvailablePermissionsGrouped: vi.fn(),
    getTenantAvailablePermissionsGrouped: vi.fn(),
    assignPermissions: vi.fn().mockResolvedValue(undefined),
  },
  mockRefreshNavigation: vi.fn(),
  mockGetCurrentPrincipal: vi.fn(),
  mockToast: vi.fn(),
  mockSuccessToast: vi.fn(),
  mockErrorToast: vi.fn(),
}));

let mockRouteRoleId = "role-a";

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: mockRouteRoleId }),
}));

vi.mock("@modules/identity/di", () => ({
  identityContainer: {
    roleRepository: mockRoleRepository,
  },
}));

vi.mock("@modules/auth/di", () => ({
  getAuthContainer: () => ({
    authRepository: {
      getCurrentPrincipal: mockGetCurrentPrincipal,
    },
  }),
}));

vi.mock("@core/providers/navigation-provider", () => ({
  useOptionalNavigation: () => ({
    refreshNavigation: mockRefreshNavigation,
  }),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    language: "en" as const,
  }),
}));

vi.mock("@core/hooks/use-enhanced-toast", () => ({
  useEnhancedToast: () => ({
    toast: mockToast,
    success: mockSuccessToast,
    error: mockErrorToast,
  }),
}));

vi.mock("../useRoleWorkspaceEntriesViewModel", () => ({
  useRoleWorkspaceEntriesViewModel: () => ({
    rules: [],
    eligibleWorkspaces: [],
    availableWorkspacesForNewRule: [],
    catalog: undefined,
    scopeMode: "tenant_role",
    isSystemRole: false,
    isLoading: false,
    isEntriesDirty: false,
    hasIncompleteDraftRule: false,
    saveWorkspaceEntries: vi.fn().mockResolvedValue(undefined),
    addRule: vi.fn(),
    updateRuleWorkspace: vi.fn(),
    updateRuleTarget: vi.fn(),
    toggleRuleEnforced: vi.fn(),
    removeRule: vi.fn(),
  }),
}));

import { useRoleDetailViewModel } from "../useRoleDetailViewModel";
import { useRolePermissionsDialog } from "../useRolePermissionsDialog";

function makePermission(code: string, id: string, extra?: { platformOnly?: boolean }) {
  const parts = code.split(".");
  const action = parts[parts.length - 1];
  const resource = parts.slice(0, -1).join(".");
  return new Permission({
    id,
    code,
    resource,
    action,
    module: "CRM",
    category: "CRM Opportunities",
    defaultScope: "tenant",
    displayOrder: 1,
    nameEn: code,
    platformOnly: Boolean(extra?.platformOnly),
  });
}

function makeRole(overrides: Partial<ConstructorParameters<typeof Role>[0]> = {}) {
  return new Role({
    id: "role-a",
    nameEn: "CRM Director",
    nameAr: "مدير المبيعات",
    code: "T_SCRIPE_CRM_DIR",
    isSystem: false,
    isTenantSuperAdmin: false,
    isPermissionLocked: false,
    priority: 10,
    isActive: true,
    permissions: [],
    createdAt: "2026-01-01T00:00:00Z",
    tenantId: "tenant-1",
    ...overrides,
  });
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("Role permission assignment ViewModels", () => {
  let queryClient: QueryClient;

  const groupedCatalog = [
    {
      module: "CRM",
      categories: [
        {
          category: "CRM Opportunities",
          permissions: [
            makePermission("crm.opportunities.read", "perm-read"),
            makePermission("crm.opportunities.create", "perm-create"),
            makePermission("tenants.create", "perm-po", { platformOnly: true }),
          ],
        },
      ],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockRouteRoleId = "role-a";
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    useAppStore.setState({
      isAuthenticated: true,
      _hasHydrated: true,
      user: {
        id: "user-1",
        username: "scripeadmin",
        tenantId: "tenant-1",
        isProtected: false,
      } as never,
      permissions: [
        SYSTEM_PERMISSIONS.ROLES_VIEW,
        SYSTEM_PERMISSIONS.ROLES_MANAGE_PERMISSIONS,
      ] as never,
      roles: [],
    });

    mockRoleRepository.getCurrentTenantAvailablePermissionsGrouped.mockResolvedValue(groupedCatalog);
    mockRoleRepository.getTenantAvailablePermissionsGrouped.mockResolvedValue(groupedCatalog);
    mockGetCurrentPrincipal.mockResolvedValue({
      id: "user-1",
      username: "scripeadmin",
      tenantId: "tenant-1",
      roles: [],
      permissions: [SYSTEM_PERMISSIONS.ROLES_VIEW, SYSTEM_PERMISSIONS.ROLES_MANAGE_PERMISSIONS],
      restrictedFields: {},
    });
  });

  afterEach(() => {
    useAppStore.setState({
      isAuthenticated: false,
      user: null,
      permissions: [] as never,
      roles: [],
    });
  });

  it("uses current-tenant endpoint for own-tenant admins without tenants.view and tenant endpoint for platform admins with search", async () => {
    mockRoleRepository.getById.mockResolvedValue(makeRole({ id: "role-a", tenantId: "tenant-1" }));
    mockRoleRepository.getRolePermissions.mockResolvedValue([]);

    const wrapper = createWrapper(queryClient);
    const { result, unmount } = renderHook(() => useRoleDetailViewModel("role-a"), { wrapper });

    await waitFor(() => {
      expect(mockRoleRepository.getCurrentTenantAvailablePermissionsGrouped).toHaveBeenCalled();
    });
    expect(mockRoleRepository.getTenantAvailablePermissionsGrouped).not.toHaveBeenCalled();
    // Defensively excludes platformOnly permission in tenant role mode
    const loadedCodes = result.current.permissions.moduleGroups.flatMap((m) =>
      m.categories.flatMap((c) => c.permissions.map((p) => p.code))
    );
    expect(loadedCodes).toEqual(["crm.opportunities.read", "crm.opportunities.create"]);
    unmount();

    // Now test Platform Super Admin with drill-down tenant role + search forwarding
    useAppStore.setState({
      isAuthenticated: true,
      user: { id: "sa", username: "platform", tenantId: null, isProtected: true } as never,
      permissions: [SYSTEM_PERMISSIONS.TENANTS_VIEW, SYSTEM_PERMISSIONS.ROLES_MANAGE_PERMISSIONS] as never,
      roles: [
        {
          roleId: "sys",
          roleName: "System Super Admin",
          roleCode: "SYSTEM_SUPER_ADMIN",
          inheritedPermissions: [],
        },
      ],
    });

    const { result: saResult } = renderHook(() => useRoleDetailViewModel("role-a"), { wrapper });
    await waitFor(() => {
      expect(mockRoleRepository.getTenantAvailablePermissionsGrouped).toHaveBeenCalledWith(
        "tenant-1"
      );
    });
    expect(saResult.current.info.totalCount).toBe(2);

    // Search filters client-side WITHOUT shrinking unfiltered info.totalCount or re-fetching backend
    act(() => {
      saResult.current.permissions.onSearchChange("create");
    });

    expect(mockRoleRepository.getTenantAvailablePermissionsGrouped).toHaveBeenCalledTimes(1);
    expect(saResult.current.info.totalCount).toBe(2);
    const visibleAfterSearch = saResult.current.permissions.moduleGroups.flatMap((m) =>
      m.categories.flatMap((c) => c.permissions.map((p) => p.code))
    );
    expect(visibleAfterSearch).toEqual(["crm.opportunities.create"]);
  });

  it("resets assignments cleanly when switching to a role with zero permissions", async () => {
    mockRoleRepository.getById.mockImplementation(async (id: string) =>
      makeRole({ id, tenantId: "tenant-1" })
    );
    mockRoleRepository.getRolePermissions.mockImplementation(async (id: string) =>
      id === "role-a"
        ? [{ permissionCode: "crm.opportunities.read", permissionId: "perm-read" }]
        : []
    );

    const wrapper = createWrapper(queryClient);
    const { result, rerender } = renderHook(({ id }) => useRoleDetailViewModel(id), {
      wrapper,
      initialProps: { id: "role-a" },
    });

    await waitFor(() => {
      expect(result.current.permissions.selectedPermissionCodes.has("crm.opportunities.read")).toBe(
        true
      );
    });

    rerender({ id: "role-b" });

    await waitFor(() => {
      expect(result.current.permissions.selectedPermissionCodes.size).toBe(0);
    });
  });

  it("parses restrictedFieldsJson, defaults toggled scopeOverride to undefined, tracks modified diff & unfiltered save IDs, and syncs authorization caches on save", async () => {
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    mockRoleRepository.getById.mockResolvedValue(makeRole({ id: "role-a", tenantId: "tenant-1" }));
    mockRoleRepository.getRolePermissions.mockResolvedValue([
      {
        permissionCode: "crm.opportunities.read",
        permissionId: "perm-read",
        scope: "Tenant",
        restrictedFieldsJson: '["estimatedAmount"]',
      },
    ]);

    const wrapper = createWrapper(queryClient);
    const { result } = renderHook(() => useRoleDetailViewModel("role-a"), { wrapper });

    await waitFor(() => {
      expect(result.current.permissions.assignments.get("crm.opportunities.read")).toEqual({
        permissionId: "perm-read",
        scopeOverride: undefined,
        restrictedFields: ["estimatedAmount"],
      });
    });

    // Toggling defaults scopeOverride to undefined ("Default / Inherited") instead of own_tenant
    act(() => {
      result.current.permissions.onTogglePermission("crm.opportunities.create");
    });
    expect(
      result.current.permissions.assignments.get("crm.opportunities.create")?.scopeOverride
    ).toBeUndefined();

    // Bulk updating to OwnTenant sets canonical "own_tenant"
    act(() => {
      result.current.permissions.onBulkScopeUpdate(PermissionScopes.OwnTenant);
    });
    expect(
      result.current.permissions.assignments.get("crm.opportunities.read")?.scopeOverride
    ).toBe(PermissionScopes.OwnTenant);

    // Tenant roles ignore all_tenants in bulkUpdateScope
    act(() => {
      result.current.permissions.onBulkScopeUpdate(PermissionScopes.AllTenants);
    });
    expect(
      result.current.permissions.assignments.get("crm.opportunities.read")?.scopeOverride
    ).toBe(PermissionScopes.OwnTenant);

    await act(async () => {
      result.current.header.onSave();
    });

    await waitFor(() => {
      expect(mockRoleRepository.assignPermissions).toHaveBeenCalledWith("role-a", {
        permissions: [
          {
            permissionId: "perm-read",
            scopeOverride: "own_tenant",
            restrictedFields: ["estimatedAmount"],
          },
          {
            permissionId: "perm-create",
            scopeOverride: "own_tenant",
            restrictedFields: [],
          },
        ],
      });
    });

    await waitFor(() => {
      expect(mockRefreshNavigation).toHaveBeenCalledTimes(1);
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["rolePermissions", "role-a"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["role-permissions", "role-a"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["entitlements"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["navigation"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["roleAvailablePermissionsGrouped"] });
  });

  it("enforces read-only protection on permission-locked roles and when lacking roles.manage_permissions", async () => {
    mockRoleRepository.getById.mockResolvedValue(
      makeRole({
        id: "role-locked",
        code: "T_SCRIPE_SA",
        isSystem: true,
        isTenantSuperAdmin: true,
        isPermissionLocked: true,
      })
    );
    mockRoleRepository.getRolePermissions.mockResolvedValue([
      { permissionCode: "crm.opportunities.read", permissionId: "perm-read" },
    ]);

    const wrapper = createWrapper(queryClient);
    const { result, unmount } = renderHook(() => useRoleDetailViewModel("role-locked"), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.permissions.isPermissionLocked).toBe(true);
    });
    expect(result.current.permissions.isReadOnly).toBe(true);
    expect(result.current.permissions.allowAllTenants).toBe(false);

    act(() => {
      result.current.permissions.onTogglePermission("crm.opportunities.create");
      result.current.permissions.onBulkScopeUpdate(PermissionScopes.Own);
    });
    expect(result.current.permissions.selectedPermissionCodes.has("crm.opportunities.create")).toBe(
      false
    );
    expect(result.current.header.isDirty).toBe(false);
    unmount();

    // Unlocked role, caller has roles.view WITHOUT roles.manage_permissions
    useAppStore.setState({
      permissions: [SYSTEM_PERMISSIONS.ROLES_VIEW] as never,
    });
    mockRoleRepository.getById.mockResolvedValue(
      makeRole({ id: "role-unlocked", isPermissionLocked: false })
    );

    const { result: viewOnlyResult } = renderHook(() => useRoleDetailViewModel("role-unlocked"), {
      wrapper,
    });
    await waitFor(() => {
      expect(viewOnlyResult.current.permissions.isLoading).toBe(false);
    });
    expect(viewOnlyResult.current.permissions.isReadOnly).toBe(true);

    act(() => {
      viewOnlyResult.current.permissions.onTogglePermission("crm.opportunities.create");
    });
    expect(viewOnlyResult.current.permissions.selectedPermissionCodes.has("crm.opportunities.create")).toBe(
      false
    );
    expect(mockRoleRepository.assignPermissions).not.toHaveBeenCalled();
  });

  it("useRolePermissionsDialog isolates tenant endpoint, rejects all_tenants on tenant role, tracks modified scope/fields, and syncs session caches safely on save", async () => {
    const onOpenChange = vi.fn();
    mockRoleRepository.getRolePermissions.mockResolvedValue([
      {
        permissionCode: "crm.opportunities.create",
        permissionId: "perm-create",
        scope: undefined,
        restrictedFields: [],
      },
    ]);
    // Background session refresh error must remain non-fatal after 200 OK save
    mockGetCurrentPrincipal.mockRejectedValueOnce(new Error("transient principal timeout"));

    const role = makeRole({ id: "role-dlg", tenantId: "tenant-1" });
    const wrapper = createWrapper(queryClient);
    const { result } = renderHook(
      () =>
        useRolePermissionsDialog({
          open: true,
          onOpenChange,
          role,
          tenantId: "tenant-1",
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.totalCount).toBe(2);
    });
    expect(mockRoleRepository.getCurrentTenantAvailablePermissionsGrouped).toHaveBeenCalled();
    expect(mockRoleRepository.getTenantAvailablePermissionsGrouped).not.toHaveBeenCalled();
    expect(result.current.allowAllTenants).toBe(false);
    expect(result.current.isReadOnly).toBe(false);
    expect(result.current.isDirty).toBe(false);

    act(() => {
      result.current.toggle("crm.opportunities.read");
    });
    expect(result.current.assignments.get("crm.opportunities.read")?.scopeOverride).toBeUndefined();

    act(() => {
      result.current.updateAssignment("crm.opportunities.create", {
        permissionId: "perm-create",
        scopeOverride: PermissionScopes.Own,
        restrictedFields: ["secretNote"],
      });
    });
    expect(result.current.changesCount).toEqual({ added: 1, removed: 0, modified: 1 });
    expect(result.current.isDirty).toBe(true);

    act(() => {
      result.current.bulkUpdateScope(PermissionScopes.AllTenants);
    });
    expect(result.current.assignments.get("crm.opportunities.create")?.scopeOverride).toBe(
      PermissionScopes.Own
    );

    act(() => {
      result.current.save();
    });

    await waitFor(() => {
      expect(mockRoleRepository.assignPermissions).toHaveBeenCalledWith("role-dlg", {
        permissions: [
          {
            permissionId: "perm-create",
            scopeOverride: "own",
            restrictedFields: ["secretNote"],
          },
          {
            permissionId: "perm-read",
            scopeOverride: null,
            restrictedFields: [],
          },
        ],
      });
    });
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it("fails loudly without calling assignPermissions when any selected permission lacks a resolvable ID", async () => {
    mockRoleRepository.getById.mockResolvedValue(makeRole({ id: "role-missing", tenantId: "tenant-1" }));
    mockRoleRepository.getRolePermissions.mockResolvedValue([
      {
        permissionCode: "legacy.orphaned.read",
        permissionId: "",
      },
    ]);

    const wrapper = createWrapper(queryClient);
    const { result } = renderHook(() => useRoleDetailViewModel("role-missing"), { wrapper });

    await waitFor(() => {
      expect(result.current.permissions.selectedPermissionCodes.has("legacy.orphaned.read")).toBe(
        true
      );
    });

    act(() => {
      result.current.permissions.onBulkScopeUpdate(PermissionScopes.Own);
    });
    act(() => {
      result.current.header.onSave();
    });

    await waitFor(() => {
      expect(mockErrorToast).toHaveBeenCalledWith({
        title: "common.error",
        description: "roles.permissionsMissingIdsError",
      });
    });
    expect(mockRoleRepository.assignPermissions).not.toHaveBeenCalled();
  });

  it("never briefly reverts assignments to stale cache while delayed post-save getRolePermissions refetch is in flight", async () => {
    let resolveDelayedRefetch!: (rows: Array<Record<string, unknown>>) => void;
    const delayedRefetchPromise = new Promise<Array<Record<string, unknown>>>((resolve) => {
      resolveDelayedRefetch = resolve;
    });

    mockRoleRepository.getById.mockResolvedValue(makeRole({ id: "role-a", tenantId: "tenant-1" }));
    mockRoleRepository.getRolePermissions
      .mockResolvedValueOnce([{ permissionCode: "crm.opportunities.read", permissionId: "perm-read" }])
      .mockImplementationOnce(() => delayedRefetchPromise);

    const wrapper = createWrapper(queryClient);
    const { result } = renderHook(() => useRoleDetailViewModel("role-a"), { wrapper });

    await waitFor(() => {
      expect(result.current.permissions.selectedPermissionCodes.has("crm.opportunities.read")).toBe(
        true
      );
    });
    expect(result.current.permissions.selectedPermissionCodes.has("crm.opportunities.create")).toBe(
      false
    );

    act(() => {
      result.current.permissions.onTogglePermission("crm.opportunities.create");
    });
    expect(result.current.permissions.selectedPermissionCodes.has("crm.opportunities.create")).toBe(
      true
    );

    await act(async () => {
      result.current.header.onSave();
    });

    await waitFor(() => {
      expect(mockRoleRepository.assignPermissions).toHaveBeenCalledTimes(1);
      expect(mockRoleRepository.getRolePermissions).toHaveBeenCalledTimes(2);
    });

    // While delayed refetch is STILL in flight, assignments MUST retain the saved selection (never revert to read-only pre-save cache)
    expect(result.current.permissions.selectedPermissionCodes.has("crm.opportunities.create")).toBe(
      true
    );
    expect(result.current.header.isDirty).toBe(false);

    // Resolve delayed refetch with server-normalized scopeOverride
    await act(async () => {
      resolveDelayedRefetch([
        { permissionCode: "crm.opportunities.read", permissionId: "perm-read" },
        {
          permissionCode: "crm.opportunities.create",
          permissionId: "perm-create",
          scopeOverride: "own",
        },
      ]);
      await delayedRefetchPromise;
    });

    await waitFor(() => {
      expect(
        result.current.permissions.assignments.get("crm.opportunities.create")?.scopeOverride
      ).toBe(PermissionScopes.Own);
    });
    expect(result.current.header.isDirty).toBe(false);
  });
});
