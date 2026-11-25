import { createElement, type ReactNode } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SudoCancelledError, useSudoStore } from "@core/store/useSudoStore";
import { UserGroupDetailView } from "../views/UserGroupDetailView";
import { AddMembersDialog } from "./AddMembersDialog";
import { SetRolesDialog } from "./SetRolesDialog";
import { AssignToGroupDialog } from "./AssignToGroupDialog";
import { useAssignToGroupViewModel } from "../viewmodels/useAssignToGroupViewModel";
import { userGroupKeys } from "../viewmodels/useUserGroupsViewModel";

const {
  mockGroupRepo,
  mockUseModuleLocales,
  mockAddMembersFn,
  mockRemoveMemberFn,
  mockSetRolesFn,
  mockSetRestrictionsFn,
  mockToastSuccess,
  mockToastError,
  mockToastInfo,
  mockSyncAuthorization,
} = vi.hoisted(() => ({
  mockGroupRepo: {
    getAll: vi.fn(),
    getCurrentTenantGroups: vi.fn(),
    getById: vi.fn(),
    addMembers: vi.fn(),
    setRoles: vi.fn(),
  },
  mockUseModuleLocales: vi.fn(),
  mockAddMembersFn: vi.fn(),
  mockRemoveMemberFn: vi.fn(),
  mockSetRolesFn: vi.fn(),
  mockSetRestrictionsFn: vi.fn(),
  mockToastSuccess: vi.fn(),
  mockToastError: vi.fn(),
  mockToastInfo: vi.fn(),
  mockSyncAuthorization: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@core/hooks/use-module-locales", () => ({
  useModuleLocales: mockUseModuleLocales,
}));

vi.mock("@core/hooks/use-permission", () => ({
  usePermission: () => true,
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({ t: (key: string) => key, language: "en" }),
}));

vi.mock("@core/providers/tenant-context-provider", () => ({
  useCurrentTenantId: () => "tenant-42",
}));

vi.mock("@core/hooks/use-enhanced-toast", () => ({
  useEnhancedToast: () => ({
    success: mockToastSuccess,
    error: mockToastError,
    info: mockToastInfo,
  }),
}));

vi.mock("@core/hooks/use-session-authorization-sync", () => ({
  useSessionAuthorizationSync: () => mockSyncAuthorization,
}));

vi.mock("@modules/identity/di", () => ({
  identityContainer: {
    userGroupRepository: mockGroupRepo,
  },
}));

vi.mock("../viewmodels/useUserGroupDetailViewModel", () => ({
  useUserGroupDetailViewModel: () => ({
    group: {
      id: "group-1",
      nameEn: "Engineering Admins",
      nameAr: "مشرفو الهندسة",
      code: "GRP_ENG",
      descriptionEn: "",
      descriptionAr: "",
      tenantId: "tenant-42",
      isActive: true,
      rowVersion: "AAAAAQ==",
      members: [
        {
          adminId: "admin-1",
          firstName: "Ada",
          lastName: "Lovelace",
          username: "ada",
          email: "ada@scripe.test",
          isActive: true,
        },
      ],
      roles: [{ roleId: "role-1", nameEn: "Auditor", nameAr: "مراجع", code: "AUDITOR" }],
      restrictions: [{ permissionCode: "crm.opportunities", restrictedFields: ["internalNotes"] }],
    },
    isLoading: false,
    error: null,
    refetch: vi.fn(),
    addMembers: mockAddMembersFn,
    removeMember: mockRemoveMemberFn,
    isAddingMembers: false,
    isRemovingMember: false,
    setRoles: mockSetRolesFn,
    isSettingRoles: false,
    setRestrictions: mockSetRestrictionsFn,
    isSettingRestrictions: false,
  }),
}));

vi.mock("../viewmodels/useAddMembersViewModel", () => ({
  useAddMembersViewModel: () => ({
    t: (k: string) => k,
    language: "en",
    adminsData: {
      items: [
        { id: "admin-2", firstName: "Grace", lastName: "Hopper", email: "grace@scripe.test", username: "grace" },
      ],
    },
    isLoading: false,
  }),
}));

vi.mock("../viewmodels/useSetRolesViewModel", () => ({
  useSetRolesViewModel: () => ({
    t: (k: string) => k,
    language: "en",
    rolesData: {
      items: [
        { id: "role-1", nameEn: "Auditor", nameAr: "مراجع", code: "AUDITOR" },
        { id: "role-2", nameEn: "Operator", nameAr: "مشغل", code: "OPERATOR" },
      ],
    },
    isLoading: false,
  }),
}));

vi.mock("../viewmodels/useSetRestrictionsViewModel", () => ({
  useSetRestrictionsViewModel: () => ({
    t: (k: string) => k,
    availablePermissions: [{ code: "crm.opportunities.view", resource: "crm.opportunities" }],
    isLoadingPermissions: false,
    canReadCustomFields: false,
  }),
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
    onValueChange,
    options,
    "aria-labelledby": ariaLabelledBy,
  }: {
    value?: string | string[];
    onValueChange?: (val: string | string[]) => void;
    options: Array<{ value: string; label: string }>;
    "aria-labelledby"?: string;
  }) => (
    <select
      aria-labelledby={ariaLabelledBy}
      data-testid="mock-multi-select"
      value={Array.isArray(value) ? value[0] ?? "" : value ?? ""}
      onChange={(e) => onValueChange?.(Array.isArray(value) ? [e.target.value] : e.target.value)}
    >
      <option value="">None</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  ),
}));

function renderWithQuery(ui: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return {
    client,
    ...render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>),
  };
}

describe("UserGroupDetail dialogs, Sudo step-up cancellation & optimistic concurrency", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSudoStore.setState({ modalOpen: false });
    mockGroupRepo.getAll.mockResolvedValue({
      items: [{ id: "group-1", nameEn: "Engineering", nameAr: "الهندسة", code: "GRP_ENG" }],
    });
    mockGroupRepo.getById.mockResolvedValue({
      id: "group-1",
      rowVersion: "AAAAAg==",
      roles: [{ roleId: "role-1" }],
    });
    mockGroupRepo.setRoles.mockResolvedValue(undefined);
    mockGroupRepo.addMembers.mockResolvedValue(undefined);
    mockSyncAuthorization.mockResolvedValue(undefined);
  });

  it("loads user-groups locales and keeps detail dialogs + selections open when Sudo verification is cancelled", async () => {
    mockAddMembersFn.mockRejectedValueOnce(new SudoCancelledError());
    mockRemoveMemberFn.mockRejectedValueOnce(new SudoCancelledError());

    renderWithQuery(<UserGroupDetailView groupId="group-1" />);

    expect(mockUseModuleLocales).toHaveBeenCalledWith(expect.any(Function), "user-groups");

    // Removing a member handles rejected mutateAsync gracefully without unhandled rejections
    fireEvent.click(screen.getByRole("button", { name: "userGroups.membersTab.removeMember: Ada Lovelace" }));
    await waitFor(() => expect(mockRemoveMemberFn).toHaveBeenCalledWith("admin-1"));

    // Open Add Members dialog, pick admin-2, and trigger Sudo cancel
    fireEvent.click(screen.getAllByRole("button", { name: /userGroups\.membersTab\.addMembers/ })[0]);
    const dialog = screen.getByRole("dialog", { name: "userGroups.membersTab.addMembers" });
    expect(dialog).toBeTruthy();

    fireEvent.change(screen.getByTestId("mock-multi-select"), { target: { value: "admin-2" } });
    fireEvent.click(screen.getByRole("button", { name: "userGroups.membersTab.addSelected" }));

    await waitFor(() => expect(mockAddMembersFn).toHaveBeenCalledWith(["admin-2"]));
    // Dialog remains mounted and selection stays active for retry after Sudo cancel
    expect(screen.getByRole("dialog", { name: "userGroups.membersTab.addMembers" })).toBeTruthy();
    expect((screen.getByTestId("mock-multi-select") as HTMLSelectElement).value).toBe("admin-2");

    // Succeed on retry -> dialog closes cleanly
    mockAddMembersFn.mockResolvedValueOnce(undefined);
    fireEvent.click(screen.getByRole("button", { name: "userGroups.membersTab.addSelected" }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "userGroups.membersTab.addMembers" })).toBeNull();
    });
  });

  it("guards AddMembersDialog, SetRolesDialog, and AssignToGroupDialog against premature close during open Sudo modal", () => {
    const onMembersClose = vi.fn();
    const onRolesClose = vi.fn();
    const onAssignClose = vi.fn();

    useSudoStore.setState({ modalOpen: true });

    renderWithQuery(
      <>
        <AddMembersDialog
          open
          onOpenChange={onMembersClose}
          groupId="group-1"
          existingMemberIds={[]}
          onSubmit={vi.fn()}
        />
        <SetRolesDialog
          open
          onOpenChange={onRolesClose}
          currentRoles={[]}
          onSubmit={vi.fn()}
        />
        <AssignToGroupDialog
          open
          onOpenChange={onAssignClose}
          mode="admin"
          adminId="admin-2"
        />
      </>
    );

    fireEvent.click(screen.getByTestId("dismiss-userGroups.membersTab.addMembers"));
    fireEvent.click(screen.getByTestId("dismiss-userGroups.rolesTab.manageRoles"));
    fireEvent.click(screen.getByTestId("dismiss-userGroups.assignToGroups"));

    expect(onMembersClose).not.toHaveBeenCalled();
    expect(onRolesClose).not.toHaveBeenCalled();
    expect(onAssignClose).not.toHaveBeenCalled();

    useSudoStore.setState({ modalOpen: false });
  });

  it("forwards rowVersion and handles Sudo cancel safely in useAssignToGroupViewModel", async () => {
    const onOpenChange = vi.fn();
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(client, "invalidateQueries");
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client }, children);

    const { result } = renderHook(
      () => useAssignToGroupViewModel({ tenantId: "tenant-42", onOpenChange }),
      { wrapper }
    );

    let ok = false;
    await act(async () => {
      ok = await result.current.addRoles(["role-2"], ["group-1"]);
    });

    expect(ok).toBe(true);
    expect(mockGroupRepo.setRoles).toHaveBeenCalledWith("group-1", {
      roleIds: ["role-1", "role-2"],
      rowVersion: "AAAAAg==",
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: userGroupKeys.lists() });
    expect(onOpenChange).toHaveBeenCalledWith(false);

    onOpenChange.mockClear();
    mockGroupRepo.addMembers.mockRejectedValueOnce(new SudoCancelledError());
    await act(async () => {
      ok = await result.current.addMembers(["admin-2"], ["group-1"]);
    });

    expect(ok).toBe(false);
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(mockToastInfo).toHaveBeenCalledWith({
      title: "profile.sudo.cancelledTitle",
      description: "profile.sudo.cancelledDescription",
    });
    expect(mockToastError).not.toHaveBeenCalled();

    // Partial multi-group loop failure still invalidates caches & syncs for committed group-1
    invalidateSpy.mockClear();
    mockSyncAuthorization.mockClear();
    mockGroupRepo.addMembers
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("Group 2 failed"));
    await act(async () => {
      ok = await result.current.addMembers(["admin-2"], ["group-1", "group-2"]);
    });
    expect(ok).toBe(false);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: userGroupKeys.lists() });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["admins"] });
    expect(mockSyncAuthorization).toHaveBeenCalledWith("tenant-42");
  });
});
