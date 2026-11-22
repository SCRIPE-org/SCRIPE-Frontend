import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, expect, it, vi } from "vitest";
import { LandingTargetCatalog } from "@core/navigation";
import { WorkspaceGroup } from "@core/navigation/domain/entities/WorkspaceGroup";
import { AccountScopeBanner } from "../sections/preferences/AccountScopeBanner";
import { WorkspaceStartPagesSection } from "../sections/preferences/WorkspaceStartPagesSection";

if (typeof (globalThis as Record<string, unknown>).ResizeObserver === "undefined") {
  (globalThis as Record<string, unknown>).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

if (typeof Element.prototype.scrollIntoView !== "function") {
  Element.prototype.scrollIntoView = () => {};
}

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) =>
      typeof params?.defaultValue === "string" ? params.defaultValue : key,
    direction: "ltr" as const,
    language: "en" as const,
  }),
}));

vi.mock("@core/providers/settings-provider", () => ({
  useSettings: () => ({
    buttonStyle: "default",
    borderRadius: "default",
    animationLevel: "default",
    inputStyle: "default",
  }),
}));

const t = (key: string, params?: Record<string, string | number>) => {
  if (params?.role) return `${key}:${params.role}`;
  if (params?.workspace) return `${key}:${params.workspace}`;
  return key;
};

const catalog = new LandingTargetCatalog({
  scopeMode: "current_context",
  contextKey: "tenant:ahly",
  overviewAuthorized: true,
  workspaces: [
    {
      workspaceKey: "crm",
      workspaceNameEn: "CRM",
      workspaceNameAr: "إدارة العملاء",
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
      contextScope: "Both",
      effectiveHomeRoute: "/roles",
    },
    {
      workspaceKey: "hrms",
      workspaceNameEn: "HRMS",
      workspaceNameAr: "الموارد البشرية",
      workspaceIcon: "Users",
      workspaceSortOrder: 3,
      workspaceType: "Module",
      contextScope: "TenantOnly",
      effectiveHomeRoute: "/hrms/staff-members",
    },
  ],
  items: [
    {
      workspaceKey: "admin",
      workspaceNameEn: "Admin",
      workspaceNameAr: "الإدارة",
      contextScope: "Both",
      slug: "overview",
      nameEn: "Overview",
      nameAr: "نظرة عامة",
      route: "/overview",
      breadcrumbEn: [],
      breadcrumbAr: [],
    },
    {
      workspaceKey: "crm",
      workspaceNameEn: "CRM",
      workspaceNameAr: "إدارة العملاء",
      contextScope: "TenantOnly",
      slug: "crm-leads",
      nameEn: "Leads",
      nameAr: "العملاء",
      route: "/crm/leads",
      breadcrumbEn: ["CRM Operations"],
      breadcrumbAr: ["العمليات"],
    },
    {
      workspaceKey: "crm",
      workspaceNameEn: "CRM",
      workspaceNameAr: "إدارة العملاء",
      contextScope: "TenantOnly",
      slug: "crm-pipeline",
      nameEn: "Pipeline",
      nameAr: "المسار",
      route: "/crm/pipeline",
      breadcrumbEn: ["CRM Operations"],
      breadcrumbAr: ["العمليات"],
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
      breadcrumbEn: ["Scheduling"],
      breadcrumbAr: ["الجدولة"],
    },
  ],
});

function makeWorkspace(
  key: string,
  nameEn: string,
  overrides: Partial<ConstructorParameters<typeof WorkspaceGroup>[0]> = {}
) {
  return new WorkspaceGroup({
    workspaceId: `ws-${key}`,
    workspaceKey: key,
    workspaceNameEn: nameEn,
    workspaceNameAr: nameEn,
    workspaceIcon: "LayoutGrid",
    workspaceSortOrder: 10,
    colorHue: 145,
    colorChroma: 0.14,
    workspaceType: "Module",
    menuItems: [],
    isLocked: false,
    homeRoute: `/${key}`,
    platformHomeRoute: null,
    effectiveHomeRoute: `/${key}`,
    isPinned: false,
    pinSortOrder: null,
    contextScope: "TenantOnly",
    accessibleItemCount: 3,
    ...overrides,
  });
}

describe("AccountScopeBanner & WorkspaceStartPagesSection", () => {
  it("renders scope banner context in <bdi> and shows Super Admin lock immunity note only for super admins", () => {
    const { rerender } = render(
      <AccountScopeBanner t={t} activeContextLabel="Al-Ahly SC" isSuperAdmin={false} />
    );

    expect(screen.getByTestId("account-scope-banner-context").querySelector("bdi")).toHaveTextContent(
      "Al-Ahly SC"
    );
    expect(screen.queryByTestId("scope-banner-superadmin-note")).not.toBeInTheDocument();

    rerender(<AccountScopeBanner t={t} activeContextLabel="Platform Control Plane" isSuperAdmin />);
    expect(screen.getByTestId("scope-banner-superadmin-note")).toBeInTheDocument();
  });

  it("hides WorkspaceStartPagesSection when <= 1 unlocked operational workspaces exist (ignoring locked & organization-core)", () => {
    const { container } = render(
      <WorkspaceStartPagesSection
        t={t}
        language="en"
        workspaceGroups={[
          makeWorkspace("crm", "CRM"),
          makeWorkspace("venue", "Venue", { isLocked: true }),
          makeWorkspace("organization-core", "Org Core"),
        ]}
        landingTargetCatalog={catalog}
        isImpersonating={false}
        isSuperAdmin={false}
        mutatingWorkspaceKey={null}
        onSetWorkspaceStartPage={vi.fn()}
        onResetWorkspaceStartPage={vi.fn()}
      />
    );

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByTestId("workspace-start-pages-section")).not.toBeInTheDocument();
  });

  it("renders Default, Custom, Auto fallback, and Enforced by [Role] badges cleanly and allows inline pick + Reset", () => {
    const onSet = vi.fn();
    const onReset = vi.fn();

    render(
      <WorkspaceStartPagesSection
        t={t}
        language="en"
        workspaceGroups={[
          makeWorkspace("admin", "Admin", {
            workspaceType: "Admin",
            workspaceSortOrder: 0,
            effectiveHomeRoute: "/overview",
            effectiveHomeMenuSlug: "overview",
            effectiveHomeSource: "WorkspaceHome",
            effectiveHomeLabelEn: "Overview",
          }),
          makeWorkspace("crm", "CRM", {
            workspaceSortOrder: 1,
            effectiveHomeRoute: "/crm/leads",
            effectiveHomeMenuSlug: "crm-leads",
            effectiveHomeSource: "PersonalOverride",
            effectiveHomeLabelEn: "Leads",
          }),
          makeWorkspace("venue", "Venue", {
            workspaceSortOrder: 2,
            effectiveHomeRoute: "/venue/calendar",
            effectiveHomeMenuSlug: "venue-calendar",
            effectiveHomeSource: "RoleEnforced",
            effectiveHomeLabelEn: "Calendar",
            isEffectiveHomeEnforced: true,
            enforcingRoleName: "Venue Manager",
          }),
          makeWorkspace("hrms", "HRMS", {
            workspaceSortOrder: 3,
            effectiveHomeRoute: "/hrms/staff-members",
            effectiveHomeSource: "FirstAuthorizedLeaf",
            effectiveHomeLabelEn: "Staff",
          }),
        ]}
        landingTargetCatalog={catalog}
        isImpersonating={false}
        isSuperAdmin={false}
        mutatingWorkspaceKey={null}
        onSetWorkspaceStartPage={onSet}
        onResetWorkspaceStartPage={onReset}
      />
    );

    expect(screen.getByTestId("workspace-origin-badge-admin")).toHaveTextContent(
      "profile.preferences.workspaceOriginDefault"
    );
    expect(screen.getByTestId("workspace-origin-badge-crm")).toHaveTextContent(
      "profile.preferences.workspaceOriginCustom"
    );
    expect(screen.getByTestId("workspace-origin-badge-venue")).toHaveTextContent(
      "profile.preferences.workspaceOriginEnforced:Venue Manager"
    );
    expect(screen.getByTestId("workspace-origin-badge-hrms")).toHaveTextContent(
      "profile.preferences.workspaceOriginAutoFallback"
    );

    // Enforced row locked for non-SuperAdmin; Default/Auto-fallback rows cannot reset; Custom row CAN change & reset
    expect(screen.getByTestId("workspace-start-picker-venue")).toBeDisabled();
    expect(screen.getByTestId("workspace-start-reset-admin")).toBeDisabled();
    expect(screen.getByTestId("workspace-start-reset-crm")).toBeEnabled();

    fireEvent.click(screen.getByTestId("workspace-start-reset-crm"));
    expect(onReset).toHaveBeenCalledWith("crm", "CRM");

    // Admin row resolves Overview (menu:overview) cleanly instead of Unavailable page
    const adminPicker = screen.getByTestId("workspace-start-picker-admin");
    expect(adminPicker).toHaveTextContent("Overview");
    expect(adminPicker).not.toHaveTextContent("Unavailable");

    // Pick new start page for CRM cleanly with concise workspace-relative labels
    const crmPicker = screen.getByTestId("workspace-start-picker-crm");
    expect(crmPicker).toHaveTextContent(/CRM Operations.*Leads/);
    expect(crmPicker).not.toHaveTextContent(/Page:/);
    fireEvent.click(crmPicker);
    fireEvent.click(screen.getByRole("option", { name: /Pipeline/i }));
    expect(onSet).toHaveBeenCalledWith("crm", "CRM", "menu:crm-pipeline");
  });

  it("ignores role locks when isSuperAdmin=true, while locking everything read-only when isImpersonating=true", () => {
    const { rerender } = render(
      <WorkspaceStartPagesSection
        t={t}
        language="en"
        workspaceGroups={[
          makeWorkspace("crm", "CRM", {
            workspaceSortOrder: 1,
            effectiveHomeSource: "PersonalOverride",
            effectiveHomeMenuSlug: "crm-leads",
          }),
          makeWorkspace("venue", "Venue", {
            workspaceSortOrder: 2,
            effectiveHomeSource: "RoleEnforced",
            effectiveHomeMenuSlug: "venue-calendar",
            isEffectiveHomeEnforced: true,
            enforcingRoleName: "Venue Manager",
          }),
        ]}
        landingTargetCatalog={catalog}
        isImpersonating={false}
        isSuperAdmin
        mutatingWorkspaceKey={null}
        onSetWorkspaceStartPage={vi.fn()}
        onResetWorkspaceStartPage={vi.fn()}
      />
    );

    // SuperAdmin overrides role lock on Venue
    expect(screen.getByTestId("workspace-start-picker-venue")).toBeEnabled();

    // Impersonation locks everything read-only regardless of SuperAdmin
    rerender(
      <WorkspaceStartPagesSection
        t={t}
        language="en"
        workspaceGroups={[
          makeWorkspace("crm", "CRM", {
            workspaceSortOrder: 1,
            effectiveHomeSource: "PersonalOverride",
            effectiveHomeMenuSlug: "crm-leads",
          }),
          makeWorkspace("venue", "Venue", {
            workspaceSortOrder: 2,
            effectiveHomeSource: "RoleEnforced",
            effectiveHomeMenuSlug: "venue-calendar",
            isEffectiveHomeEnforced: true,
            enforcingRoleName: "Venue Manager",
          }),
        ]}
        landingTargetCatalog={catalog}
        isImpersonating
        isSuperAdmin
        mutatingWorkspaceKey={null}
        onSetWorkspaceStartPage={vi.fn()}
        onResetWorkspaceStartPage={vi.fn()}
      />
    );

    expect(screen.getByTestId("workspace-start-impersonation-alert")).toBeInTheDocument();
    expect(screen.getByTestId("workspace-start-picker-crm")).toBeDisabled();
    expect(screen.getByTestId("workspace-start-reset-crm")).toBeDisabled();
    expect(screen.getByTestId("workspace-start-picker-venue")).toBeDisabled();
  });
});
