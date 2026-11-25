import { createElement, type ReactNode } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAppStore } from "@core/store/useAppStore";
import { SudoCancelledError, useSudoStore } from "@core/store/useSudoStore";
import type { IApiService } from "@core/interfaces/api.interface";
import { UserGroupService } from "../../data/services/UserGroupService";
import { useUserGroupsViewModel, type UserGroupListItem } from "./useUserGroupsViewModel";
import { useSetRolesViewModel } from "./useSetRolesViewModel";
import { SetRolesDialog } from "../components/SetRolesDialog";
import { CascadeDeleteDialog } from "../components/CascadeDeleteDialog";
import { CascadeStatusDialog } from "../components/CascadeStatusDialog";

const {
  mockGroupRepo,
  mockRoleRepo,
  mockSyncAuthorization,
  mockToastSuccess,
  mockToastError,
  mockToastInfo,
} = vi.hoisted(() => ({
  mockGroupRepo: {
    getAll: vi.fn(),
    getCurrentTenantGroups: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    createInCurrentTenant: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    bulkActivate: vi.fn(),
    bulkDeactivate: vi.fn(),
    bulkDelete: vi.fn(),
  },
  mockRoleRepo: {
    getAll: vi.fn(),
    getCurrentTenantRoles: vi.fn(),
  },
  mockSyncAuthorization: vi.fn(),
  mockToastSuccess: vi.fn(),
  mockToastError: vi.fn(),
  mockToastInfo: vi.fn(),
}));

vi.mock("@modules/identity/di", () => ({
  identityContainer: {
    userGroupRepository: mockGroupRepo,
    roleRepository: mockRoleRepo,
  },
}));

vi.mock("@core/hooks/use-session-authorization-sync", () => ({
  useSessionAuthorizationSync: () => mockSyncAuthorization,
}));

vi.mock("@core/hooks/use-enhanced-toast", () => ({
  useEnhancedToast: () => ({
    success: mockToastSuccess,
    error: mockToastError,
    info: mockToastInfo,
  }),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({ t: (k: string) => k, language: "en" }),
}));

vi.mock("@core/crud/components/generic-modal", () => ({
  GenericModal: ({
    open,
    onOpenChange,
    title,
    children,
  }: {
    open: boolean;
    onOpenChange?: (open: boolean) => void;
    title: string;
    children: ReactNode;
  }) =>
    open ? (
      <dialog open aria-label={title}>
        <h2>{title}</h2>
        <button type="button" data-testid={`dismiss-${title}`} onClick={() => onOpenChange?.(false)}>
          Dismiss
        </button>
        {children}
      </dialog>
    ) : null,
}));

vi.mock("@core/crud/components/generic-select", () => ({
  GenericSelect: ({
    value,
    options,
  }: {
    value?: string[];
    options: Array<{ value: string; label: string }>;
  }) => (
    <div data-testid="roles-select-state" data-selected={(value ?? []).join(",")}>
      {options.map((o) => (
        <span key={o.value} data-testid={`role-option-${o.value}`}>
          {o.label}
        </span>
      ))}
    </div>
  ),
}));

function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client }, children);
  };
}

describe("UserGroup list Edit hydration, role search/resolution & bulk Sudo safety", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSudoStore.setState({ modalOpen: false });
    useAppStore.setState({
      _hasHydrated: true,
      user: { id: "sa-1", username: "root", tenantId: null } as unknown as ReturnType<
        typeof useAppStore.getState
      >["user"],
    });

    mockGroupRepo.getAll.mockResolvedValue({
      items: [],
      totalCount: 0,
      page: 1,
      pageSize: 10,
      totalPages: 0,
    });
    mockGroupRepo.getCurrentTenantGroups.mockResolvedValue({
      items: [],
      totalCount: 0,
      page: 1,
      pageSize: 10,
      totalPages: 0,
    });
    mockGroupRepo.getById.mockResolvedValue({
      id: "group-1",
      nameEn: "Security Ops",
      nameAr: "أمن",
      code: "SEC_OPS",
      descriptionEn: "Ops",
      descriptionAr: "عمليات",
      tenantId: "tenant-1",
      isActive: true,
      rowVersion: "AAAAAQ==",
      roles: [{ roleId: "role-1", nameEn: "Auditor", nameAr: "مراجع", code: "AUDITOR" }],
    });
    mockGroupRepo.update.mockResolvedValue(undefined);
    mockGroupRepo.bulkActivate.mockResolvedValue(1);
    mockGroupRepo.bulkDeactivate.mockResolvedValue(1);
    mockGroupRepo.bulkDelete.mockResolvedValue(1);
    mockSyncAuthorization.mockResolvedValue(undefined);
    mockRoleRepo.getAll.mockResolvedValue({
      items: [{ id: "role-1", nameEn: "Auditor", nameAr: "مراجع", code: "AUDITOR", priority: 1 }],
      totalCount: 1,
    });
    mockRoleRepo.getCurrentTenantRoles.mockResolvedValue({ items: [], totalCount: 0 });
  });

  it("hydrates Edit modal via getById so roleIds and rowVersion are preserved on update", async () => {
    const wrapper = makeWrapper();
    const { result } = renderHook(() => useUserGroupsViewModel({ tenantId: "tenant-1" }), { wrapper });
    const summaryItem: UserGroupListItem = {
      id: "group-1",
      nameEn: "Security Ops",
      nameAr: "أمن",
      code: "SEC_OPS",
      tenantId: "tenant-1",
      isActive: true,
      memberCount: 2,
      roleCount: 1,
      createdAt: "2026-11-24T00:00:00Z",
    };

    await act(async () => {
      await result.current.vm.openEditModal(summaryItem);
    });

    expect(mockGroupRepo.getById).toHaveBeenCalledWith("group-1");
    const editValues = result.current
      .getConfigBase((k: string) => k)
      .editInitialValues(result.current.vm.editingItem);
    expect(editValues.roleIds).toEqual(["role-1"]);
    expect(editValues.rowVersion).toBe("AAAAAQ==");

    await act(async () => {
      await result.current.vm.updateItem("group-1", {
        nameEn: "Security Ops Updated",
        nameAr: "أمن محدث",
        roleIds: ["role-1"],
        isActive: true,
      });
    });

    expect(mockGroupRepo.update).toHaveBeenCalledWith("group-1", {
      nameEn: "Security Ops Updated",
      nameAr: "أمن محدث",
      roleIds: ["role-1"],
      isActive: true,
      rowVersion: "AAAAAQ==",
    });

    // handleRoleSearch passes strict: true for tenant/platform scoping
    const searchField = result.current.getConfigBase((k: string) => k).editFields[0];
    await act(async () => {
      await searchField.onServerSearch?.("aud");
    });
    expect(mockRoleRepo.getAll).toHaveBeenCalledWith(
      expect.objectContaining({ tenantId: "tenant-1", strict: true, search: "aud" })
    );
  });

  it("handles bulk 204 null responses safely, catches sync errors, and surfaces a single info toast on Sudo cancel", async () => {
    const mockApi = {
      post: vi.fn().mockResolvedValue(null),
    } as unknown as IApiService;
    const svc = new UserGroupService(mockApi);
    await expect(svc.bulkActivate(["g1", "g2"])).resolves.toBe(2);
    await expect(svc.bulkDeactivate(["g1"])).resolves.toBe(1);
    await expect(svc.bulkDelete(["g1", "g2", "g3"])).resolves.toBe(3);

    const wrapper = makeWrapper();
    const { result } = renderHook(() => useUserGroupsViewModel({ tenantId: "tenant-1" }), { wrapper });

    mockSyncAuthorization.mockRejectedValueOnce(new Error("Sync timeout"));
    await act(async () => {
      await result.current.handleToggleActive("group-1", true);
    });
    expect(mockToastSuccess).toHaveBeenCalled();
    expect(mockToastError).not.toHaveBeenCalled();

    mockGroupRepo.bulkDelete.mockRejectedValueOnce(new SudoCancelledError());
    act(() => {
      result.current.triggerDelete(["group-1"]);
    });
    await act(async () => {
      await result.current.confirmDelete(true);
    });

    expect(mockToastInfo).toHaveBeenCalledTimes(1);
    expect(mockToastInfo).toHaveBeenCalledWith({
      title: "profile.sudo.cancelledTitle",
      description: "profile.sudo.cancelledDescription",
    });
    expect(mockToastError).not.toHaveBeenCalled();
    expect(result.current.deleteDialog.open).toBe(true);
    expect(result.current.deleteDialog.isPending).toBe(false);
  });

  it("routes platform groups via roleRepository.getAll(strict: true) and resolves assigned roles beyond page 1", async () => {
    mockRoleRepo.getAll
      .mockResolvedValueOnce({
        items: [{ id: "role-1", nameEn: "First", nameAr: "الأول", code: "FIRST", priority: 1 }],
        totalCount: 150,
      })
      .mockResolvedValueOnce({
        items: [{ id: "role-120", nameEn: "Late Role", nameAr: "متأخر", code: "LATE_ROLE", priority: 2 }],
        totalCount: 1,
      });

    const Wrapper = makeWrapper();
    render(
      createElement(
        Wrapper,
        null,
        createElement(SetRolesDialog, {
          open: true,
          onOpenChange: vi.fn(),
          currentRoles: [{ roleId: "r-old", nameEn: "Late Role", nameAr: "متأخر", code: "LATE_ROLE" }],
          onSubmit: vi.fn(),
        })
      )
    );

    await waitFor(() => {
      expect(screen.getByTestId("role-option-role-120")).toBeTruthy();
    });
    expect(screen.getByTestId("roles-select-state").getAttribute("data-selected")).toBe("role-120");
    expect(mockRoleRepo.getCurrentTenantRoles).not.toHaveBeenCalled();
    expect(mockRoleRepo.getAll).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, pageSize: 100, strict: true })
    );

    // searchRoles returns matching roles cleanly
    const { result } = renderHook(
      () => useSetRolesViewModel({ open: true, currentRoles: [] }),
      { wrapper: makeWrapper() }
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const hits = await result.current.searchRoles("LATE");
    expect(Array.isArray(hits)).toBe(true);
  });

  it("guards CascadeDeleteDialog and CascadeStatusDialog against outside close while Sudo modal is open", () => {
    const onDeleteClose = vi.fn();
    const onStatusClose = vi.fn();
    useSudoStore.setState({ modalOpen: true });

    render(
      createElement(
        makeWrapper(),
        null,
        createElement(CascadeDeleteDialog, {
          open: true,
          onOpenChange: onDeleteClose,
          onConfirm: vi.fn(),
          isPending: false,
        }),
        createElement(CascadeStatusDialog, {
          open: true,
          onOpenChange: onStatusClose,
          onConfirm: vi.fn(),
          isPending: false,
          isActive: true,
        })
      )
    );

    fireEvent.click(screen.getByTestId("dismiss-userGroups.deleteConfirmTitle"));
    fireEvent.click(screen.getByTestId("dismiss-common.activate"));
    expect(onDeleteClose).not.toHaveBeenCalled();
    expect(onStatusClose).not.toHaveBeenCalled();
    useSudoStore.setState({ modalOpen: false });
  });
});
