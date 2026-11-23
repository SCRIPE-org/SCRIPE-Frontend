import { createElement, type ReactNode } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useUserGroupDetailViewModel } from "./useUserGroupDetailViewModel";

const {
  mockGroupRepo,
  mockAuthRepo,
  mockSyncCurrentSessionAuthorization,
  mockRefreshNavigation,
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
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({ t: (k: string) => k, language: "en" }),
}));

function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client }, children);
  };
}

describe("useUserGroupDetailViewModel — authorization cache sync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGroupRepo.getById.mockResolvedValue({
      id: "group-1",
      tenantId: "tenant-42",
      members: [],
      roles: [],
      restrictions: [],
    });
    mockGroupRepo.setRoles.mockResolvedValue(undefined);
    mockGroupRepo.setRestrictions.mockResolvedValue(undefined);
    mockSyncCurrentSessionAuthorization.mockResolvedValue(undefined);
  });

  it("synchronizes current session authorization with the group's tenantId after setRoles and setRestrictions", async () => {
    const { result } = renderHook(() => useUserGroupDetailViewModel("group-1"), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => {
      expect(result.current.group?.id).toBe("group-1");
    });

    act(() => {
      result.current.setRoles(["role-1"]);
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

    mockSyncCurrentSessionAuthorization.mockClear();

    act(() => {
      result.current.setRestrictions([
        { permissionCode: "crm.opportunities", restrictedFields: ["estimatedAmount"] },
      ]);
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
});
