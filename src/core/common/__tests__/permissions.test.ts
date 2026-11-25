import { describe, it, expect } from "vitest";
import {
  extractPermissionResource,
  isPlatformSuperAdminUser,
  isTenantSuperAdminUser,
  PAGE_PERMISSIONS,
  SYSTEM_PERMISSIONS,
  type AdminRole,
} from "../types/permissions";

function role(roleCode: string, roleName = roleCode, isTenantSuperAdmin = false): AdminRole {
  return {
    roleId: `id-${roleCode}`,
    roleCode,
    roleName,
    isTenantSuperAdmin,
    inheritedPermissions: [],
  };
}

describe("permissions helpers & PAGE_PERMISSIONS contracts", () => {
  describe("extractPermissionResource", () => {
    it("prefers explicitResource when present so multi-segment resources are preserved verbatim", () => {
      expect(
        extractPermissionResource("crm.opportunities.view", "crm.opportunities")
      ).toBe("crm.opportunities");
      expect(
        extractPermissionResource("finance.payments.refund", "finance.payments")
      ).toBe("finance.payments");
    });

    it("strips trailing action or .stage.override suffixes from dotted permission codes", () => {
      expect(extractPermissionResource("crm.opportunities.view")).toBe("crm.opportunities");
      expect(extractPermissionResource("crm.opportunities.stage.override")).toBe(
        "crm.opportunities"
      );
      expect(extractPermissionResource("admins.view")).toBe("admins");
      expect(extractPermissionResource("   ")).toBe("");
    });
  });

  describe("isPlatformSuperAdminUser & isTenantSuperAdminUser separation", () => {
    it("grants platform superadmin exclusively when tenantId is absent", () => {
      expect(
        isPlatformSuperAdminUser(
          { tenantId: null, isSuperAdmin: true },
          [],
          [role("SYSTEM_SUPER_ADMIN", "System Super Admin")]
        )
      ).toBe(true);

      expect(
        isPlatformSuperAdminUser(
          { tenantId: "tenant-1", isSuperAdmin: true },
          ["*"],
          [role("TENANT_SUPER_ADMIN", "superadmin", true)]
        )
      ).toBe(false);
    });

    it("excludes SYSTEM_SUPER_ADMIN, PLATFORM_SUPER_ADMIN, superadmin heuristic, and Supervisor from isTenantSuperAdminUser", () => {
      expect(
        isTenantSuperAdminUser(
          { tenantId: "tenant-1", isSuperAdmin: true },
          [role("TENANT_SUPER_ADMIN", "Tenant Super Admin", true)]
        )
      ).toBe(true);

      expect(
        isTenantSuperAdminUser(
          { tenantId: null, isSuperAdmin: true, isTenantSuperAdmin: true },
          [role("TENANT_SUPER_ADMIN", "Tenant Super Admin", true)]
        )
      ).toBe(false);

      expect(
        isTenantSuperAdminUser(
          { tenantId: "tenant-1", isSuperAdmin: false },
          [role("SYSTEM_SUPER_ADMIN")]
        )
      ).toBe(false);

      expect(
        isTenantSuperAdminUser(
          { tenantId: "tenant-1", isSuperAdmin: false },
          [role("PLATFORM_SUPER_ADMIN")]
        )
      ).toBe(false);

      expect(
        isTenantSuperAdminUser(
          { tenantId: "tenant-1", isSuperAdmin: false },
          [role("Supervisor", "Supervisor", false)]
        )
      ).toBe(false);

      expect(
        isTenantSuperAdminUser(
          { tenantId: "tenant-1", isSuperAdmin: false },
          [role("superadmin", "superadmin", false)]
        )
      ).toBe(false);
    });
  });

  describe("PAGE_PERMISSIONS route alignment", () => {
    it("aligns backend controller & menu permissions across payouts, events, onboarding rules, gallery, tenant-plans, audit, security, and sso", () => {
      expect(PAGE_PERMISSIONS["/sso/continue"]).toEqual([]);
      expect(PAGE_PERMISSIONS["/entitlements/payouts"]).toEqual([
        SYSTEM_PERMISSIONS.TENANT_STRIPE_CONNECT_VIEW,
      ]);
      expect(PAGE_PERMISSIONS["/analytics/events"]).toEqual([
        SYSTEM_PERMISSIONS.ANALYTICS_EVENTS_VIEW,
      ]);
      expect(PAGE_PERMISSIONS["/entitlements/onboarding/rules"]).toEqual([
        SYSTEM_PERMISSIONS.ONBOARDING_RULES_VIEW,
      ]);
      expect(PAGE_PERMISSIONS["/customization/gallery"]).toEqual([
        `${SYSTEM_PERMISSIONS.THEMES_VIEW}|${SYSTEM_PERMISSIONS.TENANT_SETTINGS_VIEW}|${SYSTEM_PERMISSIONS.TENANT_SETTINGS_UPDATE}`,
      ]);
      expect(PAGE_PERMISSIONS["/entitlements/tenant-plans/create"]).toEqual([
        SYSTEM_PERMISSIONS.TENANT_PLANS_CREATE,
      ]);
      expect(PAGE_PERMISSIONS["/entitlements/tenant-plans/[id]/edit"]).toEqual([
        SYSTEM_PERMISSIONS.TENANT_PLANS_UPDATE,
      ]);
      expect(PAGE_PERMISSIONS["/audit"]).toEqual([SYSTEM_PERMISSIONS.AUDIT_VIEW]);
      expect(PAGE_PERMISSIONS["/security"]).toEqual([SYSTEM_PERMISSIONS.SECURITY_VIEW]);
    });
  });
});
