import React from "react";
import { renderHook } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { PermissionProvider, usePermissions } from "../permission-provider";
import { useAppStore } from "@core/store/useAppStore";

describe("PermissionProvider - Superadmin and PBAC security tests", () => {
  beforeEach(() => {
    useAppStore.setState({
      permissions: [],
      roles: [],
      user: null,
      isAuthenticated: true,
      _hasHydrated: true,
    });
  });

  it("should NOT confer platform superadmin status to a user simply named superadmin", () => {
    useAppStore.setState({
      user: {
        id: "123",
        username: "superadmin",
        isProtected: false,
        tenantId: null,
      } as any,
      permissions: ["tenants.view_self" as any],
      roles: [{ id: "1", roleCode: "TENANT_ADMIN", roleName: "Tenant Admin" }] as any,
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PermissionProvider>{children}</PermissionProvider>
    );

    const { result } = renderHook(() => usePermissions(), { wrapper });

    expect(result.current.isPlatformSuperAdmin).toBe(false);
    expect(result.current.isSuperAdmin).toBe(false);
    expect(result.current.hasPermission("tenants.delete" as any)).toBe(false);
    expect(result.current.hasPermission("tenants.view_self" as any)).toBe(true);
  });

  it("should confer platform superadmin to a server-verified protected admin without tenant", () => {
    useAppStore.setState({
      user: {
        id: "root-1",
        username: "system_operator",
        isProtected: true,
        tenantId: null,
      } as any,
      permissions: [],
      roles: [],
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PermissionProvider>{children}</PermissionProvider>
    );

    const { result } = renderHook(() => usePermissions(), { wrapper });

    expect(result.current.isPlatformSuperAdmin).toBe(true);
    expect(result.current.isSuperAdmin).toBe(true);
    expect(result.current.hasPermission("any.unlisted.permission" as any)).toBe(true);
  });

  it("should never confer platform superadmin to a tenant-scoped user even if isProtected is true", () => {
    useAppStore.setState({
      user: {
        id: "tenant-admin-1",
        username: "superadmin",
        isProtected: true,
        tenantId: "tenant-abc",
      } as any,
      permissions: ["tenants.view_self" as any],
      roles: [{ id: "2", roleCode: "TENANT_SUPER_ADMIN", roleName: "Tenant Super Admin" }] as any,
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PermissionProvider>{children}</PermissionProvider>
    );

    const { result } = renderHook(() => usePermissions(), { wrapper });

    expect(result.current.isPlatformSuperAdmin).toBe(false);
    expect(result.current.isSuperAdmin).toBe(false);
    expect(result.current.isTenantSuperAdmin).toBe(true);
  });

  it("should evaluate page access with decoupled tenant view vs view_self permissions", () => {
    // User with only tenants.view_self
    useAppStore.setState({
      user: {
        id: "tenant-admin-1",
        username: "tenantadmin",
        isProtected: false,
        tenantId: "tenant-abc",
      } as any,
      permissions: ["tenants.view_self" as any],
      roles: [{ id: "2", roleCode: "TENANT_ADMIN", roleName: "Tenant Admin" }] as any,
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PermissionProvider>{children}</PermissionProvider>
    );

    const { result, rerender } = renderHook(() => usePermissions(), { wrapper });

    // Cannot access the global tenants list (/tenants requires tenants.view)
    expect(result.current.canAccessPage("/tenants")).toBe(false);

    // Can access own tenant details (/tenants/[id] accepts tenants.view|tenants.view_self|tenants.view_details)
    expect(result.current.canAccessPage("/tenants/tenant-abc")).toBe(true);

    // Can access shared overview (/overview requires no specific permission)
    expect(result.current.canAccessPage("/overview")).toBe(true);

    // Now grant tenants.view (e.g. platform operator)
    useAppStore.setState({
      permissions: ["tenants.view" as any],
    });
    rerender();

    // Now can access global tenants list
    expect(result.current.canAccessPage("/tenants")).toBe(true);
    expect(result.current.canAccessPage("/tenants/tenant-abc")).toBe(true);
  });
});

