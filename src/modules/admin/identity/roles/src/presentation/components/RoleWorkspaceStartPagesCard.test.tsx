import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LandingTargetCatalog } from "@core/navigation";
import { useNavigationStore } from "@core/navigation/store/useNavigationStore";
import { RoleWorkspaceStartPagesCard } from "./RoleWorkspaceStartPagesCard";
import type { DraftRoleWorkspaceEntryRule } from "../../domain/utils/role-workspace-eligibility";

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
    t: (key: string, params?: Record<string, string | number>) => {
      if (params?.permissions) return `${key}:${params.permissions}`;
      if (params?.workspace) return `${key}:${params.workspace}`;
      return key;
    },
    language: "en" as const,
    direction: "ltr" as const,
  }),
}));

vi.mock("@core/providers/settings-provider", () => ({
  useSettings: () => ({ language: "en", direction: "ltr" }),
}));

const testCatalog = new LandingTargetCatalog({
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
      breadcrumbEn: ["Scheduling"],
      breadcrumbAr: ["الجدولة"],
    },
  ],
});

describe("RoleWorkspaceStartPagesCard — sparse policy editor UX & live warnings", () => {
  beforeEach(() => {
    useNavigationStore.getState().reset();
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("renders empty sparse state by default and invokes onAddRule when + Add rule is clicked", () => {
    const onAddRule = vi.fn();

    render(
      <RoleWorkspaceStartPagesCard
        rules={[]}
        eligibleWorkspaces={[testCatalog.workspaces[0]]}
        availableWorkspacesForNewRule={[testCatalog.workspaces[0]]}
        catalog={testCatalog}
        scopeMode="tenant_role"
        selectedPermissionCodes={new Set(["crm.leads.read"])}
        isSystemRole={false}
        isLoading={false}
        onAddRule={onAddRule}
        onUpdateRuleWorkspace={vi.fn()}
        onUpdateRuleTarget={vi.fn()}
        onToggleRuleEnforced={vi.fn()}
        onRemoveRule={vi.fn()}
      />
    );

    expect(screen.getByText("roleDetail.workspaceEntriesEmpty")).toBeInTheDocument();
    const addBtn = screen.getByTestId("role-workspace-add-rule-btn");
    expect(addBtn).toBeEnabled();
    fireEvent.click(addBtn);
    expect(onAddRule).toHaveBeenCalledTimes(1);
  });

  it("displays live inline permission warning when required page permission is unchecked, and hides other workspaces' targets in the picker", () => {
    const rules: DraftRoleWorkspaceEntryRule[] = [
      {
        workspaceKey: "crm",
        target: "menu:crm-leads",
        isEnforced: false,
      },
    ];
    const onToggleRuleEnforced = vi.fn();

    const { rerender } = render(
      <RoleWorkspaceStartPagesCard
        rules={rules}
        eligibleWorkspaces={testCatalog.workspaces}
        availableWorkspacesForNewRule={[testCatalog.workspaces[1]]}
        catalog={testCatalog}
        scopeMode="tenant_role"
        selectedPermissionCodes={new Set(["crm.leads.read"])}
        isSystemRole={false}
        isLoading={false}
        onAddRule={vi.fn()}
        onUpdateRuleWorkspace={vi.fn()}
        onUpdateRuleTarget={vi.fn()}
        onToggleRuleEnforced={onToggleRuleEnforced}
        onRemoveRule={vi.fn()}
      />
    );

    // No warning while crm.leads.read is granted
    expect(screen.queryByTestId("role-workspace-warning-crm")).not.toBeInTheDocument();

    // Trigger shows concise workspace-relative <bdi> path without redundant "Page: CRM /", and picker contains CRM page only
    const trigger = screen.getByTestId("role-workspace-target-crm");
    expect(trigger).toHaveTextContent(/CRM Operations.*Leads/);
    expect(trigger).not.toHaveTextContent(/Page:/);
    fireEvent.click(trigger);
    const options = screen.getAllByRole("option");
    expect(options.some((opt) => /CRM Operations.*Leads/.test(opt.textContent ?? ""))).toBe(true);
    expect(options.some((opt) => /Calendar/.test(opt.textContent ?? ""))).toBe(false);

    // Unchecking crm.leads.read live surfaces inline mismatch warning immediately
    rerender(
      <RoleWorkspaceStartPagesCard
        rules={rules}
        eligibleWorkspaces={[testCatalog.workspaces[1]]}
        availableWorkspacesForNewRule={[]}
        catalog={testCatalog}
        scopeMode="tenant_role"
        selectedPermissionCodes={new Set(["reservations.view"])}
        isSystemRole={false}
        isLoading={false}
        onAddRule={vi.fn()}
        onUpdateRuleWorkspace={vi.fn()}
        onUpdateRuleTarget={vi.fn()}
        onToggleRuleEnforced={onToggleRuleEnforced}
        onRemoveRule={vi.fn()}
      />
    );

    const warningBanner = screen.getByTestId("role-workspace-warning-crm");
    expect(warningBanner).toHaveTextContent(
      "roleDetail.workspaceEntriesPermissionWarning:crm.leads.read"
    );
  });

  it("shows system role lock banner and disables mutations when isSystemRole=true", () => {
    render(
      <RoleWorkspaceStartPagesCard
        rules={[{ workspaceKey: "crm", target: "menu:crm-leads", isEnforced: true }]}
        eligibleWorkspaces={testCatalog.workspaces}
        availableWorkspacesForNewRule={[]}
        catalog={testCatalog}
        scopeMode="tenant_role"
        selectedPermissionCodes={new Set(["crm.leads.read"])}
        isSystemRole={true}
        isLoading={false}
        onAddRule={vi.fn()}
        onUpdateRuleWorkspace={vi.fn()}
        onUpdateRuleTarget={vi.fn()}
        onToggleRuleEnforced={vi.fn()}
        onRemoveRule={vi.fn()}
      />
    );

    expect(screen.getByTestId("role-workspace-system-lock-alert")).toBeInTheDocument();
    expect(screen.getByTestId("role-workspace-add-rule-btn")).toBeDisabled();
    expect(screen.getByTestId("role-workspace-remove-btn-crm")).toBeDisabled();
  });
});
