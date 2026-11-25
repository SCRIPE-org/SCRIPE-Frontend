/**
 * Tenant Roles Initial Values, Resync & Permissions Query-Error Hardening Tests
 */
import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { useAppStore } from "@core/store/useAppStore";
import { SudoCancelledError } from "@core/store/useSudoStore";

const { mockRoleRepo, mockTenantRepo, mockToastSuccess, mockToastError, mockToastInfo } =
  vi.hoisted(() => ({
    mockRoleRepo: {
      getAll: vi.fn(),
      getCurrentTenantRoles: vi.fn(),
      delete: vi.fn(),
    },
    mockTenantRepo: {
      resyncPermissions: vi.fn(),
      getCreationPermissions: vi.fn(),
      getTenantPermissions: vi.fn(),
      getTenantPermissionsGrouped: vi.fn(),
      updateTenantPermissions: vi.fn(),
    },
    mockToastSuccess: vi.fn(),
    mockToastError: vi.fn(),
    mockToastInfo: vi.fn(),
  }));

vi.mock("@modules/identity/di", () => ({
  identityContainer: {
    roleRepository: mockRoleRepo,
    tenantRepository: mockTenantRepo,
  },
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    language: "en" as const,
  }),
}));

vi.mock("@core/providers/tenant-context-provider", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@core/providers/tenant-context-provider")>();
  return {
    ...actual,
    useCurrentTenantId: () => null,
  };
});

vi.mock("@core/providers/navigation-provider", () => ({
  useOptionalNavigation: () => ({ refreshNavigation: vi.fn() }),
}));

vi.mock("@core/providers/workspace-provider", () => ({
  useWorkspace: () => ({ workspaceGroups: [] }),
}));

vi.mock("@core/hooks/use-authorization-sync", () => ({
  syncCurrentSessionAuthorization: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@core/hooks/use-enhanced-toast", () => ({
  useEnhancedToast: () => ({
    toast: vi.fn(),
    success: mockToastSuccess,
    error: mockToastError,
    info: mockToastInfo,
    operationSuccess: vi.fn(),
    operationError: vi.fn(),
  }),
}));

import { useTenantRolesViewModel } from "../viewmodels/useTenantRolesViewModel";
import { useTenantPermissionsDialog } from "../viewmodels/useTenantPermissionsViewModel";

describe("TenantRoles & TenantPermissions hardening", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAppStore.setState({
      isAuthenticated: true,
      _hasHydrated: true,
      user: { id: "u-1", username: "tenant-admin", tenantId: "t-1", isProtected: false } as never,
      permissions: ["roles.view", "roles.create", "roles.delete"] as never,
      roles: [],
    });
    mockRoleRepo.getCurrentTenantRoles.mockResolvedValue({
      items: [],
      totalCount: 0,
      pageNumber: 1,
      pageSize: 10,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    });
  });

  afterEach(() => {
    useAppStore.setState({ isAuthenticated: false, user: null, permissions: [] as never, roles: [] });
  });

  it("useTenantRolesViewModel initializes bilingual fields and handles Sudo cancellation on resyncPermissions", async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    mockTenantRepo.resyncPermissions.mockRejectedValueOnce(new SudoCancelledError());

    const { result } = renderHook(
      () => useTenantRolesViewModel({ tenantId: "t-1", tenantName: "Al Ahly" }),
      { wrapper }
    );

    expect(result.current.createInitialValues).toEqual({
      nameEn: "",
      nameAr: "",
      code: "",
      descriptionEn: "",
      descriptionAr: "",
      priority: 100,
      permissionIds: [],
    });

    act(() => {
      result.current.resyncPermissions();
    });

    await waitFor(() => expect(mockTenantRepo.resyncPermissions).toHaveBeenCalledWith("t-1"));
    expect(mockToastError).not.toHaveBeenCalled();
    expect(mockToastInfo).toHaveBeenCalledWith({
      title: "profile.sudo.cancelledTitle",
      description: "profile.sudo.cancelledDescription",
    });
  });

  it("useTenantPermissionsDialog surfaces permission fetch failures instead of silently saving []", async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    mockTenantRepo.getCreationPermissions.mockRejectedValue(new Error("Gateway timeout"));
    mockTenantRepo.getTenantPermissions.mockResolvedValue([]);

    const { result } = renderHook(
      () =>
        useTenantPermissionsDialog({
          open: true,
          onOpenChange: vi.fn(),
          tenantId: "t-1",
          tenantName: "Al Ahly",
        }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.hasQueryError).toBe(true));
    expect(result.current.queryErrorMessage).toBe("Gateway timeout");

    act(() => {
      result.current.save();
    });

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith({
        title: "tenant.permissionsSaveError",
        description: "Gateway timeout",
      });
    });
    expect(mockTenantRepo.updateTenantPermissions).not.toHaveBeenCalled();
  });
});
