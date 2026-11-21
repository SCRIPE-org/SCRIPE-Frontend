import React from "react";
import { renderHook } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { PermissionProvider, usePermissions } from "../permission-provider";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { matchesManifestPattern } from "@core/config/app-route-manifest";
import { useAppStore } from "@core/store/useAppStore";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PermissionProvider>{children}</PermissionProvider>
);

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

    // /overview requires dashboard.view (aligned with IdentityMenuProvider.AdminGroups.cs)
    expect(result.current.canAccessPage("/overview")).toBe(false);

    // Now grant tenants.view and dashboard.view (e.g. platform operator)
    useAppStore.setState({
      permissions: ["tenants.view" as any, SYSTEM_PERMISSIONS.DASHBOARD_VIEW as any],
    });
    rerender();

    // Now can access global tenants list and /overview
    expect(result.current.canAccessPage("/tenants")).toBe(true);
    expect(result.current.canAccessPage("/tenants/tenant-abc")).toBe(true);
    expect(result.current.canAccessPage("/overview")).toBe(true);
  });

  it("fails closed for unmapped routes, unknown subpaths, and prototype property keys", () => {
    useAppStore.setState({
      permissions: ["roles.view", "tenants.view"] as any,
      isAuthenticated: true,
    });

    const { result } = renderHook(() => usePermissions(), { wrapper });

    expect(result.current.canAccessPage("/totally-unknown-route")).toBe(false);
    expect(result.current.canAccessPage("/crm/unknown-subpage")).toBe(false);
    expect(result.current.canAccessPage("/settings/not-real")).toBe(false);
    expect(result.current.canAccessPage("/__proto__")).toBe(false);
    expect(result.current.canAccessPage("/toString")).toBe(false);
    expect(result.current.canAccessPage("/constructor")).toBe(false);
  });

  it("normalizes trailing slashes and query strings without bypassing PBAC", () => {
    useAppStore.setState({
      permissions: ["roles.view"] as any,
      isAuthenticated: true,
    });

    const { result } = renderHook(() => usePermissions(), { wrapper });

    expect(result.current.canAccessPage("/roles/")).toBe(true);
    expect(result.current.canAccessPage("/roles?tab=members#top")).toBe(true);
    expect(result.current.canAccessPage("/tenants/")).toBe(false);
    expect(result.current.canAccessPage("/tenants/tenant-abc/?step=1")).toBe(false);
  });

  it("supports multi-segment dynamic routes, catch-all pattern helpers, and empty-permission mapped shell routes", () => {
    useAppStore.setState({
      permissions: [],
      isAuthenticated: true,
    });

    const { result, rerender } = renderHook(() => usePermissions(), { wrapper });

    // Explicitly mapped non-privileged shell routes (`[]`) allow any authenticated user
    expect(result.current.canAccessPage("/hub")).toBe(true);
    expect(result.current.canAccessPage("/account/security")).toBe(true);

    // Multi-segment dynamic route requires its permission and fails closed without it
    expect(result.current.canAccessPage("/plugins/inst-1/settings")).toBe(false);
    useAppStore.setState({
      permissions: [SYSTEM_PERMISSIONS.PLUGINS_INSTALLED_CONFIGURE] as any,
    });
    rerender();
    expect(result.current.canAccessPage("/plugins/inst-1/settings")).toBe(true);

    // Catch-all pattern helper matches [...slug] and [[...slug]] accurately
    expect(matchesManifestPattern("/docs/api/v1/auth", "/docs/[...slug]")).toBe(true);
    expect(matchesManifestPattern("/docs", "/docs/[...slug]")).toBe(false);
    expect(matchesManifestPattern("/docs", "/docs/[[...slug]]")).toBe(true);
  });
});

