import { createElement, type ReactNode } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SudoCancelledError } from "@core/store/useSudoStore";
import { UserGroupMapper } from "../../data/mappers/UserGroupMapper";
import { UserGroupModel } from "../../data/models/UserGroupModel";
import { useUserGroupDetailViewModel } from "./useUserGroupDetailViewModel";
import { userGroupKeys } from "./useUserGroupsViewModel";

const {
  mockGroupRepo,
  mockAuthRepo,
  mockSyncCurrentSessionAuthorization,
  mockRefreshNavigation,
  mockToastSuccess,
  mockToastError,
  mockToastInfo,
} = vi.hoisted(() => ({
  mockGroupRepo: {
    getById: vi.fn(),
    addMembers: vi.fn(),
    removeMember: vi.fn(),
    setRoles: vi.fn(),
    setRestrictions: vi.fn(),
  },
  mockAuthRepo: {
    getCurrentPrincipal: vi.fn(),
  },
  mockSyncCurrentSessionAuthorization: vi.fn(),
  mockRefreshNavigation: vi.fn(),
  mockToastSuccess: vi.fn(),
  mockToastError: vi.fn(),
  mockToastInfo: vi.fn(),
}));

vi.mock("@modules/identity/di", () => ({
  identityContainer: {
    userGroupRepository: mockGroupRepo,
  },
}));

vi.mock("@core/services/module-bridges", () => ({
  getAuthRepository: vi.fn(async () => mockAuthRepo),
}));

vi.mock("@core/hooks/use-authorization-sync", () => ({
  syncCurrentSessionAuthorization: mockSyncCurrentSessionAuthorization,
}));

vi.mock("@core/providers/navigation-provider", () => ({
  useOptionalNavigation: () => ({
    refreshNavigation: mockRefreshNavigation,
  }),
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

function makeWrapper(client?: QueryClient) {
  const queryClient =
    client ??
    new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe("useUserGroupDetailViewModel — authorization cache sync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGroupRepo.getById.mockResolvedValue({
      id: "group-1",
      tenantId: "tenant-42",
      rowVersion: "AAAAAQ==",
      members: [],
      roles: [],
      restrictions: [],
    });
    mockGroupRepo.setRoles.mockResolvedValue(undefined);
    mockGroupRepo.setRestrictions.mockResolvedValue(undefined);
    mockSyncCurrentSessionAuthorization.mockResolvedValue(undefined);
  });

  it("synchronizes current session authorization, forwards rowVersion, and invalidates detail + list caches", async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(client, "invalidateQueries");
    const { result } = renderHook(() => useUserGroupDetailViewModel("group-1"), {
      wrapper: makeWrapper(client),
    });

    await waitFor(() => {
      expect(result.current.group?.id).toBe("group-1");
    });

    await act(async () => {
      await result.current.setRoles(["role-1"]);
    });
    expect(mockGroupRepo.setRoles).toHaveBeenCalledWith("group-1", {
      roleIds: ["role-1"],
      rowVersion: "AAAAAQ==",
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: userGroupKeys.detail("group-1") });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: userGroupKeys.lists() });
    await waitFor(() => {
      expect(mockSyncCurrentSessionAuthorization).toHaveBeenCalledWith(
        expect.objectContaining({
          authRepository: mockAuthRepo,
          refreshNavigation: mockRefreshNavigation,
          targetTenantId: "tenant-42",
        })
      );
    });

    mockSyncCurrentSessionAuthorization.mockClear();

    await act(async () => {
      await result.current.setRestrictions([
        { permissionCode: "crm.opportunities", restrictedFields: ["estimatedAmount"] },
      ]);
    });
    expect(mockGroupRepo.setRestrictions).toHaveBeenCalledWith("group-1", {
      restrictions: [{ permissionCode: "crm.opportunities", restrictedFields: ["estimatedAmount"] }],
      rowVersion: "AAAAAQ==",
    });
    await waitFor(() => {
      expect(mockSyncCurrentSessionAuthorization).toHaveBeenCalledWith(
        expect.objectContaining({
          authRepository: mockAuthRepo,
          refreshNavigation: mockRefreshNavigation,
          targetTenantId: "tenant-42",
        })
      );
    });
  });

  it("treats session sync failure as non-fatal after committed mutations and handles Sudo cancellation with an info toast", async () => {
    mockSyncCurrentSessionAuthorization.mockRejectedValueOnce(new Error("Auth refresh timeout"));
    const { result } = renderHook(() => useUserGroupDetailViewModel("group-1"), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => {
      expect(result.current.group?.id).toBe("group-1");
    });

    await expect(
      act(async () => {
        await result.current.setRoles(["role-1"]);
      })
    ).resolves.toBeUndefined();
    expect(mockToastSuccess).toHaveBeenCalled();
    expect(mockToastError).not.toHaveBeenCalled();

    mockGroupRepo.setRestrictions.mockRejectedValueOnce(new SudoCancelledError());
    await expect(
      act(async () => {
        await result.current.setRestrictions([]);
      })
    ).rejects.toThrow(SudoCancelledError);
    expect(mockToastInfo).toHaveBeenCalledWith({
      title: "profile.sudo.cancelledTitle",
      description: "profile.sudo.cancelledDescription",
    });
    expect(mockToastError).not.toHaveBeenCalled();
  });

  it("maps optional rowVersion through UserGroupMapper cleanly", () => {
    const entity = UserGroupMapper.toEntity(
      UserGroupModel.fromJson({
        id: "group-1",
        nameEn: "Restricted",
        nameAr: "مقيدة",
        code: "GRP_1",
        tenantId: "tenant-42",
        isActive: true,
        memberCount: 0,
        roleCount: 0,
        rowVersion: "AAAABw==",
        createdAt: "2026-11-24T00:00:00Z",
      })
    );
    expect(entity.rowVersion).toBe("AAAABw==");
  });
});
