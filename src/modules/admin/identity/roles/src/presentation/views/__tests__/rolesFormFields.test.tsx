import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import { WorkspaceGroup } from "@core/navigation/domain/entities/WorkspaceGroup";
import { MenuItem } from "@core/navigation/domain/entities/MenuItem";
import {
  LandingTargetCatalog,
  buildStructuredLandingTargetOptions,
  canEnforceLandingTarget,
} from "@core/navigation";
import { GenericForm } from "@core/ui/forms/generic-form";
import { RoleMapper, normalizeRoleLandingPolicy } from "../../../data/mappers/RoleMapper";
import { RoleModel } from "../../../data/models/RoleModel";
import { getRoleEditFields, getRoleEditInitialValues } from "../rolesFormFields";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, defaultVal?: string | Record<string, unknown>) =>
      typeof defaultVal === "string" ? defaultVal : key,
    direction: "ltr" as const,
    language: "en" as const,
  }),
}));

vi.mock("@core/providers/settings-provider", () => ({
  useSettings: () => ({
    buttonStyle: "default",
    borderRadius: "default",
    animationLevel: "default",
    spacingSize: "default",
    formStyle: "default",
    inputStyle: "default",
    checkboxStyle: "default",
  }),
}));

vi.mock("@core/providers/permission-provider", () => ({
  usePermissions: () => ({ hasPermission: () => true }),
}));

function createTestWorkspace(
  key: string,
  overrides: Partial<ConstructorParameters<typeof WorkspaceGroup>[0]> = {}
) {
  return new WorkspaceGroup({
    workspaceId: `ws-${key}`,
    workspaceKey: key,
    workspaceNameEn: key.toUpperCase(),
    workspaceNameAr: key.toUpperCase(),
    workspaceIcon: "Layers",
    workspaceSortOrder: 1,
    colorHue: 145,
    colorChroma: 0.14,
    workspaceType: "Admin",
    contextScope: "Both",
    menuItems: [
      new MenuItem({
        id: `m-${key}`,
        slug: `${key}-home`,
        name: `${key} Home`,
        nameEn: `${key} Home`,
        nameAr: `${key} Home`,
        href: `/${key}/home`,
        icon: "Home",
        order: 1,
        resource: key,
        actions: null,
        children: [],
      }),
    ],
    isLocked: false,
    homeRoute: `/${key}/home`,
    platformHomeRoute: null,
    effectiveHomeRoute: `/${key}/home`,
    isPinned: false,
    pinSortOrder: null,
    accessibleItemCount: 1,
    ...overrides,
  });
}

describe("Role landing policy — mappers, context constraints, and form enforcement lock", () => {
  it("normalizes default/hub targets to un-enforced and preserves rowVersion on update", () => {
    expect(normalizeRoleLandingPolicy("default", true)).toEqual({
      defaultLandingTarget: null,
      isLandingEnforced: false,
    });
    expect(normalizeRoleLandingPolicy("hub", true)).toEqual({
      defaultLandingTarget: "hub",
      isLandingEnforced: false,
    });
    expect(normalizeRoleLandingPolicy("workspace:venue", true)).toEqual({
      defaultLandingTarget: "workspace:venue",
      isLandingEnforced: true,
    });

    const entity = RoleMapper.toEntity(
      RoleModel.fromJson({
        id: "11111111-1111-1111-1111-111111111111",
        nameEn: "Coach Lead",
        nameAr: "قائد المدربين",
        code: "coach-lead",
        isSystem: false,
        priority: 10,
        isActive: true,
        permissions: [],
        createdAt: "2026-11-20T00:00:00Z",
        defaultLandingTarget: "workspace:academy",
        isLandingEnforced: true,
        rowVersion: "AQIDBA==",
      })
    );

    expect(entity.defaultLandingTarget).toBe("workspace:academy");
    expect(entity.isLandingEnforced).toBe(true);
    expect(entity.rowVersion).toBe("AQIDBA==");
    expect(getRoleEditInitialValues(entity).rowVersion).toBe("AQIDBA==");

    const updateModel = RoleMapper.toUpdateModel({
      nameEn: "Coach Lead",
      nameAr: "قائد المدربين",
      priority: 10,
      defaultLandingTarget: "workspace:academy",
      isLandingEnforced: true,
      rowVersion: "AQIDBA==",
    });

    expect(updateModel.toJson()).toMatchObject({
      defaultLandingTarget: "workspace:academy",
      isLandingEnforced: true,
      rowVersion: "AQIDBA==",
    });
  });

  it("excludes TenantOnly and Module workspaces for platform roles and keeps Tenant targets for tenant roles", () => {
    const groups = [
      createTestWorkspace("platform-admin", { workspaceType: "Admin", contextScope: "PlatformOnly" }),
      createTestWorkspace("tenant-core", { workspaceType: "Admin", contextScope: "TenantOnly" }),
      createTestWorkspace("venue", { workspaceType: "Module", contextScope: "TenantOnly" }),
      createTestWorkspace("locked-crm", { workspaceType: "Module", contextScope: "TenantOnly", isLocked: true }),
    ];

    const platformOpts = buildStructuredLandingTargetOptions({
      language: "en",
      workspaceGroups: groups,
      scopeMode: "platform_role",
      labels: {
        defaultLabel: "Default",
        overviewLabel: "Overview",
        hubLabel: "Hub",
        workspacePrefix: "Workspace:",
        menuPrefix: "Page:",
      },
    }).map((o) => o.value);

    expect(platformOpts).toContain("workspace:platform-admin");
    expect(platformOpts).not.toContain("workspace:tenant-core");
    expect(platformOpts).not.toContain("workspace:venue");

    const tenantOpts = buildStructuredLandingTargetOptions({
      language: "en",
      workspaceGroups: groups,
      scopeMode: "tenant_role",
      labels: {
        defaultLabel: "Default",
        overviewLabel: "Overview",
        hubLabel: "Hub",
        workspacePrefix: "Workspace:",
        menuPrefix: "Page:",
      },
    }).map((o) => o.value);

    expect(tenantOpts).toContain("workspace:venue");
    expect(tenantOpts).toContain("menu:venue-home");
    expect(tenantOpts).not.toContain("workspace:platform-admin");
    expect(tenantOpts).not.toContain("workspace:locked-crm");
  });

  it("disables isLandingEnforced switch in GenericForm when target is default/hub, unlocks for overview, and clears when returning to hub", async () => {
    const t = (key: string) => key;
    expect(canEnforceLandingTarget("default")).toBe(false);
    expect(canEnforceLandingTarget("hub")).toBe(false);
    expect(canEnforceLandingTarget("overview")).toBe(true);

    const onSubmit = vi.fn();
    const fields = getRoleEditFields(t, {
      language: "en",
      workspaceGroups: [createTestWorkspace("venue", { workspaceType: "Module", contextScope: "Both" })],
      isTenantRole: true,
    });

    render(
      <GenericForm
        fields={fields}
        initialValues={{
          nameEn: "Ops Manager",
          nameAr: "مدير العمليات",
          priority: 20,
          defaultLandingTarget: "default",
          isLandingEnforced: false,
          rowVersion: "AQID",
        }}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />
    );

    const targetCombobox = screen.getByRole("combobox", {
      name: "roles.defaultLandingTarget",
    });
    const enforceSwitch = screen.getByRole("switch", { name: "roles.isLandingEnforced" });
    expect(enforceSwitch).toBeDisabled();
    expect(enforceSwitch).not.toBeChecked();

    // Select Overview -> switch enables and can be toggled on
    fireEvent.click(targetCombobox);
    fireEvent.click(screen.getByRole("option", { name: "roles.landingTargetOverview" }));
    expect(enforceSwitch).toBeEnabled();
    fireEvent.click(enforceSwitch);
    expect(enforceSwitch).toBeChecked();

    // Select Hub -> switch clears back to unchecked and re-disables
    fireEvent.click(targetCombobox);
    fireEvent.click(screen.getByRole("option", { name: "roles.landingTargetHub" }));
    expect(enforceSwitch).not.toBeChecked();
    expect(enforceSwitch).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: /common\.save/i }));
  });

  it("renders grouped searchable landing target combobox with lazy catalog, <bdi> path segments, empty search state, and unavailable fallback", () => {
    const t = (key: string) => key;
    const unhydratedCrm = createTestWorkspace("crm", {
      workspaceNameEn: "CRM",
      workspaceNameAr: "المبيعات",
      workspaceType: "Module",
      contextScope: "TenantOnly",
      menuItems: [],
      homeRoute: "/crm",
      effectiveHomeRoute: "/crm",
    });

    const catalog = new LandingTargetCatalog({
      scopeMode: "tenant_role",
      contextKey: "tenant:ahly",
      overviewAuthorized: true,
      workspaces: [
        {
          workspaceKey: "crm",
          workspaceNameEn: "CRM",
          workspaceNameAr: "المبيعات",
          workspaceIcon: "LayoutGrid",
          workspaceSortOrder: 1,
          workspaceType: "Module",
          contextScope: "TenantOnly",
          effectiveHomeRoute: "/crm",
        },
      ],
      items: [
        {
          workspaceKey: "crm",
          workspaceNameEn: "CRM",
          workspaceNameAr: "المبيعات",
          contextScope: "TenantOnly",
          slug: "crm-leads",
          nameEn: "Leads",
          nameAr: "العملاء المحتملون",
          route: "/crm/leads",
          breadcrumbEn: ["Sales", "Leads"],
          breadcrumbAr: ["المبيعات", "العملاء المحتملون"],
        },
      ],
    });

    const fields = getRoleEditFields(t, {
      language: "en",
      workspaceGroups: [unhydratedCrm],
      catalog,
      isTenantRole: true,
      currentTarget: "menu:legacy-removed-page",
    });

    render(
      <GenericForm
        fields={fields}
        initialValues={{
          nameEn: "Sales Lead",
          nameAr: "قائد المبيعات",
          priority: 20,
          defaultLandingTarget: "menu:legacy-removed-page",
          isLandingEnforced: false,
          rowVersion: "AQID",
        }}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    const targetCombobox = screen.getByRole("combobox", {
      name: "roles.defaultLandingTarget",
    });
    expect(targetCombobox).toHaveTextContent("roles.landingTargetUnavailablePage");
    expect(targetCombobox).not.toHaveTextContent("menu:legacy-removed-page");

    fireEvent.click(targetCombobox);
    const searchInput = screen.getByPlaceholderText("roles.landingTargetSearchPlaceholder");
    fireEvent.change(searchInput, { target: { value: "does-not-exist" } });
    expect(screen.getByText("roles.landingTargetNoResults")).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: "Leads" } });
    const leadsOption = screen.getByRole("option", { name: /Leads/i });
    expect(leadsOption.querySelectorAll("bdi").length).toBeGreaterThanOrEqual(2);
    fireEvent.click(leadsOption);

    expect(targetCombobox.querySelectorAll("bdi").length).toBe(3);
    expect(screen.getByRole("switch", { name: "roles.isLandingEnforced" })).toBeEnabled();
  });
});
