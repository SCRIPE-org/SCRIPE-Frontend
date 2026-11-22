import { describe, expect, it } from "vitest";
import { LandingTargetCatalog } from "@core/navigation";
import {
  findFirstAuthorizedTargetForWorkspace,
  getEligibleWorkspacesForRole,
  getRulePermissionWarning,
} from "../role-workspace-eligibility";

const sampleCatalog = new LandingTargetCatalog({
  scopeMode: "tenant_role",
  contextKey: "tenant:ahly",
  overviewAuthorized: true,
  workspaces: [
    {
      workspaceKey: "crm",
      workspaceNameEn: "CRM",
      workspaceNameAr: "إدارة علاقات العملاء",
      workspaceIcon: "LayoutGrid",
      workspaceSortOrder: 1,
      workspaceType: "Module",
      contextScope: "TenantOnly",
      effectiveHomeRoute: "/crm/leads",
    },
    {
      workspaceKey: "venue",
      workspaceNameEn: "Venue",
      workspaceNameAr: "المرافق",
      workspaceIcon: "Building2",
      workspaceSortOrder: 2,
      workspaceType: "Module",
      contextScope: "TenantOnly",
      effectiveHomeRoute: "/venue/calendar",
    },
    {
      workspaceKey: "admin",
      workspaceNameEn: "Admin",
      workspaceNameAr: "الإدارة",
      workspaceIcon: "Shield",
      workspaceSortOrder: 0,
      workspaceType: "Admin",
      contextScope: "PlatformOnly",
      effectiveHomeRoute: "/tenants",
    },
  ],
  items: [
    {
      workspaceKey: "crm",
      workspaceNameEn: "CRM",
      workspaceNameAr: "إدارة علاقات العملاء",
      contextScope: "TenantOnly",
      slug: "crm-leads",
      nameEn: "Leads",
      nameAr: "العملاء المحتملون",
      route: "/crm/leads",
      breadcrumbEn: ["CRM Operations"],
      breadcrumbAr: ["عمليات المبيعات"],
    },
    {
      workspaceKey: "venue",
      workspaceNameEn: "Venue",
      workspaceNameAr: "المرافق",
      contextScope: "TenantOnly",
      slug: "venue-calendar",
      nameEn: "Calendar",
      nameAr: "التقويم",
      route: "/venue/calendar",
      breadcrumbEn: ["Operations"],
      breadcrumbAr: ["العمليات"],
    },
    {
      workspaceKey: "admin",
      workspaceNameEn: "Admin",
      workspaceNameAr: "الإدارة",
      contextScope: "PlatformOnly",
      slug: "tenants",
      nameEn: "Tenants",
      nameAr: "المستأجرون",
      route: "/tenants",
      breadcrumbEn: ["Control Plane"],
      breadcrumbAr: ["لوحة التحكم"],
    },
  ],
});

describe("role-workspace-eligibility — workspace filtering & live permission warnings", () => {
  it("returns ONLY scope-compatible workspaces where the role holds >= 1 granted permission", () => {
    expect(
      getEligibleWorkspacesForRole(sampleCatalog, new Set(), "tenant_role").map(
        (w) => w.workspaceKey
      )
    ).toEqual([]);

    expect(
      getEligibleWorkspacesForRole(
        sampleCatalog,
        new Set(["crm.leads.read", "tenants.view"]),
        "tenant_role"
      ).map((w) => w.workspaceKey)
    ).toEqual(["crm"]);

    expect(
      getEligibleWorkspacesForRole(
        sampleCatalog,
        new Set(["crm.leads.read", "reservations.view"]),
        "tenant_role"
      ).map((w) => w.workspaceKey)
    ).toEqual(["crm", "venue"]);
  });

  it("picks the first authorized leaf target in a workspace", () => {
    expect(
      findFirstAuthorizedTargetForWorkspace(
        "crm",
        sampleCatalog,
        new Set(["crm.leads.read"]),
        "tenant_role"
      )
    ).toBe("menu:crm-leads");
  });

  it("detects live PermissionTree mismatch when a required page permission is unchecked", () => {
    const rule = {
      workspaceKey: "crm",
      target: "menu:crm-leads",
      isEnforced: true,
      persistedIsStale: true,
    };

    // Unchecked -> live warning names the missing permission code
    const uncheckedWarning = getRulePermissionWarning(
      rule,
      sampleCatalog,
      new Set(["reservations.view"])
    );
    expect(uncheckedWarning).toEqual({
      hasWarning: true,
      missingPermissions: ["crm.leads.read"],
      isPersistedStaleOnly: false,
    });

    // Re-checked live before save -> warning clears immediately even if persistedIsStale was true
    const checkedAgain = getRulePermissionWarning(
      rule,
      sampleCatalog,
      new Set(["crm.leads.read"])
    );
    expect(checkedAgain).toEqual({
      hasWarning: false,
      missingPermissions: [],
      isPersistedStaleOnly: false,
    });
  });

  it("falls back to persistedIsStale when item is missing from catalog", () => {
    const warning = getRulePermissionWarning(
      {
        workspaceKey: "crm",
        target: "menu:deleted-slug",
        isEnforced: false,
        persistedIsStale: true,
      },
      sampleCatalog,
      new Set(["crm.leads.read"])
    );
    expect(warning).toEqual({
      hasWarning: true,
      missingPermissions: [],
      isPersistedStaleOnly: true,
    });
  });
});
