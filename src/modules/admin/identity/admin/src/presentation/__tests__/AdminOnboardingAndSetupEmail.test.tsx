/**
 * Admin Onboarding, Setup Email Status Badge, Cooldown vs Failure Toast & Locale Parity Tests
 */
import React from "react";
import { act, render, renderHook, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SudoCancelledError } from "@core/store/useSudoStore";
import { Admin } from "../../domain/entities/Admin";
import { AdminModel } from "../../data/models/AdminModel";
import { AdminMapper } from "../../data/mappers/AdminMapper";
import { useAdminFieldsConfig } from "../viewmodels/useAdminFieldsConfig";
import { en as adminEn } from "../../../locales/admin.en";
import { ar as adminAr } from "../../../locales/admin.ar";

const {
  mockAdminRepo,
  mockRoleRepo,
  mockUserGroupRepo,
  mockSuccessToast,
  mockErrorToast,
  mockInfoToast,
} = vi.hoisted(() => ({
  mockAdminRepo: {
    getAll: vi.fn(),
    getByTenantId: vi.fn(),
    getCurrentTenantAdmins: vi.fn(),
    create: vi.fn(),
    createInCurrentTenant: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    resendSetupEmail: vi.fn(),
    getPasswordPolicy: vi.fn().mockResolvedValue(null),
  },
  mockRoleRepo: {
    getAll: vi.fn(),
    getCurrentTenantRoles: vi.fn(),
  },
  mockUserGroupRepo: {
    getAll: vi.fn(),
    getCurrentTenantGroups: vi.fn(),
  },
  mockSuccessToast: vi.fn(),
  mockErrorToast: vi.fn(),
  mockInfoToast: vi.fn(),
}));

vi.mock("@modules/identity/di", () => ({
  identityContainer: {
    adminRepository: mockAdminRepo,
    roleRepository: mockRoleRepo,
    userGroupRepository: mockUserGroupRepo,
  },
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) =>
      params?.email ? `${key}:${String(params.email)}` : key,
    language: "en" as const,
    direction: "ltr" as const,
  }),
}));

vi.mock("@core/providers/service-provider", () => ({
  useServices: () => ({ authRepository: {} }),
}));

vi.mock("@core/providers/tenant-context-provider", () => ({
  useCurrentTenantId: () => "tenant-1",
}));

vi.mock("@core/providers/navigation-provider", () => ({
  useOptionalNavigation: () => ({ refreshNavigation: vi.fn() }),
}));

vi.mock("@core/hooks/use-permission", () => ({
  usePermission: () => true,
}));

vi.mock("@core/providers/permission-provider", () => ({
  usePermissions: () => ({
    isPlatformSuperAdmin: true,
    hasPermission: () => true,
  }),
}));

vi.mock("@core/hooks/use-module-locales", () => ({
  useModuleLocales: () => {},
}));

vi.mock("@core/providers/settings-provider", () => ({
  useSettings: () => ({ badgeStyle: "default", modalStyle: "centered", spacingSize: "default" }),
}));

vi.mock("@core/crud/components/generic-crud-view", () => ({
  GenericCrudView: ({ config }: { config: { columns: Array<{ key: string; render?: (val: unknown, item: Admin, idx: number) => React.ReactNode }> } }) => {
    const statusCol = config.columns.find((c) => c.key === "isActive");
    const pendingAdmin = new Admin({
      id: "adm-pending",
      username: "pending.user",
      isActive: true,
      createdAt: "2026-01-01T00:00:00Z",
      isAccountActivated: false,
      mustChangePassword: false,
    });
    const mustChangeAdmin = new Admin({
      id: "adm-must-change",
      username: "mustchange.user",
      isActive: true,
      createdAt: "2026-01-01T00:00:00Z",
      isAccountActivated: true,
      mustChangePassword: true,
    });
    return (
      <div>
        <div data-testid="pending-status">{statusCol?.render?.(true, pendingAdmin, 0)}</div>
        <div data-testid="must-change-status">{statusCol?.render?.(true, mustChangeAdmin, 1)}</div>
      </div>
    );
  },
}));

vi.mock("../components/AdminRoleDialogs", () => ({
  ResetPasswordDialog: () => null,
  ManualSetupDialog: () => null,
}));

vi.mock("../components/ManageRolesDialog", () => ({
  ManageRolesDialog: () => null,
}));

vi.mock("../components/AdminTransferDialog", () => ({
  AdminTransferDialog: () => null,
}));

vi.mock("@modules/identity/core", () => ({
  AssignToGroupDialog: () => null,
}));

vi.mock("@core/hooks/use-auth-bridge", () => ({
  useCoreImpersonation: () => ({
    startImpersonation: vi.fn(),
    isImpersonationLoading: false,
  }),
}));

vi.mock("@core/hooks/use-enhanced-toast", () => ({
  useEnhancedToast: () => ({
    toast: vi.fn(),
    success: mockSuccessToast,
    error: mockErrorToast,
    info: mockInfoToast,
    operationSuccess: vi.fn(),
    operationError: vi.fn(),
  }),
}));

import { useAdminsViewModel } from "../viewmodels/useAdminsViewModel";
import { useAdminOperations } from "../viewmodels/useAdminOperations";
import { AdminsView } from "../views/AdminsView";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("Admin onboarding setup email, status badges, resend error handling & locale parity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAdminRepo.getByTenantId.mockResolvedValue({
      items: [],
      totalCount: 0,
      page: 1,
      pageSize: 10,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    });
  });

  it("useAdminFieldsConfig uses type='email' for create and edit email fields and requires email only when sendSetupEmail !== false", () => {
    const { createFields, editFields } = useAdminFieldsConfig(
      (k) => k,
      async () => [],
      async () => []
    );

    const createEmailField = createFields.find((f) => f.name === "email");
    const editEmailField = editFields.find((f) => f.name === "email");

    expect(createEmailField?.type).toBe("email");
    expect(editEmailField?.type).toBe("email");
    expect(typeof createEmailField?.required).toBe("function");
    const reqFn = createEmailField?.required as (values: Record<string, unknown>) => boolean;
    expect(reqFn({ sendSetupEmail: true })).toBe(true);
    expect(reqFn({})).toBe(true);
    expect(reqFn({ sendSetupEmail: false })).toBe(false);
  });

  it("AdminMapper and Admin entity accurately track isAccountActivated, needsAccountSetup, and mustChangePassword", () => {
    const invitedModel = AdminModel.fromJson({
      id: "11111111-1111-1111-1111-111111111111",
      username: "invited.admin",
      email: "invited@ahly.com",
      isActive: true,
      createdAt: "2026-01-01T00:00:00Z",
      isAccountActivated: false,
      mustChangePassword: false,
    });

    const invitedEntity = AdminMapper.toEntity(invitedModel);
    expect(invitedEntity.isAccountActivated).toBe(false);
    expect(invitedEntity.needsAccountSetup).toBe(true);

    const roundTripJson = AdminMapper.toJsonFromEntity(invitedEntity);
    expect(roundTripJson.isAccountActivated).toBe(false);

    const activatedModel = AdminModel.fromJson({
      id: "22222222-2222-2222-2222-222222222222",
      username: "active.admin",
      isActive: true,
      createdAt: "2026-01-01T00:00:00Z",
      isAccountActivated: true,
      mustChangePassword: true,
    });

    const activatedEntity = AdminMapper.toEntity(activatedModel);
    expect(activatedEntity.isAccountActivated).toBe(true);
    expect(activatedEntity.needsAccountSetup).toBe(false);
    expect(activatedEntity.mustChangePassword).toBe(true);
  });

  it("useAdminsViewModel emits mode-aware Create Admin toast differentiating setup email invitation vs manual password", async () => {
    mockAdminRepo.create.mockResolvedValue("enc-admin-id-1");
    const wrapper = createWrapper();
    const { result } = renderHook(() => useAdminsViewModel({ tenantId: "tenant-1" }), { wrapper });

    await act(async () => {
      await result.current.vm.createItem({
        username: "new_invited_admin",
        email: "new.admin@scripe.io",
        sendSetupEmail: true,
        roleIds: ["role-1"],
      });
    });

    // Toast is held back until confirmCreateSuccess (after custom fields)
    expect(mockSuccessToast).not.toHaveBeenCalled();

    act(() => {
      result.current.vm.confirmCreateSuccess();
    });

    expect(mockSuccessToast).toHaveBeenCalledWith({
      title: "admin.created",
      description: "admin.createdSetupEmailSentDesc:new.admin@scripe.io",
    });

    mockSuccessToast.mockClear();

    await act(async () => {
      await result.current.vm.createItem({
        username: "manual_admin",
        password: "StrongPassword!123",
        sendSetupEmail: false,
        roleIds: ["role-1"],
      });
    });

    act(() => {
      result.current.vm.confirmCreateSuccess();
    });

    expect(mockSuccessToast).toHaveBeenCalledWith({
      title: "admin.created",
      description: "admin.createdManualSetupDesc",
    });
  });

  it("useAdminOperations.handleResendSetupEmail distinguishes cooldown/rate-limit vs delivery failure vs Sudo cancel", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(
      () =>
        useAdminOperations({
          tenantId: "tenant-1",
          queryKey: ["admins", "tenant-1"],
          refreshItems: vi.fn(),
        }),
      { wrapper }
    );

    // 1. Cooldown / Rate limit error
    const cooldownErr = Object.assign(
      new Error("Please wait 48 seconds before requesting another email."),
      { code: "RATE_LIMIT_EXCEEDED" }
    );
    mockAdminRepo.resendSetupEmail.mockRejectedValueOnce(cooldownErr);

    await act(async () => {
      await expect(result.current.handleResendSetupEmail("adm-1")).rejects.toThrow(
        "Please wait 48 seconds"
      );
    });

    expect(mockErrorToast).toHaveBeenCalledWith({
      title: "admin.setupEmailCooldownTitle",
      description: "Please wait 48 seconds before requesting another email.",
    });

    mockErrorToast.mockClear();

    // 2. Service unavailable / delivery failure
    const deliveryErr = Object.assign(
      new Error("Failed to dispatch account setup email. Please try again later."),
      { code: "SERVICE_UNAVAILABLE", status: 503 }
    );
    mockAdminRepo.resendSetupEmail.mockRejectedValueOnce(deliveryErr);

    await act(async () => {
      await expect(result.current.handleResendSetupEmail("adm-1")).rejects.toThrow(
        "Failed to dispatch account setup email"
      );
    });

    expect(mockErrorToast).toHaveBeenCalledWith({
      title: "admin.setupEmailFailedTitle",
      description: "Failed to dispatch account setup email. Please try again later.",
    });

    mockErrorToast.mockClear();

    // 3. Sudo cancellation -> info toast
    mockAdminRepo.resendSetupEmail.mockRejectedValueOnce(new SudoCancelledError());
    await act(async () => {
      await expect(result.current.handleResendSetupEmail("adm-1")).rejects.toThrow(
        "Sudo verification was cancelled."
      );
    });
    expect(mockInfoToast).toHaveBeenCalledWith({
      title: "profile.sudo.cancelledTitle",
      description: "profile.sudo.cancelledDescription",
    });
    expect(mockErrorToast).not.toHaveBeenCalled();
  });

  it("admin.en.ts and admin.ar.ts maintain full key parity and contain zero raw '* Desc' placeholder strings", () => {
    expect(Object.keys(adminEn.admin).sort()).toEqual(Object.keys(adminAr.admin).sort());
    expect(adminEn.admin.setupEmailResentDesc).not.toContain("Desc");
    expect(adminEn.admin.createdDesc).not.toContain("Desc");
    expect(adminEn.admin.updatedDesc).not.toContain("Desc");
    expect(adminEn.admin.deletedDesc).not.toContain("Desc");
    expect(adminEn.admin.transferredDesc).not.toContain("Desc");
    expect(adminEn.admin.protectionTransferredDesc).not.toContain("Desc");
    expect(adminEn.admin.role.assignedDesc).not.toContain("Desc");
    expect(adminEn.admin.role.removedDesc).not.toContain("Desc");
    expect(adminEn.admin.selectTenant).toBe("Select Tenant");
  });

  it("AdminsView renders 'admin.pendingSetup' badge for unactivated invited admins and 'admin.passwordChangeRequiredBadge' when mustChangePassword is true", () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <AdminsView />
      </Wrapper>
    );

    expect(screen.getByTestId("pending-status")).toHaveTextContent("common.active");
    expect(screen.getByTestId("pending-status")).toHaveTextContent("admin.pendingSetup");
    expect(screen.getByTestId("must-change-status")).toHaveTextContent("common.active");
    expect(screen.getByTestId("must-change-status")).toHaveTextContent(
      "admin.passwordChangeRequiredBadge"
    );
  });
});
