import React from "react";
import { act, render, renderHook, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { useAppStore } from "@core/store/useAppStore";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { Role } from "../../../../../roles/src/domain/entities/Role";

const {
  mockRoleRepository,
  mockAdminRepository,
  mockUserGroupRepository,
  mockRefreshNavigation,
  mockGetCurrentPrincipal,
} = vi.hoisted(() => ({
  mockRoleRepository: {
    getCurrentTenantRoles: vi.fn(),
    getAll: vi.fn(),
  },
  mockAdminRepository: {
    getRoles: vi.fn(),
    syncRoles: vi.fn().mockResolvedValue(undefined),
  },
  mockUserGroupRepository: {
    getCurrentTenantGroups: vi.fn().mockResolvedValue({ items: [] }),
    getAll: vi.fn().mockResolvedValue({ items: [] }),
  },
  mockRefreshNavigation: vi.fn(),
  mockGetCurrentPrincipal: vi.fn(),
}));

vi.mock("@modules/identity/di", () => ({
  identityContainer: {
    roleRepository: mockRoleRepository,
    adminRepository: mockAdminRepository,
    userGroupRepository: mockUserGroupRepository,
  },
}));

vi.mock("@modules/auth/di", () => ({
  getAuthContainer: () => ({
    authRepository: {
      getCurrentPrincipal: mockGetCurrentPrincipal,
    },
  }),
}));

vi.mock("@core/providers/service-provider", () => ({
  useServices: () => ({
    authRepository: {
      getCurrentPrincipal: mockGetCurrentPrincipal,
    },
  }),
}));

vi.mock("@core/hooks/use-auth-bridge", () => ({
  useCoreImpersonation: () => ({
    startImpersonation: vi.fn(),
    isLoading: false,
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
    success: vi.fn(),
    error: vi.fn(),
    toast: vi.fn(),
  }),
}));

import { ManageRolesDialog } from "../ManageRolesDialog";
import { useManageRolesViewModel } from "../../viewmodels/useManageRolesViewModel";
import { useAdminOperations } from "../../viewmodels/useAdminOperations";

function makeRole(id: string, nameEn: string, priority: number, code = nameEn.toUpperCase()) {
  return new Role({
    id,
    nameEn,
    nameAr: nameEn,
    code,
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

describe("Role picker priority sorting and tenant scoping", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    Element.prototype.scrollIntoView ??= vi.fn();
    globalThis.ResizeObserver ??= class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;

    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const unorderedRoles = [
      makeRole("r-rep", "Sales Rep", 300, "T_SCRIPE_REP"),
      makeRole("r-sa", "Tenant Super Admin", 0, "T_SCRIPE_SA"),
      makeRole("r-mgr", "Sales Manager", 20, "T_SCRIPE_MGR"),
    ];

    mockRoleRepository.getCurrentTenantRoles.mockResolvedValue({ items: unorderedRoles });
    mockRoleRepository.getAll.mockResolvedValue({ items: unorderedRoles });
    mockAdminRepository.getRoles.mockResolvedValue([
      { roleCode: "T_SCRIPE_MGR", tenantId: "tenant-1", inheritToChildren: false },
    ]);
    mockGetCurrentPrincipal.mockResolvedValue({
      id: "u1",
      username: "tenant.admin",
      tenantId: "tenant-1",
      roles: [],
      permissions: [],
      restrictedFields: {},
    });

    useAppStore.setState({
      isAuthenticated: true,
      user: { id: "u1", username: "tenant.admin", tenantId: "tenant-1" } as never,
      permissions: [SYSTEM_PERMISSIONS.ADMINS_ASSIGN_ROLES] as never,
      roles: [],
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

  it("uses current-tenant roles endpoint for own-tenant admins, keeps resolvedExtraRoles stable, and orders role options ascending by priority", async () => {
    const wrapper = createWrapper(queryClient);

    render(
      <ManageRolesDialog
        open={true}
        onOpenChange={vi.fn()}
        admin={{ id: "adm-1", displayName: "John", tenantId: "tenant-1" } as never}
        tenantId="tenant-1"
      />,
      { wrapper }
    );

    await waitFor(() => {
      expect(
        screen.getByRole("combobox", { name: /admin\.role\.selectRoles/i })
      ).toBeInTheDocument();
    });

    expect(mockRoleRepository.getCurrentTenantRoles).toHaveBeenCalled();
    expect(mockRoleRepository.getAll).not.toHaveBeenCalled();

    const combobox = screen.getByRole("combobox", { name: /admin\.role\.selectRoles/i });
    fireEvent.click(combobox);

    await waitFor(() => {
      expect(screen.getByText("Tenant Super Admin")).toBeInTheDocument();
    });

    const optionTexts = screen
      .getAllByRole("option")
      .map((el) => el.textContent?.trim() ?? "");
    const saIndex = optionTexts.findIndex((t) => t.includes("Tenant Super Admin"));
    const mgrIndex = optionTexts.findIndex((t) => t.includes("Sales Manager"));
    const repIndex = optionTexts.findIndex((t) => t.includes("Sales Rep"));

    expect(saIndex).toBeGreaterThanOrEqual(0);
    expect(saIndex).toBeLessThan(mgrIndex);
    expect(mgrIndex).toBeLessThan(repIndex);
  });

  it("sorts searchRoles and handleRoleSearch ascending by priority and syncs session caches after syncRoles", async () => {
    const wrapper = createWrapper(queryClient);

    const { result: manageVm } = renderHook(
      () => useManageRolesViewModel({ adminId: "adm-1", scopeTenantId: "tenant-1", open: true }),
      { wrapper }
    );

    await waitFor(() => {
      expect(manageVm.current.isLoading).toBe(false);
    });

    const searched = await manageVm.current.searchRoles("Sales");
    expect(searched.map((o) => o.label)).toEqual([
      "Tenant Super Admin",
      "Sales Manager",
      "Sales Rep",
    ]);

    const { result: opsVm } = renderHook(
      () =>
        useAdminOperations({
          tenantId: "tenant-1",
          queryKey: ["admins"],
          refreshItems: vi.fn().mockResolvedValue(undefined),
        }),
      { wrapper }
    );

    const opsRoles = await opsVm.current.handleRoleSearch("Sales");
    expect(opsRoles.map((o) => o.label)).toEqual([
      "Tenant Super Admin",
      "Sales Manager",
      "Sales Rep",
    ]);
    expect(mockRoleRepository.getAll).not.toHaveBeenCalled();

    await act(async () => {
      await manageVm.current.syncRoles(["r-sa"], false, vi.fn());
    });
    await waitFor(() => {
      expect(mockRefreshNavigation).toHaveBeenCalledTimes(1);
    });
  });
});
