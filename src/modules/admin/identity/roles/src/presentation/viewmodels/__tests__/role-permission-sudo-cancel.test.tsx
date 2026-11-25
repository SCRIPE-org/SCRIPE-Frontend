import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAppStore } from "@core/store/useAppStore";
import { SudoCancelledError } from "@core/store/useSudoStore";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { Permission } from "@modules/identity/permissions";
import { Role } from "../../../domain/entities/Role";

const { mockRoleRepository, mockToast, mockErrorToast, mockInfoToast } = vi.hoisted(() => ({
  mockRoleRepository: {
    getById: vi.fn(),
    getRolePermissions: vi.fn(),
    getAdminCount: vi.fn().mockResolvedValue(0),
    getCurrentTenantAvailablePermissionsGrouped: vi.fn(),
    getTenantAvailablePermissionsGrouped: vi.fn(),
    assignPermissions: vi.fn(),
  },
  mockToast: vi.fn(),
  mockErrorToast: vi.fn(),
  mockInfoToast: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "role-a" }),
}));

vi.mock("@modules/identity/di", () => ({
  identityContainer: {
    roleRepository: mockRoleRepository,
  },
}));

vi.mock("@core/providers/navigation-provider", () => ({
  useOptionalNavigation: () => ({
    refreshNavigation: vi.fn(),
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
    success: vi.fn(),
    error: mockErrorToast,
    info: mockInfoToast,
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

describe("Role permission assignment Sudo cancellation toast suppression (#508)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAppStore.setState({
      isAuthenticated: true,
      _hasHydrated: true,
      user: { id: "u-1", username: "admin", tenantId: "t-1", isProtected: false } as never,
      permissions: [SYSTEM_PERMISSIONS.ROLES_VIEW, SYSTEM_PERMISSIONS.ROLES_MANAGE_PERMISSIONS] as never,
      roles: [],
    });

    const perm = new Permission({
      id: "perm-read",
      code: "crm.opportunities.read",
      resource: "crm.opportunities",
      action: "read",
      module: "CRM",
      category: "CRM Opportunities",
      defaultScope: "tenant",
      displayOrder: 1,
      nameEn: "crm.opportunities.read",
      platformOnly: false,
    });
    const catalog = [{ module: "CRM", categories: [{ category: "CRM Opportunities", permissions: [perm] }] }];
    mockRoleRepository.getCurrentTenantAvailablePermissionsGrouped.mockResolvedValue(catalog);
    mockRoleRepository.getRolePermissions.mockResolvedValue([]);
    mockRoleRepository.getById.mockResolvedValue(
      new Role({
        id: "role-a",
        nameEn: "Sales Lead",
        nameAr: "قائد المبيعات",
        code: "T_SALES",
        isSystem: false,
        isTenantSuperAdmin: false,
        isPermissionLocked: false,
        priority: 10,
        isActive: true,
        permissions: [],
        createdAt: "2026-01-01T00:00:00Z",
        tenantId: "t-1",
      })
    );
  });

  it("suppresses destructive error toasts and shows non-destructive info toast in useRoleDetailViewModel and useRolePermissionsDialog when Sudo verification is cancelled", async () => {
    mockRoleRepository.assignPermissions.mockRejectedValue(new SudoCancelledError());
    const onDialogOpenChange = vi.fn();
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );

    const { result: detailVm } = renderHook(() => useRoleDetailViewModel("role-a"), { wrapper });
    await waitFor(() => expect(detailVm.current.info.totalCount).toBe(1));

    act(() => detailVm.current.permissions.onTogglePermission("crm.opportunities.read"));
    act(() => detailVm.current.header.onSave());

    await waitFor(() => expect(mockRoleRepository.assignPermissions).toHaveBeenCalledTimes(1));
    expect(mockErrorToast).not.toHaveBeenCalled();
    expect(mockInfoToast).toHaveBeenCalledWith({
      title: "profile.sudo.cancelledTitle",
      description: "profile.sudo.cancelledDescription",
    });

    const role = await mockRoleRepository.getById("role-a");
    const { result: dialogVm } = renderHook(
      () => useRolePermissionsDialog({ open: true, onOpenChange: onDialogOpenChange, role, tenantId: "t-1" }),
      { wrapper }
    );
    await waitFor(() => expect(dialogVm.current.totalCount).toBe(1));

    act(() => dialogVm.current.toggle("crm.opportunities.read"));
    act(() => dialogVm.current.save());

    await waitFor(() => expect(mockRoleRepository.assignPermissions).toHaveBeenCalledTimes(2));
    expect(mockToast).not.toHaveBeenCalled();
    expect(onDialogOpenChange).not.toHaveBeenCalledWith(false);
    expect(mockInfoToast).toHaveBeenCalledTimes(2);
    expect(dialogVm.current.assignments.has("crm.opportunities.read")).toBe(true);
  });
});
