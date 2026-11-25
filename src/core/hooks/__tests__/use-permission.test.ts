import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { AdminRole } from "@core/common/types/permissions";
import usePermission, { usePermissions } from "../use-permission";

function makeRole(
  roleCode: string,
  roleName = roleCode,
  isTenantSuperAdmin = false
): AdminRole {
  return {
    roleId: `role-${roleCode}`,
    roleCode,
    roleName,
    isTenantSuperAdmin,
    inheritedPermissions: [],
  };
}

// Mock the app store the hook reads permissions/user from. Follows the
// selector-mock pattern used in route-guard.test.tsx: useAppStore is a
// callable that applies the given selector to a mutable mock state object,
// so each test can just mutate mockAppState before rendering the hook.
const { mockUseAppStore, mockAppState } = vi.hoisted(() => {
  const mockAppState = {
    permissions: [] as string[],
    roles: [] as AdminRole[],
    user: null as {
      id: string;
      username?: string;
      tenantId?: string | null;
      isProtected?: boolean;
      isSuperAdmin?: boolean;
      isTenantSuperAdmin?: boolean;
      adminTypeName?: string;
    } | null,
  };

  const mockUseAppStore = Object.assign(
    (selector: (state: typeof mockAppState) => unknown) => selector(mockAppState),
    {
      getState: () => mockAppState,
    }
  );

  return { mockUseAppStore, mockAppState };
});

vi.mock("@core/store/useAppStore", () => ({
  useAppStore: mockUseAppStore,
}));

describe("usePermission — deny-by-default", () => {
  beforeEach(() => {
    mockAppState.permissions = [];
    mockAppState.roles = [];
    mockAppState.user = null;
  });

  it("denies an unknown/unrecognized permission key when the user has no matching permission", () => {
    mockAppState.permissions = ["admins.view", "roles.view"];

    const { result } = renderHook(() => usePermission("some.totally.unknown.permission"));

    expect(result.current).toBe(false);
  });

  it("denies an unknown permission key even when the user has zero permissions", () => {
    mockAppState.permissions = [];

    const { result } = renderHook(() => usePermission("reports.export"));

    expect(result.current).toBe(false);
  });

  it("does not throw for an unrecognized permission key", () => {
    mockAppState.permissions = ["admins.view"];

    expect(() => renderHook(() => usePermission("not.a.real.permission"))).not.toThrow();
  });

  it("allows when no permission is required (undefined)", () => {
    mockAppState.permissions = [];

    const { result } = renderHook(() => usePermission(undefined));

    expect(result.current).toBe(true);
  });

  it("grants access when the user holds the exact permission", () => {
    mockAppState.permissions = ["admins.view"];

    const { result } = renderHook(() => usePermission("admins.view"));

    expect(result.current).toBe(true);
  });
});

describe("usePermissions().has — deny-by-default", () => {
  beforeEach(() => {
    mockAppState.permissions = [];
    mockAppState.roles = [];
    mockAppState.user = null;
  });

  it("returns false for an unrecognized permission key rather than throwing or defaulting to true", () => {
    mockAppState.permissions = ["admins.view", "roles.view"];

    const { result } = renderHook(() => usePermissions());

    expect(() => result.current.has("completely.unknown.key")).not.toThrow();
    expect(result.current.has("completely.unknown.key")).toBe(false);
  });

  it("does not grant an unrecognized key via a wildcard unless the user actually holds one", () => {
    mockAppState.permissions = ["admins.view"];

    const { result } = renderHook(() => usePermissions());

    expect(result.current.has("billing.refund")).toBe(false);
  });

  it("grants access when the user holds the superadmin wildcard", () => {
    mockAppState.permissions = ["*"];

    const { result } = renderHook(() => usePermissions());

    expect(result.current.has("anything.at.all")).toBe(true);
  });
});

describe("usePermission & usePermissions — tenant vs platform superadmin isolation", () => {
  beforeEach(() => {
    mockAppState.permissions = [];
    mockAppState.roles = [];
    mockAppState.user = null;
  });

  it("never grants platform superadmin bypass to a tenant-scoped admin even with isSuperAdmin or superadmin role", () => {
    mockAppState.user = {
      id: "tenant-sa-1",
      tenantId: "tenant-1",
      isSuperAdmin: true,
      isTenantSuperAdmin: true,
    };
    mockAppState.roles = [makeRole("TENANT_SUPER_ADMIN", "superadmin", true)];
    mockAppState.permissions = ["admins.view"];

    const { result: canCreateTenant } = renderHook(() => usePermission("tenants.create"));
    const { result: canViewAdmins } = renderHook(() => usePermission("admins.view"));
    const { result: helpers } = renderHook(() => usePermissions());

    expect(helpers.current.isPlatformSuperAdmin).toBe(false);
    expect(helpers.current.isTenantSuperAdmin).toBe(true);
    expect(canCreateTenant.current).toBe(false);
    expect(canViewAdmins.current).toBe(true);
  });

  it("does not elevate heuristic superadmin or Supervisor role names into superadmin status", () => {
    mockAppState.user = {
      id: "supervisor-1",
      tenantId: "tenant-1",
      isSuperAdmin: false,
      isTenantSuperAdmin: false,
    };
    mockAppState.roles = [makeRole("Supervisor", "superadmin", false)];
    mockAppState.permissions = ["user_groups.view"];

    const { result: canUpdateGroups } = renderHook(() => usePermission("user_groups.update"));
    const { result: canViewGroups } = renderHook(() => usePermission("user_groups.view"));
    const { result: helpers } = renderHook(() => usePermissions());

    expect(helpers.current.isPlatformSuperAdmin).toBe(false);
    expect(helpers.current.isTenantSuperAdmin).toBe(false);
    expect(canUpdateGroups.current).toBe(false);
    expect(canViewGroups.current).toBe(true);
  });

  it("grants platform superadmin bypass exclusively to platform-level principals and excludes them from isTenantSuperAdmin", () => {
    mockAppState.user = {
      id: "platform-sa-1",
      tenantId: null,
      isSuperAdmin: true,
    };
    mockAppState.roles = [makeRole("SYSTEM_SUPER_ADMIN", "System Super Admin", false)];
    mockAppState.permissions = [];

    const { result: canManageGroups } = renderHook(() => usePermission("user_groups.update"));
    const { result: helpers } = renderHook(() => usePermissions());

    expect(helpers.current.isPlatformSuperAdmin).toBe(true);
    expect(helpers.current.isTenantSuperAdmin).toBe(false);
    expect(canManageGroups.current).toBe(true);
  });

  it("never trusts a 'superadmin' username heuristic on a tenant-scoped principal (no platform bypass, no tenant-SA elevation)", () => {
    mockAppState.user = {
      id: "tenant-user-superadmin-name",
      username: "superadmin",
      tenantId: "tenant-1",
      isSuperAdmin: false,
      isTenantSuperAdmin: false,
    };
    mockAppState.roles = [];
    mockAppState.permissions = ["admins.view"];

    const { result: canCreateTenant } = renderHook(() => usePermission("tenants.create"));
    const { result: canViewAdmins } = renderHook(() => usePermission("admins.view"));
    const { result: helpers } = renderHook(() => usePermissions());

    expect(helpers.current.isPlatformSuperAdmin).toBe(false);
    expect(helpers.current.isTenantSuperAdmin).toBe(false);
    expect(canCreateTenant.current).toBe(false);
    expect(canViewAdmins.current).toBe(true);
  });

  it("does not let isProtected: true bypass permission checks when the principal carries a tenantId", () => {
    mockAppState.user = {
      id: "tenant-protected-1",
      username: "superadmin",
      tenantId: "tenant-1",
      isProtected: true,
      isSuperAdmin: false,
      isTenantSuperAdmin: false,
    };
    mockAppState.roles = [];
    mockAppState.permissions = ["user_groups.view"];

    const { result: canUpdateGroups } = renderHook(() => usePermission("user_groups.update"));
    const { result: canViewGroups } = renderHook(() => usePermission("user_groups.view"));
    const { result: helpers } = renderHook(() => usePermissions());

    expect(helpers.current.isPlatformSuperAdmin).toBe(false);
    expect(helpers.current.isTenantSuperAdmin).toBe(false);
    expect(helpers.current.has("user_groups.update")).toBe(false);
    expect(canUpdateGroups.current).toBe(false);
    expect(canViewGroups.current).toBe(true);
  });

  it("keeps platform bypass for isProtected: true only when the principal has NO tenantId, and never reports it as tenant superadmin", () => {
    mockAppState.user = {
      id: "platform-protected-1",
      username: "superadmin",
      tenantId: null,
      isProtected: true,
      isSuperAdmin: false,
    };
    mockAppState.roles = [];
    mockAppState.permissions = [];

    const { result: canManageGroups } = renderHook(() => usePermission("user_groups.update"));
    const { result: helpers } = renderHook(() => usePermissions());

    expect(helpers.current.isPlatformSuperAdmin).toBe(true);
    expect(helpers.current.isTenantSuperAdmin).toBe(false);
    expect(canManageGroups.current).toBe(true);
  });

  it("does not elevate a tenant-scoped principal that merely holds the SYSTEM_SUPER_ADMIN role code", () => {
    mockAppState.user = {
      id: "tenant-system-role-1",
      username: "superadmin",
      tenantId: "tenant-1",
      isProtected: true,
    };
    mockAppState.roles = [makeRole("SYSTEM_SUPER_ADMIN", "System Super Admin", false)];
    mockAppState.permissions = [];

    const { result: canCreateTenant } = renderHook(() => usePermission("tenants.create"));
    const { result: helpers } = renderHook(() => usePermissions());

    expect(helpers.current.isPlatformSuperAdmin).toBe(false);
    expect(helpers.current.isTenantSuperAdmin).toBe(false);
    expect(canCreateTenant.current).toBe(false);
  });
});
