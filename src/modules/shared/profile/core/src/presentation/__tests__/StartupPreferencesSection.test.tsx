import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import { LandingTargetCatalog } from "@core/navigation";
import { WorkspaceGroup } from "@core/navigation/domain/entities/WorkspaceGroup";
import { StartupPreferencesSection } from "../sections/preferences/StartupPreferencesSection";

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

let mockDirection: "ltr" | "rtl" = "ltr";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) =>
      typeof params?.defaultValue === "string" ? params.defaultValue : key,
    direction: mockDirection,
    language: mockDirection === "rtl" ? ("ar" as const) : ("en" as const),
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
  if (params?.reason) return `${key}:${params.reason}`;
  return key;
};

const sampleWorkspaces = [
  new WorkspaceGroup({
    workspaceId: "ws-venue",
    workspaceKey: "venue",
    workspaceNameEn: "Venue Operations",
    workspaceNameAr: "عمليات المنشآت",
    workspaceIcon: "Building2",
    workspaceSortOrder: 1,
    colorHue: 145,
    colorChroma: 0.14,
    workspaceType: "Module",
    menuItems: [],
    isLocked: false,
    homeRoute: "/venue",
    platformHomeRoute: null,
    effectiveHomeRoute: "/venue",
    isPinned: false,
    pinSortOrder: null,
    accessibleItemCount: 2,
  }),
];

describe("StartupPreferencesSection — startup selector, role lock, fallback notice & impersonation guard", () => {
  it("displays activeContextKey and allows resetting a saved custom startup target", () => {
    const onReset = vi.fn();
    render(
      <StartupPreferencesSection
        t={t}
        language="en"
        startupTarget="workspace:venue"
        activeContextKey="tenant:ahly"
        isImpersonating={false}
        isEnforcedByRole={false}
        fallbackActive={false}
        workspaceGroups={sampleWorkspaces}
        onStartupTargetChange={vi.fn()}
        onResetStartupTarget={onReset}
      />
    );

    expect(screen.getByTestId("startup-active-context-badge")).toHaveTextContent("tenant:ahly");
    const resetBtn = screen.getByTestId("startup-reset-btn");
    expect(resetBtn).toBeEnabled();
    fireEvent.click(resetBtn);
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it("disables controls and renders impersonation alert while impersonating", () => {
    render(
      <StartupPreferencesSection
        t={t}
        language="en"
        startupTarget="workspace:venue"
        activeContextKey="tenant:ahly"
        isImpersonating={true}
        isEnforcedByRole={false}
        fallbackActive={false}
        workspaceGroups={sampleWorkspaces}
        onStartupTargetChange={vi.fn()}
        onResetStartupTarget={vi.fn()}
      />
    );

    expect(screen.getByTestId("startup-impersonation-alert")).toBeInTheDocument();
    expect(screen.getByTestId("startup-target-select")).toBeDisabled();
    expect(screen.getByTestId("startup-reset-btn")).toBeDisabled();
  });

  it("disables controls when enforced by role and renders fallback alert when active", () => {
    render(
      <StartupPreferencesSection
        t={t}
        language="en"
        startupTarget="overview"
        activeContextKey="platform"
        isImpersonating={false}
        isEnforcedByRole={true}
        enforcingRoleName="Venue Operations Role"
        fallbackActive={true}
        fallbackReason="permission_revoked"
        workspaceGroups={sampleWorkspaces}
        onStartupTargetChange={vi.fn()}
        onResetStartupTarget={vi.fn()}
      />
    );

    expect(screen.getByTestId("startup-enforced-alert")).toHaveTextContent("Venue Operations Role");
    expect(screen.getByTestId("startup-fallback-alert")).toHaveTextContent("permission_revoked");
    expect(screen.getByTestId("startup-target-select")).toBeDisabled();
    expect(screen.getByTestId("startup-reset-btn")).toBeDisabled();
  });

  it("renders human-readable activeContextLabel and never leaks raw tenant GUIDs", () => {
    const { rerender } = render(
      <StartupPreferencesSection
        t={t}
        language="ar"
        startupTarget="workspace:venue"
        activeContextKey="tenant:944caec0-1111-2222-3333-444455556666"
        activeContextLabel="Al-Ahly Sporting Club"
        isImpersonating={false}
        isEnforcedByRole={false}
        fallbackActive={false}
        workspaceGroups={sampleWorkspaces}
        onStartupTargetChange={vi.fn()}
        onResetStartupTarget={vi.fn()}
      />
    );

    const badge = screen.getByTestId("startup-active-context-badge");
    expect(badge).toHaveTextContent("Al-Ahly Sporting Club");
    expect(badge).not.toHaveTextContent("944caec0");
    expect(badge.querySelector("bdi")?.getAttribute("dir")).toBeNull();

    // Even when activeContextLabel is omitted for a tenant:<guid> key, fall back safely without exposing GUID
    rerender(
      <StartupPreferencesSection
        t={t}
        language="en"
        startupTarget="workspace:venue"
        activeContextKey="tenant:944caec0-1111-2222-3333-444455556666"
        isImpersonating={false}
        isEnforcedByRole={false}
        fallbackActive={false}
        workspaceGroups={sampleWorkspaces}
        onStartupTargetChange={vi.fn()}
        onResetStartupTarget={vi.fn()}
      />
    );

    expect(screen.getByTestId("startup-active-context-badge")).toHaveTextContent(
      "profile.preferences.startupContextTenant"
    );
    expect(screen.getByTestId("startup-active-context-badge")).not.toHaveTextContent("944caec0");

    // Platform context renders localized platform label
    rerender(
      <StartupPreferencesSection
        t={t}
        language="en"
        startupTarget="overview"
        activeContextKey="platform"
        isImpersonating={false}
        isEnforcedByRole={false}
        fallbackActive={false}
        workspaceGroups={sampleWorkspaces}
        onStartupTargetChange={vi.fn()}
        onResetStartupTarget={vi.fn()}
      />
    );

    expect(screen.getByTestId("startup-active-context-badge")).toHaveTextContent(
      "profile.preferences.startupContextPlatform"
    );
  });

  it("populates unhydrated workspaces from lazy catalog, filters via search with empty state, wraps path segments in <bdi>, and formats unavailable targets", () => {
    mockDirection = "rtl";
    const onChange = vi.fn();
    const unhydratedWorkspaces = [
      new WorkspaceGroup({
        workspaceId: "ws-crm",
        workspaceKey: "crm",
        workspaceNameEn: "CRM",
        workspaceNameAr: "إدارة العملاء CRM",
        workspaceIcon: "LayoutGrid",
        workspaceSortOrder: 1,
        colorHue: 195,
        colorChroma: 0.14,
        workspaceType: "Module",
        menuItems: [],
        isLocked: false,
        homeRoute: "/crm",
        platformHomeRoute: null,
        effectiveHomeRoute: "/crm",
        isPinned: false,
        pinSortOrder: null,
        accessibleItemCount: 3,
      }),
      ...sampleWorkspaces,
    ];

    const catalog = new LandingTargetCatalog({
      scopeMode: "current_context",
      contextKey: "tenant:ahly",
      overviewAuthorized: true,
      workspaces: [
        {
          workspaceKey: "crm",
          workspaceNameEn: "CRM",
          workspaceNameAr: "إدارة العملاء CRM",
          workspaceIcon: "LayoutGrid",
          workspaceSortOrder: 1,
          workspaceType: "Module",
          contextScope: "TenantOnly",
          effectiveHomeRoute: "/crm",
        },
        {
          workspaceKey: "venue",
          workspaceNameEn: "Venue Operations",
          workspaceNameAr: "عمليات المنشآت",
          workspaceIcon: "Building2",
          workspaceSortOrder: 2,
          workspaceType: "Module",
          contextScope: "TenantOnly",
          effectiveHomeRoute: "/venue",
        },
      ],
      items: [
        {
          workspaceKey: "crm",
          workspaceNameEn: "CRM",
          workspaceNameAr: "إدارة العملاء CRM",
          contextScope: "TenantOnly",
          slug: "crm-leads",
          nameEn: "Leads",
          nameAr: "العملاء المحتملون",
          route: "/crm/leads",
          breadcrumbEn: ["CRM Operations", "Leads"],
          breadcrumbAr: ["عمليات CRM", "العملاء المحتملون"],
        },
        {
          workspaceKey: "venue",
          workspaceNameEn: "Venue Operations",
          workspaceNameAr: "عمليات المنشآت",
          contextScope: "TenantOnly",
          slug: "venue-calendar",
          nameEn: "Calendar",
          nameAr: "التقويم",
          route: "/venue/calendar",
          breadcrumbEn: ["Scheduling", "Calendar"],
          breadcrumbAr: ["الجدولة", "التقويم"],
        },
      ],
    });

    const { rerender } = render(
      <StartupPreferencesSection
        t={t}
        language="ar"
        startupTarget="menu:crm-leads"
        activeContextKey="tenant:ahly"
        activeContextLabel="Al-Ahly SC"
        isImpersonating={false}
        isEnforcedByRole={false}
        fallbackActive={false}
        workspaceGroups={unhydratedWorkspaces}
        landingTargetCatalog={catalog}
        onStartupTargetChange={onChange}
        onResetStartupTarget={vi.fn()}
      />
    );

    const trigger = screen.getByTestId("startup-target-select");
    // Trigger wraps workspace & breadcrumb segments in <bdi> for mixed RTL/LTR safety
    const triggerBdiTexts = Array.from(trigger.querySelectorAll("bdi")).map(
      (node) => node.textContent
    );
    expect(triggerBdiTexts).toEqual(["إدارة العملاء CRM", "عمليات CRM", "العملاء المحتملون"]);

    // ArrowDown opens the grouped searchable combobox
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    const searchInput = screen.getByPlaceholderText(
      "profile.preferences.startupTargetSearchPlaceholder"
    );
    expect(searchInput).toBeInTheDocument();

    // Unhydrated Venue / Calendar from lazy catalog appears immediately and filters cleanly
    fireEvent.change(searchInput, { target: { value: "/venue/calendar" } });
    const calendarOption = screen.getByRole("option", { name: /التقويم/i });
    expect(calendarOption).toBeInTheDocument();
    expect(calendarOption.querySelectorAll("bdi").length).toBeGreaterThanOrEqual(2);

    // Unmatched search shows localized empty state
    fireEvent.change(searchInput, { target: { value: "non-existent-destination" } });
    expect(screen.getByText("profile.preferences.startupTargetNoResults")).toBeInTheDocument();

    // Clear search and select Venue / Calendar
    fireEvent.change(searchInput, { target: { value: "التقويم" } });
    fireEvent.click(screen.getByRole("option", { name: /التقويم/i }));
    expect(onChange).toHaveBeenCalledWith("menu:venue-calendar");

    // Unavailable legacy menu:<slug> displays readable fallback instead of raw token
    rerender(
      <StartupPreferencesSection
        t={t}
        language="en"
        startupTarget="menu:retired-legacy-slug"
        activeContextKey="tenant:ahly"
        activeContextLabel="Al-Ahly SC"
        isImpersonating={false}
        isEnforcedByRole={false}
        fallbackActive={false}
        workspaceGroups={unhydratedWorkspaces}
        landingTargetCatalog={catalog}
        onStartupTargetChange={onChange}
        onResetStartupTarget={vi.fn()}
      />
    );

    const unavailableTrigger = screen.getByTestId("startup-target-select");
    expect(unavailableTrigger).toHaveTextContent("profile.preferences.startupUnavailablePage");
    expect(unavailableTrigger).not.toHaveTextContent("menu:retired-legacy-slug");

    mockDirection = "ltr";
  });
});
