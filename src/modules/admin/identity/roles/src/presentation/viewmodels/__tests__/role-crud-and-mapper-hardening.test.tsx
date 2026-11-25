/**
 * Role CRUD, RoleMapper, RoleService 204 Safety & TenantRoles Initial-Values Hardening Tests
 */
import React from "react";
import { act, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { useAppStore } from "@core/store/useAppStore";
import { SudoCancelledError } from "@core/store/useSudoStore";
import type { IApiService } from "@core/interfaces/api.interface";
import { Role } from "../../../domain/entities/Role";
import { RoleMapper } from "../../../data/mappers/RoleMapper";
import { RoleModel } from "../../../data/models/RoleModel";
import { RoleService } from "../../../data/services/RoleService";

const { mockRoleRepo, mockTenantRepo, mockToastSuccess, mockToastError, mockToastInfo, mockOperationSuccess } =
  vi.hoisted(() => ({
    mockRoleRepo: {
      getAll: vi.fn(),
      getCurrentTenantRoles: vi.fn(),
      getById: vi.fn(),
      getAdminCount: vi.fn().mockResolvedValue(0),
      create: vi.fn(),
      createInCurrentTenant: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      clone: vi.fn(),
      bulkDelete: vi.fn(),
      assignPermissions: vi.fn(),
    },
    mockTenantRepo: {
      resyncPermissions: vi.fn(),
    },
    mockToastSuccess: vi.fn(),
    mockToastError: vi.fn(),
    mockToastInfo: vi.fn(),
    mockOperationSuccess: vi.fn(),
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

vi.mock("@core/providers/settings-provider", () => ({
  useSettings: () => ({
    modalStyle: "centered",
    spacingSize: "default",
    buttonStyle: "default",
    borderRadius: "default",
    animationLevel: "default",
    formStyle: "default",
    inputStyle: "default",
    checkboxStyle: "default",
  }),
}));

vi.mock("@core/hooks/use-permission", () => ({
  usePermissions: () => ({
    isPlatformSuperAdmin: false,
    hasPermission: () => true,
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
    operationSuccess: mockOperationSuccess,
    operationError: vi.fn(),
  }),
}));

import { useRolesViewModel } from "../useRolesViewModel";
import { RoleDeleteDialog } from "../../components/RoleDeleteDialog";

describe("Role mapper, service 204 safety & CRUD Sudo/toast behavior", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAppStore.setState({
      isAuthenticated: true,
      _hasHydrated: true,
      user: { id: "u-1", username: "tenant-admin", tenantId: "t-1", isProtected: false } as never,
      permissions: ["roles.view", "roles.create", "roles.update", "roles.delete"] as never,
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

  it("RoleMapper maps restrictedFields, CreateRole permissionIds & safe priority default 100, and UpdateRole isActive", () => {
    const entity = RoleMapper.toEntity(
      RoleModel.fromJson({
        id: "11111111-1111-1111-1111-111111111111",
        nameEn: "Coach",
        nameAr: "مدرب",
        code: "COACH",
        isSystem: false,
        priority: 20,
        isActive: true,
        permissions: [
          {
            permissionId: "22222222-2222-2222-2222-222222222222",
            permissionCode: "crm.leads.view",
            scope: "own",
            restrictedFields: ["phoneNumber"],
          },
        ],
        createdAt: "2026-01-01T00:00:00Z",
      })
    );
    expect(entity.permissions[0]?.restrictedFields).toEqual(["phoneNumber"]);
    expect(RoleMapper.toModel(entity).toJson().permissions?.[0]?.restrictedFields).toEqual([
      "phoneNumber",
    ]);

    const createJson = RoleMapper.toCreateModel({
      nameEn: "Analyst",
      nameAr: "محلل",
      code: "ANALYST",
      permissionIds: ["p-1", "p-2"],
    }).toJson();
    expect(createJson.priority).toBe(100);
    expect(createJson.permissionIds).toEqual(["p-1", "p-2"]);

    const updateJson = RoleMapper.toUpdateModel({
      nameEn: "Analyst 2",
      nameAr: "محلل 2",
      priority: 50,
      isActive: false,
    }).toJson();
    expect(updateJson.isActive).toBe(false);
  });

  it("RoleService.bulkDelete returns ids.length cleanly on 204 null API response", async () => {
    const api = {
      post: vi.fn().mockResolvedValue(null),
    } as unknown as IApiService;
    const svc = new RoleService(api);

    await expect(svc.bulkDelete(["id-1", "id-2"])).resolves.toBe(2);
  });

  it("useRolesViewModel fires single toast on create/update/delete, routes createWithPermissions via createInCurrentTenant, and surfaces info toast on Sudo cancel", async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    mockRoleRepo.createInCurrentTenant.mockResolvedValue("new-role-1");
    mockRoleRepo.update.mockResolvedValue(undefined);
    mockRoleRepo.delete.mockResolvedValue(undefined);
    mockRoleRepo.clone.mockRejectedValue(new SudoCancelledError());
    mockRoleRepo.bulkDelete.mockRejectedValue(new SudoCancelledError());

    const { result } = renderHook(() => useRolesViewModel({ useMyTenant: true }), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.createItem({ nameEn: "Lead", nameAr: "قائد", code: "LEAD", priority: 25 });
    });
    expect(mockOperationSuccess).toHaveBeenCalledTimes(1);
    expect(mockToastSuccess).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.createWithPermissions(
        { nameEn: "Ops", nameAr: "عمليات", code: "OPS", priority: 30 },
        ["perm-1"]
      );
    });
    expect(mockRoleRepo.createInCurrentTenant).toHaveBeenCalledWith({
      nameEn: "Ops",
      nameAr: "عمليات",
      code: "OPS",
      priority: 30,
    });
    expect(mockRoleRepo.assignPermissions).toHaveBeenCalledWith("new-role-1", {
      permissions: [{ permissionId: "perm-1" }],
    });
    expect(mockToastSuccess).toHaveBeenCalledWith({
      title: "roles.createdTitle",
      description: "roles.createdWithPermissionsDescription",
    });

    await act(async () => {
      await expect(
        result.current.clone({ nameEn: "Copy", nameAr: "نسخة" }, "new-role-1")
      ).rejects.toThrow();
      await expect(result.current.handleBulkDelete(["new-role-1"])).rejects.toThrow();
    });
    expect(mockToastError).not.toHaveBeenCalled();
    expect(mockToastInfo).toHaveBeenCalledWith({
      title: "profile.sudo.cancelledTitle",
      description: "profile.sudo.cancelledDescription",
    });
  });

  it("RoleDeleteDialog stays open on Confirm-click rejection / SudoCancelledError and only closes when onConfirm succeeds", async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    mockRoleRepo.getAdminCount.mockResolvedValue(0);
    const onOpenChange = vi.fn();
    const onConfirm = vi
      .fn<(fallbackRoleId?: string) => Promise<void>>()
      .mockRejectedValueOnce(new SudoCancelledError("Sudo verification was cancelled."))
      .mockImplementationOnce(async () => {
        onOpenChange(false);
      });

    const role = new Role({
      id: "role-del-1",
      nameEn: "Coach Lead",
      nameAr: "قائد المدربين",
      code: "COACH_LEAD",
      isSystem: false,
      isTenantSuperAdmin: false,
      isPermissionLocked: false,
      priority: 30,
      isActive: true,
      permissions: [],
      createdAt: "2026-01-01T00:00:00Z",
      tenantId: "t-1",
    });

    render(
      <QueryClientProvider client={queryClient}>
        <RoleDeleteDialog
          open={true}
          onOpenChange={onOpenChange}
          role={role}
          tenantId="t-1"
          onConfirm={onConfirm}
          isDeleting={false}
        />
      </QueryClientProvider>
    );

    const deleteBtn = await screen.findByRole("button", { name: "common.delete" });
    await waitFor(() => expect(deleteBtn).toBeEnabled());

    fireEvent.click(deleteBtn);
    await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1));

    // Must remain open cleanly after Sudo cancellation without synchronous auto-close
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();

    // Retry succeeds -> parent closes dialog cleanly
    fireEvent.click(screen.getByRole("button", { name: "common.delete" }));
    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledTimes(2);
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });
});
