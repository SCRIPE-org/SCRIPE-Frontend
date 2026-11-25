/**
 * Admin RBAC Sync, Mapper Schema, Transfer Search & ManageRoles Sudo Preservation Tests
 */
import React from "react";
import { act, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SudoCancelledError, useSudoStore } from "@core/store/useSudoStore";
import { AdminRepository } from "../../../data/repositories/AdminRepository";
import { AdminMapper } from "../../../data/mappers/AdminMapper";
import { AdminModel } from "../../../data/models/AdminModel";
import { Admin } from "../../../domain/entities/Admin";
import type { IAdminService } from "../../../domain/interfaces/IAdminService";

const { mockRoleRepo, mockAdminRepo, mockTenantRepo, mockInfoToast, mockErrorToast, mockSuccessToast } =
  vi.hoisted(() => ({
    mockRoleRepo: {
      getAll: vi.fn(),
      getCurrentTenantRoles: vi.fn(),
    },
    mockAdminRepo: {
      getRoles: vi.fn(),
      syncRoles: vi.fn(),
    },
    mockTenantRepo: {
      getCurrentTenantHierarchy: vi.fn(),
    },
    mockInfoToast: vi.fn(),
    mockErrorToast: vi.fn(),
    mockSuccessToast: vi.fn(),
  }));

vi.mock("@modules/identity/di", () => ({
  identityContainer: {
    roleRepository: mockRoleRepo,
    adminRepository: mockAdminRepo,
    tenantRepository: mockTenantRepo,
  },
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    language: "en" as const,
    direction: "ltr" as const,
  }),
}));

vi.mock("@core/providers/settings-provider", () => ({
  useSettings: () => ({ modalStyle: "centered", spacingSize: "default" }),
}));

vi.mock("@core/providers/navigation-provider", () => ({
  useOptionalNavigation: () => ({ refreshNavigation: vi.fn() }),
}));

vi.mock("@core/hooks/use-authorization-sync", () => ({
  syncCurrentSessionAuthorization: vi.fn().mockRejectedValue(new Error("transient sync fail")),
}));

vi.mock("@core/hooks/use-enhanced-toast", () => ({
  useEnhancedToast: () => ({
    toast: vi.fn(),
    success: mockSuccessToast,
    error: mockErrorToast,
    info: mockInfoToast,
  }),
}));

import { useAdminTransferViewModel } from "../../viewmodels/useAdminTransferViewModel";
import { useManageRolesViewModel } from "../../viewmodels/useManageRolesViewModel";
import { ManageRolesDialog } from "../ManageRolesDialog";

globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

describe("Admin RBAC sync, mapper schema, transfer search & ManageRoles Sudo hardening", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSudoStore.setState({ modalOpen: false });
  });

  it("AdminRepository.syncRoles forwards scopeTenantId and AdminMapper preserves full AdminRoleJson fields", async () => {
    const mockService = {
      syncRoles: vi.fn().mockResolvedValue(undefined),
    } as unknown as IAdminService;
    const repo = new AdminRepository(mockService);

    const assignments = [{ roleId: "role-1", tenantId: "tenant-a", inheritToChildren: true }];
    await repo.syncRoles("admin-1", assignments, "tenant-a");
    expect(mockService.syncRoles).toHaveBeenCalledWith("admin-1", assignments, "tenant-a");

    const model = AdminModel.fromJson({
      id: "11111111-1111-1111-1111-111111111111",
      username: "ops.lead",
      isActive: true,
      createdAt: "2026-01-01T00:00:00Z",
      roles: [
        {
          roleId: "22222222-2222-2222-2222-222222222222",
          roleNameEn: "Venue Director",
          roleNameAr: "مدير المنشآت",
          roleCode: "VENUE_DIR",
          tenantId: "33333333-3333-3333-3333-333333333333",
          tenantName: "Al Ahly",
          inheritToChildren: true,
        },
      ],
    });

    const entity = AdminMapper.toEntity(model);
    expect(entity.roles).toEqual([
      {
        roleId: "22222222-2222-2222-2222-222222222222",
        roleNameEn: "Venue Director",
        roleNameAr: "مدير المنشآت",
        roleCode: "VENUE_DIR",
        tenantId: "33333333-3333-3333-3333-333333333333",
        tenantName: "Al Ahly",
        expiresAt: undefined,
        inheritToChildren: true,
      },
    ]);
  });

  it("useAdminTransferViewModel queries unscoped system roles via getAll({ strict: true }) when __SYSTEM__ is selected", async () => {
    mockRoleRepo.getAll.mockResolvedValue({
      items: [{ id: "sys-1", nameEn: "System Super Admin", nameAr: "مشرف عام" }],
    });
    const { result } = renderHook(() => useAdminTransferViewModel());

    const options = await result.current.handleRoleSearch("Super", "__SYSTEM__", true, true);
    expect(mockRoleRepo.getAll).toHaveBeenCalledWith({
      search: "Super",
      page: 1,
      pageSize: 20,
      strict: true,
    });
    expect(mockRoleRepo.getCurrentTenantRoles).not.toHaveBeenCalled();
    expect(options).toEqual([{ value: "sys-1", label: "System Super Admin" }]);
  });

  it("ManageRolesDialog preserves edits across background rolesData refetches and keeps dialog open with info toast on Sudo cancellation", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    mockRoleRepo.getCurrentTenantRoles.mockResolvedValue({
      items: [
        { id: "r-1", code: "EDITOR", nameEn: "Editor", nameAr: "محرر", priority: 10 },
        { id: "r-2", code: "VIEWER", nameEn: "Viewer", nameAr: "قارئ", priority: 20 },
      ],
      totalCount: 2,
      pageNumber: 1,
      pageSize: 100,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    });
    mockAdminRepo.getRoles.mockResolvedValue([
      { roleId: "r-1", roleCode: "EDITOR", roleNameEn: "Editor", roleNameAr: "محرر", tenantId: "" },
    ]);

    const onOpenChange = vi.fn();
    const admin = new Admin({
      id: "adm-1",
      username: "ali",
      isActive: true,
      createdAt: "2026-01-01T00:00:00Z",
    });

    render(<ManageRolesDialog open={true} onOpenChange={onOpenChange} admin={admin} />, {
      wrapper,
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "admin.role.saveRoles" })).toBeEnabled();
    });

    // Simulate background refetch producing new rolesData array reference — UI should stay mounted & stable
    await act(async () => {
      await queryClient.invalidateQueries({ queryKey: ["roles-for-manage"] });
    });

    // Cancel Sudo inside syncRoles -> non-destructive info toast, zero error toast, dialog stays open
    mockAdminRepo.syncRoles.mockRejectedValueOnce(new SudoCancelledError());
    const { result: manageVm } = renderHook(
      () => useManageRolesViewModel({ adminId: "adm-1", scopeTenantId: "", open: true }),
      { wrapper }
    );
    await waitFor(() => expect(manageVm.current.isLoading).toBe(false));

    await act(async () => {
      await manageVm.current.syncRoles(["r-1", "r-2"], false, onOpenChange);
    });

    expect(mockInfoToast).toHaveBeenCalledWith({
      title: "profile.sudo.cancelledTitle",
      description: "profile.sudo.cancelledDescription",
    });
    expect(mockErrorToast).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalledWith(false);

    // Non-fatal syncCurrentSessionAuthorization error on Save still completes sync & closes dialog cleanly
    mockAdminRepo.syncRoles.mockResolvedValueOnce(undefined);
    await act(async () => {
      await manageVm.current.syncRoles(["r-1"], false, onOpenChange);
    });
    expect(mockSuccessToast).toHaveBeenCalledWith({ title: "admin.role.syncSuccess" });
    expect(onOpenChange).toHaveBeenCalledWith(false);

    fireEvent.click(screen.getByRole("button", { name: "common.cancel" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
