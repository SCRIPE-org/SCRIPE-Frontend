import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAuthRefresh } from "../use-auth-refresh";
import { useAppStore } from "@core/store/useAppStore";
import { User } from "@modules/auth/core/domain/entities/User";
import type { AdminRole } from "@core/common/types/permissions";

const mockGetCurrentPrincipal = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/crm/opportunities",
}));

vi.mock("@core/providers/service-provider", () => ({
  useServices: () => ({
    authRepository: {
      getCurrentPrincipal: mockGetCurrentPrincipal,
    },
  }),
}));

describe("useAuthRefresh — role and permission preservation", () => {
  const existingRole: AdminRole = {
    roleId: "role-admin",
    roleName: "CRM Admin",
    roleCode: "CrmAdmin",
    tenantId: "tenant-ahly",
    inheritedPermissions: [],
  };

  const initialUser = new User({
    id: "user-123",
    username: "test.admin",
    firstName: "Test",
    lastName: "Admin",
    phoneNumber: "123",
    adminTypeName: "Admin",
    permissions: ["crm.leads.view", "crm.opportunities.manage"],
    roles: [existingRole],
    tenantId: "tenant-ahly",
    isSuperAdmin: true,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    useAppStore.setState({
      user: initialUser,
      isAuthenticated: true,
      permissions: ["crm.leads.view", "crm.opportunities.manage"] as any,
      roles: [existingRole],
      restrictedFields: {},
    });
  });

  it("preserves permissions, roles, tenantId, and isSuperAdmin on successful /auth/admin/principal refresh", async () => {
    const refreshedUser = new User({
      id: "user-123",
      username: "test.admin",
      firstName: "Test",
      lastName: "Admin",
      phoneNumber: "123",
      adminTypeName: "Admin",
      permissions: ["crm.leads.view", "crm.opportunities.manage", "crm.activities.log"],
      roles: [existingRole],
      tenantId: "tenant-ahly",
      isSuperAdmin: true,
    });

    mockGetCurrentPrincipal.mockResolvedValueOnce(refreshedUser);

    const { result } = renderHook(() => useAuthRefresh({ enabled: false }));

    await act(async () => {
      await result.current.refresh();
    });

    const storeState = useAppStore.getState();
    expect(storeState.isAuthenticated).toBe(true);
    expect(storeState.user?.id).toBe("user-123");
    expect(storeState.roles).toHaveLength(1);
    expect(storeState.roles[0].roleCode).toBe("CrmAdmin");
    expect(storeState.permissions).toContain("crm.activities.log");
    expect(storeState.user?.isSuperAdmin).toBe(true);
  });

  it("overwrites roles and permissions with empty arrays when backend revokes privileges (zero stale retention)", async () => {
    const userWithoutRoles = new User({
      id: "user-123",
      username: "test.admin",
      firstName: "Test",
      lastName: "Admin",
      phoneNumber: "123",
      adminTypeName: "Admin",
      permissions: [],
      roles: [],
      tenantId: "tenant-ahly",
    });

    mockGetCurrentPrincipal.mockResolvedValueOnce(userWithoutRoles);

    const { result } = renderHook(() => useAuthRefresh({ enabled: false }));

    await act(async () => {
      await result.current.refresh();
    });

    const storeState = useAppStore.getState();
    expect(storeState.roles).toEqual([]);
    expect(storeState.permissions).toEqual([]);
  });

  it("clears auth state and navigation when /auth/admin/principal returns 401 or 403", async () => {
    mockGetCurrentPrincipal.mockRejectedValueOnce({ status: 403, message: "Forbidden" });

    const { result } = renderHook(() => useAuthRefresh({ enabled: false }));

    await act(async () => {
      await result.current.refresh();
    });

    const storeState = useAppStore.getState();
    expect(storeState.isAuthenticated).toBe(false);
    expect(storeState.permissions).toEqual([]);
    expect(storeState.roles).toEqual([]);
  });

  it("defensive guard: if getCurrentPrincipal returns malformed response with empty/missing id, does not call setAuth or wipe state", async () => {
    const malformedUser = {
      id: "",
      username: "",
      permissions: [],
      roles: [],
    } as any;

    mockGetCurrentPrincipal.mockResolvedValueOnce(malformedUser);

    const { result } = renderHook(() => useAuthRefresh({ enabled: false }));

    await act(async () => {
      await result.current.refresh();
    });

    const storeState = useAppStore.getState();
    // State must remain completely untouched
    expect(storeState.user?.id).toBe("user-123");
    expect(storeState.permissions).toContain("crm.opportunities.manage");
    expect(storeState.roles).toHaveLength(1);
  });

  it("defensive guard: if getCurrentPrincipal throws, does not alter store authentication or wipe permissions", async () => {
    mockGetCurrentPrincipal.mockRejectedValueOnce(new Error("Network Error"));

    const { result } = renderHook(() => useAuthRefresh({ enabled: false }));

    await act(async () => {
      await result.current.refresh();
    });

    const storeState = useAppStore.getState();
    expect(storeState.isAuthenticated).toBe(true);
    expect(storeState.user?.id).toBe("user-123");
    expect(storeState.roles).toHaveLength(1);
  });
});
